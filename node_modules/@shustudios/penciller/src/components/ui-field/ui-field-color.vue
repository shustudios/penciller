<template>
  <div
    class="ui-field-innergroup"
    @click.stop
  >
    <div
      ref="group"
      :class="bodyClass"
      @keydown.escape="handleEscapeKey"
      @click="handleClick"
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
        @input="handleInput"
        @keydown.enter="handleEnter"
      />
      <a class="ui-field-icon">
        <img src="../../assets/images/icon-brush.svg" class="ui-field-icon__fg" />
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
      transition="slide"
      :class="balloonClass"
      :container="container"
      :enabled="open"
      @close="handleCloseBalloon"
    >
      <ui-swatch
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
    style: Object,
    form: Object,
    fieldValue: String,
    name: String,
    container: null,
    options: Array,
    disabled: [String, Boolean],
    focus: [String, Boolean],
    select: [String, Boolean],
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
      maskedValue: '',
      parentElm: null,
    }
  },
  computed: {
    localValue: {
      get () {
        let output = ''

        if (this.fieldValue) {
          output = this.fieldValue

          if (output.charAt(0) === '#') {
            output = output.substring(1)
          }

          if (!this.isValidFormat('#' + output, 'hex')) {
            output = ''
          }
        }

        return output
      },
      set (newValue) {
        return newValue
      }
    },
    localPlaceholder () {
      let output = '0000FF'

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

      if (this.open) {
        output += ' --open'
      }

      if (this.$attrs.hasOwnProperty('balloonClass')) {
        output += ' ' + this.$attrs.balloonClass
      }

      return output
    },
  },
  methods: {
    afterMount () {
      this.parentElm = this.$el
    },
    handleInput (e) {
      let newValue = '#' + e.currentTarget.value

      if (this.isValidFormat(newValue, 'hex')) {

        this.$emit('input', newValue.toUpperCase())
        this.maskedValue = this.maskValue(newValue, 'hex').val.toUpperCase()

      } else {
        if (newValue !== '#') {
          e.preventDefault()
          e.currentTarget.value = this.maskedValue
        } else {
          this.$emit('input', newValue)
        }
      }
    },
    handleBalloonInput (newValue) {
      this.$parent.localBadge = null
      this.valid = true
      this.$emit('input', newValue.toUpperCase())
      this.open = false
      this.focused = true
    },
    handleClick () {
      if (this.localDisabled) { return }
      this.open = !this.open
    },
    handleBodyClick () {
      this.open = false
      this.focused = false
    },
    handleEnter (e) {
      e.preventDefault()
      this.open = false
    }
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
}

.ui-field.--color .ui-field-icon__bg {
  z-index: 1;
}

.ui-color-balloon {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  z-index: 1000;
  margin: 0.5rem 0;
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