import { GET_KB_DEF, getAnswer } from "./kb"; 
import { GET_FASKES_DEF, getFaskes } from "./nearby_faskes"; 

export type ChatFunction = {
  name: string;
  description?: string;
  parameters: Record<string, unknown>;
};

export const FUNCTIONS_DEFINITION: ChatFunction[] = [
  {
    name: "now",
    description: "Get current time",
    parameters: {
      type: "object",
      properties: {
        locale: {
          type: "string",
          description:
            "A string with a BCP 47 language tag, or an array of such strings. e.g. 'id-ID' for Bahasa Indonesia.",
        },
      },
    },
  },  
  GET_KB_DEF, 
  GET_FASKES_DEF
];

export function callFunction(name: string, args: Record<string, unknown>) {
  if (name === "now") return new Date().toLocaleString(args["locale"] as string);
  if (name === GET_FASKES_DEF.name) return getFaskes(args) 
  if (name === GET_KB_DEF.name) return getAnswer(args); 
}