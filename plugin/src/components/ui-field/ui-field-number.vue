<template>
  <div
    ref="body"
    :class="bodyClass"
    @keydown.down.prevent="handleInputDown('-')"
    @keydown.up.prevent="handleInputDown('+')"
    @keyup="handleInputUp()"
  >
    <div
      class="ui-field__prefix"
      :data-prefix="localPrefix"
      v-if="localPrefix"
    />
    <div
      ref="input"
      :tabindex="tabindex"
      class="ui-field__input"
      v-bind="$attrs"
      v-if="localLocked"
    >
      {{ displayValue }}
    </div>
    <input
      ref="input"
      class="ui-field__input"
      type="text"
      :step="localStep"
      :name="name"
      :disabled="localDisabled"
      :value="displayValue"
      @input="handleInput"
      v-bind="$attrs"
      v-else
    />
    <a
      :class="incrementClass"
      @mousedown="handleInputDown('+')"
      @mouseup="handleInputUp()"
      @mouseleave="handleInputUp()"
    />
    <a
      :class="decrementClass"
      @mousedown="handleInputDown('-')"
      @mouseup="handleInputUp()"
      @mouseleave="handleInputUp()"
    />
  </div>
</template>

<script>
import UiFieldCore from '../../mixins/ui-field-core.js'

export default {
  name: 'ui-field-number',
  inheritAttrs: false,
  props: {
    form: Object,
    name: String,
    prefix: String,
    format: String,
    fieldValue: [String, Number],
    decimal: [String, Number],
    disabled: [String, Boolean],
    focus: [String, Boolean],
    select: [String, Boolean],
    locked: [String, Boolean],
    rules: {
      type: Array,
      default: () => ['required', 'number']
    },
  },
  mixins: [UiFieldCore],
  data () {
    return {
      inputInterval: null,
      inputTimer: null,
      alertTimer: null,
      incremented: false,
      decremented: false,
      displayValue: '',
    }
  },
  computed: {
    localValue: {
      get () {
        return this.fieldValue
      },
      set (newValue) {
        if (this.prefix === '$') {
          let newFormat = this.maskValue(newValue.val, 'currency', newValue.sel)
          this.displayValue = newFormat.val
          setTimeout(() => { this.$refs.input.setSelectionRange(newFormat.pos, newFormat.pos)},20)
        }
        
        return newValue.val
      }
    },
    localDecimal () {
      if (isNaN(this.decimal)) {
        if (!isNaN(this.$attrs.step)) {
          return this.countDecimals(Number(this.$attrs.step))
        } else {
          return 0
        }
      } else {
        return this.decimal
      }
    },
    localMin () {
      return this.$attrs.min
    },
    localMax () {
      return this.$attrs.max
    },
    localPrefix () {
      return this.prefix
    },
    localStep () {
      let pow = Math.pow(10, this.localDecimal)
      let output = 1 / pow

      if (!isNaN(this.$attrs.step)) {
        output = this.$attrs.step
      }

      return output
    },
    localLocked () {
      return this.$penciller.utils.isTrue(this.locked)
    },
    incrementClass () {
      let output = 'ui-field__button --plus'

      if (this.incremented) { output += ' --active' }
      return output
    },
    decrementClass () {
      let output = 'ui-field__button --minus'

      if (this.decremented) { output += ' --active' }
      return output
    },
  },
  watch: {
    fieldValue: function (newValue) {
      this.formatDisplay(newValue)
    }
  },
  methods: {
    afterMount () {
      this.$refs.body.addEventListener('wheel', this.handleWheel)
      this.formatDisplay(this.fieldValue)
    },
    afterDestroy () {
      this.$refs.body.removeEventListener('wheel', this.handleWheel)
    },
    countDecimals (value) {
        if(Math.floor(value) === value) return 0
        return value.toString().split(".")[1].length || 0
    },
    formatDisplay (val) {
      if (this.prefix === '$') {
        this.displayValue = this.maskValue(val, 'currency', 0).val
      } else {
        this.displayValue = val
      }
    },
    formatDecimals () {
      if (this.localDecimal) {
        let remainders = String(this.localValue).split('.')[1]
        
        if (typeof remainders === 'undefined' || remainders.length !== this.localDecimal) {
          let formattedValue = Number(this.localValue).toFixed(this.localDecimal)
          this.applyValue(formattedValue)
        }
      }
    },
    increment () {
      if (this.localDisabled) { return }
      let pow = Math.pow(10, Number(this.localDecimal))
      let n = this.localValue * pow

      n = (n / pow) + Number(this.localStep)

      if (n > this.localMax) { n = Number(this.localMax) }
      if (isNaN(n)) { n = Number(this.localStep) }

      this.applyValue(n.toFixed(this.localDecimal))
    },
    decrement () {
      if (this.localDisabled) { return }
      let pow = Math.pow(10, Number(this.localDecimal))
      let n = this.localValue * pow

      n = (n / pow) - Number(this.localStep)

      if (n < this.localMin) { n = Number(this.localMin) }
      if (isNaN(n)) { n = Number(-this.localStep) }

      this.applyValue(n.toFixed(this.localDecimal))
    },
    inputDown (dir) {
      if (dir === '+') {
        this.increment()
        this.incremented = true
      }

      if (dir === '-') {
        this.decrement()
        this.decremented = true
      }
    },
    validate () {
      if (!this.form) { return }
      let msg = this.form.validator.check('number', this)

      this.$parent.localBadge = null      
      clearTimeout(this.alertTimer)
      this.alertTimer = setTimeout(() => {

        if (msg) {
          this.valid = false
          this.$parent.localBadge = {
            type: 'restricted',
            message: msg,
          }
        }

      }, 1000)
    },
    applyValue (val, sel) {
      this.valid = true
      this.localValue = { val, sel }
      this.$emit('input', Number(val))
    },
    handleInput (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      let val = this.unmaskValue(e.currentTarget.value, 'currency')
      let sel = e.currentTarget.selectionStart
      let unmaskOffset = this.preCharCount(e.currentTarget.value, ',', sel)

      sel = sel - unmaskOffset

      if (!isNaN(Number(val))) {
        this.applyValue(val, sel)
        this.$nextTick(this.validate)
      } else {
        if (val !== '') {
          e.currentTarget.value = this.displayValue
          this.$refs.input.setSelectionRange(sel-1, sel-1)
        } else {
          this.$emit('input', null)
        }
      }
    },
    handleInputDown (dir) {
      clearTimeout(this.inputTimer)

      this.inputDown(dir)
      this.inputTimer = setTimeout(() => {
        this.inputInterval = setInterval(() => { this.inputDown(dir) }, 100)
      }, 700)
    },
    handleInputUp () {
      this.incremented = false
      this.decremented = false
      clearInterval(this.inputInterval)
      clearTimeout(this.inputTimer)
    },
    handleWheel (e) {
      e.preventDefault()
      
      if (typeof window === 'object') {
        if (this.$refs.input === document.activeElement) {
          if (e.deltaY > 0) { this.decrement() }
          if (e.deltaY < 0) { this.increment() }
        }
      }
    },
    handleBlur (e) {
      this.formatDecimals()
      this.focused = false
      this.$emit('blur', e)
    }
  },
}
</script>

