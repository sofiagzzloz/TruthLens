"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  FileText,
  Info,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createDocument,
  deleteDocument,
  getDocument,
  listDocuments,
  listDocumentSentences,
  listSentenceCorrections,
  runDocumentAnalysis,
  updateDocument,
  type DocumentDetail,
  type DocumentSummary,
  type CorrectionDetail,
  type SentenceSummary,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const EMPTY_FORM = {
  title: "",
  content: "",
};

type SelectedKey = number | "new" | null;

type SentenceAnalysis = SentenceSummary & {
  corrections: CorrectionDetail[];
};

type SuggestionItem = {
  sentence: SentenceAnalysis;
  correction: CorrectionDetail;
};

function formatUpdated(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }
  return parsed.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
}

function buildHighlightedContent(
  content: string,
  analyses: SentenceAnalysis[],
  activeSentenceId: number | null,
  onSelect: (sentence: SentenceAnalysis) => void,
): ReactNode {
  if (!content.trim()) {
    return <span className="text-muted-foreground">Start drafting to see TruthLens highlights.</span>;
  }

  const highlightable = analyses
    .filter((item) => item.flags || item.corrections.length > 0)
    .sort((a, b) => a.start_index - b.start_index);

  if (!highlightable.length) {
    return <span>{content}</span>;
  }

  const fragments: ReactNode[] = [];
  let cursor = 0;

  highlightable.forEach((sentence) => {
    const safeStart = Math.max(0, Math.min(sentence.start_index, content.length));
    const safeEnd = Math.max(safeStart, Math.min(sentence.end_index, content.length));

    if (safeStart > cursor) {
      fragments.push(
        <span key={`text-${cursor}-${safeStart}`}>{content.slice(cursor, safeStart)}</span>,
      );
    }

    const text = content.slice(safeStart, safeEnd);
    fragments.push(
      <button
        key={`highlight-${sentence.sentence_id}`}
        type="button"
        onClick={() => onSelect(sentence)}
        className={cn(
          "inline rounded border border-transparent bg-destructive/10 px-1 py-[1px] text-left transition hover:border-destructive/40 hover:bg-destructive/20 focus:outline-none",
          activeSentenceId === sentence.sentence_id &&
            "border-destructive/60 bg-destructive/20 ring-2 ring-destructive/30",
        )}
      >
        {text}
      </button>,
    );

    cursor = safeEnd;
  });

  if (cursor < content.length) {
    fragments.push(<span key={`tail-${cursor}`}>{content.slice(cursor)}</span>);
  }

  return fragments;
}

