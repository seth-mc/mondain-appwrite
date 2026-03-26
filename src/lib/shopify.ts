const SHOPIFY_DOMAIN = "m-ondain.myshopify.com";
const SHOPIFY_ACCESS_TOKEN = "8c6d7e13254333199d913e533d62f9f2";

export async function getProductHandle(shopifyProductId: string): Promise<string | null> {
  if (!shopifyProductId) return null;

  // Handle IDs that might already be handles
  if (isNaN(Number(shopifyProductId)) && !shopifyProductId.startsWith('gid://')) {
    return shopifyProductId;
  }

  // Construct standard Shopify GID if it's just a number
  const gid = shopifyProductId.startsWith('gid://') 
    ? shopifyProductId 
    : `gid://shopify/Product/${shopifyProductId}`;

  const query = `
    query getProductHandle($id: ID!) {
      product(id: $id) {
        handle
      }
    }
  `;

  try {
    const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query,
        variables: { id: gid },
      }),
    });

    const result = await response.json();
    return result.data?.product?.handle || null;
  } catch (error) {
    console.error("Error fetching Shopify handle:", error);
    return null;
  }
}
