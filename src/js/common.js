/**
 * Common functions and information that both
 * background and content scripts use.
 */

/**
 * static constant values for all scripts
 */
const MAX_COUPON_REQUEST = 500;


/**
 * Type class is an enum to keep background and
 * content scripts inline with each other.
 */
class Type {
    static getItem = 0;
    static bjs_clipOffers = 1;
    static future_site = 2;
}

function onError(error) {
    console.error(`Error: ${error}`);
}

/**
 * This function only works in background scripts.
 * Does not work in content scripts.
 *
 * @param title is the larger text that will be displayed.
 * @param message is the description of the alert.
 */
function showAlert(title, message) {
    if (title === null || title === undefined || message === null || message === undefined) {
        onError("Alert: title or message are null or undefined");
        return;
    }

    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/clip-it_dark.png',
        title: title,
        message: message,
        priority: 1
    });
}

function isInvalid(variable) {
    return variable === null || variable === undefined;
}