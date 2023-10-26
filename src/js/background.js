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
        var bjs_url = "https://www.bjs.com";
        var current_url = tab.url;
        var bjs_match = current_url.startsWith(bjs_url);

        if (bjs_match) {
            console.log("MembershipNumber: Getting member number");
            const membershipNumber = await grabItem(tab, "x_MembershipNumber");
            // if membership is null or undefined exit.
            if (isInvalid(membershipNumber)) {
                const message = "Need to be logged in to clip coupons";
                onError(message);
                fail(message);
                return;
            }
            console.log("MembershipNumber: " + membershipNumber);

            console.log("clubDetails: Getting clubDetails");
            const clubDetails = await grabItem(tab, "clubDetailsForClubId");
            // if clubDetails is null or undefined exit.
            if (isInvalid(clubDetails)) {
                const message = "Need location selected to be able to pull offers";
                onError(message);
                fail(message);
                return;
            }

            console.log("Zipcode: Getting zipcode from clubDetails");
            let postalCode = null;
            try {
                postalCode = JSON.parse(clubDetails)["postalCode"];
            } catch (error) {
                const message = "Issue parsing clubDetails for zipcode";
                onError(message);
                fail(message);
                return;
            }
            const zipcode = postalCode;
            console.log("Zipcode: " + zipcode);

            console.log("Send clip request");
            await bjs_clipOffers(tab, membershipNumber, zipcode);
        } else {
            console.log("new tab!");
            browser.tabs.create({
                url: bjs_url
            });
        }
    }
)

/** ---------------------------------------------------------------------------
 * Common functions
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
                onError("did not find [" + key + "]: " + response.reason);
            }
            return valueString;
        })
        .catch(onError);
}

/** ---------------------------------------------------------------------------
 * BJs.com functions
 **/
async function bjs_clipOffers(tab, membershipNumber, zipcode) {
    await browser.tabs.sendMessage(tab.id, { type: Type.bjs_clipOffers, membershipNumber: membershipNumber, zipcode: zipcode })
        .then(value => {
            console.log(value);
            success(value);
        })
        .catch(error => {
            onError(error.message);
            fail(error.message);
        });
}
