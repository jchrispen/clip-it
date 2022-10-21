/**
 * Clip all available BJ's coupons
 * - Login to BJ's website
 * - Open dev console and paste this function
 * - Run it! Example `await clipAllOffers()`
 * @return {Promise<T>}
 */
async function clipAllOffers() {
    const membershipNumber = localStorage.getItem('x_MembershipNumber')
    const zipcode = JSON.parse(localStorage.getItem('clubDetailsForClubId')).postalCode
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
        })
}