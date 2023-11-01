/**
 * - Clip all available BJ's coupons
 * - Based on the work of raxityo/clipAllOffers.js on github
 * - BJ's functions and information that both
 *   background and content scripts use.
 */

/**
 * static constant values for all scripts
 */
const BJS_URL = "https://www.bjs.com";

/** ---------------------------------------------------------------------------
 * BJs.com background functions
 **/
async function bjs_background(tab) {
    try {
        let membershipNumber;
        try {
            membershipNumber = await bjs_getMembershipNumber(tab)
                .then(member_number => {
                    return member_number;
                });
        } catch (error) {
            onError(error);
            return rejectWith("Need to login");
        }
        const clubDetails = await bjs_getClubDetails(tab);
        const zipcode = await bjs_parseZipcode(clubDetails);
        return await bjs_clipCoupons(tab, membershipNumber, zipcode);
    } catch (error) {
        return rejectWith(error.message);
    }
}

async function bjs_getMembershipNumber(tab) {
    console.log("Getting membership number");
    const membershipNumber = await grabItem(tab, "x_MembershipNumber");
    // if membership is null or undefined exit.
    if (isInvalid(membershipNumber)) {
        throw new Error("Need to login");
    }

    console.log("MembershipNumber: " + membershipNumber);
    return resolveWith(membershipNumber);
}

async function bjs_getClubDetails(tab) {
    console.log("Getting clubDetails");
    const clubDetails = await grabItem(tab, "clubDetailsForClubId");

    // if clubDetails is null or undefined exit.
    if (isInvalid(clubDetails)) {
        throw new Error("Need location selected to be able to pull offers");
    }

    return resolveWith(clubDetails);
}

async function bjs_parseZipcode(jsonString) {
    console.log("Getting zipcode from json");
    let postalCode = JSON.parse(jsonString)["postalCode"];
    console.log("Zipcode: " + postalCode);
    return resolveWith(postalCode);
}

async function bjs_clipCoupons(tab, membershipNumber, zipcode) {
    console.log("Send clip request");
    return browser.tabs.sendMessage(tab.id,
        { type: Type.bjs_clipOffers, membershipNumber: membershipNumber, zipcode: zipcode });
}

/** ---------------------------------------------------------------------------
 * BJs.com content functions
 **/
async function bjs_content(membershipNumber, zipcode) {
    console.log("Preparing to clip offers");
    return bjs_fetch(membershipNumber, zipcode)
        .then(response => {
            return bjs_processFetch(response);
        })
        .then((availableOffers) => {
            return bjs_processOffers(availableOffers, zipcode);
        });
}

async function bjs_fetch(membershipNumber, zipcode) {
    console.log("Fetching available offers from API");
    return await fetch('https://api.bjs.com/digital/live/api/v1.0/member/available/offers', {
        method: 'post',
        credentials: 'include',
        body: JSON.stringify({
            membershipNumber,
            zipcode,
            'category': '',
            'isPrev': false,
            'isNext': true,
            'pagesize': MAX_COUPON_REQUEST,
            'searchString': '',
            'indexForPagination': 0,
            'brand': ''
        })
    })
}

async function bjs_processFetch(response) {
    // Check for a failed response
    if (response.status < 200 || response.status >= 300) {
        throw new Error("Offers fetch unsuccessful [" + response.status + "] " + response.statusText);
    }
    console.log("Offers fetch status [" + response.status + "]");

    const data = await response.json();
    return data[0].availableOffers; // Return an object with the parsed JSON data
}

async function bjs_processOffers(availableOffers, zipcode) {
    if (availableOffers.length === 0) {
        return resolveWith("No offers available");
    }

    let count = 0;
    if (availableOffers && Array.isArray(availableOffers)) {
        for (const offer of availableOffers) {
            const offerId = offer.offerId;
            const storeId = offer.storeId;
            if (await bjs_fetchCoupons(offerId, storeId, zipcode)) {
                count++
            }
        }
    } else {
        return rejectWith("Available offers is not iterable or is not an array.");
    }
    return resolveWith(count + " coupons clipped");
}

async function bjs_fetchCoupons(offerId, storeId, zipcode) {
    if (isInvalid(offerId)) {
        onError("OfferId is not valid");
        return false;
    }

    const url = `https://api.bjs.com/digital/live/api/v1.0/store/${storeId}/coupons/activate?zip=${zipcode}&offerId=${offerId}`;
    console.log("Url: " + url);
    const response = await fetch(url, {credentials: 'include'});
    return (response.status >= 200 && response.status <= 299);
}
