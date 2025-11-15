export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  identifier: string;
  password: string;
};

export type ApiUser = {
  user_id: number;
  username: string;
  email: string;
};

export type UpdateUserPayload = {
  username?: string;
  email?: string;
  password?: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8000";
const API_PREFIX = "/api";

async function request<T>(
  input: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${API_PREFIX}${input}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = typeof errorBody?.error === "string" ? errorBody.error : response.statusText;
    throw new Error(message || "Unexpected API error");
  }

  return response.json() as Promise<T>;
}

export async function registerUser(payload: RegisterPayload): Promise<ApiUser> {
  return request<ApiUser>("/users/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload: LoginPayload): Promise<ApiUser> {
  const { user_id } = await request<{ user_id: number }>("/users/login/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return getUser(user_id);
}

export async function getUser(userId: number): Promise<ApiUser> {
  return request<ApiUser>(`/users/${userId}/`, {
    method: "GET",
    cache: "no-store",
  });
}

export async function updateUserProfile(userId: number, payload: UpdateUserPayload): Promise<ApiUser> {
  await request<{ message: string }>(`/users/${userId}/update/`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return getUser(userId);
}

export async function changeUserPassword(
  userId: number,
  payload: ChangePasswordPayload,
): Promise<void> {
  await request<{ message: string }>(`/users/${userId}/change-password/`, {
    method: "POST",
    body: JSON.stringify({
      current_password: payload.currentPassword,
      new_password: payload.newPassword,
    }),
  });
}

export async function deleteUserAccount(userId: number): Promise<void> {
  await request<{ message: string }>(`/users/${userId}/delete/`, {
    method: "DELETE",
  });
}
