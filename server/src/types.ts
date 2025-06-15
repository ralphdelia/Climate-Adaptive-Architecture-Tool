import { z } from "zod";

export const GenerateInputSchema = z.object({
  input: z.string(),
});

export const MaterialSchema = z.object({
  material: z.string(),
  description: z.string(),
  acceptable: z.boolean().default(false),
});

export const FilteredMaterialsSchema = z.object({
  materials: z.array(MaterialSchema),
});

export type FilteredMaterialsType = z.infer<typeof FilteredMaterialsSchema>;

export const ClimateImpactEnum = z.enum([
  "Low",
  "Intermediate-Low",
  "Intermediate",
  "Intermediate-High",
  "High",
]);

export const FoundationTypeEnum = z.enum([
  "Slab-on-Grade (1‑story)",
  "Crawlspace/Pier (1‑story elevated)",
  "Basement (1‑story)",
  "Two‑story Slab",
  "Two‑story Basement",
]);
export type FoundationType = z.infer<typeof FoundationTypeEnum>;

export const BuildingContextSchema = z.object({
  location: z
    .string()
    .describe("Neighborhood-based location, including state and country"),
  projectionYear: z
    .number()
    .int()
    .gt(new Date().getFullYear())
    .default(2055)
    .describe("A future year"),
  climateAssumption: ClimateImpactEnum.default("Intermediate").describe(
    "Assumption about climate impact severity",
  ),
  foundationType: FoundationTypeEnum.nullable()
    .default(null)
    .describe("Classification of foundation for residential building."),
  floodMitigationFeatures: z
    .string()
    .nullable()
    .default(null)
    .describe("Description of architectural or structural mitigation features"),
  floodMitigationDescription: z.string().nullable().describe(`
      When a flood mitigation feature is present provide a description of how
      this feature offsets flooding damage and promotes resiliency.
      `),
});
export type BuildingContext = z.infer<typeof BuildingContextSchema>;

export const CoordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export type Coordinates = z.infer<typeof CoordinatesSchema>;

export type FloodZoneInfo = {
  designation: "AE" | "AH" | "AO" | "AR" | "VE";
  zoneDescription: string;
};

export type FloodData = {
  zone: FloodZoneInfo;
  bfe: number;
};

export type SlrProjection = {
  projectionYear: number;
  scenario: string;
  [key: string]: unknown; // allow other fields
};

export type NOAAResponse = {
  SlrProjections?: SlrProjection[];
};
