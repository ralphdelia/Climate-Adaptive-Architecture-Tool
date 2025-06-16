import Instructor from "@instructor-ai/instructor";
import oai from "./openai/client.js";

import MATERIALS_TABLE from "./data/materials.js";

import { BuildingContextSchema, FilteredMaterialsSchema } from "./types.js";

const client = Instructor({
  client: oai,
  mode: "TOOLS",
});

export async function extractBuildingData(userPrompt: string) {
  const systemPrompt = `
    You are an expert building context extractor.
    You will be given a user description of a building scenario.
    Extract exactly the following information and return valid JSON conforming to the schema:
    - location (neighborhood, state, country)
    - projectionYear (an integer greater than current year)
    - climateAssumption (one of: low, intermediate‑low, intermediate, intermediate‑high, high)
    - foundationType (one of: Slab-on-Grade (1‑story), Crawlspace/Pier (1‑story elevated), Basement (1‑story), Two‑story Slab, Two‑story Basement)
    - floodMitigationFeatures (string describing architectural or structural mitigation for flooding)

    Do NOT include any additional fields.”
  `;
  const userMessage = `
    Here is the building description:
    ${userPrompt}
  `;
  const buildingData = await client.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    model: "gpt-3.5-turbo",
    response_model: {
      schema: BuildingContextSchema,
      name: "User",
    },
    max_retries: 2,
  });

  return buildingData;
}

export async function extractMaterialsList(userPrompt: string) {
  const systemPrompt = `
    You are a strict filter tool. Parse the user input and return relevant building materials from the predefined list.
    You must only return material objects that appear to be referenced in the user prompt.
    You must choose from the provided list only. Return the matching objects EXACTLY as they appear.
    Do not invent. Do not rephrase.
    `.trim();

  const materialsListText = MATERIALS_TABLE.map(
    (mat) => `Material: ${mat.material}, Description: ${mat.description}`,
  ).join("\n");

  const userMessage = `
    User input: ${userPrompt}
    Here is the full list of available materials:
    ${materialsListText}
    `.trim();

  const materialList = await client.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    model: "gpt-3.5-turbo",
    response_model: {
      schema: FilteredMaterialsSchema,
      name: "User",
    },
    max_retries: 2,
  });

  return materialList;
}
