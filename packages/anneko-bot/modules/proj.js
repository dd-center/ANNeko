const { getNew } = require('../utils/token')
const worker = require('../utils/worker')
const { getUserName } = require('../utils/userAuth')
const { ban } = require('./stat')

const newProj = async (ctx) => {
  if (ctx.stat < 10) {
    ban(ctx)
    return
  }
  if (ctx.ctxmsg.length !== 2) {
    ctx.bot('send_group_msg', {
      group_id: ctx.group_id,
      message: `参数错误。
“立项”命令接受两个参数，分别是“项目类别”和“项目名称”。`
    })
    return
  }
  let projType = ''
  switch (ctx.ctxmsg[0]) {
    case '直播':
      projType = 'live'
      break
    case '剪辑':
      projType = 'clip'
      break
    case '单品':
      projType = 'art'
      break
    default:
      ctx.bot('send_group_msg', {
        group_id: ctx.group_id,
        message: `参数错误。
“项目名称”参数接受的值是“直播”、“剪辑”和“单品”的枚举。`
      })
      return
  }
  ctx.bot('send_group_msg', {
    group_id: ctx.group_id,
    message: '开始分配新的项目。'
  })
  const projId = await getNew(ctx)
  const projName = ctx.ctxmsg[1]
  const projCreateDate = new Date().getTime()
  await ctx.db.projdb.insertOne({
    _id: Number(projId),
    name: projName,
    type: projType,
    createTime: projCreateDate,
    stat: 1,
    step: '',
    worker: '',
    transId: ''
  })
  ctx.bot('send_group_msg', {
    group_id: ctx.group_id,
    message: `项目建立成功。
项目编号：${projId}
项目名称：${projName}
项目类型：${ctx.ctxmsg[0]}
创建时间：${new Date(projCreateDate).toLocaleString('zh-cn', {
      timeZone: 'Asia/Shanghai'
    })}
请组长签出工作进度。`
  })
}

const checkout = async (ctx) => {
  if (ctx.stat < 10) {
    ban(ctx)
    return
  }
  if (ctx.ctxmsg.length !== 2) {
    ctx.bot('send_group_msg', {
      group_id: ctx.group_id,
      message: `参数错误。
“签出”命令接受两个参数，分别是“项目编号”和“签出进度”。`
    })
    return
  }
  if (isNaN(Number(ctx.ctxmsg[0]))) {
    ctx.bot('send_group_msg', {
      group_id: ctx.group_id,
      message: '项目编号有误。'
    })
    return
  }
  const projId = Number(ctx.ctxmsg[0])
  if (
    (await ctx.db.projdb.find({ _id: Number(projId) }).toArray()).length < 1
  ) {
    ctx.bot('send_group_msg', {
      group_id: ctx.group_id,
      message: '没有找到对应编号的项目。'
    })
    return
  }

  await ctx.db.projdb.updateOne(
    {
      _id: Number(projId)
    },
    { $set: { step: ctx.ctxmsg[1] } }
  )
  ctx.bot('send_group_msg', {
    group_id: ctx.group_id,
    message: `项目${projId}已成功签出到进度${ctx.ctxmsg[1]}。`
  })
}

const jumpIn = async (ctx) => {
  if (ctx.stat < 1) {
    ban(ctx)
    return
  }
  if (ctx.ctxmsg.length !== 1) {
    ctx.bot('send_group_msg', {
      group_id: ctx.group_id,
      message: `参数错误。
“加入”命令接受一个参数：“项目编号”。`
    })
    return
  }
  if (isNaN(Number(ctx.ctxmsg[0]))) {
    ctx.bot('send_group_msg', {
      group_id: ctx.group_id,
      message: '项目编号有误。'
    })
    return
  }
  const projId = Number(ctx.ctxmsg[0])
  const data = await ctx.db.projdb.find({ _id: Number(projId) }).toArray()
  if (data.length < 1) {
    ctx.bot('send_group_msg', {
      group_id: ctx.group_id,
      message: '没有找到对应编号的项目。'
    })
    return
  }

  const workerList = worker.toArray(data[0].worker || '')
  if (workerList.find((i) => Number(i) === Number(ctx.user_id))) {
    ctx.bot('send_group_msg', {
      group_id: ctx.group_id,
      message: '您已经加入了这个项目。'
    })
    return
  }
  workerList.push(Number(ctx.user_id))

  await ctx.db.projdb.updateOne(
    {
      _id: Number(projId)
    },
    { $set: { worker: worker.toString(workerList) } }
  )
  ctx.bot('send_group_msg', {
    group_id: ctx.group_id,
    message: `${getUserName(ctx.user_id)}已成功加入项目${projId}。`
  })
}

