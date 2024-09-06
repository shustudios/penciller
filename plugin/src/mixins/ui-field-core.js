export default {
  emits: [
    'input',
    'enter',
    'icon',
    'focus',
    'blur',
    'query',
    'check',
    'click',
    'start',
    'stop',
  ],
  data() {
    return {
      valid: true,
      focused: false,
      open: false,
      localChecked: false,
      defaultValue: this.fieldValue || null,
      digits: this.decimal ? this.decimal : 0,
    }
  },
  computed: {
    localValue: {
      get () {
        return this.fieldValue
      },
      set (newValue) {
        this.$emit('input', newValue)
        return newValue
      }
    },
    localDisabled: {
      get () {
        return this.$penciller.utils.isTrue(this.disabled)
      },
      set (newValue) {
        return newValue
      }
    },
    localContainer () {
      let output = null

      if (this.container) {
        output = this.container
      }

      return output
    },
    tabindex () {
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
    bodyClass () {
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
    getListener (name) {
      let output = false

      if (this.$parent.$listeners) {
        if (this.$parent.$listeners[name]) {
          output = this.$parent.$listeners[name]
        }
      } else if (this.$parent.$attrs[name]) {
        output = this.$parent.$attrs[name]
      }

      return output
    },
    preCharCount (str, searchStr, sel) {
      let arr = str.substring(0, sel).split(searchStr)
      return arr.length - 1
    },
    maskValue(str, format, sel) {
      let val = str
      let pos = sel
      let formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: this.digits })

      if (!this.$penciller.utils.isUndefined(str)) {
        switch (format) {
          case 'currency':
            if (val !== '') {
              let fval = formatter.format(val).replace('$', '')
              let offset = this.preCharCount(fval, ',', sel)

              pos = sel + offset
              val = fval

              if (fval.charAt(sel) === ',') { pos++ }
            }
            break
            
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
    unmaskValue(str, format) {
      let output = str

      if (!this.$penciller.utils.isUndefined(str)) {
        switch (format) {
          case 'phone':
          case 'date':
            output = str.replace(/\D/g, '')
            break

          case 'currency':
            output = str.replace(/,/g, '')
            break

          case 'hex':
            output = '#' + str
            break
        }
      }
      
      return output
    },
    isValidFormat(str, format) {
      let output = false
      let regex

      switch (format) {
        case 'machine':
          regex = new RegExp(/[^a-zA-Z0-9-]/g)

          if (regex.test(str)) {
            output = true
          }

          break

        case 'currency':
          regex = new RegExp(/^\d{1,3}(,\d{3})*(\.\d{2})?$/)
          
          if (regex.test(str)) {
            output = true
          }

          break

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
    extend (orig_obj, new_obj, add) {
      if (new_obj) {
        Object.keys(new_obj).forEach(key => {
          if (orig_obj.hasOwnProperty(key) || add === true) {
            orig_obj[key] = new_obj[key];
          }
        });
      }

      return orig_obj;
    },
    handleDownKey (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      this.nextOption()
    },
    handleUpKey (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      this.prevOption()
    },
    handleFocus (e) {
      this.focused = true
      this.handleLeaveField(e)
      this.$emit('focus', e)
    },
    handleBlur (e) {
      this.focused = false
      this.$emit('blur', e)
    },
    handleLeaveField (e) {
      if (window.penciller && window.penciller.events) {
        window.penciller.events.leaveField(e.target)
      }
    }
  },
  mounted() {
    if (this.form && this.$props.form) { this.form.register(this) }

    if (this.$refs.input) {
      if (this.$penciller.utils.isTrue(this.focus) || this.$penciller.utils.isTrue(this.select)) {
        this.$refs.input.focus()
  
        if (this.select) {
          this.$refs.input.select()
        }
          
        this.handleFocus()
      }
    }

    if (typeof document === 'object') {

      if (!window.penciller) { window.penciller = { events: {}} }
      if (!window.penciller.events.leaveField) {
        document.addEventListener('click', this.handleLeaveField)
        window.addEventListener('resize', this.handleLeaveField)
        window.penciller.events.leaveField = (source) => {
          document.dispatchEvent(new CustomEvent('leave-field', { detail: { source }}))
        }
      }

      if (this.handleCloseBalloon) {
        document.addEventListener('leave-field', (e) => {
          const getAncestor = (child, parent) => {
            let elm = child

            while (elm) {
              if (elm === parent) { return elm }
              elm = elm.parentElement
            }

            return null
          }

          if (getAncestor(e.detail.source, this.$el) !== this.$el) {
            // console.log('Close balloon for --> ', this.name)
            this.handleCloseBalloon()
          }
        })
      }
    }
  

    if (this.afterMount) {
      this.afterMount()
    }
  },
  beforeUnmount () {
    if (this.form) { this.form.unRegister(this) }

    if (typeof document === 'object') {
      if (this.handleCloseBalloon) {
        document.removeEventListener('click', this.handleLeaveField)
        window.removeEventListener('resize', this.handleLeaveField)
      }
    }

    if (this.afterDestroy) {
      this.afterDestroy()
    }
  },
  beforeDestroy () {
    if (this.form) { this.form.unRegister(this) }

    if (typeof document === 'object') {
      if (this.handleCloseBalloon) {
        document.removeEventListener('click', this.handleLeaveField)
        window.removeEventListener('resize', this.handleLeaveField)
      }
    }

    if (this.afterDestroy) {
      this.afterDestroy()
    }
  }
}