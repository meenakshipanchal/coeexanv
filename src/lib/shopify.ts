// Shopify Admin API integration
// Fetches customer name by ID, stores fingerprint in metafield

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || "";
const SHOPIFY_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || "";
const SHOPIFY_VERSION = process.env.SHOPIFY_API_VERSION || "2024-07";

function shopifyURL(path: string) {
  return `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_VERSION}${path}`;
}

const headers = {
  "X-Shopify-Access-Token": SHOPIFY_TOKEN,
  "Content-Type": "application/json",
};

// ─── Fetch customer by ID ───

export async function getCustomerById(customerId: string): Promise<{
  id: string;
  name: string;
  email: string;
  phone: string;
  orders_count: number;
  total_spent: string;
} | null> {
  try {
    const res = await fetch(shopifyURL(`/customers/${customerId}.json`), { headers });
    if (!res.ok) return null;
    const data = await res.json();
    const c = data.customer;
    return {
      id: String(c.id),
      name: `${c.first_name || ""} ${c.last_name || ""}`.trim(),
      email: c.email || "",
      phone: c.phone || "",
      orders_count: c.orders_count || 0,
      total_spent: c.total_spent || "0.00",
    };
  } catch {
    return null;
  }
}

// ─── Search customer by email or phone ───

export async function searchCustomer(query: string): Promise<{
  id: string;
  name: string;
  email: string;
  phone: string;
  orders_count: number;
  total_spent: string;
} | null> {
  try {
    const res = await fetch(shopifyURL(`/customers/search.json?query=${encodeURIComponent(query)}&limit=1`), { headers });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.customers || data.customers.length === 0) return null;
    const c = data.customers[0];
    return {
      id: String(c.id),
      name: `${c.first_name || ""} ${c.last_name || ""}`.trim(),
      email: c.email || "",
      phone: c.phone || "",
      orders_count: c.orders_count || 0,
      total_spent: c.total_spent || "0.00",
    };
  } catch {
    return null;
  }
}

// ─── Store fingerprint in customer metafield ───

export async function storeFingerprintInMetafield(customerId: string, fingerprintId: string): Promise<boolean> {
  try {
    // First check if metafield already exists
    const existingRes = await fetch(
      shopifyURL(`/customers/${customerId}/metafields.json?namespace=cooee&key=fingerprint_ids`),
      { headers }
    );
    let existingFingerprints: string[] = [];
    if (existingRes.ok) {
      const existingData = await existingRes.json();
      if (existingData.metafields && existingData.metafields.length > 0) {
        try {
          existingFingerprints = JSON.parse(existingData.metafields[0].value);
        } catch {
          existingFingerprints = [existingData.metafields[0].value];
        }
      }
    }

    // Add new fingerprint if not already there
    if (!existingFingerprints.includes(fingerprintId)) {
      existingFingerprints.push(fingerprintId);
    }

    // Keep only last 10 fingerprints (different devices)
    if (existingFingerprints.length > 10) {
      existingFingerprints = existingFingerprints.slice(-10);
    }

    // Store in metafield
    const res = await fetch(shopifyURL(`/customers/${customerId}/metafields.json`), {
      method: "POST",
      headers,
      body: JSON.stringify({
        metafield: {
          namespace: "cooee",
          key: "fingerprint_ids",
          value: JSON.stringify(existingFingerprints),
          type: "json",
        },
      }),
    });

    return res.ok;
  } catch {
    return false;
  }
}

// ─── Lookup customer by fingerprint (check all customers' metafields) ───
// This is expensive — use the DB lookup instead

export async function lookupByFingerprint(fingerprintId: string): Promise<{
  id: string;
  name: string;
  email: string;
  phone: string;
  orders_count: number;
  total_spent: string;
} | null> {
  try {
    // Search metafields for this fingerprint
    const res = await fetch(
      shopifyURL(`/metafields.json?namespace=cooee&key=fingerprint_ids&limit=250`),
      { headers }
    );
    if (!res.ok) return null;
    const data = await res.json();

    for (const mf of data.metafields || []) {
      try {
        const fps = JSON.parse(mf.value);
        if (Array.isArray(fps) && fps.includes(fingerprintId)) {
          // Found! Get the customer
          const ownerId = mf.owner_id;
          return await getCustomerById(String(ownerId));
        }
      } catch { continue; }
    }
    return null;
  } catch {
    return null;
  }
}
