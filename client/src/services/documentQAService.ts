import { isAxiosError } from "axios";
import { axiosClient } from "@/helper/axiosClient";
import type { QAAnswer, QAClassroom, QADocument, QAQuestion } from "@/types/documentQA";

export const documentQAService = {
  async groups(signal?: AbortSignal) {
    return (await axiosClient.get<QAClassroom[]>("/document-qa/groups", { signal })).data;
  },
  async documents(groupId: string, signal?: AbortSignal) {
    return (await axiosClient.get<QADocument[]>(`/document-qa/groups/${groupId}/documents`, { signal })).data;
  },
  async ask({ groupId, question }: QAQuestion, signal?: AbortSignal) {
    return (await axiosClient.post<QAAnswer>(`/document-qa/groups/${groupId}/ask`, { question }, { signal, timeout: 60000 })).data;
  },
  async retry(documentId: string, signal?: AbortSignal) {
    return (await axiosClient.post<QADocument>(`/document-qa/documents/${documentId}/retry`, {}, { signal })).data;
  },
};

export function qaErrorMessage(error: unknown): string {
  if (isAxiosError<{ detail?: unknown }>(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (!error.response) return "Could not connect. Check your connection and try again.";
  }
  return "Something went wrong. Please try again.";
}