function parseSources(raw: string | null | undefined): string[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }
  } catch (error) {
    // fall through to string splitting below
  }

  return raw
    .split(/\r?\n|\s*;\s*|\s*,\s*/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function buildPreviewSnippet(content?: string | null): string {
  const normalized = (content ?? "").trim();
  if (!normalized) {
    return "Open this draft to start shaping your story.";
  }
  if (normalized.length <= 220) {
    return normalized;
  }
  return `${normalized.slice(0, 217)}…`;
}

export default function WorkspacePage() {
  const router = useRouter();
  const { user, ready } = useAuth();

  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [selectedId, setSelectedId] = useState<SelectedKey>(null);
  const [detail, setDetail] = useState<DocumentDetail | null>(null);
  const [formState, setFormState] = useState({ ...EMPTY_FORM });

  const [isListLoading, setIsListLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sentences, setSentences] = useState<SentenceAnalysis[]>([]);
  const [analysisUpdatedAt, setAnalysisUpdatedAt] = useState<string | null>(null);
  const [activeSentenceId, setActiveSentenceId] = useState<number | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [isAnalysisStale, setIsAnalysisStale] = useState(false);
  const [documentPreviews, setDocumentPreviews] = useState<Record<number, string>>({});
  const [modalSentenceId, setModalSentenceId] = useState<number | null>(null);
  const [insightTab, setInsightTab] = useState<"suggestions" | "sentences">("suggestions");

  const modalSentence = useMemo(
    () =>
      typeof modalSentenceId === "number"
        ? sentences.find((item) => item.sentence_id === modalSentenceId) ?? null
        : null,
    [modalSentenceId, sentences],
  );

  useEffect(() => {
    if (ready && !user) {
      router.replace("/auth/login");
    }
  }, [ready, user, router]);

  useEffect(() => {
    setSentences([]);
    setActiveSentenceId(null);
    setAnalysisUpdatedAt(null);
    setIsAnalysisStale(false);
    setModalSentenceId(null);
    setInsightTab("suggestions");
  }, [selectedId]);

  useEffect(() => {
    const missing = documents.filter((doc) => !(doc.document_id in documentPreviews));
    if (!missing.length) {
      return;
    }

    let isCancelled = false;

    Promise.all(
      missing.map((doc) =>
        getDocument(doc.document_id)
          .then((full) => ({ id: doc.document_id, content: full.content ?? "" }))
          .catch((error) => {
            console.error(error);
            return null;
          }),
      ),
    )
      .then((entries) => {
        if (isCancelled) {
          return;
        }

        setDocumentPreviews((previous) => {
          const next = { ...previous };
          entries.forEach((entry) => {
            if (entry) {
              next[entry.id] = entry.content;
            }
          });
          return next;
        });
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      isCancelled = true;
    };
  }, [documents, documentPreviews]);

  const openSentenceModal = useCallback((sentence: SentenceAnalysis) => {
    setActiveSentenceId(sentence.sentence_id);
    setModalSentenceId(sentence.sentence_id);
    setInsightTab("sentences");
  }, []);

  const closeSentenceModal = useCallback(() => {
    setModalSentenceId(null);
  }, []);

  const suggestionItems = useMemo(
    () =>
      sentences.flatMap((sentence) =>
        sentence.corrections.map((correction) => ({
          sentence,
          correction,
        })),
      ),
    [sentences],
  );

  const flaggedCount = useMemo(
    () => sentences.filter((item) => item.flags || item.corrections.length > 0).length,
    [sentences],
  );

  const contentHighlights = useMemo(
    () => buildHighlightedContent(formState.content, sentences, activeSentenceId, openSentenceModal),
    [formState.content, sentences, activeSentenceId, openSentenceModal],
  );

  const refreshDocuments = useCallback(
    async (targetSelection?: SelectedKey, showSpinner = true) => {
      if (!user) {
        return;
      }

      if (showSpinner) {
        setIsListLoading(true);
      }

      try {
        const docs = await listDocuments(user.user_id);
        setDocuments(docs);
        setDocumentPreviews((previous) => {
          const valid = new Set(docs.map((doc) => doc.document_id));
          let changed = false;
          const next: Record<number, string> = {};
          Object.entries(previous).forEach(([key, value]) => {
            const numericKey = Number(key);
            if (valid.has(numericKey)) {
              next[numericKey] = value;
            } else {
              changed = true;
            }
          });
          if (!changed && Object.keys(previous).length === Object.keys(next).length) {
            return previous;
          }
          return next;
        });

        if (typeof targetSelection !== "undefined") {
          setSelectedId(targetSelection);
        } else {
          setSelectedId((previous) => {
            if (previous === "new") {
              return docs.length ? previous : "new";
            }

            if (typeof previous === "number") {
              if (docs.some((doc) => doc.document_id === previous)) {
                return previous;
              }
              return docs.length ? docs[0].document_id : null;
            }

            return previous;
          });
        }
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Unable to load documents");
      } finally {
        if (showSpinner) {
          setIsListLoading(false);
        }
      }
    },
    [user],
  );

  useEffect(() => {
    if (ready && user) {
      refreshDocuments(undefined, true).catch((error) => {
        console.error(error);
      });
    }
  }, [ready, user, refreshDocuments]);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (selectedId === null) {
      return;
    }

    if (selectedId === "new") {
      setDetail(null);
      setFormState(() => ({ ...EMPTY_FORM }));
      setIsDetailLoading(false);
      return;
    }

    let isActive = true;
    setIsDetailLoading(true);
    getDocument(selectedId)
      .then((doc) => {
        if (!isActive) {
          return;
        }
        setDetail(doc);
        setFormState({ title: doc.title ?? "", content: doc.content ?? "" });
        setDocumentPreviews((previous) => ({
          ...previous,
          [doc.document_id]: doc.content ?? "",
        }));
      })
      .catch((error) => {
        if (!isActive) {
          return;
        }
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Unable to open document");
        refreshDocuments(undefined, false).catch((refreshError) => console.error(refreshError));
      })
      .finally(() => {
        if (isActive) {
          setIsDetailLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [selectedId, user, refreshDocuments]);

  const selectedSummary =
    typeof selectedId === "number"
      ? documents.find((doc) => doc.document_id === selectedId)
      : undefined;

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Preparing your workspace…</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSelectDocument = (id: number) => {
    setSelectedId(id);
  };

  const handleCreateNew = () => {
    setSelectedId("new");
    setDetail(null);
    setFormState(() => ({ ...EMPTY_FORM }));
  };

  if (selectedId === null) {
    return (
      <div className="container py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-3">
            <Badge variant="outline" className="w-fit">
              Workspace
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight">My workspace</h1>
            <p className="text-muted-foreground">
              Pick a draft to continue polishing or spin up a new document. TruthLens keeps every
              project ready for a focused editing session.
            </p>
          </div>
          <Button type="button" onClick={handleCreateNew} className="sm:w-auto">
            <Plus className="mr-2 size-4" />
            New document
          </Button>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <button
            type="button"
            onClick={handleCreateNew}
            className={cn(
              "flex h-full min-h-[220px] w-full flex-col justify-between rounded-xl border border-dashed border-border/70 bg-card/60 p-6 text-left transition hover:border-primary/50 hover:bg-primary/5 focus:outline-none",
            )}
          >
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Plus className="size-3" /> Start fresh
              </div>
              <h3 className="text-xl font-semibold">Create a new document</h3>
              <p className="text-sm text-muted-foreground">
                Capture research, draft an argument, or paste existing copy to run it through TruthLens.
              </p>
            </div>
            <span className="text-sm font-medium text-primary">Open editor →</span>
          </button>

          {isListLoading ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-border/70 bg-card/60 text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" /> Loading your drafts…
            </div>
          ) : documents.length ? (
            documents.map((doc) => {
              const rawPreview = documentPreviews[doc.document_id] ?? (detail?.document_id === doc.document_id ? detail?.content : "");
              const previewText = buildPreviewSnippet(rawPreview);
              return (
                <button
                  key={doc.document_id}
                  type="button"
                  onClick={() => handleSelectDocument(doc.document_id)}
                  className={cn(
                    "flex h-full min-h-[220px] w-full flex-col justify-between rounded-xl border border-border/70 bg-card/70 p-6 text-left shadow-sm transition hover:border-primary/50 hover:bg-primary/5 focus:outline-none",
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Updated {formatUpdated(doc.updated_at)}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{doc.title || "Untitled document"}</h3>
                    <p className="min-h-[96px] whitespace-pre-wrap text-sm text-muted-foreground">
                      {previewText}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-primary">Continue editing →</span>
                </button>
              );
            })
          ) : (
            <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-border/70 bg-card/60 p-6 text-sm text-muted-foreground">
              No saved drafts yet. Start a new document to see it appear here.
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleFormChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
    if (!isAnalysisStale && sentences.length > 0) {
      setIsAnalysisStale(true);
    }
  };

  const handleReset = () => {
    if (selectedId === "new") {
      setFormState(() => ({ ...EMPTY_FORM }));
      setDetail(null);
    } else if (detail) {
      setFormState({ title: detail.title ?? "", content: detail.content ?? "" });
      setIsAnalysisStale(false);
    }
  };

  const handleAnalyze = async () => {
    if (typeof selectedId !== "number") {
      toast.error("Save your document before running TruthLens analysis");
      return;
    }

    const trimmedTitle = formState.title.trim();
    if (!trimmedTitle) {
      toast.error("Title is required before running analysis");
      return;
    }

    setIsAnalysisLoading(true);
    try {
      if (hasChanges) {
        const updated = await updateDocument(selectedId, {
          title: trimmedTitle,
          content: formState.content,
        });
        setDetail(updated);
        setFormState({ title: updated.title ?? "", content: updated.content ?? "" });
        setDocumentPreviews((previous) => ({
          ...previous,
          [updated.document_id]: updated.content ?? "",
        }));
        await refreshDocuments(selectedId, false);
      }

      await runDocumentAnalysis(selectedId);

      const sentenceResults = await listDocumentSentences(selectedId);

      const correctionEntries = await Promise.all(
        sentenceResults.map(async (item) => {
          try {
            const corrections = await listSentenceCorrections(item.sentence_id);
            return { sentenceId: item.sentence_id, corrections };
          } catch (error) {
            console.error(error);
            return { sentenceId: item.sentence_id, corrections: [] };
          }
        }),
      );

      const correctionMap = new Map<number, CorrectionDetail[]>(
        correctionEntries.map((entry) => [entry.sentenceId, entry.corrections]),
      );

      const enriched: SentenceAnalysis[] = sentenceResults.map((sentence) => ({
        ...sentence,
        corrections: correctionMap.get(sentence.sentence_id) ?? [],
      }));

      setSentences(enriched);
      setAnalysisUpdatedAt(new Date().toISOString());
      setIsAnalysisStale(false);

      const firstWithCorrections = enriched.find((item) => item.corrections.length > 0);
      setActiveSentenceId(firstWithCorrections?.sentence_id ?? null);

      if (enriched.every((item) => item.corrections.length === 0)) {
        toast.info("TruthLens did not raise any suggestions for this draft");
      } else {
        toast.success("TruthLens analysis ready");
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Unable to analyze document");
    } finally {
      setIsAnalysisLoading(false);
    }
  };


  const handleSave = async () => {
    if (!user) {
      return;
    }

    const trimmedTitle = formState.title.trim();
    if (!trimmedTitle) {
      toast.error("Title is required");
      return;
    }

    setIsSaving(true);
    try {
      if (selectedId === "new") {
        const created = await createDocument(user.user_id, {
          title: trimmedTitle,
          content: formState.content,
        });
        setDetail(created);
        setFormState({ title: created.title ?? "", content: created.content ?? "" });
        setDocumentPreviews((previous) => ({
          ...previous,
          [created.document_id]: created.content ?? "",
        }));
        setSelectedId(created.document_id);
        toast.success("Document created");
        await refreshDocuments(created.document_id, false);
      } else if (typeof selectedId === "number") {
        const updated = await updateDocument(selectedId, {
          title: trimmedTitle,
          content: formState.content,
        });
        setDetail(updated);
        setFormState({ title: updated.title ?? "", content: updated.content ?? "" });
        setDocumentPreviews((previous) => ({
          ...previous,
          [updated.document_id]: updated.content ?? "",
        }));
        toast.success("Document updated");
        await refreshDocuments(selectedId, false);
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Unable to save document");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (typeof selectedId !== "number") {
      return;
    }

    const documentId = selectedId;

    const confirmed = window.confirm("Delete this document? This cannot be undone.");
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteDocument(documentId);
      toast.success("Document deleted");
      setDetail(null);
      setFormState(() => ({ ...EMPTY_FORM }));
      setSelectedId(null);
      setDocumentPreviews((previous) => {
        const next = { ...previous };
        delete next[documentId];
        return next;
      });
      await refreshDocuments(undefined, false);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Unable to delete document");
    } finally {
      setIsDeleting(false);
    }
  };

  const baseTitleEmpty = !formState.title.trim();
  const hasChanges =
    selectedId === "new"
      ? Boolean(formState.title.trim() || formState.content.trim())
      : detail
        ? formState.title !== detail.title || formState.content !== detail.content
        : false;
  const isSavingDisabled = isSaving || baseTitleEmpty || (selectedId !== "new" && !hasChanges);
  const isResetDisabled = isSaving || !hasChanges;
  const isAnalyzeDisabled =
    isAnalysisLoading ||
    isSaving ||
    isDetailLoading ||
    typeof selectedId !== "number" ||
    !formState.content.trim();

  return (
    <div className="container py-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <Badge variant="outline" className="w-fit">
            Workspace
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">TruthLens editor</h1>
          <p className="text-muted-foreground">
            Fine-tune your draft, rerun analysis when you refine facts, and ship polished work with confidence.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="ghost" onClick={() => setSelectedId(null)}>
            <ArrowLeft className="mr-2 size-4" /> Back to documents
          </Button>
          <Button type="button" variant="outline" onClick={handleCreateNew}>
            <Plus className="mr-2 size-4" />
            New document
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.36fr)]">
        <Card className="border-border/60 bg-card/80">
          <CardHeader className="flex flex-col gap-4 border-b border-border/60 pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5 text-primary" />
                {selectedId === "new" ? "New document" : selectedSummary?.title || detail?.title || "Document"}
              </CardTitle>
              <CardDescription>
                {selectedId === "new"
                  ? "Draft your piece, then run TruthLens for tailored suggestions."
                  : "Polish this draft and queue TruthLens to surface fact checks and clarity feedback."}
              </CardDescription>
              {typeof selectedId === "number" && selectedSummary?.updated_at && (
                <p className="text-xs text-muted-foreground">
                  Updated {formatUpdated(selectedSummary.updated_at)}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" onClick={handleReset} disabled={isResetDisabled}>
                Reset
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleAnalyze}
                disabled={isAnalyzeDisabled}
              >
                {isAnalysisLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Analyzing…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 size-4" /> Run TruthLens
                  </>
                )}
              </Button>
              <Button type="button" onClick={handleSave} disabled={isSavingDisabled}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Save className="mr-2 size-4" /> Save draft
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {isDetailLoading && selectedId !== "new" ? (
              <div className="flex h-48 items-center justify-center rounded-md border border-dashed border-border/60 text-sm text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" /> Loading document…
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium text-muted-foreground">
                      Title
                    </label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Weekly climate digest"
                      value={formState.title}
                      onChange={handleFormChange}
                      disabled={isSaving || isDetailLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="content" className="text-sm font-medium text-muted-foreground">
                      Document body
                    </label>
                    <Textarea
                      id="content"
                      name="content"
                      rows={12}
                      placeholder="Paste or start writing your article here."
                      value={formState.content}
                      onChange={handleFormChange}
                      disabled={isSaving || isDetailLoading}
                      className="min-h-[320px] text-base"
                    />
                  </div>
                </div>
                {isAnalysisStale && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    Content changed since the last TruthLens pass. Run analysis again to refresh suggestions.
                  </div>
                )}
                <div className="space-y-3 rounded-lg border border-border/60 bg-background/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-muted-foreground">TruthLens highlights</p>
                    <span className="text-xs text-muted-foreground">
                      Last run: {analysisUpdatedAt ? formatUpdated(analysisUpdatedAt) : "—"}
                    </span>
                  </div>
                  <div className="min-h-[160px] whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {contentHighlights}
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={typeof selectedId !== "number" || isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" /> Deleting…
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 size-4" /> Delete
                      </>
                    )}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {flaggedCount} flagged sentences
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-primary" /> TruthLens insights
            </CardTitle>
            <CardDescription>
              Review tailored suggestions or inspect every sentence’s status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{flaggedCount} flagged sentence{flaggedCount === 1 ? "" : "s"}</span>
              <span>{suggestionItems.length} suggestion{suggestionItems.length === 1 ? "" : "s"}</span>
            </div>
            <Tabs value={insightTab} onValueChange={(value) => setInsightTab(value as "suggestions" | "sentences")}> 
              <TabsList>
                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                <TabsTrigger value="sentences">All sentences</TabsTrigger>
              </TabsList>
              <TabsContent value="suggestions" className="space-y-3 pt-3">
                {isAnalysisLoading ? (
                  <div className="flex items-center gap-2 rounded-md border border-dashed border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" /> TruthLens is reviewing your draft…
                  </div>
                ) : typeof selectedId !== "number" ? (
                  <div className="rounded-md border border-dashed border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                    Save your draft to unlock sentence-level guidance.
                  </div>
                ) : suggestionItems.length ? (
                  suggestionItems.map(({ sentence, correction }, index) => {
                    const sources = parseSources(correction.sources);
                    const isActive = activeSentenceId === sentence.sentence_id;
                    return (
                      <button
                        key={`${sentence.sentence_id}-${correction.correction_id}-${index}`}
                        type="button"
                        onClick={() => openSentenceModal(sentence)}
                        className={cn(
                          "w-full rounded-lg border border-border/60 bg-background/80 p-4 text-left transition hover:border-primary/50 hover:bg-primary/5 focus:outline-none",
                          isActive && "border-primary/70 bg-primary/10",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">Suggestion {index + 1}</p>
                            <p className="text-sm text-muted-foreground">
                              {correction.reasoning || "TruthLens spotted an opportunity to clarify this sentence."}
                            </p>
                          </div>
                          {Number.isFinite(sentence.confidence) && (
                            <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                              {sentence.confidence}% confidence
                            </span>
                          )}
                        </div>
                        <div className="mt-3 space-y-2 text-sm">
                          <div className="rounded-md border border-border/60 bg-card/70 px-3 py-2 text-muted-foreground">
                            “{sentence.content.trim() || "Selected sentence"}”
                          </div>
                          <div className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-foreground">
                            {correction.suggested_correction}
                          </div>
                        </div>
                        {sources.length > 0 && (
                          <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                            <p className="font-medium text-foreground">Sources</p>
                            <ul className="space-y-1">
                              {sources.map((source: string) => (
                                <li key={source} className="truncate">
                                  {source}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </button>
                    );
                  })
                ) : sentences.length ? (
                  <div className="rounded-md border border-dashed border-primary/40 bg-primary/10 p-4 text-sm text-primary">
                    TruthLens didn’t find any issues. Nice work!
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                    Run TruthLens to generate tailored suggestions for this document.
                  </div>
                )}
              </TabsContent>
              <TabsContent value="sentences" className="space-y-3 pt-3">
                {isAnalysisLoading ? (
                  <div className="flex items-center gap-2 rounded-md border border-dashed border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" /> TruthLens is syncing sentence insights…
                  </div>
                ) : typeof selectedId !== "number" ? (
                  <div className="rounded-md border border-dashed border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                    Save your draft to explore sentence-level details.
                  </div>
                ) : sentences.length ? (
                  sentences.map((sentence, index) => {
                    const flagged = sentence.flags || sentence.corrections.length > 0;
                    const confidenceLabel = Number.isFinite(sentence.confidence)
                      ? `${sentence.confidence}% confidence`
                      : "Confidence unavailable";
                    const correctionCount = sentence.corrections.length;

                    return (
                      <button
                        key={sentence.sentence_id}
                        type="button"
                        onClick={() => openSentenceModal(sentence)}
                        className={cn(
                          "w-full rounded-lg border border-border/60 bg-background/80 p-4 text-left transition hover:border-primary/50 hover:bg-primary/5 focus:outline-none",
                          activeSentenceId === sentence.sentence_id && "border-primary/70 bg-primary/10",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">Sentence {index + 1}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {sentence.content.trim() || "Sentence content unavailable."}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge
                              variant={flagged ? "destructive" : "secondary"}
                              className="uppercase"
                            >
                              {flagged ? (
                                <>
                                  <AlertTriangle className="size-3" /> Flagged
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="size-3" /> Clear
                                </>
                              )}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{confidenceLabel}</span>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {correctionCount} correction{correctionCount === 1 ? "" : "s"}
                          </span>
                          <span className="inline-flex items-center gap-1 text-primary">
                            View details <ChevronRight className="size-3" />
                          </span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-md border border-dashed border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                    Run TruthLens to populate per-sentence analysis.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <Dialog open={Boolean(modalSentence)} onOpenChange={(open) => !open && closeSentenceModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sentence insight</DialogTitle>
            <DialogDescription>
              TruthLens captured the following details for this portion of your document.
            </DialogDescription>
          </DialogHeader>
          {modalSentence ? (
            <div className="space-y-6">
              <div className="space-y-2 rounded-lg border border-border/60 bg-background/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Sentence
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {modalSentence.content.trim() || "Sentence content unavailable."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={modalSentence.flags ? "destructive" : "secondary"} className="uppercase">
                  {modalSentence.flags ? (
                    <>
                      <AlertTriangle className="size-3" /> Flagged
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-3" /> Clear
                    </>
                  )}
                </Badge>
                <Badge variant="outline">
                  {Number.isFinite(modalSentence.confidence)
                    ? `${modalSentence.confidence}% confidence`
                    : "Confidence unavailable"}
                </Badge>
                <Badge variant="outline">
                  {modalSentence.corrections.length} correction
                  {modalSentence.corrections.length === 1 ? "" : "s"}
                </Badge>
              </div>
              {modalSentence.corrections.length ? (
                <div className="space-y-4">
                  {modalSentence.corrections.map((correction, index) => {
                    const sources = parseSources(correction.sources);
                    const createdAtLabel = correction.created_at
                      ? new Date(correction.created_at).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "Timestamp unavailable";
                    return (
                      <div
                        key={correction.correction_id ?? `${correction.suggested_correction}-${index}`}
                        className="space-y-3 rounded-lg border border-border/60 bg-background/70 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-foreground">Correction {index + 1}</p>
                          <span className="text-xs text-muted-foreground">{createdAtLabel}</span>
                        </div>
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Analysis
                            </p>
                            <p className="text-foreground">
                              {correction.reasoning || "TruthLens did not include additional analysis for this sentence."}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Suggested correction
                            </p>
                            <div className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-foreground">
                              {correction.suggested_correction || "—"}
                            </div>
                          </div>
                          {sources.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Sources
                              </p>
                              <ul className="space-y-1 text-xs text-muted-foreground">
                                {sources.map((source) => (
                                  <li key={source} className="truncate">
                                    {source}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                  TruthLens marked this sentence as clear—no corrections were generated.
                </div>
              )}
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeSentenceModal}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
