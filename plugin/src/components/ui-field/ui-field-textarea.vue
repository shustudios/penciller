<template>
  <div :class="bodyClass">
    <textarea
      ref="input"
      :class="inputClass"
      :name="name"
      :rows="localRows"
      :disabled="localDisabled"
      :value="localValue"
      :style="{ resize: (!this.resize || this.resize === 'false') ? 'none' : '' }"
      @input="handleInput"
      v-bind="$attrs"
    />
    <div
      :class="charinfo"
      v-if="$attrs.maxlength"
    >
      <span class="ui-field-charinfo__length">{{ charlength }}</span>
      <span class="ui-field-charinfo__max">{{ $attrs.maxlength }}</span>
    </div>
  </div>
</template>

<script>
import UiFieldCore from '../../mixins/ui-field-core.js'

export default {
  name: 'ui-field-textarea',
  inheritAttrs: false,
  props: {
    style: Object,
    form: Object,
    fieldValue: String,
    name: String,
    disabled: [String, Boolean],
    focus: [String, Boolean],
    select: [String, Boolean],
    autosize: [String, Boolean],
    rows: [String, Number],
    resize: [String, Boolean],
    rules: {
      type: Array,
      default: () => ['required']
    }
  },
  mixins: [UiFieldCore],
  data () {
    return {
      charlength: (this.fieldValue) ? this.fieldValue.length : 0,
      focused: false,
      localRows: this.rows || 5,
      observer: null,
      lastHeight: null,
    }
  },
  computed: {
    localValue: {
      get () {
        return this.fieldValue
      },
      set (newValue) {
        this.charlength = (newValue) ? newValue.length : 0
        this.$emit('input', newValue)
      }
    },
    charinfo () {
      let output = 'ui-field-charinfo'

      if (this.charlength > 0) {
        output += ' --active'
      }

      return output
    },
    inputClass () {
      let output = 'ui-field__input'

      if (this.$penciller.utils.isTrue(this.autosize)) {
        output += ' --autosize'
      }

      return output
    },
  },
  watch: {
    localValue () {
      this.updateSize()
    }
  },
  methods: {
    updateSize () {
      if (this.$penciller.utils.isTrue(this.autosize)) {
        let input = this.$refs.input
        let padding = parseInt(window.getComputedStyle(input).getPropertyValue('padding-bottom'), 10)

        if (input) {
          input.style.height = "auto";
          input.style.height = (input.scrollHeight + padding) + "px"
        }
      }
    },
    handleInput (e) {
      this.localValue = e.currentTarget.value
    },
  },
  mounted () {
    if (this.form) { this.form.register(this) }
    if (this.$penciller.utils.isTrue(this.focus) || this.$penciller.utils.isTrue(this.select)) {
      this.$refs.input.focus()

      if (this.select) {
        this.$refs.input.select()
      }
      
      this.handleFocus()
    }
    
    this.$refs.input.addEventListener('focus', this.handleFocus)
    this.$refs.input.addEventListener('blur', this.handleBlur)
    
    this.observer = new ResizeObserver(this.updateSize)
    this.observer.observe(this.$refs.input)
    this.updateSize()
  },
  beforeDestroy () {
    if (this.form) { this.form.unRegister(this) }

    if (this.observer) {
      this.observer.disconnect()
    }

    this.$refs.input.removeEventListener('focus', this.handleFocus)
    this.$refs.input.removeEventListener('blur', this.handleBlur)
  },
}
</script>

<style>
.ui-field.--textarea .ui-field__input {
  font-size: 1.6rem;
  padding: 1rem;
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  border: solid 2px var(--color-brdr-primary);
  border-radius: 4px;
  outline: none;
  display: block;
  width: 100%;
  transition: all 0.3s ease-out;
}

.ui-field.--textarea .ui-field__input.--autosize {
  overflow-y: hidden;
}

.ui-field.--textarea .ui-field__input::placeholder {
  color: var(--color-text-tertiary);
}

.ui-field.--textarea .ui-field-body.--focused .ui-field__input {
  border-color: var(--dim-brdr-primary);
}

.ui-field.--textarea .ui-field-body.--disabled .ui-field__input {
  opacity: 0.5;
  cursor: default;
}

.ui-field.--textarea .ui-field__input:disabled,
.ui-field.--textarea .ui-field__input:disabled + .ui-field-charinfo {
  opacity: 0.5;
  resize: none;
}

.ui-field.--textarea .ui-field-charinfo {
  font-size: 1.3rem;
  padding: 0.5rem;
  text-align: right;
  color: var(--color-label);
  transition: all 0.2s ease-out;
}

.ui-field.--textarea .ui-field-charinfo__length {
  display: none;
}

.ui-field.--textarea .ui-field-charinfo__max:before {
  content: 'Maximum '
}

.ui-field.--textarea .ui-field-charinfo__max:after {
  content: ' characters.'
}

.ui-field.--textarea .ui-field-charinfo.--active .ui-field-charinfo__length {
  display: inline;
}

.ui-field.--textarea .ui-field-charinfo.--active .ui-field-charinfo__length:after {
  content: ' / '
}

.ui-field.--textarea .ui-field-charinfo.--active .ui-field-charinfo__max:before {
  display: none;
}

@media (hover: hover) and (pointer: fine) {
  .ui-field.--textarea .ui-field-body:not(.--focused) .ui-field__input:not(:disabled):hover {
    border-color: var(--hilite-brdr-primary);
  }
}
</style>