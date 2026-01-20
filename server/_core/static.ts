import express, { type Express } from "express";
import fs from "node:fs";
import path from "node:path";

export function serveStatic(app: Express) {
    // In our Docker image, the structure is /app/dist/index.js and /app/dist/public/
    // But process.cwd() is /app. So /app/dist/public is the path.
    let distPath = path.resolve(process.cwd(), "dist", "public");

    if (!fs.existsSync(distPath)) {
        // Fallback if running from within dist folder or other context
        distPath = path.resolve(import.meta.dirname, "public");
    }

    console.log(`[Static] Serving files from: ${distPath}`);

    if (!fs.existsSync(distPath)) {
        console.error(`[Static] CRITICAL: Could not find build directory!`);
    }

    app.use(express.static(distPath));

    // fall through to index.html if the file doesn't exist
    app.use("*", (_req, res) => {
        const indexPath = path.resolve(distPath, "index.html");
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            res.status(404).send("Frontend build not found");
        }
    });
}
