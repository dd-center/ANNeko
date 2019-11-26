const MongoClient = require('mongodb').MongoClient

const client = new MongoClient(
  `mongodb://admin:${process.env.MONGODB_PASS}@${process.env.MONGODB_IP}:27017/admin?authMechanism=DEFAULT`,
  { useNewUrlParser: true, useUnifiedTopology: true }
)

const connect = client.connect().catch((err) => {
  console.log('ERR when connect to Database')
  console.log(err)
  process.exit(1)
})

const statdbP = connect.then(() => client.db('anneko').collection('stat'))
const userdbP = connect.then(() => client.db('anneko').collection('user'))
const trprojdbP = connect.then(() => client.db('anneko').collection('trproj'))
const otherprojdbP = connect.then(() =>
  client.db('anneko').collection('otherproj')
)

// userdbP.createIndex(
//   {
//     uname: -1
//   },
//   (e, s) => {}
// )

// module.exports = { statdbP, userdbP, trprojdbP, otherprojdbP }

module.exports = async () => {
  return {
    statdb: await statdbP,
    userdb: await userdbP,
    trprojdb: await trprojdbP,
    otherprojdb: await otherprojdbP
  }
}
