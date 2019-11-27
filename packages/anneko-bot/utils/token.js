const getNew = async (ctx) => {
  const current = Number(
    (
      await ctx.db.statdb
        .find({
          _id: 'projCount'
        })
        .toArray()
    )[0].data
  )
  await ctx.db.statdb.updateOne(
    { _id: 'projCount' },
    { $set: { data: Number(current + 1) } }
  )
  return Number(Number(current) + 1)
}

const getCurrent = async (ctx) => {
  return {
    projCount: Number(
      (
        await ctx.db.statdb
          .find({
            _id: 'projCount'
          })
          .toArray()
      )[0].data
    ),
    processingCount: Number(
      (await ctx.db.projdb.find({ stat: 1 }).toArray()).length
    )
  }
}

module.exports = { getNew, getCurrent }
