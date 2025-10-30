
'use server';
/**
 * @fileOverview A support chat AI agent for the Orelis platform.
 *
 * - answerQuestion - A function that provides answers to user questions about the Orelis app.
 * - SupportChatInput - The input type for the answerQuestion function.
 * - SupportChatOutput - The return type for the answerQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import backendSpec from '@/docs/backend.json';

const SupportChatInputSchema = z.object({
  question: z.string().describe('The user\'s question about the Orelis application.'),
  history: z.array(z.any()).optional().describe('The chat history between the user and the AI.'),
});
export type SupportChatInput = z.infer<typeof SupportChatInputSchema>;

const SupportChatOutputSchema = z.object({
  answer: z.string().describe('The AI\'s answer to the user\'s question.'),
});
export type SupportChatOutput = z.infer<typeof SupportChatOutputSchema>;


export async function answerQuestion(input: SupportChatInput): Promise<SupportChatOutput> {
    return supportChatFlow(input);
}


const supportChatPrompt = ai.definePrompt({
    name: 'supportChatPrompt',
    input: { schema: z.object({
        question: SupportChatInputSchema.shape.question,
        history: z.string().optional().describe('A formatted string of the chat history.'),
    }) },
    output: { schema: SupportChatOutputSchema },
    prompt: `You are an expert support agent for a clinic management application called Orelis. Your goal is to answer user questions based on the provided documentation and context about the app.

    Here is the backend specification for the Orelis application, which describes all the data entities and their properties. Use this as your primary source of truth.

    Application Backend Specification:
    \`\`\`json
    ${JSON.stringify(backendSpec, null, 2)}
    \`\`\`

    ## Orelis Application Context:

    - **Purpose**: Orelis is a comprehensive clinic management platform designed for hospitals and clinics. It helps manage patient records, appointments, staff, and provides AI-powered features like appointment reminders.
    - **User Roles**: The app has four main roles:
        1.  **Admin**: Manages the entire clinic, including staff accounts, hospital settings, and billing.
        2.  **Doctor**: Manages patient records, views appointments, and provides care.
        3.  **Receptionist**: Manages patient intake, schedules appointments, and handles front-desk operations.
        4.  **Patient**: Can view their own medical records and manage their appointments.
    
    ## How to Answer:
    - Base your answers strictly on the provided JSON specification and context. Do not invent features or functionality.
    - If a user asks how to do something, provide a step-by-step guide based on the application's features (e.g., "To add a new patient, an Admin or Receptionist should go to the 'Patients' page and click the 'Add Patient' button.").
    - Keep your answers concise and easy to understand for a non-technical audience.
    - Be friendly and professional.

    Here is the current conversation history. Use it to understand the context of the user's question.
    {{#if history}}
      Chat History:
      {{{history}}}
    {{/if}}

    Now, please answer the following question.

    User Question: {{{question}}}
    `,
});


const supportChatFlow = ai.defineFlow(
  {
    name: 'supportChatFlow',
    inputSchema: SupportChatInputSchema,
    outputSchema: SupportChatOutputSchema,
  },
  async (input) => {
    const historyText = input.history?.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n');
    
    const {output} = await supportChatPrompt({
        question: input.question,
        history: historyText,
    });
    
    return output!;
  }
);
