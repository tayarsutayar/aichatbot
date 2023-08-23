import {
  AnyMessageContent,
  MiscMessageGenerationOptions,
  WAProto,
} from "@whiskeysockets/baileys";
import 'dotenv/config'
import DB from "./db";

const db = new DB();

export type Message = WAProto.IWebMessageInfo;

export type Reply = [AnyMessageContent, MiscMessageGenerationOptions?];

export async function getMessage(stanzaId: string, jid: string): Promise<Message | undefined> {
  const response = await db.getByStanzaid(stanzaId, jid);
  if(response) return response.message;
}

export async function getQuotedMessages(message: Message) {
  const result = [message];
  while (true) {
    const stanzaId = result.at(0)?.message?.extendedTextMessage?.contextInfo?.stanzaId;
    const jid = result.at(0)?.key.remoteJid;
    if (!stanzaId || !jid) break;
    
    const message = await getMessage(stanzaId, jid);
    if (!message) break;
    result.unshift(message);
  }
  return result;
}
