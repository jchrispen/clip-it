/**
 * Clip all available coupons
 * Content script can access tab/website localStorage and can send webrequests
 */

"use strict";

/** ---------------------------------------------------------------------------
 * onMessage listener
 **/
browser.runtime.onMessage.addListener((request) => {
    console.log("Hi, Mom");

    switch (request.type) {
        case Type.getItem:
            console.log("Getting [" + request.itemKey + "]");
            return bjs_getItem(request.itemKey)
                .catch(error => {
                    return rejectWith(error);
                });
        case Type.bjs_clipOffers:
            console.log("clip it!");
            return bjs_content(request.membershipNumber, request.zipcode);
        default:
            return rejectWith("Request type [" + request.type + "] not supported");
    }
});

/** ---------------------------------------------------------------------------
 * Common content functions
 **/
function getItem(itemKey) {
    console.log("Checking for localStorage support");
    if (!window.localStorage) {
        throw new Error("localStorage not supported");
    }
    console.log("localStorage is supported. Getting [" + itemKey + "]");
    const item= window.localStorage.getItem(itemKey);
    if (isInvalid(item)) {
        throw new Error("Item [" + itemKey + "] not found");
    } else {
        return item;
    }
}
