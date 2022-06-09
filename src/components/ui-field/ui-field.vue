<template>
  <div :class="fieldClass">
    <label
      ref="label"
      class="ui-field__label"
      :for="id"
      v-if="label && type != 'checkbox' && type !== 'button'"
      v-html="label"
    />
    <div class="ui-field-outergroup">
      <ui-badge
        ref="badge"
        :key="badgeKey"
        v-model="localBadge"
        v-if="localBadge && localErrors !== 'inline'"
        @click="handleBadge"
      />
      <component
        ref="field"
        :is="dependencies[type]"
        :name="name"
        :id="id"
        :form="localForm"
        :disabled="localDisabled"
        :maxlength="localMaxlength"
        :label="label"
        v-bind="$attrs"
        v-model="localValue"
        v-if="name"
        @input="handleInput"
        @check="handleCheck"
        @query="handleQuery"
        @icon="handleIconClick"
        @click="handleClick"
        @enter="handleEnter"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <ui-message
        ref="badge"
        :key="badgeKey"
        v-model="localBadge"
        v-if="localBadge && localErrors === 'inline'"
      />
    </div>
  </div>
</template>

<script>
import UiBadge from '../ui-badge/ui-badge.vue'
import UiMessage from '../ui-message/ui-message.vue'
import UiFieldAutosuggest from './ui-field-autosuggest.vue'
import UiFieldButton from './ui-field-button.vue'
import UiFieldCheckbox from './ui-field-checkbox.vue'
import UiFieldColor from './ui-field-color.vue'
import UiFieldCreditCardNumber from './ui-field-credit-card-number.vue'
import UiFieldCreditCardExpiry from './ui-field-credit-card-expiry.vue'
import UiFieldCreditCardCvv from './ui-field-credit-card-cvv.vue'
import UiFieldDate from './ui-field-date.vue'
import UiFieldDaterange from './ui-field-daterange.vue'
import UiFieldNumber from './ui-field-number.vue'
import UiFieldMultiselect from './ui-field-multiselect.vue'
import UiFieldPhone from './ui-field-phone.vue'
import UiFieldPassword from './ui-field-password.vue'
import UiFieldRadio from './ui-field-radio.vue'
import UiFieldSelect from './ui-field-select.vue'
import UiFieldSlider from './ui-field-slider.vue'
import UiFieldTags from './ui-field-tags.vue'
import UiFieldText from './ui-field-text.vue'
import UiFieldTextarea from './ui-field-textarea.vue'
import UiFieldTime from './ui-field-time.vue'

export default {
  name: 'ui-field',
  inheritAttrs: false,
  props: {
    badge: Object,
    id: String,
    label: String,
    name: { type: String, required: true },
    type: { type: String, required: true },
    value: [ String, Number, Array, Object ],
    maxlength: [ String, Number ],
    messages: Object,
    disabled: [String, Boolean],
  },
  components: {
    UiBadge,
    UiMessage,
  },
  data: function() {
    return {
      alertTimer: null,
      badgeKey: 0, // allows alert badge to reanimate
      dependencies: {
        autosuggest: UiFieldAutosuggest,
        button: UiFieldButton,
        checkbox: UiFieldCheckbox,
        color: UiFieldColor,
        creditcardnumber: UiFieldCreditCardNumber,
        creditcardexpiry: UiFieldCreditCardExpiry,
        creditcardcvv: UiFieldCreditCardCvv,
        date: UiFieldDate,
        daterange: UiFieldDaterange,
        number: UiFieldNumber,
        multiselect: UiFieldMultiselect,
        phone: UiFieldPhone,
        password: UiFieldPassword,
        radio: UiFieldRadio,
        select: UiFieldSelect,
        slider: UiFieldSlider,
        tags: UiFieldTags,
        text: UiFieldText,
        textarea: UiFieldTextarea,
        time: UiFieldTime,
      },
      localBadge: this.badge,
      localForm: this.getFormComponent(this),
      localValue: this.value,
      localMessages: this.messages || {},
      localDisabled: (this.disabled === 'true' || this.disabled === true),
      localMaxlength: this.maxlength || 64,
      localErrors: 'badge',
      defaultDisabled: (this.disabled === 'true' || this.disabled === true),
    }
  },
  watch: {
    value: function (newValue) {
      this.localValue = newValue
    },
    badge: function (newValue) {
      this.localBadge = newValue
    },
    disabled: function (newValue) {
      if (newValue === 'true' || newValue === true) {
        this.localDisabled = true
      } else {
        this.localDisabled = false
      }
    },
    maxlength: function (newValue) {
      this.localMaxlength = newValue || 64
    }
  },
  computed: {
    fieldClass: function () {
      let output = 'ui-field'
      if (this.type) { output += ' --' + this.type }
      return output
    }
  },
  methods: {
    handleInput: function (newValue) {
      this.localBadge = null

      if (this.localForm && this.localForm.submitComponent) {
        this.localForm.submitComponent.localBadge = null
      }
      
      this.$emit('update:value', newValue)
      this.$emit('input', newValue)
    },
    handleCheck: function (newValue) {
      this.$emit('update:checked', newValue)
      this.$emit('input', newValue)
    },
    handleQuery: function (newValue) {
      this.$emit('query', newValue)
    },
    handleIconClick: function (e, newValue) {
      this.$emit('icon', e, newValue)
    },
    handleClick: function (e, ref) {
      this.$emit('click', e, ref)
    },
    handleEnter: function (e, newValue) {
      this.$emit('enter', e, newValue)
    },
    handleBadge: function (e) {
      if (this.localForm && this.localForm.dialog) {
        this.showDialog()
      } else {
        this.$emit('alert', e, this.localBadge)
      }
    },
    handleFocus: function (e) {
      this.$emit('focus', e)
    },
    handleBlur: function (e) {
      this.$emit('blur', e)
    },
    getFormComponent: function (component) {
      if (component.$parent) {
        if (component.$parent.$options._componentTag === 'ui-form') {
          return component.$parent
        } else {
          return this.getFormComponent(component.$parent)
        }
      }
    },
    showDialog: function () {
      let dialog = this.localBadge

      if (dialog.type === 'wait') { return }
      if (!dialog.confirm) {
        dialog.confirm = {
          label: 'Ok',
          func: this.localForm.hideDialog
        }
      }

      this.localForm.dialogEnabled = true
      this.localForm.dialog = dialog
    },
    focus: function (select) {
      if (this.$refs.field) {
        let input = this.$refs.field.$refs.input

        if (this.type === 'daterange') {
          input = this.$refs.field.$refs.from
        }

        input.focus()
        
        if (select) {
          this.$nextTick(() => {
            input.select()
          })
        }
      }
    },
    blur: function () {
      if (this.$refs.field) {
        let input = this.$refs.field.$refs.input

        if (this.type === 'daterange') {
          input = this.$refs.field.$refs.from
        }

        input.blur()
      }
    },
  }
}
</script>

<style>
.ui-field {
  margin-bottom: 2rem;
}

.ui-field.--submit,
.ui-field.--checkbox,
.ui-field.--radio {
  display: table;
}

.ui-field-outergroup {
  position: relative;
}

.ui-field__label {
  font-size: 1.4rem;
  margin-bottom: 0.5rem;
  display: table;
  color: var(--color-label);
}
</style>