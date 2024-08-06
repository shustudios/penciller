class Validator {
  constructor () {
    this.result = {}
    this.dateformat = 'YYYY-MM-DD'
    this.messages = {
      creditexpiry: 'The date provided in this %label% field is not valid.',
      creditnumber: 'The credit card number provided in this %label% field is not valid.',
      creditcode: 'Please provide a valid security code in this %label% field, found on the back of your card.',
      dateformat: 'The date provided in this %label% field is not valid.',
      dateformats: 'The \'%dir%\' date provided in this %label% field is not valid.',
      dateorder: 'The \'To\' date cannot be after the \'From\' date in this %label% field.',
      daterange: 'The date provided in this %label% field is not within the specified range.',
      dateranges: 'The \'%dir%\' date provided in this %label% field is not within the specified range.',
      email: 'This %label% field requires a properly formatted email address.',
      min: 'The minimum value allowed is %min%.',
      max:  'The maximum value allowed is %max%.',
      password: 'This %label% field requires at least:<br>(8 characters, 1 lowercase, 1 uppercase).',
      phone: 'This %label% is in an incorrect format.',
      range: 'The provided value is outside of the specified (%min% - %max%) range.',
      required: 'Please complete this %label% field - it is required.',
      time: 'The time provided in this %label% field is not valid.',
      unique: 'Value for this %label% field needs to be unique.',
      machine: 'Value for this %label% can only contain alphanumeric characters and dashes.',
    }
  }

  check(rule, field) {
    this.result = {
      type: 'error',
      message: 'Unknown validation error.',
    }

    if (this[rule]) {
      return this[rule](field)
    } else {
      return rule.call(null, field.localValue)
    }
  }

  handleMessage (type, field) {
    if (field.$parent.localMessages[type]) {
      return field.$parent.localMessages[type]
    } else {
      return this.messages[type]
    }
  }

  creditcode(field) {
    if (this.isEmpty(field.localValue)) {
      return this.handleMessage('creditcode', field).replace('%label%', this.getLabel(field))
    } else {
      return null
    }
  }

  creditexpiry(field) {
    if (!this.isEmpty(field.localValue)) {
      let parts = field.localValue.split('/')

      if (parts[0] > 12 || parts[0] < 1) {
        return this.handleMessage('creditexpiry', field).replace('%label%', this.getLabel(field))
      } else {
        return null
      }
    }
  }

  creditnumber(field) {
    if (!this.isEmpty(field.localValue)) {
      if (!this.isValidCard(field.localValue)) {
        return this.handleMessage('creditnumber', field).replace('%label%', this.getLabel(field))
      } else {
        return null
      }
    }
  }

  date(field) {
    let inrange = true
    let val = new Date(field.localValue + ' 00:00:00').getTime()

    if (field.min) {
      let min = new Date(field.min + ' 00:00:00').getTime()
      if (val < min) {
        inrange = false
      }
    }

    if (field.max) {
      let max = new Date(field.max + ' 00:00:00').getTime()
      if (val > max) {
        inrange = false
      }
    }

    if (!this.isValidDate(field.localValue)) {
      let msg = this.handleMessage('dateformat', field)
      return msg.replace('%label%', this.getLabel(field))
    }

    if (!inrange) {
      let msg = this.handleMessage('daterange', field)
      return msg.replace('%label%', this.getLabel(field))
    }

    return null
  }
  
  daterange(field) {
    let outrange = ''
    let invalid = ''
    let val = {
      from: new Date(field.localValue.from + ' 00:00:00').getTime(),
      to:new Date(field.localValue.to + ' 00:00:00').getTime(),
    }

    if (field.min) {
      let min = new Date(field.min + ' 00:00:00').getTime()
      if (val.from < min) {
        outrange = 'from'
      }
    }

    if (field.max) {
      let max = new Date(field.max + ' 00:00:00').getTime()
      if (val.to > max) {
        outrange = 'to'
      }
    }

    if (field.focused === 'from') {
      if (!this.isValidDate(field.localValue.from)) { invalid = 'from' }
    }
    
    if (field.focused === 'to') {
      if (!this.isValidDate(field.localValue.to)) { invalid = 'to' }
    }

    if (val.from && val.to) {
      if (val.from > val.to) {
        return this.handleMessage('dateorder', field).replace('%label%', this.getLabel(field))
      }
    }

    if (invalid !== '') {
      let msg = this.handleMessage('dateformats', field)
      msg = msg.replace('%label%', this.getLabel(field))
      return msg.replace('%dir%', invalid)
    }

    if (outrange !== '') {
      let msg = this.handleMessage('dateranges', field)
      msg = msg.replace('%label%', this.getLabel(field))
      return msg.replace('%dir%', outrange)
    }

    return null
  }

  email(field) {
    if (!this.isEmpty(field.localValue)) {
      // eslint-disable-next-line
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!re.test(field.localValue)) {
        return this.handleMessage('email', field).replace('%label%', this.capitalize(this.getLabel(field)))
      }
    }

    return null
  }

  machine(field) {
    if (!this.isEmpty(field.localValue)) {
      var regexp = /^[a-zA-Z0-9-]+$/

      if (field.localValue.search(regexp) === -1) {
        return this.handleMessage('machine', field).replace('%label%', this.getLabel(field))
      } else {
        return null
      }
    }
  }

  number(field) {
    let min = Number(field.localMin)
    let max = Number(field.localMax)
    let val = Number(field.fieldValue)

    if (min && max) {
      if (val < min || val > max) {
        let msg = this.handleMessage('range', field).replace('%min%', min)
        return msg.replace('%max%', max)
      }
    } else if (min) {
      if (val < min) {
        return this.handleMessage('min', field).replace('%min%', min)
      }
    } else if (max) {
      if (val > max) {
        return this.handleMessage('max', field).replace('%max%', max)
      }
    }

    return null
  }

  password(field) {
    /**
     * min 8 characters
     * min 1 lowercase
     * min 1 uppercase
     */
    let regex = new RegExp("^(?=.{8,})(?=.*[a-z])(?=.*[A-Z])")

    if (!regex.test(field.fieldValue)) {
      return this.handleMessage('password', field).replace('%label%', this.capitalize(this.getLabel(field)))
    }

    return null
  }

  phone(field) {
    let regex = new RegExp(/^[0-9-]+$/g)

    if (!regex.test(field.fieldValue)) {
      return this.handleMessage('phone', field).replace('%label%', this.capitalize(this.getLabel(field)))
    }

    return null
  }

  required(field) {
    if (field.$parent.type === 'checkbox') {
      if (field.localChecked === true) {
        return null
      } else {
        return this.handleMessage('required', field).replace('%label%', this.getLabel(field))
      }
    } else {
      if (this.isEmpty(field.fieldValue)) {
        return this.handleMessage('required', field).replace('%label%', this.getLabel(field))
      }
  
      return null
    }
  }

  time(field) {
    if (this.isEmpty(field.localValue)) { return null }

    let parts = field.localValue.time.split(':')
    let hours = parts[0]
    let mins = parts[1]
    let daytime = field.localValue.daytime
    let valid = true

    if (hours > 23) { valid = false }
    if (mins > 59) { valid = false }
    if (hours === '' || mins === '') { valid = false }

    if (daytime === 'am') {
      if (hours < 1) { valid = false }
    }
    
    if (valid) {
      return null
    } else {
      return this.handleMessage('time', field).replace('%label%', this.capitalize(this.getLabel(field)))
    }
  }

  unique(field) {
    if (!this.isEmpty(field.localValue)) {
      let registry = field.form.$data.registry

      for (let key in registry) {
        let item = registry[key]

        if (item.name !== field.name && item.localValue === field.localValue) {
          return this.handleMessage('unique', field).replace('%label%', this.getLabel(field))
        }
      }

      return null
    }
  }

  isEmpty(val) {
    let output = false

    if (typeof val === 'undefined' || typeof val === undefined || val === null) {
      output = true
    } else if (Array.isArray(val)) {
      if (val.length === 0) {
        output = true
      }
    } else if (typeof val === 'string' && val.replace(' ', '') === '') {
      output = true
    } else if (typeof val === 'object') {
      output = true

      for (let i in val) {
        if (!this.isEmpty(val[i])) {
          output = false
          break
        }
      }
    }
  
    return output
  }

  isValidDate(str) {
    if (str.length !== 10) {
      return false
    } else {
      let date = new Date(str)
      return date instanceof Date && !isNaN(date)
    }
  }

  isValidCard(val) { // luhn algorithm
    let input = val.replace(/\D/g, '')
    let isDouble = false
    let sum = 0

    for (let idx=input.length-1; idx >=0; idx--) {
      let digit = parseInt(input.charAt(idx))

      if (isDouble) {
        if ((digit *= 2) > 9) digit -= 9
      }

      sum += digit
      isDouble = !isDouble
    }

    return (sum % 10) == 0
  }

  getLabel(field) {
    let output = ''

    if (field.$parent.$attrs.placeholder) {
      output = field.$parent.$attrs.placeholder
    }

    if (!this.isEmpty(field.$parent.label)) {
      // parses HTML string
      let div = document.createElement( 'div' );
      div.innerHTML = `<div>${field.$parent.label}</div>`;
      
      // find label text
      let textlabel = div.getElementsByClassName( 'ui-textlabel' );

      if (textlabel.length > 0) {
        output = textlabel[0].innerHTML
      } else {
        output = field.$parent.label;
      }
    }

    return this.isEmpty(output)? '' : '<span class="ui-code">' + output + '</span>';
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  conclude(alertCount) {
    let n = (alertCount > 1) ? String(alertCount) + ' errors' : 'an error'
    
    return {
      type: 'error',
      message: `Found ${ n } in the form. Please correct and try again.`,
    }
  }
}

export default Validator;