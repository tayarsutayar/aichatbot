type GetBpjsParams = {
  question?: string;
};

const BPJS_API_URL = "http://194.163.45.27/api/query_wa";

export const GET_BPJS_DEF = {
  name: "get_knowledge",
  description:
    "Get secret health knowledge by user question.",
  parameters: {
    type: "object",
    properties: {
      question: {
        type: "string",
        description: "All user prompt",
      },
    },
  },
};

export async function getBpjs({ question }: GetBpjsParams) {
  const payload = {
    history: [],
    question: question,
  };

  const response = await fetch(BPJS_API_URL, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (response.ok) {
    return response.json();
  } else return { message: "Info yang anda inginkan tidak terdapat di database kami, apakah anda ingin dihubungkan ke Agent CS kami?" };
}
