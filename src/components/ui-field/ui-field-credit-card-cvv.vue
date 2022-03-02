<template>
  <div :class="bodyClass">
    <div
      id="StripeCardCVC"
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
  name: 'ui-field-credit-card-cvv',
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
      default: () => ['creditcode']
    }
  },
  mixins: [UiFieldCore],
  data: function() {
    return {
      maxlength: 4,
    }
  },
  methods: {
    handleInput: function (e) {
      let newValue = e.currentTarget.value.replace(/\D/g, '')

      e.currentTarget.value = newValue

      this.localValue = newValue
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
#StripeCardCVC {
  width: 100%;
  height: 4rem;
  padding: 1.2rem;
}

.ui-field.--creditcardcvv {
  width: 8rem;
}

.ui-field.--creditcardcvv .ui-field-body {
  display: flex;
  border: solid 0.2rem var(--color-brdr-primary);
  border-radius: 0.4rem;
  transition: all 0.3s ease-out;
  background: var(--color-bg-primary);
}

.ui-field.--creditcardcvv .ui-field__input {
  font-size: 1.6rem;
  padding: 1rem;
  color: var(--color-text-primary);
  background-color: transparent;
  border: none;
  outline: none;
  display: block;
  width: 100%;
}

.ui-field.--creditcardcvv .ui-field__input::placeholder {
  color: var(--color-text-tertiary);
}

.ui-field.--creditcardcvv .ui-field-body.--focused {
  border-color: var(--dim-brdr-primary);
}

.ui-field.--creditcardcvv .ui-field-body.--disabled {
  opacity: 0.5;
  cursor: default;
}

@media (hover: hover) and (pointer: fine) {
  .ui-field.--creditcardcvv .ui-field-body:not(.--disabled):not(.--focused):hover {
    border-color: var(--hilite-brdr-primary);
  }
}
</style>