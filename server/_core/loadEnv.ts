import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the project root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

console.log("[Env] VITE_APP_ID:", process.env.VITE_APP_ID ? "Loaded" : "Missing");
console.log("[Env] VITE_OAUTH_PORTAL_URL:", process.env.VITE_OAUTH_PORTAL_URL ? "Loaded" : "Missing");
