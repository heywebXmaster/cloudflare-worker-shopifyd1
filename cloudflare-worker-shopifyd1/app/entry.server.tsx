import type { EntryContext } from "@remix-run/cloudflare";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { addDocumentResponseHeaders } from "./shopify.server";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  addDocumentResponseHeaders(request, responseHeaders);
  const userAgent = request.headers.get("user-agent");
  const isBot = isbot(userAgent ?? '');

  // Dynamic import to avoid Vite 6 ESM resolution issues with react-dom/server
  const { renderToReadableStream } = await import("react-dom/server");

  try {
    const stream = await renderToReadableStream(
      <RemixServer
        context={remixContext}
        url={request.url}
      />,
      {
        signal: request.signal,
        onError(error: unknown) {
          console.error(error);
          responseStatusCode = 500;
        }
      }
    );

    if (isBot) {
      await stream.allReady;
    }

    responseHeaders.set("Content-Type", "text/html");

    return new Response(stream, {
      status: responseStatusCode,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Error during rendering:", error);
    return new Response("Internal Server Error", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
