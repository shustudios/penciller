<template>
  <div
    class="ui-field-innergroup"
  >
    <div
      ref="group"
      :class="groupClass"
    >
      <input
        ref="hour"
        class="ui-field__input --hour"
        type="tel"
        autocomplete="off"
        :placeholder="placeholderHour"
        name="hour"
        maxlength="2"
        :disabled="localDisabled"
        :value="formattedHour"
        @keydown="handleKeyright"
        @focus="handleInnerFocus"
        @blur="handleBlur"
        @input="handleHourInput"
      />
      :
      <input
        ref="minute"
        class="ui-field__input --minute"
        type="tel"
        autocomplete="off"
        placeholder="00"
        name="minute"
        maxlength="2"
        :disabled="localDisabled"
        :value="minute"
        @keydown="handleKeyleft"
        @focus="handleInnerFocus"
        @blur="handleInnerBlur"
        @input="handleMinuteInput"
      />
      <div
        ref="daytime"
        :class="switchClass"
        @keydown.space="handleDaytimeInput"
        @focus="handleInnerFocus"
        @blur="handleInnerBlur"
        @click="handleDaytimeInput"
        tabindex="0"
        v-if="!Boolean(military)"
      >
        <span class="--am" />
        <span class="--pm" />
      </div>
      <a class="ui-field__icon --clock" @click="handleBalloon" />
    </div>
    <ui-balloon
      ref="balloon"
      :css="balloonClass"
      :type="balloon.type"
      :container="balloon.container"
      :enabled="open"
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
    name: String,
    label: String,
    fieldValue: [String, Object],
    disabled: Boolean,
    focus: [String, Boolean],
    select: [String, Boolean],
    balloon: Object,
    options: [Object, Array],
    hourStep: [String, Number],
    minuteStep: [String, Number],
    numericHours: [String, Boolean],
    military: [String, Boolean],
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
  data () {
    return {
      daytime: '',
      hour: '',
      minute: '',
      alertTimer: null,
      parentElm: null,
      localTabIndex: 0,
    }
  },
  computed: {
    localValue: {
      get () {
        let output = ''

        if (this.fieldValue) {
          this.validate()
          output = this.fieldValue
        }

        return output
      },
      set (newValue) {
        return String(newValue)
      }
    },
    placeholderHour () {
      let output = '0'

      if (this.military) {
        output = '00'
      }

      return output
    },
    formattedHour () {
      let output = String(this.hour)

      if (this.hour) {
        if (this.military && Number(this.hour) < 10) {
          output = String('0' + this.hour)
        }
      }

      return output
    },
    switchClass () {
      let output = 'ui-field-switch'
      output += ' --' + this.daytime

      return output
    },
    balloonClass () {
      let output = 'ui-time-balloon'

      if (this.balloon.css) {
        output += ' ' + this.balloon.css
      }

      if (this.open) {
        output += ' --open'
      }

      return output
    },
    groupClass () {
      let output = 'ui-field-body'

      if (this.focused) { output += ' --focused' }
      if (this.open) { output += ' --open' }
      if (this.localDisabled) { output += ' --disabled' }

      return output
    }
  },
  watch: {
    military (newValue) {
      let val = Boolean(newValue)

      if (val) {
        this.to24Format()
      } else {
        this.to12Format()
      }
    }
  },
  methods: {
    afterMount () {
      this.$refs.hour.addEventListener('wheel', this.handleHourWheel)
      this.$refs.hour.addEventListener('focus', this.handleFocus)
      this.$refs.hour.addEventListener('blur', this.handleBlur)
      this.$refs.minute.addEventListener('wheel', this.handleMinuteWheel)
      this.$refs.minute.addEventListener('focus', this.handleFocus)
      this.$refs.minute.addEventListener('blur', this.handleBlur)

      if (this.$refs.daytime) {
        this.$refs.daytime.addEventListener('blur', this.handleBlur)
      }
      
      this.parentElm = this.$el
      
      let vals = this.parseValue()

      this.hour = vals[0]
      this.minute = vals[1]
      this.daytime = vals[2]

      // this.handleInput() // set value by default
    },
    afterDestroy () {
      this.$refs.hour.removeEventListener('wheel', this.handleHourWheel)
      this.$refs.hour.removeEventListener('focus', this.handleFocus)
      this.$refs.hour.removeEventListener('blur', this.handleBlur)
      this.$refs.minute.removeEventListener('wheel', this.handleMinuteWheel)
      this.$refs.minute.removeEventListener('focus', this.handleFocus)
      this.$refs.minute.removeEventListener('blur', this.handleBlur)

      if (this.$refs.daytime) {
        this.$refs.daytime.removeEventListener('blur', this.handleBlur)
      }
    },
    parseValue () {
      let h = ''
      let m = ''
      let dt = ''
      let timeObj = this.$penciller.utils.clone(this.fieldValue)

      if (timeObj) {
        if (typeof timeObj === 'string') {
          let daytimes = ['am', 'pm']
          let str = timeObj.replace(/ /g, '')
          
          timeObj = { time: '', daytime: '' }

          if (daytimes.includes(str.substring(str.length-2))) {
            timeObj.time = str.substring(0, str.length - 2)
            timeObj.daytime = str.substring(str.length-2)
          } else {
            timeObj.time = str
            timeObj.daytime = '24'
          }
        }

        if (timeObj.time && timeObj.time.indexOf(':') !== -1) {
          let parts = timeObj.time.split(':')
          let hour = Number(parts[0])
          let min = Number(parts[1])

          if (hour >= 0 && hour < 25) {
            if (hour < 13) {
              h = String(hour)
            }

            if (this.military) {
              if (timeObj.daytime === 'pm' && this.hour < 13) {
                h = String(hour + 12)
              } else {
                h = String(hour)
              }
              dt = '24'
            } else {
              if (hour > 12) {
                h = String(hour - 12)
                dt = 'pm'
              } else {
                h = String(hour)
                dt = timeObj.daytime
              }
            }
          } else {
            h = '0'
          }

          if (min > 0 && min < 60) {
            if (min < 10) {
              m = '0' + String(min)
            } else {
              m = String(min)
            }
          } else {
            m = '00'
          }
        }
      }

      if (h && m && dt) {
        return [h, m, dt]
      } else {
        return ['','','']
      }
    },
    to24Format () {
      if (this.daytime === 'pm') {
        this.hour = String(Number(this.hour) + 12)
      }

      this.daytime = '24'
    },
    to12Format () {
      if (Number(this.hour) > 12) {
        this.hour = String(Number(this.hour) - 12)
        this.daytime = 'pm'
      } else {
        this.daytime = 'am'
      }
    },
    validate () {
      if (this.fieldValue.time && this.fieldValue.time.length >= 5) {
        if (this.rules && this.rules.includes('required')) {
          return
        }
      } else {
        return
      }

      let msg = null
      this.$parent.localBadge = null
      this.valid = true

      clearTimeout(this.alertTimer)
      this.alertTimer = setTimeout(() => {
        
        msg = this.$penciller.validator.check('time', this)

        if (msg) {
          this.valid = false
          this.$parent.localBadge = {
            type: 'restricted',
            message: msg,
          }
        }

      }, 500)
    },
    increment (pos) {
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
    decrement (pos) {
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
    handleInput () {
      let output = {
        time: this.formattedHour + ':' + this.minute,
        daytime: this.daytime,
      }

      if (this.hour !== '' && this.minute !== '') {
        this.handleCloseBalloon()
      }

      this.$parent.localBadge = null
      this.localValue = output
      this.$emit('input', output)
    },
    handleHourInput (e) {
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
    handleMinuteInput (e) {
      let newValue = e.currentTarget.value

      if (this.isValidFormat(newValue, 'time')) {
        this.minute = newValue
      } else {
        e.currentTarget.value = this.minute
      }

      this.handleInput()
    },
    handleDaytimeInput (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      if (Number(this.hour) <= 12) {
        if (this.daytime === 'am') {
          this.daytime = 'pm'
        } else {
          this.daytime = 'am'
        }
      }

      this.handleInput()
    },
    handleClockHour (newValue) {

      if (this.daytime === '24') {
        if (newValue > 12) { this.daytime = '24' }
        else if (Number(this.hour) > 12) { this.daytime = 'pm' }
        else { this.daytime = 'am' }
      }

      // this.$refs.hour.focus()
      this.hour = newValue
      this.handleInput()
    },
    handleClockMinute (newValue) {
      // this.$refs.minute.focus()
      this.minute = newValue
      this.handleInput()
    },
    handleKeyright (e) {
      if (e.key === 'ArrowRight' && e.currentTarget.selectionStart === e.currentTarget.value.length) {
        let field = this.$refs.minute

        field.focus()
        setTimeout(() => { field.setSelectionRange(0, 0)}, 0)
      }
    },
    handleKeyleft (e) {
      if (e.key === 'ArrowLeft' && e.currentTarget.selectionStart === 0) {
        let field = this.$refs.hour

        field.focus()
        setTimeout(() => { field.setSelectionRange(10, 10)}, 0)
      }
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
    /*handleBlur (e) {
      if (this.open) {
        setTimeout(() => {
          if (!document.activeElement.classList.contains('ui-balloon')) {
            this.open = false
          }
        }, 100)
      }

      this.focused = false
      this.$emit('blur', e)
    },*/
    /*handleBlur (e) {
      if (this.open) { return }

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
    },*/
    handleHourWheel (e) {
      e.preventDefault()
      this.handleWheel(e, 'hour')
    },
    handleMinuteWheel (e) {
      e.preventDefault()
      this.handleWheel(e, 'minute')
    },
    handleWheel (e, pos) {      
      if (typeof window === 'object') {
        if (this.$refs[pos] === document.activeElement) {
          if (e.deltaY > 0) { this.decrement(pos) }
          if (e.deltaY < 0) { this.increment(pos) }

          this.handleInput()
        }
      }
    },
    handleOuterFocus (e) {
      if (!this.open) {
        this.$refs.hour.focus()
        this.$emit('focus', e)
      }
    },
    handleInnerFocus () {
      if (document) {
        if (document.activeElement === this.$refs.hour) {
          this.localTabIndex = '-1'
        } else {
          this.localTabIndex = this.tabindex
        }
      }

      this.focused = true
    },
    handleInnerBlur () {      
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

.ui-field.--time .ui-field-body.--focused,
.ui-field.--time .ui-field-body.--open {
  border-color: var(--dim-brdr-primary);
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

.ui-field.--time .ui-field-switch:focus .--am,
.ui-field.--time .ui-field-switch:focus .--pm {
  color: var(--color-text-primary);
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

.ui-time-balloon .ui-clock {
  border: none;
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