import { ChatMessage, chat } from "./chat";
import { Message, Reply, getQuotedMessages } from "./wa";
import { FUNCTIONS_DEFINITION, callFunction } from "./functions";

const SYSTEM_MESSAGES: ChatMessage[] = [
  {
    role: "system",
    content: "You are a helpful assistant named Asistenkeu that answer question related to Ministry of Finance.",
  },
  {
    role: "system",
    content: "Answer in 50 words or less.",
  }
];

export async function assistant(message: Message): Promise<Reply | void> {
  const PHONE_NUMBER = process.env.PHONE_NUMBER
  const SELF_JID = PHONE_NUMBER + "@s.whatsapp.net";
  
  const contextInfo = message.message?.extendedTextMessage?.contextInfo ?? message.message?.locationMessage?.contextInfo;
  const isPersonal =  message.key.remoteJid?.endsWith('@s.whatsapp.net')
  if (
    contextInfo?.mentionedJid?.includes(SELF_JID) ||
    contextInfo?.participant === SELF_JID ||
    isPersonal
  ) { 
    const messages = await getQuotedMessages(message);

    const chats: ChatMessage[] = messages.map(({ key, message }) => ({
      role: key.fromMe ? "assistant" : "user",
      content:
        (message?.extendedTextMessage?.text?.replaceAll(
          "@" + PHONE_NUMBER,
          "Asistenkeu"
        ) ?? "") + 
        (isPersonal ? (message?.conversation?.replaceAll(
          "@" + PHONE_NUMBER,
          "Asistenkeu"
        ) ?? "") : ""),
    }));
 
      const text = await chat([...SYSTEM_MESSAGES, ...chats], {
        max_tokens: 500,
        functions_definition: FUNCTIONS_DEFINITION,
        call_function: callFunction,
      }).catch((err) => `${err}.`);
      return [{ text }, { quoted: message }];
    
    
  }
}


