/*
 * Clip all the coupons on your BJs account.
 */

browser.browserAction.onClicked.addListener((tab) => {
        var taburl = "https://www.bjs.com";
        var currenturl = tab.url;

        var match = currenturl.startsWith(taburl);
        if (match) {
            // clip coupons
            console.log("FINDME: clip it!");
            // call the clippAllOffers().then() function
            browser.tabs.reload();
        } else {
            console.log("FINDME: new tab!");
            // open new tab
            browser.tabs.create({
                url: taburl
            });
        }
    }
);
