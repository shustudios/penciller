class Penciller {
  constructor () {
    
  }

  clone(obj) {
    let output = obj

    if (typeof obj === 'object' && obj !== null) {
      output = JSON.parse(JSON.stringify(obj))
    }

    return output
  }
}

export default Penciller;