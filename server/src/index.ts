import "./env.js";

import { serve } from "@hono/node-server";
import { Hono } from "hono";

import {
  extractBuildingData,
  extractMaterialsList,
} from "./extractionTools.js";
import { getCoordinates } from "./apis/geocode.js";
import { getFloodData, getSLRProjection } from "./apis/floodAPIs.js";
import { generateContext, generateReport } from "./prompts.js";

import { GenerateInputSchema } from "./types.js";

const app = new Hono();

const step = async <T>(label: string, promise: Promise<T>): Promise<T> => {
  try {
    return await promise;
  } catch (err) {
    console.error(`Step failed: ${label}`, err);
    throw new Error(`Error during ${label}`);
  }
};

app.post("/api/generate", async (c) => {
  try {
    const body = await c.req.json();
    const parseResult = GenerateInputSchema.safeParse(body);

    if (!parseResult.success) {
      return c.json(
        { error: "Invalid request body", details: parseResult.error.format() },
        400,
      );
    }

    const { input } = parseResult.data;

    // Extract structured data from prompt
    const [materialsList, buildingData] = await Promise.all([
      step("extractMaterialsList", extractMaterialsList(input)),
      step("extractBuildingData", extractBuildingData(input)),
    ]);

    // Get coordinates from Google Maps API by user prompt location
    const coordinates = await step(
      "getCoordinates",
      getCoordinates(buildingData.location),
    );

    // Get Flood infromation (BFE and Zone) for specific location
    // Get Sea Level Rise(SLR) projections using coordinates
    const [floodData, slrProjections] = await Promise.all([
      step("getFloodData", getFloodData(coordinates)),
      step(
        "getSLRProjection",
        getSLRProjection(
          buildingData.projectionYear,
          buildingData.climateAssumption,
          coordinates,
        ),
      ),
    ]);

    // Assemble context for LLM call
    const context = generateContext({
      materialsList,
      buildingData,
      floodData,
      slrProjections,
    });

    // Generate report by providing context to LLM call
    const report = await step(
      "generateReport",
      generateReport(input, context, buildingData),
    );

    return c.json({ context, report });
  } catch (e: unknown) {
    console.error("Error in /api/generate:", e);

    const message = e instanceof Error ? e.message : "Unknown server error";
    return c.json({ error: "Internal server error", message }, 500);
  }
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
