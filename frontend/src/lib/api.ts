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

export type DocumentSummary = {
  document_id: number;
  title: string;
  updated_at: string;
  user_id: number;
};

export type DocumentDetail = {
  document_id: number;
  title: string;
  content: string;
  user_id: number;
  updated_at?: string;
};

export type DocumentPayload = {
  title: string;
  content: string;
};

export type SentenceSummary = {
  sentence_id: number;
  content: string;
  start_index: number;
  end_index: number;
  flags: boolean;
  confidence: number;
};

export type CorrectionDetail = {
  correction_id: number;
  suggested_correction: string;
  reasoning: string;
  sources: string;
  created_at: string;
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

export async function listDocuments(userId: number): Promise<DocumentSummary[]> {
  return request<DocumentSummary[]>(`/documents/?user_id=${userId}`);
}

export async function getDocument(documentId: number): Promise<DocumentDetail> {
  return request<DocumentDetail>(`/documents/${documentId}/`);
}

export async function createDocument(userId: number, payload: DocumentPayload): Promise<DocumentDetail> {
  const { document_id } = await request<{ document_id: number }>("/documents/create/", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      title: payload.title,
      content: payload.content,
    }),
  });
  return getDocument(document_id);
}

export async function updateDocument(documentId: number, payload: Partial<DocumentPayload>): Promise<DocumentDetail> {
  await request<{ message: string }>(`/documents/${documentId}/update/`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return getDocument(documentId);
}

export async function deleteDocument(documentId: number): Promise<void> {
  await request<{ message: string }>(`/documents/${documentId}/delete/`, {
    method: "DELETE",
  });
}

export async function listDocumentSentences(documentId: number): Promise<SentenceSummary[]> {
  return request<SentenceSummary[]>(`/documents/${documentId}/sentences/`);
}

export async function listSentenceCorrections(sentenceId: number): Promise<CorrectionDetail[]> {
  return request<CorrectionDetail[]>(`/sentences/${sentenceId}/corrections/`);
}
