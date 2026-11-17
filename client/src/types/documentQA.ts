export interface QAClassroom {
  id: string;
  name: string;
  can_ask: boolean;
}

export interface QADocument {
  id: string;
  title: string;
  status: "pending" | "ready" | "error" | "unsupported";
  page_count: number;
  error: string | null;
}

export interface QACitation {
  document_id: string;
  title: string;
  page: number;
  quote: string;
}

export interface QAAnswer {
  answer: string;
  found: boolean;
  citations: QACitation[];
}

export interface QAQuestion {
  groupId: string;
  question: string;
}

export interface DocumentQAState {
  groups: QAClassroom[];
  groupId: string;
  documents: QADocument[];
  answer: QAAnswer | null;
  question: string;
  groupsLoading: boolean;
  documentsLoading: boolean;
  asking: boolean;
  retryingId: string | null;
  groupsError: string | null;
  documentsError: string | null;
  answerError: string | null;
  groupsRequestId?: string;
  documentsRequestId?: string;
  answerRequestId?: string;
}
