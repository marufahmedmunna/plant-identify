'use server';
/**
 * @fileOverview This file defines a Genkit flow for answering questions about a plant after it has been identified.
 *
 * It includes:
 * - answerQuestionsAboutPlant: An exported function to initiate the question answering flow.
 * - AnswerQuestionsAboutPlantInput: The input type for the function, including plant attributes and the user's question.
 * - AnswerQuestionsAboutPlantOutput: The output type, which is the answer to the question.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerQuestionsAboutPlantInputSchema = z.object({
  plantName: z.string().describe('The identified name of the plant.'),
  organName: z.string().describe('The identified organ name of the plant.'),
  speciesName: z.string().describe('The identified species name of the plant.'),
  plantHealth: z.string().describe('The identified health status of the plant.'),
  question: z.string().describe('The user question about the plant.'),
});
export type AnswerQuestionsAboutPlantInput = z.infer<
  typeof AnswerQuestionsAboutPlantInputSchema
>;

const AnswerQuestionsAboutPlantOutputSchema = z.object({
  answer: z.string().describe('The answer to the user question about the plant.'),
});
export type AnswerQuestionsAboutPlantOutput = z.infer<
  typeof AnswerQuestionsAboutPlantOutputSchema
>;

export async function answerQuestionsAboutPlant(
  input: AnswerQuestionsAboutPlantInput
): Promise<AnswerQuestionsAboutPlantOutput> {
  return answerQuestionsAboutPlantFlow(input);
}

const answerQuestionsAboutPlantPrompt = ai.definePrompt({
  name: 'answerQuestionsAboutPlantPrompt',
  input: {schema: AnswerQuestionsAboutPlantInputSchema},
  output: {schema: AnswerQuestionsAboutPlantOutputSchema},
  prompt: `You are an expert botanist. Use the provided information about a plant to answer the user's question.

Plant Name: {{{plantName}}}
Organ Name: {{{organName}}}
Species Name: {{{speciesName}}}
Plant Health: {{{plantHealth}}}

Question: {{{question}}}

Answer:`,
});

const answerQuestionsAboutPlantFlow = ai.defineFlow(
  {
    name: 'answerQuestionsAboutPlantFlow',
    inputSchema: AnswerQuestionsAboutPlantInputSchema,
    outputSchema: AnswerQuestionsAboutPlantOutputSchema,
  },
  async input => {
    const {output} = await answerQuestionsAboutPlantPrompt(input);
    return output!;
  }
);
