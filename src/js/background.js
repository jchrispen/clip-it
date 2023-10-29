/**
 * Clip all available coupons
 * - Login to website
 * - Click on the Clip-it icon
 * - Clip coupons
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
            coupons = await bjs_coupon(tab);
            break;
        // case GIANT_URL:
        //     coupons = giant_coupon(tab);
        //     break;
        default:
            coupons = reject("Site not supported");
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
        return reject("grabItem: tab or key not valid");
    }

    const emptyString = "";
    return await browser.tabs.sendMessage(tab.id, { type: Type.getItem, itemKey: key })
        .then((response) => {
            let valueString = emptyString;
            if (response.item) {
                valueString = response.item;
            } else {
                return reject("did not find [" + key + "]: " + response.reason);
            }
            return (valueString);
        });
}
