<template>
  <div
    :tabindex="tabindex"
    :class="bodyClass"
    v-bind="$attrs"
    @keydown.down="handleInputNext"
    @keydown.right="handleInputNext"
    @keydown.up="handleInputPrev"
    @keydown.left="handleInputPrev"
  >
    <div
      ref="options"
      v-for="(option, idx) in localOptions"
      :key="'option_' + idx"
      :data-value="option.value"
      :class="optionClass(option.value, idx)"
      @click="handleOptionClick($event, idx)"
    >
      <div class="ui-field-item__outer">
        <div class="ui-field-item__inner" />
      </div>
      <div class="ui-field-item__label">{{ option.label }}</div>
    </div>
  </div>
</template>

<script>
import UiFieldCore from '../../mixins/ui-field-core.js'

export default {
  name: 'ui-field-radio',
  inheritAttrs: false,
  props: {
    style: Object,
    form: Object,
    fieldValue: String,
    name: String,
    options: [Object, Array],
    disabled: [String, Boolean],
    rules: {
      type: Array,
      default: () => ['required']
    }
  },
  mixins: [UiFieldCore],
  data () {
    return {
      idx: -1,
    }
  },
  computed: {
    localValue: {
      get () {
        return this.fieldValue || []
      },
      set (newValue) {
        this.$emit('input', newValue)
        return newValue
      }
    },
    localOptions () {
      return this.formatOptions(this.options)
    },
  },
  methods: {
    optionClass (val, idx) {
      let output = 'ui-field-item'

      if (this.localValue === val) { output += ' --selected' }
      if (this.focused === idx) { output += ' --focused' }

      return output
    },
    selectOption () {
      if (this.localDisabled) { return }
      let val = this.localOptions[this.idx].value
      this.$emit('input', val)
    },
    nextOption () {
      if (this.localDisabled) { return }
      this.idx++

      if (this.idx > this.localOptions.length - 1) {
        this.idx = 0
      }
      
      this.selectOption()
    },
    prevOption () {
      if (this.localDisabled) { return }
      this.idx--

      if (this.idx < 0) {
        this.idx = this.localOptions.length - 1
      }
      
      this.selectOption()
    },
    formatOptions (options) {
      let output = options

      if (typeof options === 'object' && !Array.isArray(options)) {
        output = []
        
        for (let key in options) {
          output.push({ label: options[key], value: key })
        }
      }

      return output
    },
    handleOptionClick (e, idx) {
      if (this.localDisabled) { return }
      e.preventDefault()

      this.idx = idx
      this.selectOption()
    },
    handleInputNext (e) {
      e.preventDefault()

      this.nextOption()
    },
    handleInputPrev (e) {
      e.preventDefault()
      
      this.prevOption()
    }
  },
}
</script>

<style>
.ui-field.--radio .ui-field-body {
  outline: none;
}

.ui-field.--radio .ui-field-body.--disabled .ui-field-item {
  cursor: default;
  opacity: 0.5;
}

.ui-field.--radio .ui-field-item {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease-out;
  color: var(--color-text-primary);
}

.ui-field.--radio .ui-field-item__outer {
  border: solid 0.2rem var(--color-brdr-primary);
  border-radius: 100%;
  padding: 0.5rem;
  transition: all 0.2s ease-out;
  background-color: var(--color-bg-primary);
}

.ui-field.--radio .ui-field-item__inner {
  width: 0.8rem;
  height: 0.8rem;
  background-color: var(--color-text-secondary);
  border-radius: 100%;
  opacity: 0;
}

.ui-field.--radio .ui-field-item.--selected .ui-field-item__inner {
  opacity: 1;
}

.ui-field.--radio .ui-field-item__label {
  margin: 0 3rem 0 1rem;
  color: var(--color-text-primary);
}

.ui-field.--radio .ui-field-body:not(.--disabled):focus .ui-field-item__outer {
  border-color: var(--dim-brdr-primary);
}

@media (hover: hover) and (pointer: fine) {
  .ui-field.--radio .ui-field-body:not(.--disabled):not(.--focused):hover .ui-field-item__outer {
    border-color: var(--hilite-brdr-primary);
  }

  .ui-field.--radio .ui-field-body:not(.--disabled) .ui-field-item:hover .ui-field-item__inner {
    opacity: 0.3;
  }

  .ui-field.--radio .ui-field-body:not(.--disabled) .ui-field-item.--selected:hover .ui-field-item__inner {
    opacity: 1;
  }
}
</style>