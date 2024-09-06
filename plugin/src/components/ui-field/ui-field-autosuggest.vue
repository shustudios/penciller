<template>
  <div
    :class="bodyClass"
  >
    <input
      type="text"
      ref="input"
      :name="name"
      :disabled="localDisabled"
      :value="inputValue"
      class="ui-field__input"
      autocomplete="off"
      v-bind="$attrs"
      @keydown.escape="handleEscapeKey"
      @keydown.enter="handleEnterKey"
      @keydown.down="handleDownKey"
      @keydown.up="handleUpKey"
      @focus="handleFocus"
      @blur="handleBlur"
      @input="handleInput"
    />
    <div
      class="ui-field__icon"
      @click="handleBalloon"
    />
    <ui-balloon
      ref="balloon"
      :css="balloonClass"
      :type="balloon.type"
      :container="balloon.container"
      :enabled="open"
    >
      <div
        ref="menu"
        class="ui-field-menu"
      >
        <div
          ref="results"
          :class="itemClass(result.value, idx)"
          :key="'result_' + idx"
          @click="handleBalloonInput($event, idx)"
          v-for="(result, idx) in this.trimList(localResults)"
        >
          {{ result.label }}
        </div>
      </div>
      <div :class="overflowClass" v-if="overflow > 0">
        {{ overflow }}
      </div>
    </ui-balloon>
  </div>
</template>

<script>
import UiFieldCore from '../../mixins/ui-field-core.js'
import UiBalloon from '../ui-balloon/ui-balloon.vue'
import Fuse from 'fuse.js'

