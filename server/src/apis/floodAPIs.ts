import type {
  FloodZoneInfo,
  FloodData,
  Coordinates,
  SlrProjection,
  NOAAResponse,
} from "../types.js";

export async function getSLRProjection(
  year: number,
  projectionScenario: string,
  coordinates: Coordinates,
): Promise<SlrProjection | null> {
  const roundedYear = Math.round(year / 10) * 10;

  const url = `https://api.tidesandcurrents.noaa.gov/dpapi/prod/webapi/product/slr_projections.json?lat=${coordinates.lat.toFixed(1)}&lon=${coordinates.lng.toFixed(1)}&units=english`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`NOAA API request failed: ${res.status} ${res.statusText}`);
      return null;
    }

    const data: NOAAResponse = await res.json();

    if (!Array.isArray(data.SlrProjections)) {
      console.error("Unexpected response format: missing SlrProjections array");
      return null;
    }

    const match = data.SlrProjections.find(
      ({ projectionYear, scenario }) =>
        projectionYear === roundedYear && scenario === projectionScenario,
    );

    if (!match) {
      console.warn(
        `No projection found for year ${roundedYear} and scenario "${projectionScenario}"`,
      );
      return null;
    }

    return match;
  } catch (error) {
    console.error("Error fetching SLR projection:", error);
    return null;
  }
}

export async function getFloodData(
  coordinates: Coordinates,
): Promise<FloodData> {
  const zones: FloodZoneInfo[] = [
    {
      designation: "AE",
      zoneDescription:
        "Areas inundated by the base (1%-annual-chance) flood with BFEs determined; mandatory insurance and floodplain management standards apply.", //
    },
    {
      designation: "AH",
      zoneDescription:
        "Areas subject to shallow flooding (ponding) with average depths of 1–3 ft; BFEs (derived by detailed analysis) are shown.", //
    },
    {
      designation: "AO",
      zoneDescription:
        "Areas subject to shallow sheet-flow flooding with average depths of 1–3 ft; average flood depths (rather than BFEs) are shown.", //
    },
    {
      designation: "AR",
      zoneDescription:
        "Areas where flood protection (e.g., levees or dams) has been reduced or is being restored; BFEs or depths are shown.", //
    },
    {
      designation: "VE",
      zoneDescription:
        "Coastal high-hazard areas (wave action) subject to the base flood; BFEs plus wave-velocity hazards are shown; mandatory insurance applies.", //
    },
  ];

  const zone = zones[Math.floor(Math.random() * zones.length)];

  const randInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  let bfe: number;
  switch (zone.designation) {
    case "AE":
      bfe = randInt(5, 18);
      break;
    case "AH":
      bfe = randInt(1, 3);
      break;
    case "AO":
      bfe = randInt(1, 3);
      break;
    case "AR":
      bfe = randInt(5, 10);
      break;
    case "VE":
      bfe = randInt(10, 18);
      break;
  }

  return { zone, bfe };
}
