import Fuse from 'fuse.js'

class Utils {
  constructor () {
    this.fuse = Fuse
  }

  clone(obj) {
    let output = obj

    if (typeof obj === 'object' && obj !== null) {
      output = JSON.parse(JSON.stringify(obj))
    }

    return output
  }

  isTrue (val) {
    let output = false

    if (val === 'true' || val === true) {
      output = true
    }

    return output
  }

  isUndefined (val) {
    let output = false

    if (typeof val === 'undefined' || typeof val === undefined || val === null) {
      output = true
    }

    return output
  }

  parseBracketSyntax (str) {
    let output = str
    let regex = new RegExp(/\]/g)

    if (regex.test(str)) {
      output = str.replace(regex, '').split('[')
    }

    return output
  }

  addToObject (str, val, obj) {
    let path = this.parseBracketSyntax(str)

    if (Array.isArray(path)) {
      let cur = obj

      path.forEach((key, idx) => {
        if (key === '') {
          if (cur.__has_fields) {
            key = Object.keys(cur).length-1
          } else {
            key = Object.keys(cur).length
          }
        }

        if (!cur[key]) {
          if (idx < path.length-1) {
            cur[key] = { __has_fields: true }
          } else {
            cur[key] = val
          }
        }

        cur = cur[key]
      })
    } else {
      obj[path] = val
    }
  }
}

export default Utils;