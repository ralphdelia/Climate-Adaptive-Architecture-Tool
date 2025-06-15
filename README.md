# Climate-Adaptive-Architecture-Tool
- [Approach](#approach)
- [1. Structured Data Extraction](#1-structured-data-extraction)
- [2. Connecting Structured Data to Real World Impact](#2-connecting-structured-data-to-real-world-impact)
- [3. Modeling the Impact of Climate Change](#3-modeling-the-impact-of-climate-change)
- [4. Actionable Insights and Recommendations](#4-actionable-insights-and-recommendations)
- [Technical Decisions](#technical-decisions)
  - [Frontend (React)](#frontend-react)
  - [Backend (Node + Hono)](#backend-node--hono)
  - [Environment Variables](#environment-variables)
- [Usage and Example Prompts](#usage-and-example-prompts)


## Approach
My approach can be broken into four main steps.
1. Pulling out structured data from the input prompt.
2. Projecting outcomes by connecting structured data to real-world impact and historical data.
3. Modeling the future impact of climate change on architectural decisions through Sea Level Rise (SLR) Projections
4. Extracting recommendations and actionable insight through assembled context.

## 1. Structured Data Extraction
To extract structured data from the input prompt, I used Instructor.js. This tool acts as a wrapper around OpenAI’s API and allows you to define a schema for the structured data using Zod. You provide the model with free-form text, and Instructor.js guides it to return structured and validated output that aligns with your schema. Zod specifies the expected fields, OpenAI processes the text, and Instructor.js ensures that the final response conforms to your defined schema.

I used this method to extract details about the proposed building, the timeline the user wants to understand, and the severity of the climate change impact projected by the model.

The schema roughly had the following data:
- Climate Impact (low - high)
- Foundation Type
- Flood Mitigation features
- Projected Year (year in the future that we should model for)

Additionally, I used it to pull out materials found in the input text.
## 2. Connecting Structured Data to Real World Impact
I found 3 ways to connect the input schema to real world datasets.

I found [FEMA Flood Damage-Resistant Requirement](http://fema.gov/sites/default/files/documents/fema_tb_2_flood_damage-resistant_materials_requirements_01-22-2025.pdf) on page 8, Table 1 shows structural materials and their `Flood Damage-Resistance Rating`, which is classified as acceptable/unacceptable. I used this to classify materials found in the input prompt description.  This is later used to make recommendations for improvement if something is found to be unacceptable.

In the [Hazus Flood Model Technical Maual](https://www.fema.gov/sites/default/files/documents/fema_hazus-flood-model-technical-manual-5-1.pdf?utm_source=chatgpt.com) on page 5-12, Figure 5-1 shows the impact on damage as a percentage based on flood water depth. This was especially helpful because it was broken down by foundation type. Although I wasn't able to find the data used in this chart, I was able to create a mock and used the extracted foundation type from the previous step to model how vulnerable each foundation was at a given depth.

Lastly, I integrated a [NOAA API](https://api.tidesandcurrents.noaa.gov/dpapi/prod/#:~:text=End%20Date-,Sea%20Level%20Rise%20Projections,-Input%20Parameters) that accepts geographic coordinates and returns sea level rise (SLR) projections by decade. This allowed me to estimate future 100-year flood events based on location-specific data. The API further expands on its projection by providing `Low`, `Intermediate-Low`, `Intermediate`, `Intermediate-High`, and `High` projections, enabling users to describe a range of scenarios. To ensure accuracy, I used the Google Maps API to convert user-provided text locations into precise coordinates before querying the SLR projections.
## 3. Modeling the Impact of Climate Change
Using the projected sea level rise (SLR) and the foundation-specific flood impact data from the Hazus Technical Manual, I was able to connect the user’s input, including their projected year, foundation type, level of expected climate impact and real-world location, to an estimated percentage of damage during a 100-year flood event.

## 4. Actionable Insights and Recommendations
All of the assembled information was provided as context to an LLM call that prompts examination of the data and generates a report.

The report is generated with 6 main sections:
1. A single **Resilience Score** (0–100) for the projected year.
2. A **Performance Timeline**
3. **Material Recommendations**
      • If any “acceptable” materials are low-quality relative to risk, suggest higher-performance alternatives.
      • If risk is low and a material is costly, suggest more economical options.
4. **Mitigation Feature Suggestions**
      • Specific, locally appropriate measures for New Orleans (e.g., breakaway walls, elevated utilities, sacrificial lower levels).
5. **Foundation Advice**
      • Using the % loss from sea-level rise + foundation type, if the loss is high, propose foundation upgrades (e.g., deeper piles, higher elevation).
6. A brief **Cost–Benefit Analysis** for each major recommendation (estimated cost vs. % damage reduction or years of added service life).

After this final step, the report would be provided to the user. Additionally, I felt that for transparency, I would also provide the context that was assembled as part of the report, so that the user could see any assumptions made by the model along the way.

## Usage & Prompts
The model relies heavily on the existence of a few data points in the input prompt. Specifically, location, and foundation type should be included for the best results; other inputs have default fallbacks. For the best results, be sure to include a year in the future, climate severity estimate, flood mitigation features, and structural materials.

## Technical Decisions
The backend is a Node.js application using Hono.js as a routing library. It uses Instructor.js for structured data extraction and OpenAI as an LLM model. Additionally, it makes use of the Google Maps API to convert the user's input location to geographic coordinates.

The frontend is a vite React application, and it uses react-markdown to render the LLM output.

### Frontend (React)
1. Navigate to the client directory
2. Install dependencies
3. Start the development server

```
cd ./client
npm install
npm run dev
```

The frontend will be available at [http://localhost:5173](http://localhost:5173).
### Backend (Node + Hono)
Create a `.env` file in the `./server` directory with the following keys:
```
OPENAI_API_KEY=
OPENAI_ORG_ID=
GOOGLE_API_KEY=
```

1. Navigate to the server directory:
2. Install dependencies:
3. Start the backend server:
```
cd ./server
npm install
tsx src/index.ts
```
