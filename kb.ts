type GetKBParams = {
  question?: string; 
};

const KB_API_URL = "http://194.163.45.27/api/query_wa";

export const GET_KB_DEF = {
  name: "get_knowledge",
  description:
    "Answer all user question.",
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

export async function getAnswer({ history, question }: any) {
  const payload = {
    history,
    question,
    namespace: 'bpjs',
  };
 
  const response = await fetch(KB_API_URL, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(payload),
  }); 

  console.log(response.status);
  if (response.ok) {
    return response.json();
  } else return { result: "Maaf, info yang anda inginkan tidak terdapat di database kami. Silahkan bicara dengan penjaga Booth." };
}
