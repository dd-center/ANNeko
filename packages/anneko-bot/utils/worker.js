const toArray = (str) => {
  if (str === '') return []
  const arr = []
  const data = str.split(',')
  for (const item of data) {
    const d = Number(item)
    if (!isNaN(d)) arr.push(Number(d))
  }
  return arr
}

const toString = (array) => {
  let str = ''
  for (const item of array) str += item + ','
  str = str.substring(0, str.length - 1)
  return str
}

module.exports = { toArray, toString }
