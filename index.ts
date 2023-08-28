import makeWASocket, { 
	delay, 
	DisconnectReason, 
	WASocket, 
	fetchLatestBaileysVersion, 
  proto,
	makeCacheableSignalKeyStore, 
	makeInMemoryStore, 
	useMultiFileAuthState, 
  WAMessageKey,
  WAMessageContent
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import NodeCache from 'node-cache'
import 'dotenv/config'
import { Reply } from "./wa";
import MAIN_LOGGER from './logger'
import { assistant } from './assistant'
import DB from "./db";

const logger = MAIN_LOGGER.child({})
logger.level = 'trace'

const db = new DB();

const msgRetryCounterCache = new NodeCache()

const store = makeInMemoryStore({ logger })
store?.readFromFile('./baileys_store_multi.json')
setInterval(() => {
	store?.writeToFile('./baileys_store_multi.json')
}, 10_000)

export const sendMessageWTyping = async(reply: Reply, jid: string, sock : WASocket) => {
	await sock.presenceSubscribe(jid)
	await delay(500)
	await sock.sendPresenceUpdate('composing', jid)
	await delay(2000)
	await sock.sendPresenceUpdate('paused', jid)
	await sock.sendMessage(jid, reply[0], reply[1] ?? undefined)
}

const greetingMessage = (name: string = '') : string => {
return `Halo Bpk/Ibu ${name}
Terima kasih telah mengubungi WhatsApp Customer Care Kami

Bagaimana BOT BPJS bisa membantu ?

Dengan BOT BPJS Makin Mudah Makin Cepat
BPJS Kesehatan 
Gotong Royong Semua Tertolong`
}

const startSocket = async() => {
	const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info')
	const { version, isLatest } = await fetchLatestBaileysVersion()

	const sock = makeWASocket({
		version,
		logger,
		printQRInTerminal: true,
		auth: {
			creds: state.creds,
			keys: makeCacheableSignalKeyStore(state.keys, logger),
		},
		msgRetryCounterCache,
    getMessage
	})

	store?.bind(sock.ev)

	sock.ev.process(
		async(events) => {
			if(events['connection.update']) {
				const update = events['connection.update']
				const { connection, lastDisconnect } = update
				if(connection === 'close') {
					if((lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
						startSocket()
					} else {
						console.log('Connection closed. You are logged out.')
					}
				}
				console.log('connection update', update)
			}

			if(events['creds.update']) {
				await saveCreds()
			}

			if(events['messages.upsert']) {
				const upsert = events['messages.upsert']
					for(const msg of upsert.messages) {
						if(upsert.type === 'notify' && !msg.key.fromMe) {
							const result = await assistant(msg)
              				await sock!.readMessages([msg.key])

							if(await db.isFirstMsg(msg)) await sendMessageWTyping([{text: greetingMessage(msg.pushName ?? '')}], msg.key.remoteJid!, sock)
							if(result) await sendMessageWTyping(result, msg.key.remoteJid!, sock)	
						}
						db.insertMessages(msg, upsert.type)
					}
			}
		}
	)

	return sock

  async function getMessage(key: WAMessageKey): Promise<WAMessageContent | undefined> {
		if(store) {
			const msg = await store.loadMessage(key.remoteJid!, key.id!)
			return msg?.message || undefined
		}

		// only if store is present
		return proto.Message.fromObject({})
	}
}

startSocket()