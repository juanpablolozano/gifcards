import { apiFetch } from "../lib/apiClient";

export async function getPresignedUploadUrl(
  token: string,
  payload: { purpose: "logo" | "preview"; contentType: string; fileName: string },
): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  return apiFetch("/api/v1/uploads/presign", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function uploadFileToS3(uploadUrl: string, file: File): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!response.ok) {
    throw new Error("upload_failed");
  }
}
