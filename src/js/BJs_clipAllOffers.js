/**
 * Clip all available BJ's coupons
 * - Login to BJ's website
 * - Open dev console and paste this function
 * - Run it! Example `await clipAllOffers()`
 * @return {Promise<T>}
 */
async function clipAllOffers() {
    const membershipNumber = localStorage.getItem('x_MembershipNumber');
    // if membership is null or undefined exit.
    if (membershipNumber === null || membershipNumber === undefined) {
        console.log("FINDME membership: Need to be logged in to clip coupons.");
        alert("You must be logged in.");
        return;
    }
    let clubDetails = localStorage.getItem('clubDetailsForClubId');
    if (clubDetails === null || clubDetails === undefined) {
        console.log("FINDME club: Need location selected to be able to pull offers.");
        alert("You must select a store.");
        return;
    }
    console.log("FINDME: clipping coupons!");
    const zipcode = JSON.parse(clubDetails).postalCode;
    await fetch('https://api.bjs.com/digital/live/api/v1.0/member/available/offers', {
        method: 'post',
        credentials: 'include',
        body: JSON.stringify({
            membershipNumber,
            zipcode,
            'category': '',
            'isPrev': false,
            'isNext': true,
            'pagesize': 500,
            'searchString': '',
            'indexForPagination': 0,
            'brand': ''
        })
    })
        .then(r => r.json())
        .then(([{ availableOffers }]) => {
            // Intentionally doing sequential requests to avoid hammering the backend
            availableOffers.forEach(async ({ offerId, storeId }) => {
                await fetch(
                    `https://api.bjs.com/digital/live/api/v1.0/store/${storeId}/coupons/activate?zip=07302&offerId=${offerId}`,
                    {
                        credentials: 'include'
                    }
                )
            })
        });
    alert("Coupons clipped");
}

clipAllOffers();
