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
        return bjs_clipOffers(tab, membershipNumber, zipcode);
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

async function bjs_clipOffers(tab, membershipNumber, zipcode) {
    console.log("Send clip request");
    return browser.tabs.sendMessage(tab.id,
        { type: Type.bjs_clipOffers, membershipNumber: membershipNumber, zipcode: zipcode });
}

/** ---------------------------------------------------------------------------
 * BJs.com content functions
 **/