<style>
.ui-field.--number .ui-field-body {
  display: flex;
  border: solid 0.2rem var(--color-brdr-primary);
  border-radius: 0.4rem;
  transition: all 0.3s ease-out;
  background: var(--color-bg-primary);
}

.ui-field.--number .ui-field__input {
  font-size: 1.6rem;
  padding: 1rem;
  color: var(--color-text-primary);
  background-color: transparent;
  border: none;
  outline: none;
  display: block;
  width: 100%;
  text-align: right;
  -moz-appearance: textfield;
  min-width: 5rem;
  box-shadow: none;
}

.ui-field.--number .ui-field__input::-webkit-inner-spin-button, 
.ui-field.--number .ui-field__input::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}

.ui-field.--number .ui-field__input::placeholder {
  color: var(--color-text-tertiary);
}

.ui-field.--number .ui-field-body.--invalid .ui-field__input {
  text-decoration: line-through;
}

.ui-field.--number .ui-field-body.--focused,
.ui-field.--number .ui-field-body.--focused .ui-field__button {
  border-color: var(--dim-brdr-primary);
}

.ui-field.--number .ui-field-body.--disabled,
.ui-field.--number .ui-field-body.--disabled .ui-field__button {
  opacity: 0.5;
  cursor: default;
}

.ui-field.--number .ui-field__prefix {
  flex-shrink: 1;
  display:flex;
  align-items: center;
  justify-content: flex-start;
  user-select: none;
  padding: 0 1.5rem;
  border-right-width: 0;
  color: var(--color-text-primary);
}

.ui-field.--number .ui-field__prefix:before {
  content: attr(data-prefix);
  opacity: 0.5;
}

.ui-field.--number .ui-field__button {
  cursor: pointer;
  user-select: none;
  flex: 0 0 4rem;
  border-width: 0 0 0 0.2rem;
  border-style: solid;
  border-radius: 0;
  border-color: var(--color-brdr-primary);
  transition: border 0.3s ease-out;
  padding: 0;
  box-shadow: none;
}

.ui-field.--number .ui-field__button.--plus {
  right: 4rem;
}

.ui-field.--number .ui-field__button:before {
  content: '';
  width: 100%;
  height: 100%;
  background-size: 2.4rem;
  background-position: center center;
  background-repeat: no-repeat;
  display: block;
  opacity: 0.3;
}

.ui-field.--number .ui-field__button.--plus:before {
  background-image: url('../../assets/images/icon-plus.svg');
}

.ui-field.--number .ui-field__button.--minus:before {
  background-image: url('../../assets/images/icon-minus.svg');
}

@media (hover: hover) and (pointer: fine) {
  .ui-field.--number .ui-field-body:not(.--disabled):not(.--focused):hover,
  .ui-field.--number .ui-field-body:not(.--disabled):not(.--focused):hover .ui-field__button {
    border-color: var(--hilite-brdr-primary);
  }

  .ui-field.--number .ui-field-body:not(.--disabled) .ui-field__button:hover {
    background-color: var(--hilite-bg-primary);
  }

  .ui-field.--number .ui-field-body:not(.--disabled) .ui-field__button:hover:before {
    filter: invert(100);
    opacity: 1;
  }
}

.ui-field.--number .ui-field-body:not(.--disabled) .ui-field__button.--active {
  background-color: var(--dim-bg-primary);
}

.ui-field.--number .ui-field-body:not(.--disabled) .ui-field__button.--active:before {
  filter: invert(100);
  opacity: 1;
}
</style>