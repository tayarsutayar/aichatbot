import { createClient, SupabaseClient} from "@supabase/supabase-js";
import { WAProto } from "@whiskeysockets/baileys"

interface Messages {
  key_id: string,
  remote_jid: string,
  from_me: boolean,
  upsert_type: string,
  message: WAProto.IWebMessageInfo,
  created_at?: Date
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
  
  async insertMessages(message : WAProto.IWebMessageInfo, upsert_type: string){    
    const newMessage : Messages = {
      key_id: message.key.id ?? '',
      remote_jid: message.key.remoteJid ?? '',
      from_me: message.key.fromMe ?? false,
      upsert_type: upsert_type,
      message: message,
      created_at: new Date(Date.now()),
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

  async isFirstMsg(message : WAProto.IWebMessageInfo) : Promise<boolean>{    
    let { data } = await this.client
      .from('messages')
      .select()
      .eq('remote_jid', message.key.remoteJid ?? '')
      .eq('upsert_type', 'notify')
      .eq('from_me', false)
      .gte('created_at', (new Date( Date.now() - (1000 * 60 * 5) )).toDateString())
      .limit(1)
      
    if(!(message.message?.extendedTextMessage?.contextInfo?.stanzaId || message.message?.locationMessage?.contextInfo?.stanzaId)
        && data?.length == 0){
      return true
    }
    return false
  }
  
}

