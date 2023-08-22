import makeWASocket, { AnyMessageContent, delay, makeCacheableSignalKeyStore, makeInMemoryStore, proto, useMultiFileAuthState,  WASocket } from '@whiskeysockets/baileys'
import MAIN_LOGGER from './logger'
import { assistant } from './assistant'
import 'dotenv/config'

const logger = MAIN_LOGGER.child({})
logger.level = 'info'

const store = makeInMemoryStore({ logger })
store?.readFromFile('./baileys_store_multi.json')
// save every 10s
setInterval(() => {
	store?.writeToFile('./baileys_store_multi.json')
}, 10_000)

export const sendMessageWTyping = async(msg: AnyMessageContent, jid: string, sock : WASocket) => {
	await sock.presenceSubscribe(jid)
	await delay(500)

	await sock.sendPresenceUpdate('composing', jid)
	await delay(2000)

	await sock.sendPresenceUpdate('paused', jid)

	await sock.sendMessage(jid, msg)
}

const startSocket = async() => {
	const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info')

	const sock = makeWASocket({
		printQRInTerminal: true,
		auth: {
			creds: state.creds,
			keys: makeCacheableSignalKeyStore(state.keys, logger),
		},
	})

	store?.bind(sock.ev)

	sock.ev.process(

		async(events) => {

			if(events['creds.update']) {
				await saveCreds()
			}

			if(events['messages.upsert']) {
				const upsert = events['messages.upsert']
				console.log('recv messages ', JSON.stringify(upsert, undefined, 2))

				if(upsert.type === 'notify') {
					for(const msg of upsert.messages) {
						if(!msg.key.fromMe) {
							console.log('replying to', msg.key.remoteJid)
							const result = await assistant(msg)
							console.log(result)
							
							if(result && result[0])await sendMessageWTyping(result[0] , msg.key.remoteJid!, sock)
						}
					}
				}
			}
		}
	)

	return sock
}

startSocket()