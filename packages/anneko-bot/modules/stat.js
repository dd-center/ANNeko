const { getCurrent } = require('../utils/token')
const { refreshAuth } = require('../utils/userAuth')

const jobTable = {
  typing: '录入',
  record: '录播',
  timing: '时轴',
  support: '技术支持',
  translation: '翻译',
  clip: '剪辑',
  video: '视频',
  upload: '压制',
  mixing: '混音',
  music: '编曲',
  art: '画师/美工',
  program: '程序',
  data: '数据'
}

const HELP_MESSAGE = `永远喵——任务分配系统v0.1，请勿调戏。
命令请加“永远喵，”。以空格分隔参数。
状态：查看跟踪对象直播状态。
成员：查看工作组成员。
开启提醒：对于录播、轴和录入人员，在跟踪对象开播时收到@提醒。提醒默认关闭。
关闭提醒：关闭上述提醒。
自动立项：通过直播间检测自动建立直播字幕项目。
立项：建立项目。参数为“项目类别”和“项目名称”。
类别有“直播”（完整的直播字幕制作）、“剪辑”（短时长剪辑视频的字幕制作）和“单品”（音视频作品制作）。
签出：组长使用，标记某个项目的进度，如“正在制作”、“正在压制”或“可投稿”。参数分别是“项目编号”和“签出进度”。
加入：加入某个项目。参数为项目编号。
退出：退出某个项目。参数同上。
标记：组长使用，标记某个项目为“进行中”或“已完成”。参数分别是“项目编号”和“标记类别”。视频源：组长使用，设置项目的Transerver ID，便于下载。参数分别是“项目编号”和“Transerver ID”。
项目状态：查看项目状态。参数是项目编号。`

const member = async (ctx) => {
  if (!global.anneko.uList) {
    ctx.bot('send_group_msg', {
      group_id: ctx.group_id,
      message: 'ERR at fetching uList'
    })
    return
  }
  let msg = `目前工作组内成员有（进组请先看群公告）：
`
  for (const d of global.anneko.uList) {
    msg += d.displayName + '：'
    msg += Object.entries(jobTable)
      .map(([key, name]) => Number(d[key]) === 1 || name)
      .filter(Boolean)
      .join(' ')
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
    message: `欢迎回来。
跟踪对象当前${global.anneko.live ? '正在' : '未'}直播。
正在进行的项目个数：${current.processingCount}；历史总项目个数：${
      current.projCount
    }`
  })
}

const help = async (ctx) => {
  if (ctx.stat < 1) {
    ban(ctx)
    return
  }
  ctx.bot('send_group_msg', {
    group_id: ctx.group_id,
    message: HELP_MESSAGE
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
    message: `[CQ:at,qq=${ctx.user_id}]您的权限不足。`
  })
}

const debug = async (ctx) => {
  switch (ctx.ctxmsg[0]) {
    case 'TESTMSG':
      ctx.bot('send_group_msg', {
        group_id: ctx.group_id,
        message: `[CQ:at,qq=${ctx.user_id}]TESTMSG`
      })
      break
    default:
      break
  }
}

module.exports = { member, status, help, refresh, ban, debug }
