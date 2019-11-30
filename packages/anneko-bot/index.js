const { CQWebSocket } = require('cq-websocket')
const { KeepLiveTCP } = require('bilibili-live-ws')
const { refreshAuth } = require('./utils/userAuth')

const statFunc = require('./modules/stat')
const projFunc = require('./modules/proj')
const userConfFunc = require('./modules/userConf')

const groups = [951669054, 950620854]
const livets = 0

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

    const send = (message) =>
      bot('send_group_msg', {
        group_id,
        message
      })

    const ctx = {
      bot,
      send,
      ctxmsg,
      db,
      group_id,
      user_id,
      stat: global.anneko.authdb[Number(user_id)]
        ? Number(global.anneko.authdb[Number(user_id)])
        : 0
    }

    switch (cmd) {
      case '贴贴':
      case '贝占贝占':
      case 'tietie':
      case 'てえてえ':
      case 'てぇてぇ':
        send('贴贴！')
        break
      case '抱抱！':
      case '抱抱':
        send('抱抱~')
        break
      case '亲亲！': // 蹬鼻子上脸
      case '亲亲':
        send('mua~')
        break
      case '自动立项':
        await projFunc.newProj({
          ...ctx,
          ctxmsg: [
            '直播',
            new Date(livets)
              .toLocaleString('zh-cn', { timeZone: 'Asia/Shanghai' })
              .replace(/ /g, '-') + '时的直播'
          ]
        })
        break
      case '立项':
        await projFunc.newProj(ctx)
        break
      case '签出':
        await projFunc.checkout(ctx)
        break
      case '加入':
        await projFunc.jumpIn(ctx)
        break
      case '退出':
        await projFunc.jumpOut(ctx)
        break
      case '标记':
        await projFunc.tag(ctx)
        break
      case '项目状态':
        await projFunc.status(ctx)
        break
      case '视频源':
        await projFunc.trans(ctx)
        break
      case '概览':
        await projFunc.galance(ctx)
        break
      case '开启提醒':
        await userConfFunc.enableNotify(ctx)
        break
      case '关闭提醒':
        await userConfFunc.disableNotify(ctx)
        break
      case '成员':
        await statFunc.member(ctx)
        break
      case '状态':
        await statFunc.status(ctx)
        break
      case '帮助':
        await statFunc.help(ctx)
        break
      case '维护':
        await statFunc.refresh(ctx)
        break
      case 'DEBUG':
        await statFunc.debug(ctx)
        break
      default:
        send('无效指令。')
        break
    }
  })

  const live = new KeepLiveTCP(21701071)
  live.on('LIVE', async () => {
    global.anneko.live = true
    const ts = new Date().getTime()
    for (const group_id of groups) {
      bot('send_group_msg', {
        group_id,
        message: `跟踪对象${new Date(ts).toLocaleString('zh-cn', {
          timeZone: 'Asia/Shanghai'
        })}开始了直播。正在准备任务分配。
使用“永远喵，自动立项”以自动开始本次直播的立项。`
      })
    }
    const userdb = db.userdb
    const userFinded = await userdb.find({ notice: 1 }).toArray()
    let message = ''
    for (const item of userFinded) {
      if (
        Number(item.record) === 1 ||
        Number(item.timing) === 1 ||
        Number(item.typing) === 1
      )
        message += `[CQ:at,qq=${item._id}]`
    }
    message += '\n上述有时间的组员请各就各位。'
    for (const group_id of groups) {
      bot('send_group_msg', {
        group_id,
        message
      })
    }
  })
  live.on('PREPARING', () => {
    global.anneko.live = false
    for (const group_id of groups) {
      bot('send_group_msg', {
        group_id,
        message: `跟踪对象停止了直播。剪辑请等待录播筛流。
          使用“永远喵，自动立项”以自动开始本次直播的立项。`
      })
    }
  })
})()
