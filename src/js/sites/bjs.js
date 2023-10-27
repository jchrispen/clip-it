/**
 * BJ's functions and information that both
 * background and content scripts use.
 */

/**
 * static constant values for all scripts
 */
const BJS_URL = "https://www.bjs.com";

/** ---------------------------------------------------------------------------
 * BJs.com background functions
 **/
async function bjs_coupon(tab) {
    try {
        const membershipNumber = await bjs_getMembershipNumber(tab)
        const clubDetails = await bjs_getClubDetails(tab);
        const zipcode = await bjs_parseZipcode(clubDetails);
        return bjs_clipCoupons(tab, membershipNumber, zipcode);
    } catch (error) {
        return Promise.reject(error);
    }
}

async function bjs_getMembershipNumber(tab) {
    console.log("MembershipNumber: Getting member number");
    const membershipNumber = await grabItem(tab, "x_MembershipNumber");
    // if membership is null or undefined exit.
    if (isInvalid(membershipNumber)) {
        const message = "Need to be logged in to clip coupons";
        throw Error(message);
    }

    console.log("MembershipNumber: " + membershipNumber);
    return Promise.resolve(membershipNumber);
}

async function bjs_getClubDetails(tab) {
    console.log("clubDetails: Getting clubDetails");
    const clubDetails = await grabItem(tab, "clubDetailsForClubId");

    // if clubDetails is null or undefined exit.
    if (isInvalid(clubDetails)) {
        const message = "Need location selected to be able to pull offers";
        throw Error(message);
    }

    return Promise.resolve(clubDetails);
}

async function bjs_parseZipcode(jsonString) {
    console.log("Getting zipcode from json");
    let postalCode = null;
    try {
        postalCode = JSON.parse(jsonString)["postalCode"];
    } catch (error) {
        const message = "Issue parsing json for zipcode";
        throw Error(message);
    }
    console.log("Zipcode: " + postalCode);
    return Promise.resolve(postalCode);
}

async function bjs_clipCoupons(tab, membershipNumber, zipcode) {
    console.log("Send clip request");
    return browser.tabs.sendMessage(tab.id,
        { type: Type.bjs_clipOffers, membershipNumber: membershipNumber, zipcode: zipcode });
}

/** ---------------------------------------------------------------------------
 * BJs.com content functions
 **/
async function bjs_clipOffers(membershipNumber, zipcode) {
    console.log("Offers: Fetching available offers from API");
    return fetch('https://api.bjs.com/digital/live/api/v1.0/member/available/offers', {
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
        .then(response => {
            // check for a failed response
            if (response.status < 200 && response.status > 299) {
                const message = "Offers fetch unsuccessful [" + response.status + "] " + response.statusText;
                onError(message);
                return Promise.reject(message);
            }

            const message = "Offers fetch status [" + response.status + "]";
            console.log(message);
            return response.json();
        })
        .then((availableOffers) => {
            if (availableOffers[0].totalAvailable === 0) {
                const message = "No offers available"
                console.log(message);
                return Promise.resolve(message);
            }

            let count = 0;
            // Intentionally doing sequential requests to avoid hammering the backend
            availableOffers.forEach(
                async ({ offerId, storeId }) => {
                    if (isInvalid(offerId)) {
                        const message = "OfferId is not valid";
                        onError(message);
                        return;
                    }

                    const url = `https://api.bjs.com/digital/live/api/v1.0/store/${storeId}/coupons/activate?zip=${zipcode}&offerId=${offerId}`;
                    console.log("Url: " + url);
                    // let r = await fetch(url, {credentials: 'include'});
                    // if (r.status >= 200 && r.status <= 299) count++;
                }
            );

            const message = count + " coupons clipped";
            console.log(message);
            return Promise.resolve(message);
        });
}
