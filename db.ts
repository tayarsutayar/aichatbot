import { createClient, SupabaseClient} from "@supabase/supabase-js";
import { WAProto } from "@whiskeysockets/baileys"

interface Messages {
  key_id: string,
  remote_jid: string,
  message: WAProto.IWebMessageInfo
}

export default class DB {
  private client: SupabaseClient;

  constructor() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY)
      throw new Error("Supabase Key Not Setted!");
    this.client = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
  }
  
  async insertMessages(message : WAProto.IWebMessageInfo){    
    const newMessage : Messages = {
      key_id: message.key.id ?? '',
      remote_jid: message.key.remoteJid ?? '',
      message: message,
    } 
    const { error } = await this.client.from('messages').insert(newMessage)
    if(error) console.log(`[ERROR] ${JSON.stringify(error)}.`)
  }

  async getByStanzaid(stanzaId: string, remoteJid: string): Promise<Messages | void> {    
    let { data, error } = await this.client
      .from('messages')
      .select()
      .eq('key_id', stanzaId)
      .eq('remote_jid', remoteJid)
      .order('id', {'ascending' : false})
      .limit(1)
    if(!error && data) return data[0]
    console.log(`[ERROR] ${JSON.stringify(error)}.`)
  }
}

