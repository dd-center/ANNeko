const { getUserName } = require('../utils/userAuth')
const { ban } = require('./stat')

const enableNotify = async (ctx) => {
  if (ctx.stat < 1) {
    ban(ctx)
    return
  }
  await ctx.db.userdb.updateOne(
    { _id: Number(ctx.user_id) },
    { $set: { notice: 1 } }
  )
  ctx.bot('send_group_msg', {
    group_id: ctx.group_id,
    message: `${getUserName(ctx.user_id)}的任务提醒已经开启。`
  })
}

const disableNotify = async (ctx) => {
  if (ctx.stat < 1) {
    ban(ctx)
    return
  }
  await ctx.db.userdb.updateOne(
    { _id: Number(ctx.user_id) },
    { $set: { notice: 0 } }
  )
  ctx.bot('send_group_msg', {
    group_id: ctx.group_id,
    message: `${getUserName(ctx.user_id)}的任务提醒已经关闭。`
  })
}

module.exports = { enableNotify, disableNotify }
