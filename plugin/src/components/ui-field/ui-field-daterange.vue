<template>
  <div
    ref="group"
    :class="groupClass"
  >
    <div
      ref="fromGroup"
      :class="fromGroupClass"
      @click="handleOpenBalloon"
    >
      <div class="ui-field__prefix" data-prefix="From:" />
      <input
        ref="from"
        class="ui-field__input"
        type="text"
        autocomplete="off"
        :placeholder="localPlaceholder"
        :name="name + '-from'"
        :disabled="localDisabled"
        :value="localValue.from"
        v-bind="$attrs"
        @input="handleInput($event, 'from')"
      />
      <a class="ui-field__icon --calendar" />
    </div>
    <div
      ref="toGroup"
      :class="toGroupClass"
      @click="handleOpenBalloon"
    >
      <div class="ui-field__prefix" data-prefix="To:" />
      <input
        ref="to"
        class="ui-field__input"
        type="text"
        autocomplete="off"
        :placeholder="localPlaceholder"
        :name="name + '-to'"
        :disabled="localDisabled"
        :value="localValue.to"
        v-bind="$attrs"
        @input="handleInput($event, 'to')"
      />
      <a class="ui-field__icon --calendar" />
    </div>
    <ui-balloon
      ref="balloon"
      :css="balloonClass"
      :type="balloon.type"
      :container="balloon.container"
      :enabled="open"
    >
      <ui-calendar
        type="daterange"
        :value="localValue"
        :min="this.min"
        :max="this.max"
        :class="'--' + lastFocus"
        :parent="$el"
        @input="handleBalloonInput"
      />
    </ui-balloon>
  </div>
</template>

<script>
import UiFieldCore from '../../mixins/ui-field-core.js'
import UiCalendar from '../ui-balloon/ui-calendar.vue'
import UiBalloon from '../ui-balloon/ui-balloon.vue'

export default {
  name: 'ui-field-daterange',
  inheritAttrs: false,
  props: {
    form: Object,
    name: String,
    label: String,
    fieldValue: Object,
    options: [Object, Array],
    disabled: [String, Boolean],
    focus: [String, Boolean],
    select: [String, Boolean],
    balloon: Object,
    min: String,
    max: String,
    rules: {
      type: Array,
      default: () => ['required', 'daterange']
    }
  },
  components: {
    UiCalendar,
    UiBalloon,
  },
  mixins: [UiFieldCore],
  data () {
    return {
      lastFocus: 'from',
      inrange: { from:true, to:true },
      valid: { from:true, to:true },
      maskedValue: this.fieldValue || { from:'', to:'' },
    }
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler () {
        this.validate()
      }
    }
  },
  computed: {
    localValue: {
      get () {
        let output = { from:'', to:'' }

        if (!this.$penciller.utils.isUndefined(this.fieldValue) && this.fieldValue.hasOwnProperty('from')) {
          output.from = this.fieldValue.from
        }

        if (!this.$penciller.utils.isUndefined(this.fieldValue) && this.fieldValue.hasOwnProperty('to')) {
          output.to = this.fieldValue.to
        }

        return output
      },
      set (newValue) {
        this.$emit('input', newValue)
        return newValue
      }
    },
    localPlaceholder () {
      let output = 'yyyy-mm-dd'

      if (this.$attrs.hasOwnProperty('placeholder')) {
        output = this.$attrs.placeholder
      }

      return output
    },
    balloonClass () {
      let output = 'ui-daterange-balloon'

      if (this.open) {
        output += ' --open'
      }

      if (this.$attrs.hasOwnProperty('balloonClass')) {
        output += ' ' + this.$attrs.balloonClass
      }

      return output
    },
    groupClass () {
      let output = 'ui-field-innergroup'
        
      if (this.open) { output += ' --open' }
      if (this.localDisabled) { output += ' --disabled' }
      if (this.lastFocus) { output += ' --' + this.lastFocus }

      return output
    },
    fromGroupClass () {
      let output = 'ui-field-body --from'

      if (this.focused === 'from') { output += ' --focused' }
      if (!this.valid.from) { output += ' --invalid' }
      if (!this.inrange.from) { output += ' --invalid' }

      return output
    },
    toGroupClass () {
      let output = 'ui-field-body --to'

      if (this.focused === 'to') { output += ' --focused' }
      if (!this.valid.to) { output += ' --invalid' }
      if (!this.inrange.to) { output += ' --invalid' }

      return output
    },
  },
  methods: {
    validate () {
      if (!this.form) { return }
      if ((this.focused === 'from' || this.focused === 'to') && this.localValue) {
        let msg = null
        this.valid = { from:true, to:true }
        this.$parent.localBadge = null

        let val = this.localValue[this.focused]

        if (val && val.length >= 10) {
          msg = this.form.validator.check('daterange', this)
        }

        if (msg) {
          this.valid[this.focused] = false
          this.$parent.localBadge = {
            type: 'restricted',
            message: msg,
          }
        }
      }
    },
    handleInput (e, dir) {
      let input = e.currentTarget
      let caret = input.selectionStart
      let newValue = this.unmaskValue(input.value, 'date')
      
      if (this.isValidFormat(newValue)) {
        let newFormat = this.maskValue(newValue, 'date', caret)

        this.maskedValue[dir] = newFormat.val
        this.$emit('input', this.maskedValue)

      } else {
        if (newValue !== '') {
          e.preventDefault()
          input.value = this.maskedValue[dir]
        } else {
          this.maskedValue[dir] = ''
          this.$emit('input', this.maskedValue)
        }
      }
    },
    handleBalloonInput (newValue) {
      let publishValue = this.maskedValue
      publishValue[this.lastFocus] = newValue

      let fromdate = new Date(publishValue.from + ' 00:00:00')
      let todate = new Date(publishValue.to + ' 00:00:00')
      let from = fromdate.getTime()
      let to = todate.getTime()

      if (from > to) {
        if (this.lastFocus === 'from') {
          publishValue.to = ''
        } else if (this.lastFocus === 'to') {
          publishValue.from = ''
        }
      }
 
      this.valid = { from:true, to:true }
      this.$parent.localBadge = null
      this.$emit('input', publishValue)

      if (this.lastFocus === 'from') {
        this.lastFocus = 'to'
      } else if (this.lastFocus === 'to') {
        this.lastFocus = 'from'
      }
    },
    handleFromFocus (e) {
      this.focused = 'from'
      this.lastFocus = this.focused
      this.$emit('focus', e)
    },
    handleToFocus (e) {
      this.focused = 'to'
      this.lastFocus = this.focused
      this.$emit('focus', e)
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
  },
  mounted () {
    if (this.form) { this.form.register(this) }
    if (this.$penciller.utils.isTrue(this.focus) || this.$penciller.utils.isTrue(this.select)) {
      this.$refs.from.focus()

      if (this.select) {
        this.$refs.from.select()
      }
      
      this.focused = 'from'
    }

    this.$refs.from.addEventListener('focus', this.handleFromFocus)
    this.$refs.to.addEventListener('focus', this.handleToFocus)
    this.$refs.from.addEventListener('blur', this.handleBlur)
    this.$refs.to.addEventListener('blur', this.handleBlur)

    if (typeof document === 'object') {
      document.addEventListener('click', this.handleBodyClick)
    }
  },
  beforeDestroy () {
    if (this.form) { this.form.unRegister(this) }

    this.$refs.from.removeEventListener('focus', this.handleFromFocus)
    this.$refs.to.removeEventListener('focus', this.handleToFocus)
    this.$refs.from.removeEventListener('blur', this.handleBlur)
    this.$refs.to.removeEventListener('blur', this.handleBlur)

    if (typeof document === 'object') {
      document.removeEventListener('click', this.handleBodyClick)
    }
  }
}
</script>

