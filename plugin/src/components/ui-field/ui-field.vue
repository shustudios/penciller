<template>
  <div
    :class="fieldClass"
    :style="style"
  >
    <label
      ref="label"
      class="ui-field__label"
      :for="id"
      v-if="label && type != 'checkbox' && type !== 'button'"
      v-html="label"
    />
    <div
      class="ui-field-outergroup"
    >
      <ui-badge
        ref="badge"
        :key="badgeKey"
        :badge="localBadge"
        v-if="localBadge && localErrors !== 'inline'"
        @click="handleBadge"
      />
      <component
        ref="field"
        :is="dependency"
        :name="name"
        :id="id"
        :form="localForm"
        :disabled="localDisabled"
        :maxlength="localMaxlength"
        :label="label"
        :fieldValue="localValue"
        :options="localOptions"
        :checked="localChecked"
        v-bind="$attrs"
        v-if="name"
        @input="handleInput"
        @check="handleCheck"
        @query="handleQuery"
        @icon="handleIcon"
        @click="handleClick"
        @enter="handleEnter"
      />
      <ui-message
        ref="badge"
        :key="badgeKey"
        :value="localBadge"
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
import UiFieldDate from './ui-field-date.vue'
import UiFieldDaterange from './ui-field-daterange.vue'
import UiFieldEmail from './ui-field-email.vue'
import UiFieldMultiselect from './ui-field-multiselect.vue'
import UiFieldNumber from './ui-field-number.vue'
import UiFieldPassword from './ui-field-password.vue'
import UiFieldPhone from './ui-field-phone.vue'
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
  dependencies: null,
  emits: [
    'input',
    'check',
    'query',
    'icon',
    'click',
    'enter',
    'update:value',
    'update:checked',
  ],
  props: {
    badge: Object,
    id: String,
    label: String,
    name: { type: String, required: true },
    type: { type: String, required: true },
    value: [ String, Number, Array, Object ],
    options: [ Object, Array ],
    maxlength: [ String, Number ],
    messages: Object,
    disabled: [String, Boolean],
    checked: [String, Boolean],
    style: [String, Object],
  },
  components: {
    UiBadge,
    UiMessage,
  },
  data () {
    return {
      alertTimer: null,
      badgeKey: 0, // allows alert badge to reanimate
      localBadge: this.badge,
      localForm: this.getFormComponent(this),
      localValue: this.value,
      localOptions: this.options || [],
      localMessages: this.messages || {},
      localDisabled: (this.disabled === 'true' || this.disabled === true),
      localMaxlength: this.maxlength || 64,
      localErrors: 'badge',
      localChecked: this.checked,
    }
  },
  watch: {
    value (newValue) {
      this.localValue = newValue
    },
    localValue () {
      this.$nextTick(this.updateForm)
    },
    options (newValue) {
      this.localOptions = newValue
    },
    badge (newValue) {
      this.localBadge = newValue
    },
    disabled (newValue) {
      if (newValue === 'true' || newValue === true) {
        this.localDisabled = true
      } else {
        this.localDisabled = false
      }
    },
    maxlength (newValue) {
      this.localMaxlength = newValue || 64
    },
    checked (newValue) {
      this.localChecked = newValue
    }
  },
  computed: {
    dependency () {
      return this.$options.dependencies[this.type]
    },
    fieldClass () {
      let output = 'ui-field'
      if (this.$attrs.class) { output += ' ' + this.$attrs.class }
      if (this.type) { output += ' --' + this.type }
      return output
    }
  },
  methods: {
    handleInput (newValue) {
      this.localBadge = null
      this.localValue = newValue
      this.$emit('update:value', newValue)
      this.$emit('input', newValue)
    },
    handleCheck (newValue) {
      this.$emit('update:checked', newValue)
      this.$emit('input', newValue)
    },
    handleQuery (newValue) {
      this.$emit('query', newValue)
    },
    handleIcon (e, newValue) {
      this.$emit('icon', e, newValue)
    },
    handleClick (e, ref) {
      this.$emit('click', e, ref)
    },
    handleEnter (e, newValue) {
      this.$emit('enter', e, newValue)
    },
    handleBadge (e) {
      if (this.localForm && this.localForm.dialog) {
        this.showDialog()
      } else {
        this.$emit('alert', e, this.localBadge)
      }
    },
    getFormComponent (component) {
      if (component.$parent) {
        if (component.$parent.$options.name === 'ui-form') {
          return component.$parent
        } else if (component.$parent.$options._componentTag === 'ui-form') {
          return component.$parent
        } else {
          return this.getFormComponent(component.$parent)
        }
      }
    },
    showDialog () {
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
    focus (select) {
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
    blur () {
      if (this.$refs.field) {
        let input = this.$refs.field.$refs.input

        if (this.type === 'daterange') {
          input = this.$refs.field.$refs.from
        }

        input.blur()
      }
    },
    updateForm () {
      if (this.localForm) {
        this.localForm.update()
      }
    }
  },
  created () {
    this.$options.dependencies = {
      autosuggest: UiFieldAutosuggest,
      button: UiFieldButton,
      checkbox: UiFieldCheckbox,
      color: UiFieldColor,
      date: UiFieldDate,
      daterange: UiFieldDaterange,
      email: UiFieldEmail,
      multiselect: UiFieldMultiselect,
      number: UiFieldNumber,
      password: UiFieldPassword,
      phone: UiFieldPhone,
      radio: UiFieldRadio,
      select: UiFieldSelect,
      slider: UiFieldSlider,
      tags: UiFieldTags,
      text: UiFieldText,
      textarea: UiFieldTextarea,
      time: UiFieldTime,
    }
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