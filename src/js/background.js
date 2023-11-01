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
    switch (current_url) {
        case BJS_URL:
            await bjs_background(tab)
                .then(msg => { success(msg); })
                .catch(error => { fail(error); });
            break;
        case GIANT_URL:
            await giant_background(tab)
                .then(msg => { success(msg); })
                .catch(error => { fail(error); });
            break;
        default:
            fail("Site not supported");
    }
})

/** ---------------------------------------------------------------------------
 * Common background functions
 **/
async function grabItem(tab, key) {
    if (isInvalid(tab) || isInvalid(key)) {
        return rejectWith("grabItem: tab or key not valid");
    }

    const emptyString = "";
    return await browser.tabs.sendMessage(tab.id, { type: Type.getItem, itemKey: key })
        .then((response) => {
            let valueString = emptyString;
            if (response.item) {
                valueString = response.item;
            } else {
                return rejectWith("did not find [" + key + "]: " + response.reason);
            }
            return (valueString);
        });
}

async function grabAppConfig(tab, key) {
    if (isInvalid(tab) || isInvalid(key)) {
        return rejectWith("grabAppConfig: tab or key not valid");
    }

    const emptyString = "";
    return await browser.tabs.sendMessage(tab.id, { type: Type.getAppConfig, itemKey: key })
        .then((response) => {
            let valueString = emptyString;
            if (response.item) {
                valueString = response.item;
            } else {
                return rejectWith("did not find [" + key + "]: " + response.reason);
            }
            return (valueString);
        });
}