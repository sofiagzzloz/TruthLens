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

export type AnalysisResponse = {
  status: string;
  analysis: unknown;
};

export type ApplyCorrectionResponse = {
  document_id: number;
  content: string;
  sentences: Array<{
    sentence_id: number;
    content: string;
    start_index: number;
    end_index: number;
    flags: boolean;
    confidence: number;
    corrections: CorrectionDetail[];
  }>;
};

function normalizeBaseUrl(raw?: string | null): string | null {
  if (!raw) {
    return null;
  }

  try {
    return new URL(raw).origin;
  } catch (error) {
    try {
      return new URL(`http://${raw}`).origin;
    } catch (nestedError) {
      console.warn("Failed to normalize API base URL", nestedError);
      return raw.replace(/\/$/, "");
    }
  }
}

const CONFIGURED_API_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL ?? null);

const API_URL = (() => {
  if (typeof window === "undefined") {
    return CONFIGURED_API_URL ?? "http://localhost:8000";
  }

  if (!CONFIGURED_API_URL) {
    const port = window.location.protocol === "https:" ? "443" : "8000";
    return `${window.location.protocol}//${window.location.hostname}:${port}`;
  }

  try {
    const url = new URL(CONFIGURED_API_URL);
    const localBackendHosts = new Set(["backend", "127.0.0.1", "0.0.0.0"]);

    if (localBackendHosts.has(url.hostname)) {
      url.hostname = window.location.hostname;
    }

    if (!url.port) {
      url.port = url.protocol === "https:" ? "443" : "8000";
    }

    return url.origin;
  } catch (error) {
    console.warn("Falling back to window-derived API base URL", error);
    const port = window.location.protocol === "https:" ? "443" : "8000";
    return `${window.location.protocol}//${window.location.hostname}:${port}`;
  }
})();

const API_PREFIX = "/api";

export class DocumentNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentNotFoundError";
  }
}

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
    const normalized = typeof message === "string" ? message.toLowerCase() : "";

    // Allow callers to handle this specific error gracefully without throwing.
    if (normalized.includes("document not found")) {
      throw new DocumentNotFoundError(message ?? "document not found");
    }

    throw new Error(message || "Unexpected API error");
  }

  if (response.status === 204) {
    return undefined as T;
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
  try {
    await request<{ message: string }>(`/documents/${documentId}/delete/`, {
      method: "DELETE",
    });
  } catch (error: unknown) {
    if (error instanceof DocumentNotFoundError) {
      return;
    }
    throw error;
  }
}

export async function listDocumentSentences(documentId: number): Promise<SentenceSummary[]> {
  return request<SentenceSummary[]>(`/documents/${documentId}/sentences/`);
}

export async function listSentenceCorrections(sentenceId: number): Promise<CorrectionDetail[]> {
  return request<CorrectionDetail[]>(`/sentences/${sentenceId}/corrections/`);
}

export async function applySentenceCorrection(sentenceId: number, correctionId: number): Promise<ApplyCorrectionResponse> {
  return request<ApplyCorrectionResponse>(`/sentences/${sentenceId}/apply/${correctionId}/`, {
    method: "POST",
  });
}

export async function runDocumentAnalysis(documentId: number): Promise<AnalysisResponse> {
  return request<AnalysisResponse>(`/documents/${documentId}/analyze/`, {
    method: "POST",
  });
}
