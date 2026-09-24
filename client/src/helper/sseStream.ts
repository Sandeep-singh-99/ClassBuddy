export interface SSEEventData {
  chunk?: string;
  note_id?: string;
  done?: boolean;
  error?: string;
  [key: string]: any;
}

export interface FetchSSEOptions {
  url: string;
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  body?: any;
  signal?: AbortSignal;
  onChunk: (data: SSEEventData) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Robust SSE Stream Reader that buffers chunk streams and handles TCP fragmentation.
 */
export async function fetchSSEStream({
  url,
  method = "POST",
  headers = {},
  body,
  signal,
  onChunk,
  onDone,
  onError,
}: FetchSSEOptions): Promise<void> {
  try {
    const isFormData = body instanceof URLSearchParams || body instanceof FormData;
    
    const requestHeaders: Record<string, string> = {
      ...headers,
    };

    if (!isFormData && body && typeof body === "object" && !requestHeaders["Content-Type"]) {
      requestHeaders["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
      credentials: "include",
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }

    if (!response.body) {
      throw new Error("Response body is null or streaming is not supported.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Split buffer by double newline (SSE event boundary)
      const parts = buffer.split("\n\n");
      // Keep the last incomplete fragment in the buffer
      buffer = parts.pop() || "";

      for (const eventBlock of parts) {
        const lines = eventBlock.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            const dataStr = trimmed.slice(6).trim();
            if (!dataStr) continue;

            try {
              const data: SSEEventData = JSON.parse(dataStr);
              if (data.error) {
                throw new Error(data.error);
              }
              onChunk(data);
              if (data.done && onDone) {
                onDone();
              }
            } catch (err) {
              console.error("Error parsing SSE JSON chunk:", err, "Raw data:", dataStr);
            }
          }
        }
      }
    }

    // Flush remainder if any
    if (buffer.trim().startsWith("data: ")) {
      const dataStr = buffer.trim().slice(6).trim();
      if (dataStr) {
        try {
          const data: SSEEventData = JSON.parse(dataStr);
          if (data.error) {
            throw new Error(data.error);
          }
          onChunk(data);
          if (data.done && onDone) {
            onDone();
          }
        } catch (err) {
          console.error("Error parsing final SSE JSON chunk:", err);
        }
      }
    }

    if (onDone) onDone();
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.log("SSE Stream aborted by user");
      return;
    }
    if (onError) {
      onError(error instanceof Error ? error : new Error(String(error)));
    } else {
      throw error;
    }
  }
}
