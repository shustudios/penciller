<template>
  <form ref="form" @submit="handleSubmit" class="ui-form" novalidate>
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
    disabled: [String, Boolean],
    errors: String,
  },
  components: {
    UiDialog,
  },
  data: function() {
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
      validator: this.$validator,
    }
  },
  watch: {
    disabled: function (newValue) {
      if (newValue === true || newValue === 'true') {
        this.disable()
      } else {
        this.enable()
      }
    }
  },
  methods: {
    register: function (component) {
      let name = component.$props.name

      component.$parent.localErrors = this.errors

      if (component.value) {
        component.defaultValue = JSON.parse(JSON.stringify(component.value))
      }

      if (component.checked) {
        component.defaultChecked = component.checked
      }

      if (component.$options._componentTag === 'ui-submit') {
        name = 'submit'
        this.submitComponent = component
      }

      if (this.disabled === true || this.disabled === 'true') {
        if (component.$options._componentTag === 'ui-submit') {
          component.localDisabled = true
        } else {
          component.$parent.localDisabled = true
        }
      }
      
      this.registry[name] = component
    },
    unRegister: function (component) {
      let name = component.$props.name

      if (this.registry[name]) {
        delete this.registry[name]
      }
    },
    handleSubmit: function (e) {
      e.preventDefault()
      this._submit(e)
    },
    triggerSubmit: function () {
      this._submit()
    },
    _submit: function (e) {
      this.alerts = 0

      let output = false
      let fields = this.getFieldsFromRegistry()
      
      if (this.alerts === 0) {
        output = {
          fields: fields,
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
        }
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

      this.$emit('submit', output, e);
    },

    getFieldsFromRegistry: function () {
      let output = {}

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
              
              this.alerts++
              break
            }
          }
        }

        output[i] = {
          name: fieldComponent.name,
          type: fieldComponent.$parent.type,
          value: fieldComponent.localValue,
          rules: fieldComponent.rules,
        }
      }

      return output
    },

    validate: function () {
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

    setValidationMessage: function (rule, message) {
      this.validator.messages[rule] = message
    },

    startProcessing: function () {
      this.disable()

      if (this.submitComponent) {
        this.submitComponent.localBadge = { type: 'wait' }
      }
    },

    endProcessing: function () {
      this.enable()

      if (this.submitComponent) {
        this.submitComponent.localBadge = false
      }
    },

    enable: function () {
      for (let i in this.registry) {
        this.registry[i].$parent.localDisabled = null
      }

      if (this.submitComponent) {
        this.submitComponent.localDisabled = null
      }
    },

    disable: function () {
      for (let i in this.registry) {
        this.registry[i].$parent.localDisabled = true
      }
      
      if (this.submitComponent) {
        this.submitComponent.localDisabled = true
      }
    },

    reset: function () {
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

    clearAlerts: function () {
      for (let i in this.registry) {
        this.registry[i].$parent.localBadge = null
      }
    },

    complete: function(reset) {
      this.endProcessing()
      this.hideDialog()

      if (reset === true) { this.reset() }
    },

    showDialog: function(dialog) {
      this.dialog = dialog
      this.dialogEnabled = true
    },

    hideDialog: function() {
      this.dialogEnabled = false
    },
  },
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
