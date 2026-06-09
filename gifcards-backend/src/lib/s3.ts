export type PresignInput = {
  bucket: string;
  key: string;
  contentType: string;
  accessKeyId: string;
  secretAccessKey: string;
  region?: string;
};

async function hmacSha256(key: ArrayBuffer | string, data: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const keyData = typeof key === "string" ? encoder.encode(key) : key;
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createPresignedPutUrl(input: PresignInput): Promise<string> {
  const region = input.region ?? "us-east-1";
  const service = "s3";
  const method = "PUT";
  const host = `${input.bucket}.s3.${region}.amazonaws.com`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const credential = `${input.accessKeyId}/${credentialScope}`;

  const canonicalHeaders =
    `content-type:${input.contentType}\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:UNSIGNED-PAYLOAD\n` +
    `x-amz-date:${amzDate}\n`;

  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [
    method,
    `/${input.key}`,
    "",
    canonicalHeaders,
    signedHeaders,
    "UNSIGNED-PAYLOAD",
  ].join("\n");

  const encoder = new TextEncoder();
  const canonicalHash = toHex(
    await crypto.subtle.digest("SHA-256", encoder.encode(canonicalRequest)),
  );

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    canonicalHash,
  ].join("\n");

  const kDate = await hmacSha256(`AWS4${input.secretAccessKey}`, dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  const kSigning = await hmacSha256(kService, "aws4_request");
  const signature = toHex(await hmacSha256(kSigning, stringToSign));

  const query = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": credential,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": "900",
    "X-Amz-SignedHeaders": signedHeaders,
    "X-Amz-Signature": signature,
  });

  return `https://${host}/${input.key}?${query.toString()}`;
}

export function buildPublicUrl(bucket: string, key: string, region = "us-east-1"): string {
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}
