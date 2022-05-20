<template>
  <div
    class="ui-field-innergroup"
    @click.stop
  >
    <div
      ref="group"
      :class="groupClass"
      :tabindex="localTabIndex"
      @focus="handleOuterFocus"
    >
      <input
        ref="hour"
        class="ui-field__input --hour"
        type="text"
        autocomplete="off"
        placeholder="00"
        name="hour"
        maxlength="2"
        :disabled="localDisabled"
        :value="hour"
        @input="handleHourInput"
        @focus="handleInnerFocus"
        @blur="handleInnerBlur"
        @keydown="handleKeyright"
      />
      :
      <input
        ref="minute"
        class="ui-field__input --minute"
        type="text"
        autocomplete="off"
        placeholder="00"
        name="minute"
        maxlength="2"
        :disabled="localDisabled"
        :value="minute"
        @input="handleMinuteInput"
        @focus="handleInnerFocus"
        @blur="handleInnerBlur"
        @keydown="handleKeyleft"
      />
      <div
        ref="daytime"
        :class="switchClass"
        @click="handleDaytimeInput"
        @focus="handleInnerFocus"
        @blur="handleInnerBlur"
        @keydown.space="handleDaytimeInput"
        tabindex="0"
      >
        <span class="--am" />
        <span class="--pm" />
      </div>
      <a class="ui-field__icon --clock" @click="handleIcon" />
    </div>
    <ui-balloon
      transition="slide"
      :class="balloonClass"
      :container="container"
      :enabled="open"
      @close="handleCloseBalloon"
    >
      <ui-clock
        :parent="parentElm"
        :hour="hour"
        :minute="minute"
        :minuteStep="Number(minuteStep) || 1"
        :hourStep="Number(hourStep) || 1"
        :labels="Boolean(numericHours)"
        :military="Boolean(military)"
        @hour="handleClockHour"
        @minute="handleClockMinute"
      />
    </ui-balloon>
  </div>
</template>

<script>
import UiFieldCore from '../../mixins/ui-field-core.js'
import UiClock from '../ui-balloon/ui-clock.vue'
import UiBalloon from '../ui-balloon/ui-balloon.vue'

