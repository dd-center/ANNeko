const { CQAt } = require('cq-websocket')
const { getCurrent } = require('../utils/token')
const { refreshAuth } = require('../utils/userAuth')

const member = async (ctx) => {
  const userdb = ctx.db.userdb
  const cursor = userdb.find({})
  let msg = '目前工作组内成员有（进组请先看群公告）：\n'
  while (await cursor.hasNext()) {
    const d = await cursor.next()
    msg += d.displayName + '：'
    if (Number(d.typing) === 1) msg += '录入 '
    if (Number(d.record) === 1) msg += '录播 '
    if (Number(d.timing) === 1) msg += '时轴 '
    if (Number(d.support) === 1) msg += '技术支持 '
    if (Number(d.translation) === 1) msg += '翻译 '
    if (Number(d.clip) === 1) msg += '剪辑 '
    if (Number(d.video) === 1) msg += '视频 '
    if (Number(d.upload) === 1) msg += '压制 '
    if (Number(d.mixing) === 1) msg += '混音 '
    if (Number(d.music) === 1) msg += '编曲 '
    if (Number(d.art) === 1) msg += '画师 '
    if (Number(d.program) === 1) msg += '程序 '
    if (Number(d.data) === 1) msg += '数据 '
    msg += '\n'
  }
  ctx.bot('send_group_msg', {
    group_id: ctx.group_id,
    message: msg
  })
}

const status = async (ctx) => {
  if (ctx.stat < 1) {
    ban(ctx)
    return
  }
  const current = await getCurrent(ctx)
  ctx.bot('send_group_msg', {
    group_id: ctx.group_id,
    message:
      '欢迎回来。\n跟踪对象当前' +
      (global.anneko.live ? '正在' : '未') +
      `直播。\n正在进行的项目个数：${current.processingCount}；历史总项目个数：${current.projCount}`
  })
}

const help = async (ctx) => {
  if (ctx.stat < 1) {
    ban(ctx)
    return
  }
  ctx.bot('send_group_msg', {
    group_id: ctx.group_id,
    message:
      '永远喵——任务分配系统v0.1，请勿调戏。\n命令请加“永远喵，”。\n状态：查看跟踪对象直播状态。\n成员：查看工作组成员。\n开启提醒：对于录播、轴和录入人员，在跟踪对象开播时收到@提醒。提醒默认关闭。\n关闭提醒：关闭上述提醒。'
  })
}

const refresh = async (ctx) => {
  if (ctx.stat < 250) {
    ban(ctx)
    return
  }
  ctx.bot('send_group_msg', {
    group_id: ctx.group_id,
    message: '维护任务开始。'
  })
  await refreshAuth(ctx)
  ctx.bot('send_group_msg', {
    group_id: ctx.group_id,
    message: '维护完毕。'
  })
}

const ban = (ctx) => {
  ctx.bot('send_group_msg', {
    group_id: ctx.group_id,
    message: [new CQAt(Number(ctx.user_id)), '您的权限不足。']
  })
}

module.exports = { member, status, help, refresh, ban }
