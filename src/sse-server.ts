import { createServer, IncomingMessage, ServerResponse, RequestListener } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = process.env.HOST || "0.0.0.0";

const startTime = Date.now();

interface MetricsStore {
  totalRequests: number;
  activeConnections: number;
  responsesByStatus: Record<number, number>;
  latencyMs: number[];
  errorsByEndpoint: Record<string, number>;
  requestsByEndpoint: Record<string, number>;
}
const metrics: MetricsStore = {
  totalRequests: 0,
  activeConnections: 0,
  responsesByStatus: {},
  latencyMs: [],
  errorsByEndpoint: {},
  requestsByEndpoint: {},
};

function sendJson(res: ServerResponse, status: number, data: Record<string, unknown>): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function addCorsHeaders(res: ServerResponse): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function parseBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 10_000_000) {
        req.destroy(new Error("Request body too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function recordMetrics(url: URL, status: number, durationMs: number, error: boolean): void {
  metrics.totalRequests++;
  metrics.responsesByStatus[status] = (metrics.responsesByStatus[status] || 0) + 1;
  metrics.latencyMs.push(durationMs);
  if (metrics.latencyMs.length > 10000) metrics.latencyMs.shift();
  const ep = url.pathname;
  metrics.requestsByEndpoint[ep] = (metrics.requestsByEndpoint[ep] || 0) + 1;
  if (error) {
    metrics.errorsByEndpoint[ep] = (metrics.errorsByEndpoint[ep] || 0) + 1;
  }
}

function computePercentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

function handleHealth(_req: IncomingMessage, res: ServerResponse): void {
  sendJson(res, 200, {
    status: "ok",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "0.1.0",
  });
}

function handleMetrics(_req: IncomingMessage, res: ServerResponse): void {
  const sorted = [...metrics.latencyMs].sort((a, b) => a - b);
  sendJson(res, 200, {
    uptime: Math.floor((Date.now() - startTime) / 1000),
    total_requests: metrics.totalRequests,
    active_connections: metrics.activeConnections,
    responses_by_status: metrics.responsesByStatus,
    requests_by_endpoint: metrics.requestsByEndpoint,
    errors_by_endpoint: metrics.errorsByEndpoint,
    latency: {
      p50_ms: computePercentile(sorted, 50),
      p95_ms: computePercentile(sorted, 95),
      p99_ms: computePercentile(sorted, 99),
      avg_ms: sorted.length > 0 ? Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length) : 0,
    },
  });
}

function handleNotFound(_req: IncomingMessage, res: ServerResponse): void {
  sendJson(res, 404, { error: "Not found" });
}

export async function startSSEServer(server: McpServer): Promise<{ close: () => void }> {
  const transports = new Map<string, SSEServerTransport>();

  const requestListener: RequestListener = async (req, res) => {
    addCorsHeaders(res);

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const startMs = Date.now();
    let error = false;

    function finish(status: number): void {
      const duration = Date.now() - startMs;
      recordMetrics(url, status, duration, error);
    }

    if (url.pathname === "/health") {
      handleHealth(req, res);
      finish(200);
      return;
    }

    if (url.pathname === "/metrics") {
      handleMetrics(req, res);
      finish(200);
      return;
    }

    if (url.pathname === "/mcp/sse" && req.method === "GET") {
      metrics.activeConnections++;
      const transport = new SSEServerTransport("/mcp/message", res);
      const sessionId = transport.sessionId;
      transports.set(sessionId, transport);
      res.on("close", () => {
        metrics.activeConnections--;
        transports.delete(sessionId);
      });
      try {
        await server.connect(transport);
      } catch (err) {
        metrics.activeConnections--;
        transports.delete(sessionId);
        if (!res.headersSent) {
          error = true;
          sendJson(res, 503, { error: "Server busy: another client is already connected. Try again later." });
          finish(503);
        }
      }
      return;
    }

    if (url.pathname === "/mcp/message" && req.method === "POST") {
      const sessionId = url.searchParams.get("sessionId");
      if (!sessionId || !transports.has(sessionId)) {
        error = true;
        sendJson(res, 404, { error: "No active SSE session found. Connect to /mcp/sse first." });
        finish(404);
        return;
      }
      const transport = transports.get(sessionId)!;
      const body = await parseBody(req);
      try {
        await transport.handlePostMessage(req, res, body);
        finish(202);
      } catch (err) {
        error = true;
        if (!res.headersSent) {
          sendJson(res, 500, { error: "Internal server error" });
          finish(500);
        }
      }
      return;
    }

    error = true;
    handleNotFound(req, res);
    finish(404);
  };

  const httpServer = createServer(requestListener);

  return new Promise((resolve) => {
    httpServer.listen(PORT, HOST, () => {
      const addr = httpServer.address();
      const actualPort = typeof addr === "object" && addr ? addr.port : PORT;
      console.error(`FAST_HTML_MCP_PORT=${actualPort}`);
      console.log(`Fast HTML MCP (SSE) listening on http://${HOST}:${actualPort}`);
      console.log(`  Health:  http://${HOST}:${actualPort}/health`);
      console.log(`  Metrics: http://${HOST}:${actualPort}/metrics`);
      console.log(`  SSE:     http://${HOST}:${actualPort}/mcp/sse`);
    });
    resolve({ close: () => httpServer.close() });
  });
}
