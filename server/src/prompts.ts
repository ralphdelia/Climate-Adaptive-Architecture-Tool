import { getDamage } from "./data/foundationDamage.js";
import oai from "./openai/client.js";

import type {
  BuildingContext,
  FilteredMaterialsType,
  FloodData,
  SlrProjection,
} from "./types.js";

interface ContextInputs {
  materialsList: FilteredMaterialsType;
  buildingData: BuildingContext;
  floodData: FloodData;
  slrProjections: SlrProjection | null;
}

export function generateContext(inputs: ContextInputs) {
  const { materialsList, buildingData, floodData, slrProjections } = inputs;

  const beneficial =
    materialsList.materials
      .filter((m) => m.acceptable)
      .map((m) => m.material)
      .join(", ") || "None";

  const unacceptable =
    materialsList.materials
      .filter((m) => !m.acceptable)
      .map((m) => m.material)
      .join(", ") || "None";

  let percentLoss: string | number = "unknown";
  if (buildingData.foundationType) {
    percentLoss = getDamage(floodData.bfe, buildingData.foundationType!);
  }

  return `
    #### Background
    - **Projected year:** ${slrProjections && slrProjections.projectionYear}
    - **Scenario severity:** ${slrProjections && slrProjections.scenario}

    #### Flood Data
    - **BFE:** ${floodData.bfe} ft
    - **FEMA Zone:** ${floodData.zone.designation}
      > ${floodData.zone.zoneDescription}

    #### Building Materials
    - **Beneficial:** ${beneficial}
    - **Unacceptable:** ${unacceptable}

    #### Estimated Loss from 100-Year Flood Event (Adjusted by Foundation Type)
    This value estimates the percentage of structural damage during a 100-year flood event. The calculation is based on the building’s foundation type and the projected floodwater depth, as defined by the Base Flood Elevation (BFE) for the location.
    - **Foundation:** ${buildingData.foundationType}
    - **Percent loss:** ${percentLoss}%

    #### Flood Mitigation Features
    - ${buildingData.floodMitigationFeatures}
    - **Description:** ${buildingData.floodMitigationDescription || "N/A"}
  `;
}

export async function generateReport(
  userInputs: string,
  context: string,
  buildingData: BuildingContext,
) {
  const systemPrompt = `
    You are a leading expert in flood-resilient architecture and climate-adaptive design.
    Your job is to review a proposed building design—given its site flood data, materials, foundation, and mitigation features—and produce:

    1. A single **Resilience Score** (0–100) for the projected year.
    2. A **Performance Timeline** Starting at ${new Date().getFullYear()} to ${buildingData.projectionYear} showing how resilience degrades or holds up as flood risk increases.
    3. **Material Recommendations**
      • If any “acceptable” materials are low-quality relative to risk, suggest higher-performance alternatives.
      • If risk is low and a material is costly, suggest more economical options.
    4. **Mitigation Feature Suggestions**
      • Specific, locally appropriate measures for New Orleans (e.g., breakaway walls, elevated utilities, sacrificial lower levels).
    5. **Foundation Advice**
      • Using the % loss from sea-level rise + foundation type—if loss is high, propose foundation upgrades (e.g., deeper piles, higher elevation).
    6. A brief **Cost–Benefit Analysis** for each major recommendation (estimated cost vs. % damage reduction or years of added service life).

    Always return clearly labeled sections, favor small heading, bullet lists, and any simple tables you need.
    Do not provide an offer for further interaction or questions.
  `;

  const userPrompt = `
    Here is the **project context** and **user inputs**:

    ${context}

    Additional user notes:
    ${userInputs}

    Please generate the **Design-Review Report** as outlined above.
  `;

  const completion = await oai.chat.completions.create({
    model: "chatgpt-4o-latest",
    messages: [
      { role: "developer", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });
  const report = completion.choices[0]?.message.content ?? "";
  return report;
}
