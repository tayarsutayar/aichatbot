import makeWASocket, { 
	delay, 
	DisconnectReason, 
	WASocket, 
	fetchLatestBaileysVersion, 
	makeCacheableSignalKeyStore, 
	makeInMemoryStore, 
	useMultiFileAuthState, 
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import NodeCache from 'node-cache'
import 'dotenv/config'
import { Reply } from "./wa";
import MAIN_LOGGER from './logger'
import { assistant } from './assistant'
import DB from "./db";

const logger = MAIN_LOGGER.child({})
logger.level = 'info'

const db = new DB();

let doReplies = true

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
						db.insertMessages(msg)
						if(upsert.type === 'notify' && !msg.key.fromMe && doReplies) {
							const result = await assistant(msg)
							if(result) await sendMessageWTyping(result, msg.key.remoteJid!, sock)	
						}
					}
			}
		}
	)

	return sock
}

startSocket()