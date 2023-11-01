/**
 * - Clip all available Giant Food's coupons
 * - Giant Food's functions and information that both
 *   background and content scripts use.
 */

/**
 * static constant values for all scripts
 */
const GIANT_URL = "https://giantfood.com";
const DEFAULT_USER = 2;

/** ---------------------------------------------------------------------------
 * GiantFood.com background functions
 **/
async function giant_background(tab) {
    let userId;
    let locationId;
    try {
        userId = await giant_getUserId(tab)
            .then(item => {
                if (item === DEFAULT_USER) {
                    throw new Error("Need to login");
                }
                return item;
            });
        locationId = await giant_getLocationId(tab)
            .then(item => {
                return item;
            });

        return await giant_clipCoupons(tab, userId, locationId);
    } catch (error) {
        return rejectWith(error.message);
    }
}

async function giant_getUserUuid(tab) {
    console.log("Getting user-uuid");
    const uuid = await grabItem(tab, "user-uuid");
    // if item is null or undefined throw down.
    if (isInvalid(uuid)) {
        throw new Error("Need to login");
    }

    console.log("User-Uuid: " + uuid);
    return resolveWith(uuid);
}

async function giant_getUserId(tab) {
    console.log("Getting User ID");
    const userId = await grabAppConfig(tab, "userId");
    // if item is null or undefined throw down.
    if (isInvalid(userId)) {
        throw new Error("Need to login");
    }

    console.log("User ID: " + userId);
    return resolveWith(userId);
}

async function giant_getLocationId(tab) {
    console.log("Getting locationId");
    const locationId = await grabAppConfig(tab, "currentServiceLocationId");
    // if item is null or undefined throw down.
    if (isInvalid(locationId)) {
        throw new Error("Need to login");
    }

    console.log("locationIdd: " + locationId);
    return resolveWith(locationId);
}

async function giant_clipCoupons(tab, userId, locationId) {
    console.log("Send clip request");
    return browser.tabs.sendMessage(tab.id,
        { type: Type.giant_clipOffers, userId: userId, locationId: locationId });
}

/** ---------------------------------------------------------------------------
 * BJs.com content functions
 **/
async function giant_content(userId, locationId) {
    console.log("Preparing to clip offers");
    return giant_fetch(userId, locationId)
        .then((availableOffers) => {
            return giant_processOffers(availableOffers, userId);
        });
}

async function giant_fetch(userId, locationId) {
    console.log("Fetching available offers from API");
    const fetch_url = `${GIANT_URL}/api/v6.0/coupons/users/${userId}/prism/service-locations/${locationId}/coupons/search?fullDocument=true&unwrap=true`;

    try {
        const response = await fetch(fetch_url, {
            method: "post",
            credentials: 'include',
            mode: "cors",
            body: JSON.stringify({
                query: { start: 0, size: MAX_COUPON_REQUEST },
                filter: { loadable: true, loaded: false, sourceSystems: ["QUO", "COP"] },
                copientQuotientTargetingEnabled: true,
                sorts: [{ targeted: "desc" }]
            }),
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/118.0",
                "Accept": "application/json, text/plain, */*",
                "Accept-Language": "en-US,en;q=0.5",
                "Content-Type": "application/json;charset=utf-8",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin"
            }
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok with status [${response.status}`);
        }

        const data = await response.json();
        return data.coupons;
    } catch (error) {
        onError(error);
        throw error;
    }
}

async function giant_processOffers(availableOffers, userId) {
    if (availableOffers.length === 0) {
        return resolveWith("No offers available");
    }

    let count = 0;
    if (availableOffers && Array.isArray(availableOffers)) {
        for (const offer of availableOffers) {
            const offerId = offer.id;
            if (await giant_fetchCoupons(offerId, userId)) {
                count++
            }
        }
    } else {
        return rejectWith("Available offers is not iterable or is not an array.");
    }
    return resolveWith(count + " coupons clipped");
}

async function giant_fetchCoupons(offerId, userId) {
    if (isInvalid(offerId)) {
        onError("OfferId is not valid");
        return false;
    }

    const response = await fetch(`${GIANT_URL}/api/v6.0/users/${userId}/coupons/clipped`, {
        credentials: "include",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/json;charset=utf-8",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin"
        },
        referrer: `${GIANT_URL}/savings/coupons/browse`,
        body: JSON.stringify({ couponId: offerId }),
        method: "POST",
        mode: "cors"
    });
    return (response.status >= 200 && response.status <= 299);
}

