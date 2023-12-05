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
}

export default Utils;