export default {
  name: 'ui-field-autosuggest',
  inheritAttrs: false,
  components: {
    UiBalloon,
  },
  props: {
    form: Object,
    name: String,
    label: String,
    fieldValue: [String, Object],
    options: [Object, Array],
    disabled: [String, Boolean],
    focus: [String, Boolean],
    select: [String, Boolean],
    balloon: Object,
    fuse: Object,
    max: {
      type: [String, Number],
      default: () => 50,
    },
    rules: {
      type: Array,
      default: () => ['required']
    },
  },
  mixins: [UiFieldCore],
  data () {
    return {
      open: false,
      focused: false,
      idx: -1,
      localOptions: this.formatItems(this.options),
      localResults: [],
      overflow: 0,
      selected: [],
    }
  },
  computed: {
    inputValue: {
      get () {
        let output = this.fieldValue

        if (this.fieldValue && this.fieldValue.hasOwnProperty('label')) {
          output = this.fieldValue.label
        }

        return output
      },
      set (newValue) {
        return newValue
      }
    },
    localValue: {
      get () {
        let output = this.fieldValue

        if (this.fieldValue && !this.fieldValue.hasOwnProperty('label')) {
          output =  { label: this.fieldValue, value: this.fieldValue }
        }

        return output
      },
      set (newValue) {
        this.$emit('input', newValue)
      }
    },
    overflowClass () {
      let output = 'ui-field__overflow'

      if (this.overflow === 1) {
        output += ' --singular'
      }

      return output
    },
    balloonClass () {
      let output = 'ui-autosuggest-balloon'

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
    queryItems (query) {
      let output = []
      let fuseOptions = this.extend({
        threshold: 0.2,
        keys: ['label'],
        minMatchCharLength: 1,
      }, this.fuse, true)

      this.handleCloseBalloon()
      this.overflow = 0

      let dict = new Fuse(this.localOptions, fuseOptions)

      if (dict !== null) {
        let results = dict.search(query)

        for (let i in results) {
          output.push(results[i].item)
        }
      }

      this.localResults = output

      if (output.length > 0) {
        this.open = true
      }
    },
    itemClass (val, idx) {
      let output = 'ui-field-item'

      if (this.localValue && this.localValue.value === val && val !== '') {
        output += ' --selected'
      }

      if (this.idx === idx) {
        output += ' --focused'
      }

      return output
    },
    prevItem () {
      if  (this.open) {
        let idx = this.idx - 1

        if (idx < 0) { idx = this.$refs.results.length - 1 }
        if (idx > this.$refs.results.length - 1) { idx = this.$refs.results.length - 1 }

        this.idx = idx
      }
    },
    nextItem () {
      if (this.open) {
        let idx = this.idx + 1

        if (idx > this.$refs.results.length - 1) { idx = 0 }
        if (idx < 0) { idx = 0 }

        this.idx = idx
      }
    },
    findItem (search) {
      let output = null

      for (let idx=0; idx<this.localOptions.length; idx++) {
        if (this.localOptions[idx].label === search) {
          output = this.localOptions[idx].value
        }
      }

      return output
    },
    selectItem () {
      if (this.idx > -1) {
        let newValue = this.localResults[this.idx]

        this.localValue = newValue
        this.inputValue = newValue.label
      }
      
      this.$refs.input.focus()
      this.handleCloseBalloon()
    },
    formatItems (options) {
      let output = options

      if (typeof options === 'object' && !Array.isArray(options)) {
        output = []
        
        for (let key in options) {
          output.push({ label: options[key], value: key })
        }
      }

      return output
    },
    trimList (results) {
      let output = results

      if (this.max) {
        output = []

        for (let idx=0; idx<results.length; idx++) {
          this.overflow = results.length - this.max

          if (idx < this.max) {
            output.push(results[idx])
          }
        }
      }

      return output
    },
    handleDownKey (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      if (this.open) {
        this.nextItem(e)
        this.$refs.results[this.idx].scrollIntoView(false)
      } else {
        this.handleOpenBalloon()
      }
    },
    handleUpKey (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      if (this.open) {
        this.prevItem(e)
        this.$refs.results[this.idx].scrollIntoView(false)
      } else {
        this.handleOpenBalloon()
      }
    },
    handleEnterKey (e) {
      if (this.localDisabled === true) { return }
      e.preventDefault()

      if (this.open && this.idx > -1) {
        this.selectItem()
      } else {
        if (this.inputValue !== '') {
          this.localValue = { label: this.inputValue, value: '' }
          this.handleCloseBalloon()
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
    handleInput (e) {
      let label = e.currentTarget.value
      let value = this.findItem(label)
      let listener = this.getListener('query')

      if (value === null) { value = '' }

      let newValue = { label, value }
     
      this.inputValue = label
      this.localValue = newValue

      if (listener) {
        this.$emit('query', label)
      } else {
        this.queryItems(label)
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

      this.localResults = this.formatItems(this.options)
      this.$refs.input.focus()
      this.open = true
    },
    handleCloseBalloon () {
      this.idx = -1
      this.open = false
    },
    handleBalloonInput (e, idx) {
      if (this.localDisabled) { return }
      e.stopPropagation()

      this.idx = idx
      this.selectItem()
    },
  },
}
</script>

<style>
.ui-field.--autosuggest .ui-field-body {
  position: relative;
  border-radius: 0.4rem;
  border: solid 0.2rem var(--color-brdr-primary);
  background-color: var(--color-bg-primary);
  width: 100%;
  transition: all 0.3s ease-out;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  outline: none;
}

.ui-field.--autosuggest .ui-field-body.--open {
  border-color: var(--dim-brdr-primary);
}

.ui-field.--autosuggest .ui-field__input {
  font-size: 1.6rem;
  padding: 1rem;
  color: var(--color-text-primary);
  flex-grow: 0;
  outline: none;
  border: none;
  min-width: 5rem;
  background-color: transparent;
  width: calc(100% - 4rem);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ui-field.--autosuggest .ui-field__input::placeholder {
  color: var(--color-text-tertiary);
}

.ui-field.--autosuggest .ui-field__icon {
  position: absolute;
  top: 0;
  right: 0;
  width: 4rem;
  height: 4rem;
  background: url('../../assets/images/icon-suggestion.svg') center center no-repeat;
  opacity: 0.3;
}

.ui-field.--autosuggest .ui-field-body:not(.--disabled) .ui-field__icon {
  cursor: pointer;
}

.ui-field.--autosuggest .ui-field-body.--open .ui-field__icon {
  opacity: 0.7;
}

.ui-field.--autosuggest .ui-field-body.--disabled {
  cursor: default;
  opacity: 0.5;
}

.ui-field.--autosuggest .ui-field-body:not(.--disabled) .ui-field__title:focus  {
  border-color: var(--hilite-brdr-primary);
}

.ui-field.--autosuggest .ui-field-body.--focused {
  border-color: var(--dim-brdr-primary)
}

.ui-autosuggest-balloon .ui-field__overflow {
  color: var(--color-text-secondary);
  padding: 1rem 1rem 1rem 4rem;
  border-top: solid 0.1rem var(--color-brdr-quarternary);
}

.ui-autosuggest-balloon .ui-field__overflow:before {
  content: '+ ';
}

.ui-autosuggest-balloon .ui-field__overflow:after {
  content: ' more items';
}

.ui-autosuggest-balloon .ui-field__overflow.--singular:after {
  content: ' more item';
}

.ui-autosuggest-balloon .ui-field-menu {
  outline: none;
}

@media (hover: hover) and (pointer: fine) {
  .ui-field.--autosuggest .ui-field-body:not(.--disabled):not(.--focused):hover {
    border-color: var(--hilite-brdr-primary);
  }

  .ui-field.--autosuggest .ui-field-body:not(.--disabled) .ui-field__icon:hover {
    opacity: 0.7;
  }
}
</style>