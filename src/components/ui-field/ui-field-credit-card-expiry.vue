<template>
  <div :class="bodyClass">
    <div
      id="StripeCardExpiry"
      v-if="stripe"
    />
    <input
      ref="input"
      class="ui-field__input"
      type="text"
      placeholder="MM/YY"
      :name="name"
      :value="localValue"
      :disabled="localDisabled"
      :maxlength="maxlength"
      @input="handleInput"
      @keydown.enter="handleEnter"
      v-bind="$attrs"
      v-else
    />
  </div>
</template>

<script>
import UiFieldCore from '../../mixins/ui-field-core.js'

export default {
  name: 'ui-field-credit-card-expiry',
  inheritAttrs: false,
  props: {
    form: Object,
    value: [String, Number],
    name: String,
    disabled: [String, Boolean],
    focus: [String, Boolean],
    select: [String, Boolean],
    stripe: Object,
    rules: {
      type: Array,
      default: () => ['required', 'creditexpiry']
    }
  },
  mixins: [UiFieldCore],
  data: function() {
    return {
      focused: false,
      maxlength: 5,
    }
  },
  computed: {
    localValue: {
      get: function () {
        let output = ''

        if (this.value) {
          output = this.maskValue(this.value, 'cc_expiry').val
        }

        return output
      },
      set: function(newValue) {
        this.$emit('input', newValue)
      }
    },
  },
  methods: {
    handleInput: function (e) {
      let newValue = e.currentTarget.value
      let maskedValue = this.maskValue(newValue, 'cc_expiry').val
      let input = this.$refs.input
      let cursor = input.selectionStart

      if (cursor === newValue.length) {
        cursor = maskedValue.length

        if (this.localValue && this.localValue.charAt(cursor - 1) === '/') {
          cursor--
        }
      }

      if (newValue !== maskedValue) {
        if (newValue.charAt(cursor) === '/' && maskedValue.charAt(cursor - 1) === '/') {
          cursor++
        }
      }

      e.currentTarget.value = maskedValue

      input.selectionStart = cursor
      input.selectionEnd = cursor

      this.localValue = maskedValue
      this.$emit('input', newValue)
    },
    handleEnter: function (e) {
      if (this.localDisabled) { return }
      this.$emit('enter', e)
    },
  }
}
</script>

<style>
#StripeCardExpiry {
  width: 100%;
  height: 4rem;
  padding: 1.2rem;
}

.ui-field.--creditcardexpiry {
  width: 9rem;
}

.ui-field.--creditcardexpiry .ui-field-body {
  display: flex;
  border: solid 0.2rem var(--color-brdr-primary);
  border-radius: 0.4rem;
  transition: all 0.3s ease-out;
  background: var(--color-bg-primary);
}

.ui-field.--creditcardexpiry .ui-field__input {
  font-size: 1.6rem;
  padding: 1rem;
  color: var(--color-text-primary);
  background-color: transparent;
  border: none;
  outline: none;
  display: block;
  width: 100%;
}

.ui-field.--creditcardexpiry .ui-field__input::placeholder {
  color: var(--color-text-tertiary);
}

.ui-field.--creditcardexpiry .ui-field-body.--focused {
  border-color: var(--dim-brdr-primary);
}

.ui-field.--creditcardexpiry .ui-field-body.--disabled {
  opacity: 0.5;
  cursor: default;
}

@media (hover: hover) and (pointer: fine) {
  .ui-field.--creditcardexpiry .ui-field-body:not(.--disabled):not(.--focused):hover {
    border-color: var(--hilite-brdr-primary);
  }
}
</style>