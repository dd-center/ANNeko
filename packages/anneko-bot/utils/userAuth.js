const refreshAuth = async (ctx) => {
  if (!global.anneko.authdb) return
  const uList = await ctx.db.userdb.find({}).toArray()
  global.anneko.authdb = {}
  global.anneko.uList = uList
  if (uList.length && uList.length !== 0)
    for (const item of uList) {
      global.anneko.authdb[Number(item._id)] = item.stat ? Number(item.stat) : 0
    }
  return global.anneko.authdb
}

const getUserName = (id) => {
  if (!global.anneko.uList) return ''
  return (
    global.anneko.uList.find((i) => Number(i._id) === Number(id)).displayName ||
    ''
  )
}

module.exports = { refreshAuth, getUserName }
