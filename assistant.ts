import { ChatMessage, chat } from "./chat";
import { Message, Reply, getQuotedMessages } from "./wa";
import { FUNCTIONS_DEFINITION, callFunction } from "./functions";

const SYSTEM_MESSAGES: ChatMessage[] = [
  {
    role: "system",
    content: "You are a helpful assistant named BOT BPJS.",
  },
  {
    role: "system",
    content: "Only answer in 50 words or less.",
  },
];

export async function assistant(message: Message): Promise<Reply | void> {
  const PHONE_NUMBER = process.env.PHONE_NUMBER
  const SELF_JID = PHONE_NUMBER + "@s.whatsapp.net";
  
  const contextInfo = message.message?.extendedTextMessage?.contextInfo;
  if (
    contextInfo?.mentionedJid?.includes(SELF_JID) ||
    contextInfo?.participant === SELF_JID
  ) {
    const messages = await getQuotedMessages(message);
    const chats: ChatMessage[] = messages.map(({ key, message }) => ({
      role: key.fromMe ? "assistant" : "user",
      content:
        message?.extendedTextMessage?.text?.replaceAll(
          "@" + PHONE_NUMBER,
          "BOT BPJS"
        ) ?? "",
    }));
    
    const text = await chat([...SYSTEM_MESSAGES, ...chats], {
      max_tokens: 500,
      functions_definition: FUNCTIONS_DEFINITION,
      call_function: callFunction,
    }).catch((err) => `[ERROR] ${err}.`);
    return [{ text }];
  }
}