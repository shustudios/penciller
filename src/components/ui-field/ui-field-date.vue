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
      <a class="ui-field__icon --calendar" />
    </div>
    <ui-balloon
      transition="slide"
      :class="balloonClass"
      :container="container"
      :enabled="open"
      @close="handleCloseBalloon"
    >
      <ui-calendar
        :value="balloonValue"
        :min="min"
        :max="max"
        :parent="parentElm"
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
  name: 'ui-field-date',
  inheritAttrs: false,
  props: {
    form: Object,
    value: String,
    name: String,
    container: null,
    min: String,
    max: String,
    disabled: [String, Boolean],
    focus: [String, Boolean],
    select: [String, Boolean],
    rules: {
      type: Array,
      default: () => ['required', 'date']
    }
  },
  components: {
    UiCalendar,
    UiBalloon,
  },
  mixins: [UiFieldCore],
  data: function() {
    return {
      valid: true,
      maskedValue: '',
      parentElm: null,
    }
  },
  watch: {
    value: function () {
      this.validate()
    }
  },
  computed: {
    localPlaceholder: function () {
      let output = 'yyyy-mm-dd'

      if (this.$attrs.hasOwnProperty('placeholder')) {
        output = this.$attrs.placeholder
      }

      return output
    },
    balloonValue: function () {
      let output = {}

      if (this.localValue) {
        let parts = this.localValue.split('-')
        let date = new Date(Number(parts[0]), Number(parts[1]-1), Number(parts[2]))

        output = {
          year: date.getFullYear(),
          month: date.getMonth(),
          day: date.getDate(),
        }
      }
      
      return output
    },
    balloonClass: function () {
      let output = 'ui-calendar-balloon'

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
    afterMount: function () {
      this.parentElm = this.$el
    },
    validate: function () {
      if (!this.form) { return }

      let msg = null
      this.$parent.localBadge = null
      this.valid = true

      if (this.localValue && this.localValue.length >= 10) {
        msg = this.form.validator.check('date', this)
      }

      if (msg) {
        this.valid = false
        this.$parent.localBadge = {
          type: 'restricted',
          message: msg,
        }
      }
    },
    handleInput: function(e) {
      let newValue = this.unmaskValue(e.currentTarget.value, 'date')
      let caret = e.currentTarget.selectionStart
      
      if (this.isValidFormat(newValue, 'date')) {
        let newFormat = this.maskValue(newValue, 'date', caret)

        this.$emit('input', newFormat.val)
        this.maskedValue = newFormat.val

        setTimeout(() => { this.$refs.input.setSelectionRange(newFormat.pos, newFormat.pos)},20)

      } else {
        if (newValue !== '') {
          e.preventDefault()
          e.currentTarget.value = this.maskedValue
        } else {
          this.$emit('input', '')
        }
      }
    },
    handleBalloonInput: function(newValue) {
      this.$parent.localBadge = null
      this.valid = true
      this.$emit('input', newValue)
      this.open = false
      this.focused = true
    },
    handleClick: function() {
      if (this.localDisabled) { return }
      this.open = !this.open
    },
    handleBodyClick: function() {
      this.open = false
      this.focused = false
    },
    handleBlur: function (e) {
      if (this.localValue && this.valid) {
        let parts = this.localValue.split('-')
        let date = new Date(Number(parts[0]), Number(parts[1]-1), Number(parts[2]))
        let year = String(date.getFullYear())
        let month = String(date.getMonth() + 1)
        let day = String(date.getDate())

        if (month < 10) { month = '0' + month }
        if (day < 10) { day = '0' + day }

        this.$emit('input', year + '-' + month + '-' + day)
      }

      this.focused = false
      this.$emit('blur', e)
    }
  },
}
</script>

<style>
.ui-field.--date .ui-field-innergroup {
  position: relative;
}

.ui-field.--date .ui-field-body {
  display: flex;
  border-width: 0.2rem;
  border-style: solid;
  border-color: var(--color-brdr-primary);
  border-radius: 0.4rem;
  background-color: var(--color-bg-primary);
  transition: all 0.3s ease-out;
}

.ui-field.--date .ui-field__input {
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

.ui-field.--date .ui-field__input::placeholder {
  color: var(--color-text-tertiary);
}

.ui-field.--date .ui-field-body.--focused,
.ui-field.--date .ui-field-body.--open {
  border-color: var(--dim-brdr-primary);
}

.ui-field.--date .ui-field-body.--invalid .ui-field__input {
  text-decoration: line-through;
}

.ui-field.--date .ui-field-body.--disabled {
  opacity: 0.5;
}

.ui-field.--date .ui-field__icon {
  flex-shrink: 1;
  width: 5rem;
  display:flex;
  align-items: center;
  justify-content: flex-start;
  user-select: none;
  cursor: pointer;
}

.ui-field.--date .ui-field-body.--open .ui-field__icon:before {
  opacity: 0.7;
}

.ui-field.--date .ui-field__icon:before {
  content: '';
  width: 100%;
  height: 100%;
  display: block;
  background-position: center center;
  background-repeat: no-repeat;
  background-size: 2.4rem;
  opacity: 0.3;
}

.ui-field.--date .ui-field__icon.--calendar:before {
  background-image: url('../../assets/images/icon-calendar.svg');
}

.ui-calendar-balloon {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  z-index: 1000;
  margin: 0.5rem 0;
}

.ui-field.--date .trans-enter-active,
.ui-field.--date .trans-leave-active {
  transition: all 0.2s ease-out;
}
.ui-field.--date .trans-enter,
.ui-field.--date .trans-leave-to {
  opacity: 0;
  transform: translateY(-1rem);
}

@media (hover: hover) and (pointer: fine) {
  .ui-field.--date .ui-field-body:not(.--disabled):not(.--focused):hover {
    border-color: var(--hilite-brdr-primary);
  }

  .ui-field.--date  .ui-field-innergroup:not(.--disabled) .ui-field__icon:hover:before {
    opacity: 0.7;
  }
}
</style>