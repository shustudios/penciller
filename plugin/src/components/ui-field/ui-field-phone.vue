<template>
  <div :class="bodyClass">
    <div
      class="ui-field__prefix"
      data-prefix="+1"
    />
    <input
      ref="input"
      class="ui-field__input"
      type="tel"
      :placeholder="placeholder"
      :name="name"
      :disabled="localDisabled"
      :value="localValue"
      v-bind="$attrs"
      @input="handleInput"
    />
  </div>
</template>

<script>
import UiFieldCore from '../../mixins/ui-field-core.js'

export default {
  name: 'ui-field-phone',
  inheritAttrs: false,
  props: {
    form: Object,
    fieldValue: String,
    name: String,
    label: String,
    disabled: [String, Boolean],
    focus: [String, Boolean],
    select: [String, Boolean],
    options: [Object, Array],
    balloon: Object,
    placeholder: {
      type: String,
      default: () => '000-000-0000'
    },
    rules: {
      type: Array,
      default: () => ['required', 'phone']
    }
  },
  mixins: [UiFieldCore],
  data () {
    return {
      maskedValue: '',
    }
  },
  computed: {
    localValue: {
      get () {
        if (this.isValidFormat(this.unmaskValue(this.fieldValue, 'phone'), 'phone')) {
          return this.maskValue(this.fieldValue, 'phone').val
        } else {
          return ''
        }
      },
      set (newValue) {
        return newValue
      }
    },
  },
  methods: {
    handleInput (e) {
      let newValue = this.unmaskValue(e.currentTarget.value, 'phone')
      let caret = e.currentTarget.selectionStart
      
      if (this.isValidFormat(newValue, 'phone')) {
        let newFormat = this.maskValue(newValue, 'phone', caret)

        this.$emit('input', newFormat.val)
        this.maskedValue = newFormat.val

        setTimeout(() => { this.$refs.input.setSelectionRange(newFormat.pos, newFormat.pos)},20)

      } else {
        if (newValue !== '') {
          e.preventDefault()
          e.currentTarget.value = this.maskedValue
        } else {
          this.$emit('input', '')
        }
      }
    },
  },
}
</script>

<style>
.ui-field.--phone .ui-field-body {
  display: flex;
  border: solid 0.2rem var(--color-brdr-primary);
  border-radius: 0.4rem;
  transition: all 0.3s ease-out;
  background: var(--color-bg-primary);
}

.ui-field.--phone .ui-field__input {
  font-size: 1.6rem;
  padding: 1rem;
  color: var(--color-text-primary);
  background-color: transparent;
  outline: none;
  display: block;
  width: 100%;
  border: none;
  -moz-appearance: textfield;
  min-width: 5rem;
  box-shadow: none;
}

.ui-field.--phone .ui-field__input::-webkit-inner-spin-button, 
.ui-field.--phone .ui-field__input::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}

.ui-field.--phone .ui-field__input::placeholder {
  color: var(--color-text-tertiary);
}

.ui-field.--phone .ui-field-body.--focused {
  border-color: var(--dim-brdr-primary);
}

.ui-field.--phone .ui-field-body.--disabled {
  opacity: 0.5;
}

.ui-field.--phone .ui-field__prefix {
  flex-shrink: 1;
  display:flex;
  align-items: center;
  justify-content: flex-start;
  user-select: none;
  padding: 0 1.5rem;
  color: var(--color-text-primary);
}

.ui-field.--phone .ui-field__prefix:before {
  content: attr(data-prefix);
  opacity: 0.5;
}

@media (hover: hover) and (pointer: fine) {
  .ui-field.--phone .ui-field-body:not(.--disabled):not(.--focused):hover {
    border-color: var(--hilite-brdr-primary);
  }
}
</style>