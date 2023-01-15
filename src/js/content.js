/*
Add the clipAllOffers function to the document.body.
*/
loader = document.createElement('script');
loader.id = "ClipAllOffers";
loader.text = "async function clipAllOffers() {\n" +
    "    const membershipNumber = localStorage.getItem('x_MembershipNumber');\n" +
    "    const zipcode = JSON.parse(localStorage.getItem('clubDetailsForClubId')).postalCode;\n" +
    "    await fetch('https://api.bjs.com/digital/live/api/v1.0/member/available/offers', {\n" +
    "        method: 'post',\n" +
    "        credentials: 'include',\n" +
    "        body: JSON.stringify({\n" +
    "            membershipNumber,\n" +
    "            zipcode,\n" +
    "            'category': '',\n" +
    "            'isPrev': false,\n" +
    "            'isNext': true,\n" +
    "            'pagesize': 500,\n" +
    "            'searchString': '',\n" +
    "            'indexForPagination': 0,\n" +
    "            'brand': ''\n" +
    "        })\n" +
    "    })\n" +
    "        .then(r => r.json())\n" +
    "        .then(([{ availableOffers }]) => {\n" +
    "            // Intentionally doing sequential requests to avoid hammering the backend\n" +
    "            availableOffers.forEach(async ({ offerId, storeId }) => {\n" +
    "                await fetch(\n" +
    "                    `https://api.bjs.com/digital/live/api/v1.0/store/${storeId}/coupons/activate?zip=07302&offerId=${offerId}`,\n" +
    "                    {\n" +
    "                        credentials: 'include'\n" +
    "                    }\n" +
    "                )\n" +
    "            })\n" +
    "        });\n" +
    "};";
document.body.appendChild(loader);
