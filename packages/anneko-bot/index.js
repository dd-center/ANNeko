const { CQWebSocket } = require('cq-websocket')
const db = require('./utils/db')

const statfunc = require('./modules/stat')

process.on('uncaughtException', (err) => {
  console.log('ERR unc expt')
  console.log(err)
})
;(() => {
  const bot = new CQWebSocket({
    baseUrl: process.env.WS_BASE
  })
  bot.connect()
  bot.on('error', (err) => {
    console.log('ERR')
    console.log(err)
  })
  bot.on('socket.error', (err) => {
    console.log('ERR')
    console.log(err)
  })
  bot.on('message.group', async (event, context, tags) => {
    const contextMessage = context.message
    const group_id = context.group_id
    const user_id = context.user_id
    if (!contextMessage.startsWith('永远喵，')) return
    const ctxmsg = contextMessage.replace('永远喵，', '').split(' ')
    const cmd = ctxmsg[0]
    ctxmsg.shift()
    const ctx = {
      bot,
      ctxmsg,
      db,
      group_id,
      user_id
    }
    switch (cmd) {
      case '成员':
        await statfunc.member(ctx)
        break
      case '状态':
        await statfunc.status(ctx)
        break
    }
  })
})()
