<template>
  <div
    class="ui-field-innergroup"
  >
    <div
      ref="group"
      :class="bodyClass"
    >
      <div
        class="ui-field__prefix"
        :data-prefix="prefix"
        v-if="prefix"
      />
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
        @keydown.escape="handleEscapeKey"
        @focus="handleFocus"
        @focusout="handleBlur"
        @input="handleInput"
      />
      <a
        class="ui-field-icon"
        @click="handleBalloon"
      >
        <div class="ui-field-icon__fg" />
        <svg class="ui-field-icon__bg" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <g id="icon-brush-color" stroke="none" stroke-width="1" fill-rule="evenodd" fill="none">
                <g id="icon-brush" transform="translate(5.000000, 2.000000)" :fill="previewColor">
                    <path d="M0,3.5 C0,1 1.5,0 3.5,0 C4.83333333,0 8.8333333,0 15.5,0 C13.8333333,1.33333333 13,2.66666667 13,4 C13,5.33333333 13.1666667,6.5 13.5,7.5 L0,7.5 C0,6.5 0,5.16666667 0,3.5 Z" id="Path"></path>
                </g>
            </g>
        </svg>
      </a>
    </div>
    <ui-balloon
      ref="balloon"
      :css="balloonClass"
      :type="balloon.type"
      :container="balloon.container"
      :enabled="open"
    >
      <ui-swatch
        ref="swatch"
        :value="swatchValue"
        :options="options"
        @input="handleBalloonInput"
      />
    </ui-balloon>
  </div>
</template>

<script>
import UiFieldCore from '../../mixins/ui-field-core.js'
import UiSwatch from '../ui-balloon/ui-swatch.vue'
import UiBalloon from '../ui-balloon/ui-balloon.vue'

export default {
  name: 'ui-field-color',
  inheritAttrs: false,
  props: {
    form: Object,
    name: String,
    label: String,
    fieldValue: String,
    options: Array,
    disabled: [String, Boolean],
    focus: [String, Boolean],
    select: [String, Boolean],
    balloon: Object,
    rules: {
      type: Array,
      default: () => ['required']
    }
  },
  components: {
    UiBalloon,
    UiSwatch,
  },
  mixins: [UiFieldCore],
  data () {
    return {
      open: false,
      prefix: '#',
      valid: true,
      parentElm: null,
      maskFormat: 'hex',
      mask: this.maskValue(this.fieldValue, 'hex'),
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
    localPlaceholder () {
      let output = 'FF0000'

      if (this.$attrs.hasOwnProperty('placeholder')) {
        output = this.$attrs.placeholder
      }

      return output
    },
    swatchValue () {
      let output = '#FF0000'

      if (this.localValue) {
        output = '#' + this.localValue
      }

      return output
    },
    previewColor () {
      return (this.localValue) ? '#' + this.localValue : 'none'
    },
    balloonValue () {
      let output = {}

      if (this.localValue) {
        output = this.localValue
      }
      
      return output
    },
    balloonClass () {
      let output = 'ui-color-balloon'

      if (this.balloon.css) {
        output += ' ' + this.balloon.css
      }

      if (this.open) {
        output += ' --open'
      }

      return output
    },
  },
  methods: {
    afterMount () {
      this.parentElm = this.$el
    },
    handleEscapeKey () {
      this.open = false
      this.$refs.input.focus()
    },
    handleInput (e) {
      if (this.localDisabled) { return }
      e.preventDefault()
      
      let newValue = e.currentTarget.value.toUpperCase()
      let cursor = e.currentTarget.selectionStart

      if (newValue === '' || this.isValidFormat('#' + newValue, this.maskFormat)) {
        console.log('----', newValue)
        this.mask = this.maskValue(newValue, this.format, cursor)
        this.$emit('input', this.mask.val)
      }

      e.currentTarget.value = this.mask.val
      e.currentTarget.setSelectionRange(this.mask.pos, this.mask.pos)
    },
    handleBalloon (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      if (this.open) {
        this.handleCloseBalloon()
      } else {
        this.handleOpenBalloon()
      }
    },
    handleOpenBalloon () {
      if (this.localDisabled) { return }
      this.open = true
    },
    handleCloseBalloon () {
      this.open = false
    },
    handleBalloonInput (newValue) {
      this.$parent.localBadge = null
      this.valid = true
      this.$emit('input', newValue.toUpperCase())
      this.handleCloseBalloon()
      this.$refs.input.focus()
    },
  },
}
</script>

<style>
.ui-field.--color .ui-field-innergroup {
  position: relative;
}

.ui-field.--color .ui-field-body {
  display: flex;
  border-width: 0.2rem;
  border-style: solid;
  border-color: var(--color-brdr-primary);
  border-radius: 0.4rem;
  background-color: var(--color-bg-primary);
  transition: all 0.3s ease-out;
}

.ui-field.--color .ui-field__prefix {
  flex-shrink: 1;
  display:flex;
  align-items: center;
  justify-content: flex-start;
  user-select: none;
  padding: 0 0 0 1.5rem;
  border-right-width: 0;
  color: var(--color-text-primary);
}

.ui-field.--color .ui-field__prefix:before {
  content: attr(data-prefix);
  opacity: 0.5;
}

.ui-field.--color .ui-field__input {
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

.ui-field.--color .ui-field__input::placeholder {
  color: var(--color-text-tertiary);
}

.ui-field.--color .ui-field-body.--focused,
.ui-field.--color .ui-field-body.--open {
  border-color: var(--dim-brdr-primary);
}

.ui-field.--color .ui-field-body.--invalid .ui-field__input {
  text-decoration: line-through;
}

.ui-field.--color .ui-field-body.--disabled {
  opacity: 0.5;
}

.ui-field.--color .ui-field-icon {
  flex-shrink: 1;
  width: 5rem;
  user-select: none;
  cursor: pointer;
  position: relative;
}

.ui-field.--color .ui-field-icon__fg,
.ui-field.--color .ui-field-icon__bg {
  content: '';
  width: 2.4rem;
  height: 2.4rem;
  display: block;
  position: absolute;
  top: calc(50% - 1.2rem);
  left: calc(50% - 1.2rem);
}

.ui-field.--color .ui-field-icon__fg {
  opacity: 0.4;
  z-index: 2;
  background: url(../../assets/images/icon-brush.svg) center / 2.4rem no-repeat;
}

.ui-field.--color .ui-field-icon__bg {
  z-index: 1;
}

.ui-balloon-screen.--dropdown .ui-color-balloon {
  border: none;
}

.ui-field.--color .trans-enter-active,
.ui-field.--color .trans-leave-active {
  transition: all 0.2s ease-out;
}
.ui-field.--color .trans-enter,
.ui-field.--color .trans-leave-to {
  opacity: 0;
  transform: translateY(-1rem);
}

@media (hover: hover) and (pointer: fine) {
  .ui-field.--color .ui-field-body:not(.--disabled):not(.--focused):hover {
    border-color: var(--hilite-brdr-primary);
  }

  .ui-field.--color  .ui-field-innergroup:not(.--disabled) .ui-field__icon:hover:before {
    opacity: 0.7;
  }
}
</style>