export default {
  name: 'ui-time',
  inheritAttrs: false,
  props: {
    form: Object,
    value: Object,
    name: String,
    hourStep: [String, Number],
    minuteStep: [String, Number],
    numericHours: [String, Boolean],
    military: [String, Boolean],
    disabled: Boolean,
    focus: [String, Boolean],
    select: [String, Boolean],
    container: null,
    rules: {
      type: Array,
      default: () => ['required', 'time']
    }
  },
  components: {
    UiClock,
    UiBalloon,
  },
  mixins: [UiFieldCore],
  data: function() {
    let vals = ['', '']
    let dt = '24'

    if (this.value) {
      if (this.value.time) {
        vals = this.value.time.split(':')
      }

      if (this.value.daytime) {
        dt = this.value.daytime
      }
    } else {
      let now = new Date()
      let h = now.getHours()
      let m = now.getMinutes()

      if (h > 12) {
        h = h - 12
        dt = 'pm'
      } else {
        dt = 'am'
      }

      if (m < 10) { m = '0' + String(m) }

      vals = [h,m]
    }

    return {
      daytime: dt,
      hour: vals[0],
      minute: vals[1],
      alertTimer: null,
      parentElm: null,
      localTabIndex: 0,
    }
  },
  computed: {
    localValue: {
      get: function () {
        let output = ''

        if (this.value) {
          if (this.value.time && this.value.time.length >= 5) {
            this.validate()
          }
          output = this.value
        }

        return output
      },
      set: function(newValue) {
        return String(newValue)
      }
    },
    switchClass: function () {
      let output = 'ui-field-switch'
      output += ' --' + this.daytime

      return output
    },
    balloonClass: function () {
      let output = 'ui-time-balloon'

      if (this.open) {
        output += ' --open'
      }

      if (this.$attrs.hasOwnProperty('balloonClass')) {
        output += ' ' + this.$attrs.balloonClass
      }

      return output
    },
    groupClass: function () {
      let output = 'ui-field-body'

      if (this.focused) { output += ' --focused' }
      if (this.open) { output += ' --open' }
      if (this.localDisabled) { output += ' --disabled' }

      return output
    }
  },
  methods: {
    afterMount: function () {
      this.$refs.hour.addEventListener('wheel', this.handleHourWheel)
      this.$refs.hour.addEventListener('focus', this.handleFocus)
      this.$refs.hour.addEventListener('blur', this.handleBlur)
      this.$refs.minute.addEventListener('wheel', this.handleMinuteWheel)
      this.$refs.minute.addEventListener('focus', this.handleFocus)
      this.$refs.minute.addEventListener('blur', this.handleBlur)
      this.$refs.daytime.addEventListener('blur', this.handleBlur)
      this.parentElm = this.$el
      this.handleInput() // set value by default
    },
    afterDestroy: function () {
      this.$refs.hour.removeEventListener('wheel', this.handleHourWheel)
      this.$refs.hour.removeEventListener('focus', this.handleFocus)
      this.$refs.hour.removeEventListener('blur', this.handleBlur)
      this.$refs.minute.removeEventListener('wheel', this.handleMinuteWheel)
      this.$refs.minute.removeEventListener('focus', this.handleFocus)
      this.$refs.minute.removeEventListener('blur', this.handleBlur)
      this.$refs.daytime.removeEventListener('blur', this.handleBlur)
    },
    validate: function () {      
      let msg = null
      this.$parent.localBadge = null
      this.valid = true

      clearTimeout(this.alertTimer)
      this.alertTimer = setTimeout(() => {
        
        msg = this.$validator.check('time', this)

        if (msg) {
          this.valid = false
          this.$parent.localBadge = {
            type: 'restricted',
            message: msg,
          }
        }

      }, 500)
    },
    increment: function(pos) {
      let limit
      let hr = Number(this.hour)
      let min = Number(this.minute)

      if (pos === 'hour') {
        if (this.daytime === '24') {
          limit = 23
        } else {
          limit = 11
        }

        if (hr > limit) {
          hr = 1
        } else {
          hr++
        }
      }

      if (pos === 'minute') {
        limit = 59

        if (min > limit) {
          min = 0
        } else {
          min++
        }
      }

      if (min < 10) {
        min = '0' + String(min)
      }

      this.hour = String(hr)
      this.minute = String(min)
    },
    decrement: function(pos) {
      let limit
      let hr = Number(this.hour)
      let min = Number(this.minute)

      if (pos === 'hour') {
        limit = 2

        if (hr < limit) {
          if (this.daytime === '24') {
            hr = 24
          } else {
            hr = 12
          }
        } else {
          hr--
        }
      }

      if (pos === 'minute') {
        limit = 1

        if (min < limit) {
          min = 59
        } else {
          min--
        }
      }

      if (min < 10) {
        min = '0' + String(min)
      }

      this.hour = String(hr)
      this.minute = String(min)
    },
    handleInput: function () {
      let output = {
        time: this.hour + ':' + this.minute,
        daytime: this.daytime,
      }

      this.$parent.localBadge = null
      this.localValue = output
      this.$emit('input', output)
    },
    handleHourInput: function (e) {
      let newValue = e.currentTarget.value

      if (newValue > 12) {
        this.daytime = '24'
      }

      if (this.isValidFormat(newValue, 'time')) {
        this.hour = newValue
      } else {
        e.currentTarget.value = this.hour
      }

      this.handleInput()
    },
    handleMinuteInput: function (e) {
      let newValue = e.currentTarget.value

      if (this.isValidFormat(newValue, 'time')) {
        this.minute = newValue
      } else {
        e.currentTarget.value = this.minute
      }

      this.handleInput()
    },
    handleDaytimeInput: function (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      if (this.hour <= 12) {
        if (this.daytime === 'am') {
          this.daytime = 'pm'
        } else {
          this.daytime = 'am'
        }
      }

      this.handleInput()
    },
    handleClockHour: function (newValue) {

      if (this.daytime === '24') {
        if (newValue > 12) { this.daytime = '24' }
        else if (this.hour > 12) { this.daytime = 'pm' }
        else { this.daytime = 'am' }
      }

      this.$refs.hour.focus()
      this.hour = newValue
      this.handleInput()
    },
    handleClockMinute: function (newValue) {
      this.$refs.minute.focus()
      this.minute = newValue
      this.handleInput()
    },
    handleKeyright: function (e) {
      if (e.key === 'ArrowRight' && e.currentTarget.selectionStart === e.currentTarget.value.length) {
        let field = this.$refs.minute

        field.focus()
        setTimeout(() => { field.setSelectionRange(0, 0)}, 0)
      }
    },
    handleKeyleft: function (e) {
      if (e.key === 'ArrowLeft' && e.currentTarget.selectionStart === 0) {
        let field = this.$refs.hour

        field.focus()
        setTimeout(() => { field.setSelectionRange(10, 10)}, 0)
      }
    },
    handleIcon: function() {
      if (this.localDisabled) { return }
      this.open = !this.open
    },
    handleBodyClick: function () {
      this.open = false
      this.focused = false
    },
    handleBlur: function (e) {
      setTimeout(() => {
        let active = document.activeElement
        let ref = this.$refs

        if (active !== ref.minute && active !== ref.hour && active !== ref.daytime) {
          this.focused = false
          this.open = false
          this.validate()
        }

        this.$emit('blur', e)
      }, 100)
    },
    handleHourWheel: function (e) {
      e.preventDefault()
      this.handleWheel(e, 'hour')
    },
    handleMinuteWheel: function (e) {
      e.preventDefault()
      this.handleWheel(e, 'minute')
    },
    handleWheel: function(e, pos) {      
      if (typeof window === 'object') {
        if (this.$refs[pos] === document.activeElement) {
          if (e.deltaY > 0) { this.decrement(pos) }
          if (e.deltaY < 0) { this.increment(pos) }

          this.handleInput()
        }
      }
    },
    handleOuterFocus: function (e) {
      if (!this.open) {
        this.$refs.hour.focus()
        this.$emit('focus', e)
      }
    },
    handleInnerFocus: function () {
      if (document) {
        if (document.activeElement === this.$refs.hour) {
          this.localTabIndex = '-1'
        } else {
          this.localTabIndex = this.tabindex
        }
      }

      this.focused = true
    },
    handleInnerBlur: function () {      
        this.localTabIndex = this.tabindex
    },
  },
}
</script>

