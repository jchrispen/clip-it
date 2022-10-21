/*
 * Clip all the coupons on your BJs account.
 */
async function clipCoupons() {

    console.log("Clipping ...")
    await clipAllOffers().then()
    console.log("... Clipped")
}

// bind to clicking on the extension icon
browser.browserAction.onClicked.addListener(clipCoupons);

await clipCoupons().then()
