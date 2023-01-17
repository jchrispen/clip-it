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
            clipit();
            tab.url = taburl + "/myCoupons";

        } else {
            console.log("FINDME: new tab!");
            // open new tab
            browser.tabs.create({
                url: taburl
            });
        }
    }
)

function clipit() {
    const executing = browser.tabs.executeScript({
        file: "js/BJs_clipAllOffers.js",
        allFrames: false
    });
    executing.then(onExecuted, onError);
}

function onExecuted(result) {
    console.log(`FINDME Success: We executed`);
}

function onError(error) {
    console.log(`FINDME Error: ${error}`);
}
