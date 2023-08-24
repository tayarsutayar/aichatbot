import { GET_DAFTAR_PERATURAN_DEF, getDaftarPeraturan } from "./jdih";
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
  // {
  //   name: "nearby",
  //   description: "Get nearby longitude latitude",
  //   parameters: {
  //     type: "object",
  //     properties: {
  //       request: {
  //         type: "string",
  //         description:
  //           "A string contains 'nearby' or similar word but don't know where the place is.",
  //       },
  //     },
  //   },
  // },
  GET_DAFTAR_PERATURAN_DEF,
  GET_FASKES_DEF,
];

export function callFunction(name: string, args: Record<string, unknown>) {
  if (name === "now")
    return new Date().toLocaleString(args["locale"] as string);
  // if (name === "nearby")
  //   return 'Please Share your current location';
  if (name === GET_DAFTAR_PERATURAN_DEF.name) return getDaftarPeraturan(args);
  if (name === GET_FASKES_DEF.name) return getFaskes(args);
}