<style>
.ui-field.--daterange .ui-field-innergroup {
  display: flex;
  justify-content: space-between;
}

.ui-field.--daterange .ui-field-innergroup.--disabled .ui-field-body {
  opacity: 0.5;
}

.ui-field.--daterange .ui-field-body {
  display: flex;
  border-radius: 0.4rem;
  border-width: 0.2rem;
  border-style: solid;
  border-color: var(--color-brdr-primary);
  background-color: var(--color-bg-primary);
  transition: all 0.3s ease-out;
  width: calc(50% - 0.5rem);
}

.ui-field.--daterange .ui-field-body.--focused,
.ui-field.--daterange .ui-field-body.--open {
  border-color: var(--dim-brdr-primary);
}

.ui-field.--daterange .ui-field-body.--invalid .ui-field__input {
  text-decoration: line-through;
}

.ui-field.--daterange .ui-field__prefix {
  flex-shrink: 1;
  display:flex;
  align-items: center;
  justify-content: flex-start;
  user-select: none;
  padding: 0 0 0 1.5rem;
  color: var(--color-text-primary);
}

.ui-field.--daterange .ui-field__prefix:before {
  content: attr(data-prefix);
  opacity: 0.5;
}

.ui-field.--daterange .ui-field__input {
  font-size: 1.6rem;
  padding: 1rem;
  color: var(--color-text-primary);
  background-color: transparent;
  border: none;
  outline: none;
  display: block;
  width: 100%;
  -moz-appearance: textfield;
  min-width: 5rem;
  box-shadow: none;
}

.ui-field.--daterange .ui-field__input::placeholder {
  color: var(--color-text-tertiary);
}

.ui-field.--daterange .ui-field-innergroup:not(.--disabled) .ui-field__icon {
  cursor: pointer;
}

.ui-field.--daterange .ui-field-innergroup.--open .ui-field__icon:before {
  opacity: 0.7;
}

.ui-field.--daterange .ui-field__icon {
  flex-shrink: 0;
  width: 5rem;
  display:flex;
  align-items: center;
  justify-content: flex-start;
  user-select: none;
}

.ui-field.--daterange .ui-field__icon:before {
  content: '';
  width: 100%;
  height: 100%;
  display: block;
  background-position: center center;
  background-repeat: no-repeat;
  background-size: 2.4rem;
  opacity: 0.3;
}

.ui-field.--daterange .ui-field__icon.--calendar:before {
  background-image: url('../../assets/images/icon-calendar.svg');
}

.ui-daterange-balloon .ui-calendar {
  border: none;
}

@media screen and (max-width: 60rem) {
  .ui-field.--daterange .ui-field-innergroup {
    flex-direction: column;
  }

  .ui-field.--daterange .ui-field-body {
    flex-grow: 1;
    width: auto;
  }

  .ui-field.--daterange .ui-field-body:first-child {
    margin-bottom: 0.5rem;
  }
}

@media (hover: hover) and (pointer: fine) {
  .ui-field.--daterange .ui-field-innergroup:not(.--disabled) .ui-field-body:not(.--focused):hover {
    border-color: var(--hilite-brdr-primary);
  }

  .ui-field.--daterange  .ui-field-innergroup:not(.--disabled) .ui-field__icon:hover:before {
    opacity: 0.7;
  }
}
</style>