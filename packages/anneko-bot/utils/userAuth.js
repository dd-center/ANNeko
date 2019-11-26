const refreshAuth = async (ctx) => {
  if (!global.anneko.authdb) return
  const uList = ctx.db.userdb.find({}).toArray()
  global.anneko.authdb = {}
  global.anneko.uList = uList
  for (const item of uList) {
    global.anneko.authdb[Number(item._id)] = Number(item.stat)
  }
  return global.anneko.authdb
}

module.exports = { refreshAuth }
