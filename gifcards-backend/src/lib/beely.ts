export type GiftCardEmailInput = {
  to: string;
  merchantName: string;
  amount: string;
  viewGiftUrl: string;
  giftMessage?: string;
};

export async function sendGiftCardEmail(
  apiKey: string,
  input: GiftCardEmailInput,
): Promise<boolean> {
  try {
    const response = await fetch("https://api.beely.com/v1/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: input.to,
        subject: `Your gift card from ${input.merchantName}`,
        template: "gift_card_delivery",
        data: {
          merchantName: input.merchantName,
          amount: input.amount,
          viewGiftUrl: input.viewGiftUrl,
          giftMessage: input.giftMessage ?? "",
        },
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
