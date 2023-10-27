/**
 * Clip all available BJ's coupons
 * - Login to BJ's website
 * - Click on the Clip-it icon
 * - Clip coupons
 * - Based on the work of raxityo/clipAllOffers.js on github
 *
 * Content script can access tab/website localStorage and can send webrequests
 */

"use strict";

/** ---------------------------------------------------------------------------
 * onMessage listener
 **/
browser.runtime.onMessage.addListener((request) => {
    switch (request.type) {
        case Type.getItem:
            console.log("Getting [" + request.itemKey + "]");
            try {
                const itemValue = getItem(request.itemKey);
                console.log(request.itemKey + ": " + itemValue);
                return Promise.resolve({ item: itemValue });
            } catch (error) {
                onError("onMessage: " + error);
                return Promise.reject(error);
            }
        case Type.bjs_clipOffers:
            console.log("clip it!");
            return bjs_clipOffers(request.membershipNumber, request.zipcode);
        default:
            return Promise.reject(Error("Site not supported"));
    }
});

/** ---------------------------------------------------------------------------
 * Common content functions
 **/
function getItem(itemKey) {
    console.log("Checking for localStorage support");
    if (!window.localStorage) {
        throw Error("localStorage not supported");
    }
    console.log("localStorage is supported. Getting [" + itemKey + "]");
    const item= window.localStorage.getItem(itemKey);
    if (isInvalid(item)) {
        throw Error("Item [" + itemKey + "] not found");
    } else {
        return item;
    }
}
