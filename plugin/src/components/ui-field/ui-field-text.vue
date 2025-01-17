<template>
  <div :class="bodyClass">
    <div
      class="ui-field__prefix"
      :data-prefix="prefix"
      v-if="prefix"
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
    />
    <a
      class="ui-field__icon"
      @click="handleIcon"
      v-if="hasIconListener"
    />
  </div>
</template>

<script>
import UiFieldCore from '../../mixins/ui-field-core.js'

export default {
  name: 'ui-field-text',
  inheritAttrs: false,
  props: {
    form: Object,
    fieldValue: [String, Number],
    name: String,
    prefix: String,
    label: String,
    maxlength: [String, Number],
    disabled: [String, Boolean],
    focus: [String, Boolean],
    select: [String, Boolean],
    options: [Object, Array],
    balloon: Object,
    format: String,
    rules: {
      type: Array,
      default: () => ['required']
    }
  },
  mixins: [UiFieldCore],
  data () {
    return {
      maskFormat: this.format,
      mask: this.format ? this.maskValue(this.fieldValue || '', this.format) : null,
    }
  },
  computed: {
    localValue: function() {
      let output = this.fieldValue || ''
     
      if (!this.$penciller.utils.isUndefined(this.format)) {
        if (output && this.isValidFormat(output, this.maskFormat)) {
          output = this.maskValue(output, this.maskFormat).val
          this.mask.val = output
        }
      }

      return output
    },
    hasIconListener () {
      let output = false

      if (this.getListener('icon')) {
        output = true
      }

      return output
    }
  },
  methods: {
    handleInput (e) {
      if (this.localDisabled) { return }
      e.preventDefault()
      
      let newValue = e.currentTarget.value

      if (!this.$penciller.utils.isUndefined(this.format)) {
        newValue = this.maskValue(e.currentTarget.value, this.format).val
        e.currentTarget.value = newValue
      }

      this.$emit('input', newValue, e)
    },
    handleEnter (e,) {
      if (this.localDisabled) { return }
      e.preventDefault()

      this.$emit('enter', e, this.localValue)
    },
    handleIcon (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      this.$emit('icon', e, this.localValue)
    },
  },
}
</script>

<style>
.ui-field.--text .ui-field-body {
  display: flex;
  border: solid 0.2rem var(--color-brdr-primary);
  border-radius: 0.4rem;
  transition: all 0.3s ease-out;
  background: var(--color-bg-primary);
}

.ui-field.--text .ui-field__prefix {
  flex-shrink: 1;
  display:flex;
  align-items: center;
  justify-content: flex-start;
  user-select: none;
  padding: 0 0 0 1.5rem;
  border-right-width: 0;
  color: var(--color-text-primary);
}

.ui-field.--text .ui-field__prefix:before {
  content: attr(data-prefix);
  opacity: 0.5;
}

.ui-field.--text .ui-field__input {
  font-size: 1.6rem;
  padding: 1rem;
  color: var(--color-text-primary);
  background-color: transparent;
  border: none;
  outline: none;
  display: block;
  width: 100%;
}

.ui-field.--text .ui-field__input::placeholder {
  color: var(--color-text-tertiary);
}

.ui-field.--text .ui-field-body.--focused {
  border-color: var(--dim-brdr-primary);
}

.ui-field.--text .ui-field-body.--disabled {
  opacity: 0.5;
  cursor: default;
}

.ui-field.--text .ui-field__icon {
  display: block;
  flex: 0 0 4rem;
  background-position: center center;
  background-repeat: no-repeat;
  background-size: 2.4rem;
  cursor: pointer;
  opacity: 0.3;
}

.ui-field.--text .ui-field-body.--disabled .ui-field__icon {
  cursor: default;
}

@media (hover: hover) and (pointer: fine) {
  .ui-field.--text .ui-field-body:not(.--disabled):not(.--focused):hover {
    border-color: var(--hilite-brdr-primary);
  }

  .ui-field.--text .ui-field-body:not(.--disabled) .ui-field__icon:hover {
    opacity: 0.8;
  }
}
</style>