<style>

.ui-field.--time .ui-field-innergroup {
  position: relative;
  min-width: 19rem;
}

.ui-field.--time .ui-field-body {
  display: flex;
  border-width: 0.2rem;
  border-style: solid;
  border-color: var(--color-brdr-primary);
  border-radius: 0.4rem;
  background-color: var(--color-bg-primary);
  transition: all 0.3s ease-out;
  align-items: center;
}

.ui-field.--time .ui-field__input {
  font-size: 1.6rem;
  padding: 1rem;
  color: var(--color-text-primary);
  background-color: transparent;
  outline: none;
  display: block;
  width: 100%;
  border: none;
  -moz-appearance: textfield;
  min-width: 3rem;
  box-shadow: none;
}

.ui-field.--time .ui-field__input.--hour {
  text-align: right;
  padding-right: 0.5rem;
}

.ui-field.--time .ui-field__input.--minute {
  padding-left: 0.5rem;
}

.ui-field.--time .ui-field__input::-webkit-inner-spin-button, 
.ui-field.--time .ui-field__input::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}

.ui-field.--time .ui-field__input::placeholder {
  color: var(--color-text-tertiary);
}

.ui-field.--time .ui-field-body.--focused {
  border-color: var(--dim-brdr-primary);
}

.ui-field.--time .ui-field-body.--disabled {
  opacity: 0.5;
}

.ui-field.--time .ui-field__prefix {
  flex-shrink: 1;
  display:flex;
  align-items: center;
  justify-content: flex-start;
  user-select: none;
  padding: 0 1.5rem;
  color: var(--color-text-primary);
}

.ui-field.--time .ui-field__prefix:before {
  content: attr(data-prefix);
  opacity: 0.5;
}

.ui-field.--time .ui-field-switch {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 0.2rem;
  border-radius: 0.3rem;
}

.ui-field.--time .ui-field-switch:focus {
  outline: none;
}

.ui-field.--time .ui-field-switch .--am,
.ui-field.--time .ui-field-switch .--pm {
  padding: 0 0.3rem 0.3rem 0.3rem;
  margin: 0 0.2rem;
  color: var(--color-text-tertiary);
  border-radius: 0.3rem;
}

.ui-field.--time .ui-field-switch.--am > .--am,
.ui-field.--time .ui-field-switch.--pm > .--pm {
  background-color: var(--color-text-secondary);
  color: var(--color-text-inverted);
}

.ui-field.--time .ui-field-switch:focus.--am > .--am,
.ui-field.--time .ui-field-switch:focus.--pm > .--pm {
  background-color: var(--dim-bg-primary);
}

.ui-field.--time .ui-field-switch .--am:before {
  content: 'am';
}

.ui-field.--time .ui-field-switch .--pm:before {
  content: 'pm';
}

.ui-field.--time .ui-field-body:not(.--disabled) .ui-field-switch,
.ui-field.--time .ui-field-body:not(.--disabled) .ui-field__icon {
  cursor: pointer;
}

.ui-field.--time .ui-field__icon {
  flex-shrink: 0;
  width: 5rem;
  height: 4rem;
  display:flex;
  align-items: center;
  justify-content: flex-start;
  user-select: none;
}

.ui-field.--time .ui-field-body.--open .ui-field__icon:before {
  opacity: 0.7;
}

.ui-field.--time .ui-field__icon:before {
  content: '';
  width: 100%;
  height: 100%;
  display: block;
  background-position: center center;
  background-repeat: no-repeat;
  background-size: 2.4rem;
  opacity: 0.3;
}

.ui-field.--time .ui-field__icon.--clock:before {
  background-image: url('../../assets/images/icon-clock.svg');
}

.ui-time-balloon {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  z-index: 1000;
  margin: 0.5rem 0;
}

.ui-field.--time .trans-enter-active,
.ui-field.--time .trans-leave-active {
  transition: all 0.2s ease-out;
}
.ui-field.--time .trans-enter,
.ui-field.--time .trans-leave-to {
  opacity: 0;
  transform: translateY(-1rem);
}

@media (hover: hover) and (pointer: fine) {
  .ui-field.--time .ui-field-body:not(.--disabled):not(.--focused):hover {
    border-color: var(--hilite-brdr-primary);
  }

  .ui-field.--time .ui-field-body:not(.--disabled) .ui-field__icon:hover:before {
    opacity: 0.7;
  }
}
</style>