<template>
  <form
    ref="form"
    @submit="handleSubmit"
    class="ui-form"
    novalidate
  >
    <slot />
    <ui-dialog
      :enabled="dialogEnabled"
      :message="dialog.message"
      :confirm="dialog.confirm"
      :cancel="dialog.cancel"
    />
  </form>
</template>

<script>
import UiDialog from '../ui-dialog/ui-dialog.vue';

export default {
  name: 'ui-form',
  props: {
    debug: Boolean,
    disabled: [String, Boolean],
    errors: String,
  },
  emits: ['init', 'submit', 'update'],
  components: {
    UiDialog,
  },
  data() {
    return {
      registry: {},
      dialogEnabled: false,
      dialog: {
        message: null,
        confirm: null,
        cancel: null,
      },
      submitComponent: null,
      alerts: 0,
      validator: this.$penciller.validator,
      formObj: false,
      autoUpdate: true,
    }
  },
  watch: {
    disabled (newValue) {
      if (newValue === true || newValue === 'true') {
        this.disable()
      } else {
        this.enable()
      }
    }
  },
  methods: {
    register (component) {
      let name = component.$props.name

      component.$parent.localErrors = this.errors

      if (component.value) {
        component.defaultValue = JSON.parse(JSON.stringify(component.value))
      }

      if (component.checked) {
        component.defaultChecked = component.checked
      }

      if (this.getTag(component) === 'ui-submit') {
        name = 'submit'
        this.submitComponent = component
      }

      if (this.disabled === true || this.disabled === 'true') {
        if (this.getTag(component) === 'ui-submit') {
          component.localDisabled = true
        } else {
          component.$parent.localDisabled = true
        }
      }

      if (component.$parent.localBadge) {
        component.$props.badge = component.$parent.localBadge
      }

      this.registry[name] = component
    },
    unRegister (component) {
      let name = component.$props.name

      if (this.registry[name]) {
        delete this.registry[name]
      }
    },
    update () {
      if (this.autoUpdate) {
        this.$nextTick(() => {
          this.$emit('update', this.toFormObject(this.getFieldsFromRegistry()))
        })
      }

      this.autoUpdate = true
    },
    getTag (component) {
      let output = null

      if (component.$options.name) {
        output = component.$options.name
      } else if (component.$options._componentTag) {
        output = component.$options._componentTag
      }

      return output
    },
    handleSubmit (e) {
      e.preventDefault()
      this._submit(e)
    },
    triggerSubmit () {
      this.autoUpdate = false
      this._submit()
    },
    _submit (e) {
      this.alerts = 0

      let output = false
      let fields = this.getFieldsFromRegistry(true)

      if (this.alerts === 0) {
        output = this.toFormObject(fields)
      } else {
        if (this.submitComponent) {
          if (this.submitComponent.localNoisy === true) {
            this.submitComponent.badgeKey++
            this.submitComponent.localBadge = this.validator.conclude(this.alerts)
          } else {
            this.submitComponent.localBadge = null
          }
        }
      }
      
      this.$emit('submit', output, e)
    },
    toFormObject (fields) {
      let output = {
        fields: fields,
        values: this.values(fields),
        startProcessing: this.startProcessing,
        endProcessing: this.endProcessing,
        enable: this.enable,
        disable: this.disable,
        reset: this.reset,
        complete: this.complete,
        showDialog: this.showDialog,
        hideDialog: this.hideDialog,
        submit: this.submitComponent,
        clearAlerts: this.clearAlerts,
        refresh: this.refresh,
      }

      return output
    },
    getFieldsFromRegistry (includeAlerts) {
      let output = {}

      for (let i in this.registry) {
        let fieldComponent = this.registry[i]

        fieldComponent.$parent.localBadge = fieldComponent.$parent.badge
        fieldComponent.$parent.badgeKey++

        if (includeAlerts && fieldComponent.rules) {
          for (let r=0; r<fieldComponent.rules.length; r++) {
            let rule = fieldComponent.rules[r]
            let message = this.validator.check(rule, fieldComponent)

            if (message !== null) {
              fieldComponent.$parent.localBadge = {
                type: 'error',
                message,
              }

              if (this.debug) {
                console.log('error from:', fieldComponent)
              }
              
              this.alerts++
              break
            }
          }
        }

        output[i] = {
          label: fieldComponent.$parent.label || fieldComponent.label,
          name: fieldComponent.name,
          type: fieldComponent.$parent.type,
          value: fieldComponent.localValue,
          rules: fieldComponent.rules,
        }
      }

      return output
    },
    validate () {
      let output = true

      for (let i in this.registry) {
        let fieldComponent = this.registry[i]

        fieldComponent.$parent.localBadge = null
        fieldComponent.$parent.badgeKey++

        if (fieldComponent.rules) {
          for (let r=0; r<fieldComponent.rules.length; r++) {
            let rule = fieldComponent.rules[r]
            let message = this.validator.check(rule, fieldComponent)

            if (message !== null) {
              fieldComponent.$parent.localBadge = {
                type: 'error',
                message,
              }
              
              output = false
              break
            }
          }

        }
      }

      return output
    },
    values (fields) {
      let output = {}

      for (let key in fields) {
        if (fields[key].type) {
          output[key] = fields[key].value
        }
      }

      return output
    },
    setValidationMessage (rule, message) {
      this.validator.messages[rule] = message
    },
    startProcessing () {
      this.disable()

      if (this.submitComponent) {
        this.submitComponent.localBadge = { type: 'wait' }
      }
    },
    endProcessing () {
      this.enable()

      if (this.submitComponent) {
        this.submitComponent.localBadge = false
      }
    },
    enable () {
      for (let i in this.registry) {
        this.registry[i].$parent.localDisabled = null
      }

      if (this.submitComponent) {
        this.submitComponent.localDisabled = null
      }
    },
    disable () {
      for (let i in this.registry) {
        this.registry[i].$parent.localDisabled = true
      }
      
      if (this.submitComponent) {
        this.submitComponent.localDisabled = true
      }
    },
    reset () {
      for (let i in this.registry) {
        let field = this.registry[i]

        if (field.defaultValue) {
          field.localValue = field.defaultValue
        } else {
          field.localValue = null
        }

        if (field.defaultChecked) {
          field.localChecked = field.defaultChecked
        } else {
          field.localChecked = null
        }
      }
    },
    clearAlerts () {
      for (let i in this.registry) {
        this.registry[i].$parent.localBadge = null
      }
    },
    complete (reset) {
      this.endProcessing()
      this.hideDialog()

      if (reset === true) { this.reset() }
    },
    showDialog (dialog) {
      this.dialog = dialog
      this.dialogEnabled = true
    },
    hideDialog () {
      this.dialogEnabled = false
    },
    refresh () {
      this.formObj = this.toFormObject(this.getFieldsFromRegistry())
      this.$emit('init', this.formObj)
    }
  },
  mounted: function () {
    this.formObj = this.toFormObject(this.getFieldsFromRegistry())
    this.$emit('init', this.formObj)
  }
}
</script>

<style>
.ui-form .ui-dialog .ui-code {
  display: inline-block;
  padding: 0 1rem;
  border-radius: 3px;
  font-style: normal;
  font-size: 1.3rem;
  letter-spacing: 0.05rem;
  background-color: var(--color-text-secondary);
  color: var(--color-text-inverted)
}
</style>
