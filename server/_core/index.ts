import "./loadEnv";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import fs from "node:fs";
import path from "node:path";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Request Logging
  app.use((req, res, next) => {
    console.log(`[Request] ${req.method} ${req.url}`);
    next();
  });

  // Health check for K8s
  app.get("/health", (req, res) => res.send("OK"));

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    // Hidden from esbuild to prevent bundling devDependencies
    const devModule = ["./", "vite"].join("");
    const { setupVite } = await import(devModule);
    await setupVite(app, server);
  } else {
    // Production: serve static files directly
    const distPath = path.resolve(process.cwd(), "dist", "public");
    console.log(`[Static] Checking for assets at: ${distPath}`);

    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.use("*", (req, res) => {
        const indexPath = path.resolve(distPath, "index.html");
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(404).send("Frontend index.html fallback not found");
        }
      });
      console.log(`[Static] Production assets served from ${distPath}`);
    } else {
      console.error(`[Static] CRITICAL: Build directory not found at ${distPath}`);
      app.use("*", (req, res) => {
        res.status(500).send("Server configuration error: Assets missing");
      });
    }
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
  });
}

startServer().catch(console.error);
