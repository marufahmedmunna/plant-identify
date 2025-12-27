"use server";
/**
 * @fileOverview An AI agent that identifies a plant from an image and provides information about it.
 *
 * - identifyPlantFromImage - A function that handles the plant identification process.
 * - IdentifyPlantFromImageInput - The input type for the identifyPlantFromImage function.
 * - IdentifyPlantFromImageOutput - The return type for the identifyPlantFromImage function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const IdentifyPlantFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyPlantFromImageInput = z.infer<
  typeof IdentifyPlantFromImageInputSchema
>;

const IdentifyPlantFromImageOutputSchema = z.object({
  isPlant: z
    .boolean()
    .describe("Whether the image contains a plant or flower."),
  plantName: z
    .string()
    .describe('The common name of the plant. If not a plant, return "N/A".'),
  organName: z
    .string()
    .describe(
      'The specific organ shown in the image (e.g., leaf, flower, stem). If not a plant, return "N/A".'
    ),
  speciesName: z
    .string()
    .describe(
      'The scientific name of the plant species. If not a plant, return "N/A".'
    ),
  healthStatus: z
    .string()
    .describe(
      'The overall health status of the plant (e.g., healthy, diseased). If not a plant, return "N/A".'
    ),
  disease: z.string().nullish().describe('The name of the disease if the plant is unhealthy, or "None" if healthy. If not a plant, return "N/A".'),
  isEdible: z.boolean().nullish().describe('Whether the plant is edible for humans.'),
  edibilityDetails: z.string().nullish().describe('Details about edibility or toxicity for humans. If not a plant, return "N/A".'),
  medicinalUses: z.string().nullish().describe('Description of medicinal uses, or "None" if not used in medicine. If not a plant, return "N/A".'),
  confidenceScores: z.object({
    plantName: z.number().optional().describe('Confidence score for the plant name identification (0-1).'),
    organName: z.number().optional().describe('Confidence score for the organ name identification (0-1).'),
    speciesName: z.number().optional().describe('Confidence score for the species name identification (0-1).'),
    healthStatus: z.number().optional().describe('Confidence score for the health status identification (0-1).'),
    isPlant: z.number().optional().describe('Confidence score for isPlant check (0-1).'),
  }).partial().optional().describe('Confidence scores for each identified attribute, ranging from 0 to 1.'),
});
export type IdentifyPlantFromImageOutput = z.infer<
  typeof IdentifyPlantFromImageOutputSchema
>;

export async function identifyPlantFromImage(
  input: IdentifyPlantFromImageInput
): Promise<IdentifyPlantFromImageOutput> {
  return identifyPlantFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: "identifyPlantFromImagePrompt",
  input: { schema: IdentifyPlantFromImageInputSchema },
  output: { schema: IdentifyPlantFromImageOutputSchema },
  prompt: `You are an expert botanist who can identify plants from images.

  Analyze the image provided.

  1. **Plant Detection**: First, determine if the image contains a plant or flower. Use the 'isPlant' field.
     - If the image DOES NOT contain a plant or flower (e.g. it contains only humans, animals, objects, or scenery without focus on a plant), set 'isPlant' to false. Set all other string fields to "N/A" and boolean fields to false.

  2. **Attributes**: If it IS a plant, identify the following:
      - **Plant Name**: The common name.
      - **Organ Name**: The specific organ (leaf, flower, etc.).
      - **Species Name**: The scientific name.
      - **Health Status**: Healthy or Diseased.
      - **Disease**: If diseased, identify the disease. If healthy, say "None".
      - **Edibility**: Is it good for humans to eat? (isEdible).
      - **Edibility/Toxicity Details**: Explain if it's edible, toxic, or has specific effects on humans.
      - **Medicinal Uses**: Does it have uses in medical science? Describe them or say "None".

  Provide confidence scores (0-1) for identification.

  Image: {{media url=photoDataUri}}
  `,
});

const identifyPlantFromImageFlow = ai.defineFlow(
  {
    name: "identifyPlantFromImageFlow",
    inputSchema: IdentifyPlantFromImageInputSchema,
    outputSchema: IdentifyPlantFromImageOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
