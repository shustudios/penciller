<template>
  <div
    class="ui-field-innergroup"
  >
    <div
      ref="group"
      :class="bodyClass"
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
        @keydown.escape="handleEscapeKey"
        @focus="handleFocus"
        @focusout="handleFocusout"
        @blur="handleBlur"
        @input="handleInput"
      />
      <a
        class="ui-field__icon --calendar"
        @click="handleBalloon"
      />
    </div>
    <ui-balloon
      ref="balloon"
      :css="balloonClass"
      :type="balloon.type"
      :container="balloon.container"
      :enabled="open"
    >
      <ui-calendar
        ref="calendar"
        :value="balloonValue"
        :filter="filter"
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
    name: String,
    label: String,
    fieldValue: String,
    options: [Object, Array],
    disabled: [String, Boolean],
    focus: [String, Boolean],
    select: [String, Boolean],
    balloon: Object,
    filter: Object,
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
  data () {
    return {
      valid: true,
      parentElm: null,
      maskFormat: 'date',
      mask: this.maskValue(this.fieldValue, 'date'),
    }
  },
  watch: {
    fieldValue () {
      if (this.localValue.length >= 10) {
        this.validate()
      } else {
        this.valid = true
      }
    }
  },
  computed: {
    localValue: function() {
      let output = this.fieldValue || ''
     
      if (output && this.isValidFormat(output, this.maskFormat)) {
        output = this.maskValue(output, this.maskFormat).val
      }

      return output
    },
    localPlaceholder () {
      let output = 'yyyy-mm-dd'

      if (this.$attrs.hasOwnProperty('placeholder')) {
        output = this.$attrs.placeholder
      }

      return output
    },
    balloonValue () {
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
    balloonClass () {
      let output = 'ui-calendar-balloon'

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

    if (this.localValue) {
      let invalid = this.$penciller.validator.check('date', this)

      if (invalid) {
        this.localValue = ''
      }
    }
    },
    validate () {
      if (!this.form) { return }

      let msg = null
      this.$parent.localBadge = null
      this.valid = true

      if (this.localValue) {
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
    handleEscapeKey (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      if (this.open) {
        this.handleCloseBalloon()
      }
    },
    handleFocusout () {
      this.validate()

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
    },
    handleInput (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      let newValue = e.currentTarget.value
      let unmaskedValue = this.unmaskValue(newValue, this.maskFormat)
      let cursor = e.currentTarget.selectionStart

      this.mask.pos = cursor-1
      
      if (newValue === '' || this.isValidFormat(unmaskedValue, this.maskFormat) && e.data !== '-') {
        this.mask = this.maskValue(unmaskedValue, this.maskFormat, cursor)
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
      this.$emit('input', newValue)
      this.handleCloseBalloon()
      this.$refs.input.focus()
    },
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

.ui-field.--date .trans-enter-active,
.ui-field.--date .trans-leave-active {
  transition: all 0.2s ease-out;
}
.ui-field.--date .trans-enter,
.ui-field.--date .trans-leave-to {
  opacity: 0;
  transform: translateY(-1rem);
}

.ui-calendar-balloon .ui-calendar {
  border: none;
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