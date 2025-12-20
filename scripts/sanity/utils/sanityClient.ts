import "dotenv/config";
import { createClient } from "@sanity/client";

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? "production";
const apiVersion = process.env.SANITY_API_VERSION ?? "2025-12-01";
const token = process.env.SANITY_TOKEN;

if (!projectId) throw new Error("Missing SANITY_PROJECT_ID in .env");
if (!token) throw new Error("Missing SANITY_TOKEN in .env");

export const sanity = createClient({ projectId, dataset, apiVersion, token, useCdn: false });
