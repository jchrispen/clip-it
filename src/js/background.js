/**
 * Clip all available BJ's coupons
 * - Login to BJ's website
 * - Click on the Clip-it icon
 * - Clip coupons
 * - Based on the work of raxityo/clipAllOffers.js on github
 *
 * background script interacts with the user and can send notifications
 */

"use strict";

/** ---------------------------------------------------------------------------
 * onClicked listener
 **/
browser.action.onClicked.addListener(async (tab) => {
    console.log("Hi, Mom!");
    const current_url = new URL(tab.url).origin;

    let coupons;
    switch (current_url) {
        case BJS_URL:
            coupons = bjs_coupon(tab);
            break;
        // case GIANT_URL:
        //     coupons = giant_coupon(tab);
        //     break;
        default:
            coupons = Promise.reject(Error("Site not supported"));
    }
    coupons
        .then(msg => { success(msg); })
        .catch(error => { fail(error.message); });
})

/** ---------------------------------------------------------------------------
 * Common background functions
 **/
async function grabItem(tab, key) {
    if (isInvalid(tab) || isInvalid(key)) {
        const message = "grabItem: tab or key not valid";
        onError(message);
        return Promise.reject(message);
    }

    const emptyString = "";
    return await browser.tabs.sendMessage(tab.id, { type: Type.getItem, itemKey: key })
        .then((response) => {
            let valueString = emptyString;
            if (response.item) {
                valueString = response.item;
            } else {
                return Promise.reject("did not find [" + key + "]: " + response.reason);
            }
            return Promise.resolve(valueString);
        });
}
