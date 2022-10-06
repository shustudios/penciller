import Validator from './validator.js'
import Utils from './utils.js'

class Penciller {
  constructor (prefix) {
    this.validator = new Validator()
    this.utils = new Utils()
    this.prefix = prefix || 'Ui'
  }
}

export default Penciller;