const jumpOut = async (ctx) => {
  if (ctx.stat < 1) {
    ban(ctx)
    return
  }
  if (ctx.ctxmsg.length !== 1) {
    ctx.bot('send_group_msg', {
      group_id: ctx.group_id,
      message: `参数错误。
“退出”命令接受一个参数：“项目编号”。`
    })
    return
  }
  if (isNaN(Number(ctx.ctxmsg[0]))) {
    ctx.bot('send_group_msg', {
      group_id: ctx.group_id,
      message: '项目编号有误。'
    })
    return
  }
  const projId = Number(ctx.ctxmsg[0])
  const data = await ctx.db.projdb.find({ _id: Number(projId) }).toArray()
  if (data.length < 1) {
    ctx.bot('send_group_msg', {
      group_id: ctx.group_id,
      message: '没有找到对应编号的项目。'
    })
    return
  }

  const workerList = worker.toArray(data[0].worker || '')
  const index = workerList.indexOf(Number(ctx.user_id))
  if (index > -1) {
    workerList.splice(index, 1)
  } else {
    ctx.bot('send_group_msg', {
      group_id: ctx.group_id,
      message: '您不在项目中。'
    })
    return
  }

  await ctx.db.projdb.updateOne(
    {
      _id: Number(projId)
    },
    { $set: { worker: worker.toString(workerList) } }
  )
  ctx.bot('send_group_msg', {
    group_id: ctx.group_id,
    message: `${getUserName(ctx.user_id)}已成功退出项目${projId}。`
  })
}

const status = async (ctx) => {
  if (ctx.stat < 1) {
    ban(ctx)
    return
  }
  if (ctx.ctxmsg.length !== 1) {
    ctx.bot('send_group_msg', {
      group_id: ctx.group_id,
      message: `参数错误。
“项目状态”命令接受一个参数：“项目编号”。`
    })
    return
  }
  if (isNaN(Number(ctx.ctxmsg[0]))) {
    ctx.bot('send_group_msg', {
      group_id: ctx.group_id,
      message: '项目编号有误。'
    })
    return
  }
  const projId = Number(ctx.ctxmsg[0])
  const data = await ctx.db.projdb.find({ _id: Number(projId) }).toArray()
  if (data.length < 1) {
    ctx.bot('send_group_msg', {
      group_id: ctx.group_id,
      message: '没有找到对应编号的项目。'
    })
    return
  }

  const workerList = worker.toArray(data[0].worker)
  let str = ''
  for (const item of workerList) str += getUserName(Number(item)) + '，'
  str = str.substring(0, str.length - 1)

  let stat = ''
  switch (Number(data[0].stat)) {
    case 1:
      stat = '进行中'
      break
    case 2:
      stat = '已完成'
      break

    default:
      stat = '其他'
      break
  }

  ctx.bot('send_group_msg', {
    group_id: ctx.group_id,
    message: `项目${projId}的状态：
名称：${data[0].name}
创建时间：${data[0].createTime}
状态：${stat}
进度：${data[0].step}
工作人员：${str}。`
  })
}

const trans = async (ctx) => {
  if (ctx.stat < 10) {
    ban(ctx)
    return
  }
  if (ctx.ctxmsg.length !== 2) {
    ctx.bot('send_group_msg', {
      group_id: ctx.group_id,
      message: `参数错误。
“视频源”命令接受两个参数：“项目编号”和“Transerver ID”。`
    })
    return
  }
  if (isNaN(Number(ctx.ctxmsg[0]))) {
    ctx.bot('send_group_msg', {
      group_id: ctx.group_id,
      message: '项目编号有误。'
    })
    return
  }
  const projId = Number(ctx.ctxmsg[0])
  const data = await ctx.db.projdb.find({ _id: Number(projId) }).toArray()
  if (data.length < 1) {
    ctx.bot('send_group_msg', {
      group_id: ctx.group_id,
      message: '没有找到对应编号的项目。'
    })
    return
  }

  await ctx.db.projdb.updateOne(
    {
      _id: Number(projId)
    },
    { $set: { transId: ctx.ctxmsg[1] } }
  )

  ctx.bot('send_group_msg', {
    group_id: ctx.group_id,
    message: `项目${projId}的Transerver ID${ctx.ctxmsg[1]}：。请时轴和录入人员下载视频开始工作。`
  })
}

const tag = async (ctx) => {
  if (ctx.stat < 10) {
    ban(ctx)
    return
  }
  if (ctx.ctxmsg.length !== 2) {
    ctx.bot('send_group_msg', {
      group_id: ctx.group_id,
      message: `参数错误。
“标记”命令接受两个参数，分别是“项目编号”和“标记类别”。`
    })
    return
  }
  let stat = -1
  switch (ctx.ctxmsg[1]) {
    case '进行中':
      stat = 1
      break
    case '已完成':
      stat = 2
      break
    default:
      ctx.bot('send_group_msg', {
        group_id: ctx.group_id,
        message: `参数错误。
“标记类别”参数接受的值是“进行中”和“已完成”的枚举。`
      })
      return
  }
  if (isNaN(Number(ctx.ctxmsg[0]))) {
    ctx.bot('send_group_msg', {
      group_id: ctx.group_id,
      message: '项目编号有误。'
    })
    return
  }
  const projId = Number(ctx.ctxmsg[0])
  const data = await ctx.db.projdb.find({ _id: Number(projId) }).toArray()
  if (data.length < 1) {
    ctx.bot('send_group_msg', {
      group_id: ctx.group_id,
      message: '没有找到对应编号的项目。'
    })
    return
  }

  await ctx.db.projdb.updateOne(
    {
      _id: Number(projId)
    },
    { $set: { stat: Number(stat) } }
  )
  ctx.bot('send_group_msg', {
    group_id: ctx.group_id,
    message: `项目${projId}已被成功标记为${ctx.ctxmsg[1]}。`
  })
}

module.exports = { newProj, checkout, jumpIn, jumpOut, tag, status, trans }
