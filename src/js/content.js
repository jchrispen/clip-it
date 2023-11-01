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
            console.log("Getting [" + request.itemKey + "] from localStorage");
            return getItem(request.itemKey)
                .catch(error => {
                    return rejectWith(error);
                });
        case Type.getAppConfig:
            console.log("Getting [" + request.itemKey + "] from appConfig");
            return getAppConfig(request.itemKey)
                .catch(error => {
                    return rejectWith(error);
                });
        case Type.bjs_clipOffers:
            console.log("BJ's clip it!");
            return bjs_content(request.membershipNumber, request.zipcode);
        case Type.giant_clipOffers:
            console.log("Giant clip it!");
            return giant_content(request.userId, request.locationId);
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
        return resolveWith({ item: item });
    }
}

function getAppConfig(itemKey) {
    // Get the appConfig.user JSON string
    const appConfigUserObj = window.wrappedJSObject.appConfig.user;
    // Check if the property with itemKey exists in the object
    if (appConfigUserObj.hasOwnProperty(itemKey)) {
        // Get the value associated with the itemKey
        return resolveWith({ item: appConfigUserObj[itemKey] });
    } else {
        throw new Error(itemKey + " was not found");
    }
}
