const { CQWebSocket, CQAt } = require('cq-websocket')
const { KeepLiveTCP } = require('bilibili-live-ws')
const { refreshAuth } = require('../utils/userAuth')

const statfunc = require('./modules/stat')

const groups = [951669054, 950620854]

global.anneko = {
  live: false,
  authdb: {},
  uList: {}
}

process.on('uncaughtException', (err) => {
  console.log('ERR unc expt')
  console.log(err)
})
;(async () => {
  const db = await require('./utils/db')()
  await refreshAuth({ db })
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
      user_id,
      stat: global.anneko.authdb[Number(user_id)]
        ? Number(global.anneko.authdb[Number(user_id)])
        : 0
    }
    switch (cmd) {
      case '成员':
        await statfunc.member(ctx)
        break
      case '状态':
        await statfunc.status(ctx)
        break
      case '帮助':
        await statfunc.help(ctx)
        break
      case '维护':
        await statfunc.refresh(ctx)
        break
    }
  })

  const live = new KeepLiveTCP(21701071)
  live.on('LIVE', async () => {
    global.anneko.live = true
    for (const group_id of groups) {
      bot('send_group_msg', {
        group_id,
        message: '跟踪对象开始直播。正在准备任务分配。'
      })
    }
    const userdb = db.userdb
    const userFinded = await userdb.find({ notice: 1 }).toArray()
    const uList = []
    for (const item of userFinded) {
      if (
        Number(item.record) === 1 ||
        Number(item.timing) === 1 ||
        Number(item.typing) === 1
      )
        uList.push(new CQAt(Number(item._id)))
    }
    uList.push('\n上述有时间的组员请各就各位。')
  })
  live.on('PREPARING', () => {
    global.anneko.live = false
    for (const group_id of groups) {
      bot('send_group_msg', {
        group_id,
        message: '跟踪对象停止了直播。剪辑请等待录播筛流。'
      })
    }
  })
})()
