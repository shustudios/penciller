<template>
  <div
    class="ui-field-innergroup"
  >
    <div
      ref="group"
      :class="bodyClass"
    >
      <input
        ref="input"
        class="ui-field__input"
        type="text"
        autocomplete="off"
        :placeholder="localPlaceholder"
        :name="name"
        :disabled="localDisabled"
        :value="localValue"
        v-bind="$attrs"
        @input="handleInput"
      />
    </div>
  </div>
</template>

<script>
import UiFieldCore from '../../mixins/ui-field-core.js'

export default {
  name: 'ui-field-email',
  inheritAttrs: false,
  props: {
    form: Object,
    fieldValue: String,
    name: String,
    disabled: [String, Boolean],
    focus: [String, Boolean],
    select: [String, Boolean],
    rules: {
      type: Array,
      default: () => ['required', 'email']
    }
  },
  mixins: [UiFieldCore],
  data () {
    return {
      valid: true,
    }
  },
  computed: {
    localPlaceholder () {
      let output = ''

      if (this.$attrs.hasOwnProperty('placeholder')) {
        output = this.$attrs.placeholder
      }

      return output
    },
  },
  methods: {
    validate () {
      if (!this.form) { return }
      let msg = this.form.validator.check('email', this)

      this.$parent.localBadge = null      
      
      if (msg) {
        this.valid = false
        this.$parent.localBadge = {
          type: 'restricted',
          message: msg,
        }
      }
    },
    handleInput (e) {
      let newValue = e.currentTarget.value

      this.valid = true
      this.$emit('input', newValue)
    },
    handleBlur (e) {
      if (this.localValue !== '') {
        this.validate()
      }

      this.$emit('blur', e)
    }
  },
}
</script>

<style>
.ui-field.--email .ui-field-innergroup {
  position: relative;
}

.ui-field.--email .ui-field-body {
  display: flex;
  border-width: 0.2rem;
  border-style: solid;
  border-color: var(--color-brdr-primary);
  border-radius: 0.4rem;
  background-color: var(--color-bg-primary);
  transition: all 0.3s ease-out;
}

.ui-field.--email .ui-field__input {
  font-size: 1.6rem;
  padding: 1rem;
  border: none;
  color: var(--color-text-primary);
  background-color: transparent;
  outline: none;
  display: block;
  width: 100%;
  -moz-appearance: textfield;
  min-width: 5rem;
  box-shadow: none;
}

.ui-field.--email .ui-field__input::placeholder {
  color: var(--color-text-tertiary);
}

.ui-field.--email .ui-field-body.--focused {
  border-color: var(--dim-brdr-primary);
}

.ui-field.--email .ui-field-body.--invalid .ui-field__input {
  text-decoration: line-through;
}

.ui-field.--email .ui-field-body.--disabled {
  opacity: 0.5;
}

@media (hover: hover) and (pointer: fine) {
  .ui-field.--email .ui-field-body:not(.--disabled):not(.--focused):hover {
    border-color: var(--hilite-brdr-primary);
  }
}
</style>