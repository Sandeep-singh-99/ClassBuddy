import { useState, useRef, useCallback } from "react";
import { fetchSSEStream, type SSEEventData } from "@/helper/sseStream";

export interface UseAIStreamOptions {
  url?: string;
  onDone?: () => void;
  onError?: (err: Error) => void;
}

export function useAIStream(options?: UseAIStreamOptions) {
  const [text, setText] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
  const defaultUrl = `${baseUrl}/ai/stream`;

  const abortStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  const startStream = useCallback(
    async (prompt: string, systemPrompt?: string, customBody?: Record<string, any>, customUrl?: string) => {
      abortStream();

      setIsStreaming(true);
      setError(null);
      setText("");

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const targetUrl = customUrl || options?.url || defaultUrl;
      const payload = customBody || { prompt, system_prompt: systemPrompt };

      try {
        await fetchSSEStream({
          url: targetUrl,
          method: "POST",
          body: payload,
          signal: controller.signal,
          onChunk: (data: SSEEventData) => {
            if (data.chunk) {
              setText((prev) => prev + data.chunk);
            }
          },
          onDone: () => {
            setIsStreaming(false);
            if (options?.onDone) options.onDone();
          },
          onError: (err: Error) => {
            setIsStreaming(false);
            setError(err.message);
            if (options?.onError) options.onError(err);
          },
        });
      } catch (err: any) {
        setIsStreaming(false);
        setError(err.message || "Failed to stream response");
      }
    },
    [abortStream, defaultUrl, options]
  );

  return {
    text,
    setText,
    isStreaming,
    error,
    startStream,
    abortStream,
  };
}
