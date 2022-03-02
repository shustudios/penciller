export default {
  data: function() {
    return {
      valid: true,
      focused: false,
      open: false,
    }
  },
  computed: {
    localValue: {
      get: function () {
        return this.value
      },
      set: function (newValue) {
        this.$emit('input', newValue)
        return newValue
      }
    },
    localDisabled: {
      get: function () {
        return this.isTrue(this.disabled)
      },
      set: function (newValue) {
        return newValue
      }
    },
    localContainer: function () {
      let output = null

      if (this.container) {
        output = this.container
      }

      return output
    },
    tabindex: function () {
      let output = -1

      if (!this.localDisabled) {
        if (this.$attrs.tabindex) {
          output = this.$attrs.tabindex
        } else {
          output = 0
        }
      }
      
      return output
    },
    bodyClass: function () {
      let output = 'ui-field-body'

      if (this.localDisabled) { output += ' --disabled' }
      if (this.localChecked) { output += ' --checked' }
      if (this.open) { output += ' --open' }
      if (this.focused) { output += ' --focused' }
      if (this.valid === false) { output += ' --invalid' }

      return output
    },
  },
  methods: {
    maskValue: function(str, format, sel) {
      let val = str
      let pos = sel

      if (!this.isUndefined(str)) {
        switch (format) {
          case 'machine':
            val = val.replace(/ /g,'-')
            val = val.replace(/[^a-zA-Z0-9-]/g, '')
            break

          case 'number':
            val = false

            if (str.length === 0 || str === '-' || str === '.' ||  !isNaN(str)) {
              val = str
            }
            break

          case 'hex':
            val = str.substring(1)
            break

          case 'date':
            if (str.substr(4, 1) !== '-') {
              if (val.length > 4 && val.length <= 10) {
                if (sel === str.length && sel < 6) { pos++ }
                val = str.slice(0, 4) + '-' + str.slice(4)
              }
            }
    
            if (val.substr(7, 1) !== '-') {
              if (val.length > 7 && val.length <= 10) {
                if (sel === (str.length+1) && sel < 9) { pos++ }
                val = val.slice(0, 7) + '-' + val.slice(7)
              }
            }
            break

          case 'phone':
            if (str.substr(3, 1) !== '-') {
              if (val.length > 3 && val.length <= 11) {
                if (sel === str.length && sel < 5) { pos++ }
                val = str.slice(0, 3) + '-' + str.slice(3)
              }
            }
    
            if (val.substr(7, 1) !== '-') {
              if (val.length > 7 && val.length <= 11) {
                if (sel == (str.length+1) && sel < 10) { pos++ }
                val = val.slice(0, 7) + '-' + val.slice(7)
              }
            }
            break

          case 'cc_expiry':
            val = val.replace(/\D/g, '')
            val = val.replace(/(\d{2})/, '$1/')
            break
        }
      }

      return { val, pos }
    },
    unmaskValue: function(str, format) {
      let output = str

      if (!this.isUndefined(str)) {
        switch (format) {
          case 'phone':
          case 'date':
            output = str.replace(/-/g, '')
            break

          case 'hex':
            output = '#' + str
            break
        }
      }
      
      return output
    },
    isValidFormat: function(str, format) {
      let output = false
      let regex

      switch (format) {
        case 'phone':
          regex = new RegExp(/^[0-9-]+$/g)

          if (regex.test(str) && str.length < 11) {
            output = true
          }
          break

        case 'date':
          regex = new RegExp(/^[0-9-]+$/g)

          if (regex.test(str) && str.length < 9) {
            output = true
          }
          break

        case 'hex':
          regex = new RegExp(/^#[0-9A-F]+$/gi)

          if (regex.test(str) && str.length < 8) {
            output = true
          }
          break

        case 'time':
          regex = new RegExp(/^[0-9]+$/g)

          if (str === '' || (regex.test(str) && str.length < 3)) {
            output = true
          }
          break
      }

      return output
    },
    isTrue: function (val) {
      let output = false

      if (val === 'true' || val === true) {
        output = true
      }

      return output
    },
    isUndefined: function (val) {
      let output = false

      if (typeof val === 'undefined' || typeof val === undefined || val === null) {
        output = true
      }

      return output
    },
    extend: function (orig_obj, new_obj, add) {
      if (new_obj) {
        Object.keys(new_obj).forEach(key => {
          if (orig_obj.hasOwnProperty(key) || add === true) {
            orig_obj[key] = new_obj[key];
          }
        });
      }

      return orig_obj;
    },
    showBalloon: function () {
      this.open = true
    },
    hideBalloon: function () {
      this.open = false
    },
    handleIcon: function (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      this.toggleBalloon()
    },
    handleCloseBalloon: function () {
      this.hideBalloon()
    },
    handleDownKey: function (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      this.nextOption()
    },
    handleUpKey: function (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      this.prevOption()
    },
    handleEscapeKey: function () {
      this.hideBalloon()
    },
    handleFocus: function () {
      this.focused = true
    },
    handleBlur: function () {
      this.focused = false
    },
    handleBodyClick: function () {
      this.hideBalloon()
    }
  },
  mounted: function() {
    if (this.form) { this.form.register(this) }

    if (this.$refs.input) {
      if (this.isTrue(this.focus) || this.isTrue(this.select)) {
        this.$refs.input.focus()
  
        if (this.select) {
          this.$refs.input.select()
        }
          
        this.handleFocus()
      }
      
      this.$refs.input.addEventListener('focus', this.handleFocus)
      this.$refs.input.addEventListener('blur', this.handleBlur)
    }

    if (typeof document === 'object') {
      document.addEventListener('click', this.handleBodyClick)
    }

    if (this.afterMount) {
      this.afterMount()
    }
  },
  beforeDestroy: function () {
    if (this.form) { this.form.unRegister(this) }

    if (this.$refs.input) {
      this.$refs.input.removeEventListener('focus', this.handleFocus)
      this.$refs.input.removeEventListener('blur', this.handleBlur)
    }

    if (typeof document === 'object') {
      document.removeEventListener('click', this.handleBodyClick)
    }

    if (this.afterDestroy) {
      this.afterDestroy()
    }
  }
}