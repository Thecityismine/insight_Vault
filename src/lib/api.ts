import type { User } from "firebase/auth";

export async function authedGet(user: User, url: string): Promise<Response> {
  const token = await user.getIdToken();
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * POST JSON to an internal API route with the caller's Firebase ID token
 * attached, so the server can verify the request comes from a signed-in user.
 */
export async function authedPost(
  user: User,
  url: string,
  body: unknown
): Promise<Response> {
  const token = await user.getIdToken();
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
}
