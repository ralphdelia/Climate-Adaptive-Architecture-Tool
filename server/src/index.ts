import "./env.js";

import { serve } from "@hono/node-server";
import { Hono } from "hono";

import { getBuildingData, getMaterialsList } from "./extractionTools.js";
import { getCoordinates } from "./apis/geocode.js";
import { getFloodData, getSLRProjection } from "./apis/floodAPIs.js";
import { generateContext, generateReport } from "./prompts.js";

const app = new Hono();

app.post("/api/generate", async (c) => {
  const body = await c.req.json();
  const input = body.input;

  try {
    const [materialsList, buildingData] = await Promise.all([
      getMaterialsList(input),
      getBuildingData(input),
    ]);

    const coordinates = await getCoordinates(buildingData.location);

    const [floodData, slrProjections] = await Promise.all([
      getFloodData(coordinates),
      getSLRProjection(
        buildingData.projectionYear,
        buildingData.climateAssumption,
        coordinates,
      ),
    ]);

    const context = generateContext({
      materialsList,
      buildingData,
      floodData,
      slrProjections,
    });
    const report = await generateReport(input, context, buildingData);

    return c.json({ context, report });
  } catch (e: unknown) {
    c.status(500);
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
