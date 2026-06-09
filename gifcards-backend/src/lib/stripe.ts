export type CreateCheckoutSessionInput = {
  amountCents: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail: string;
  metadata: Record<string, string>;
};

export async function createStripeCheckoutSession(
  secretKey: string,
  input: CreateCheckoutSessionInput,
): Promise<{ id: string; url: string }> {
  const params = new URLSearchParams();
  params.append("mode", "payment");
  params.append("success_url", input.successUrl);
  params.append("cancel_url", input.cancelUrl);
  params.append("customer_email", input.customerEmail);
  params.append("line_items[0][price_data][currency]", input.currency.toLowerCase());
  params.append("line_items[0][price_data][unit_amount]", String(input.amountCents));
  params.append("line_items[0][price_data][product_data][name]", "Gift Card");
  params.append("line_items[0][quantity]", "1");

  for (const [key, value] of Object.entries(input.metadata)) {
    params.append(`metadata[${key}]`, value);
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Stripe checkout failed: ${response.status} ${err}`);
  }

  const data = (await response.json()) as { id: string; url: string };
  return { id: data.id, url: data.url };
}

export async function verifyStripeWebhook(
  payload: string,
  signature: string,
  secret: string,
): Promise<{ type: string; id: string; data: Record<string, unknown> }> {
  const parts = signature.split(",").reduce<Record<string, string>>((acc, part) => {
    const [k, v] = part.split("=");
    if (k && v) acc[k] = v;
    return acc;
  }, {});

  const timestamp = parts.t;
  const sig = parts.v1;
  if (!timestamp || !sig) {
    throw new Error("invalid_stripe_signature");
  }

  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (expected !== sig) {
    throw new Error("invalid_stripe_signature");
  }

  const event = JSON.parse(payload) as {
    id: string;
    type: string;
    data: { object: Record<string, unknown> };
  };

  return { type: event.type, id: event.id, data: event.data.object };
}
