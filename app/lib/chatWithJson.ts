import { createOpenAI } from "@ai-sdk/openai";
import { convertToCoreMessages, CoreMessage, streamText, tool } from "ai";
import { z } from "zod";
import { getErrorMessage } from "./utils/error";

export async function chatWithJson({
  json,
  prompt,
  openaiApiKey,
  schema,
}: {
  openaiApiKey: string;
  schema: string;
  json: string;
  prompt: CoreMessage[];
}) {
  const result = await streamText({
    experimental_toolCallStreaming: true,
    model: createOpenAI({ compatibility: "strict", apiKey: openaiApiKey })(
      "gpt-4o"
    ),

    system: `You are a helpful assistant who will write javscript code to extract,modify and generate data to an json object. The schema of the json object is ${schema}. Goal of the the code will be to answer the user's query. To execute the generated code you can use the tool. Remember the generated code will have access to the json data in the variable __jsonData. Once you got the required data, explain the data in human friendly language. Always consider null as a value too. Use only valid json.`,
    tools: {
      js_executator: tool({
        description:
          "Use this tool to execute javascript code, to extract,modify and generate data from the json object. The json object will be accessible to the code in the variable __jsonData. The result the execuation must be stored in variable __result.",
        parameters: z.object({
          code: z
            .string()
            .describe(
              "Javascript code to execute. Provide only the code, no other text including ```"
            ),
        }),

        async execute({ code }: { code: string }) {
          try {
            const result = new Function(
              `const __jsonData = ${json};\n` + code + "\nreturn __result;"
            )();

            return result;
          } catch (error) {
            const errorMessage = getErrorMessage(error);

            return `There was an error executing the code: ${errorMessage}`;
          }
        },
      }),
    },
    messages: prompt,
  });

  return result;
}

export function createChatWithJsonFetch({
  openaiApiKey,
  json,
  schema,
}: {
  openaiApiKey: string | null;
  schema: string;
  json: string;
}) {
  const chatWithJsonFetch: typeof fetch = async (request, options) => {
    if (!openaiApiKey) {
      console.log("No openai api key");
      return new Response("No openai api key");
    }

    if (options) {
      const history = JSON.parse(options?.body?.toString() || "");

      const coreMessage = convertToCoreMessages(history.messages);
      const result = await chatWithJson({
        openaiApiKey,
        schema,
        json,
        prompt: coreMessage,
      });

      return result.toDataStreamResponse();
    }

    throw new Error("No options");
  };

  return chatWithJsonFetch;
}
