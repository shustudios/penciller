<template>
  <div :class="bodyClass">
    <div
      id="StripeCardNumber"
      v-if="stripe"
    />
    <input
      ref="input"
      class="ui-field__input"
      type="text"
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
  name: 'ui-field-credit-card-number',
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
      default: () => ['required', 'creditnumber']
    }
  },
  mixins: [UiFieldCore],
  data: function() {
    return {
      focused: false,
      maxlength: 19,
      cards: {
        visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
        mastercard: /^5[1-5][0-9]{14}$|^2(?:2(?:2[1-9]|[3-9][0-9])|[3-6][0-9][0-9]|7(?:[01][0-9]|20))[0-9]{12}$/,
        amex: /^3[47][0-9]{13}$/,
        discover: /^65[4-9][0-9]{13}|64[4-9][0-9]{13}|6011[0-9]{12}|(622(?:12[6-9]|1[3-9][0-9]|[2-8][0-9][0-9]|9[01][0-9]|92[0-5])[0-9]{10})$/,
        diners_club: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
        jcb: /^(?:2131|1800|35[0-9]{3})[0-9]{11}$/,
      },
    }
  },
  computed: {
    localValue: {
      get: function () {
        let output = ''

        if (this.value) {
          output = this.maskValue(this.value)
        }

        return output
      },
      set: function(newValue) {
        this.$emit('input', newValue)
      }
    },
  },
  methods: {
    cardType: function (val) {
      let input = val.replace(/\D/g, '')
      let output = null

      for (let key in this.cards) {
        if (this.cards[key].test(input)) {
          output = key
          break
        }
      }

      return output
    },
    maskValue: function(val) {
      let input = val.replace(/\D/g, '')
      let type = this.cardType(val)
      let output

      switch (type) {
        case 'amex':
          this.maxlength = 17
          output = input.replace(/(\d{4})/, '$1 ').replace(/(\d{4}) (\d{6})/, '$1 $2 ')
          break

        case 'diners_club':
          this.maxlength = 16
          output = input.replace(/(\d{4})/, '$1 ').replace(/(\d{4}) (\d{6})/, '$1 $2 ')
          break

        default:
          this.maxlength = 19
          output = input.replace(/(\d{4})/, '$1 ').replace(/(\d{4}) (\d{4})/, '$1 $2 ').replace(/(\d{4}) (\d{4}) (\d{4})/, '$1 $2 $3 ')
          break
      }

      return output
    },
    handleInput: function (e) {
      let newValue = e.currentTarget.value
      let maskedValue = this.mask(newValue)
      let input = this.$refs.input
      let cursor = input.selectionStart

      if (cursor === newValue.length) {
        cursor = maskedValue.length

        if (this.localValue && this.localValue.charAt(cursor - 1) === ' ') {
          cursor--
        }
      }

      if (newValue !== maskedValue) {
        if (newValue.charAt(cursor) === ' ' && maskedValue.charAt(cursor - 1) === ' ') {
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
  },
}
</script>

<style>
#StripeCardNumber {
  width: 100%;
  height: 4rem;
  padding: 1.2rem;
}

.ui-field.--creditcardnumber .ui-field-body {
  display: flex;
  border: solid 0.2rem var(--color-brdr-primary);
  border-radius: 0.4rem;
  transition: all 0.3s ease-out;
  background: var(--color-bg-primary);
}

.ui-field.--creditcardnumber .ui-field__input {
  font-size: 1.6rem;
  padding: 1rem;
  color: var(--color-text-primary);
  background-color: transparent;
  border: none;
  outline: none;
  display: block;
  width: 100%;
}

.ui-field.--creditcardnumber .ui-field__input::placeholder {
  color: var(--color-text-tertiary);
}

.ui-field.--creditcardnumber .ui-field-body.--focused {
  border-color: var(--dim-brdr-primary);
}

.ui-field.--creditcardnumber .ui-field-body.--disabled {
  opacity: 0.5;
  cursor: default;
}

@media (hover: hover) and (pointer: fine) {
  .ui-field.--creditcardnumber .ui-field-body:not(.--disabled):not(.--focused):hover {
    border-color: var(--hilite-brdr-primary);
  }
}
</style>