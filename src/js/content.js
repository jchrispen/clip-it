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
    if (request.type === Type.getItem) {
        console.log("Getting [" + request.itemKey + "]");
        let itemValue =  null;
        try {
            itemValue = getItem(request.itemKey);
            console.log(request.itemKey + ": " + itemValue);
            return Promise.resolve({ item: itemValue });
        } catch (error) {
            onError("onMessage: " + error);
            return Promise.reject(error);
        }
    } else if (request.type === Type.bjs_clipOffers) {
        console.log("clip it!");
        return bjs_clipOffers(request.membershipNumber, request.zipcode);
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

/** ---------------------------------------------------------------------------
 * BJs.com functions
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
