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
      maskFormat: 'phone',
      mask: this.maskValue(this.fieldValue, 'phone'),
    }
  },
  computed: {
    localValue: function() {
      let output = this.fieldValue || ''
     
      if (output && this.isValidFormat(output, this.maskFormat)) {
        output = this.maskValue(output, this.maskFormat).val
        this.mask.val = output
      }

      return output
    },
  },
  methods: {
    handleInput (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      let newValue = e.currentTarget.value
      let unmaskedValue = this.unmaskValue(newValue, this.maskFormat)
      let cursor = e.currentTarget.selectionStart

      this.mask.pos = cursor-1
      
      if (newValue === '' || this.isValidFormat(unmaskedValue, this.maskFormat) && e.data !== '-') {
        this.mask = this.maskValue(unmaskedValue, this.maskFormat, cursor)
        this.$emit('input', unmaskedValue)
      }

      e.currentTarget.value = this.mask.val
      e.currentTarget.setSelectionRange(this.mask.pos, this.mask.pos)
    },
  }
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