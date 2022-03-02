<template>
  <div
    :class="bodyClass"
    :tabindex="localTabIndex"
    @keydown.down="handleDownKey"
    @keydown.up="handleUpKey"
    @keydown.enter="handleEnterKey"
    @keydown.escape="handleEscapeKey"
    @focus="handleOuterFocus"
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
      @input="handleInput"
      @focus="handleInnerFocus"
      @blur="handleInnerBlur"
      @keydown.down="handleDownKey($event, true)"
      @keydown.up="handleUpKey($event, true)"
    />
    <div
      class="ui-field__icon"
      @click.stop="handleIcon"
    />
    <ui-balloon
      ref="menu"
      transition="slide"
      :class="balloonClass"
      :container="localContainer"
      :enabled="open"
      @close="handleCloseBalloon"
    >
      <div
        ref="results"
        :class="optionClass(result.value, idx)"
        :key="'result_' + idx"
        @click="handleOptionClick($event, idx)"
        v-for="(result, idx) in this.trimList(localResults)"
      >
        {{ result.label }}
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
    container: null,
    value: [String, Object],
    options: [Object, Array],
    disabled: [String, Boolean],
    focus: [String, Boolean],
    select: [String, Boolean],
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
  data: function() {
    return {
      open: false,
      focused: false,
      idx: -1,
      localOptions: this.formatOptions(this.options),
      localResults: [],
      localTabIndex: 0,
      overflow: 0,
      selected: [],
    }
  },
  computed: {
    inputValue: {
      get: function () {
        let output = this.value

        if (this.value && this.value.hasOwnProperty('label')) {
          output = this.value.label
        }

        return output
      },
      set: function (newValue) {
        return newValue
      }
    },
    localValue: {
      get: function () {
        let output = this.value

        if (this.value && !this.value.hasOwnProperty('label')) {
          output =  { label: this.value, value: this.value }
        }

        return output
      },
      set: function (newValue) {
        this.$emit('input', newValue)
      }
    },
    overflowClass: function () {
      let output = 'ui-field__overflow'

      if (this.overflow === 1) {
        output += ' --singular'
      }

      return output
    },
    balloonClass: function () {
      let output = 'ui-autosuggest-balloon'

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
    queryOptions: function (query) {
      let output = []
      let fuseOptions = this.extend({
        threshold: 0.2,
        keys: ['label'],
        minMatchCharLength: 1,
      }, this.fuse, true)

      this.hideBalloon()
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
        this.idx = 0
        this.showBalloon()
      }
    },
    optionClass: function(val, idx) {
      let output = 'ui-field-item'

      if (this.localValue && this.localValue.value === val) {
        output += ' --selected'
      }

      if (this.idx === idx) {
        output += ' --focused'
      }

      return output
    },
    prevOption: function() {
      if  (this.open) {
        let idx = this.idx - 1

        if (idx < 0) { idx = this.$refs.results.length - 1 }
        if (idx > this.$refs.results.length - 1) { idx = this.$refs.results.length - 1 }

        this.idx = idx
      }
    },
    nextOption: function() {
      if (this.open) {
        let idx = this.idx + 1

        if (idx > this.$refs.results.length - 1) { idx = 0 }
        if (idx < 0) { idx = 0 }

        this.idx = idx
      }
    },
    findResult: function (search) {
      let output = null

      for (let idx=0; idx<this.localOptions.length; idx++) {
        if (this.localOptions[idx].label === search) {
          output = this.localOptions[idx].value
        }
      }

      return output
    },
    selectOption: function () {
      if (this.idx > -1) {
        let newValue = this.localResults[this.idx]

        this.localValue = newValue
        this.inputValue = newValue.label
      }
      
      this.hideBalloon()
    },
    handleIcon: function () {
      if (this.localDisabled) { return }
      
      if (this.open) {
        this.open = false
      } else {
        this.localResults = this.formatOptions(this.options)
        this.open = true
      }
    },
    trimList: function (results) {
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
    formatOptions: function (options) {
      let output = options

      if (typeof options === 'object' && !Array.isArray(options)) {
        output = []
        
        for (let key in options) {
          output.push({ label: options[key], value: key })
        }
      }

      return output
    },
    handleInput: function (e) {
      let label = e.currentTarget.value
      let value = this.findResult(label)

      if (value === null) { value = '' }

      let newValue = { label, value }
     
      this.inputValue = label
      this.localValue = newValue

      if (this.$parent.$listeners.query) {
        this.$emit('query', label)
      } else {
        this.queryOptions(label)
      }
    },
    handleOptionClick: function(e, idx) {
      if (this.localDisabled) { return }
      e.stopPropagation();

      this.idx = idx
      this.selectOption()
    },
    handleDownKey: function (e, trigger) {
      if (this.localDisabled) { return }
      e.preventDefault()

      if (!trigger) {
        if (!this.open) {
          this.localResults = this.formatOptions(this.options)
          this.open = true
          this.$nextTick(() => { this.nextOption(e) })
        } else {
          this.nextOption(e)
        }
      }
    },
    handleUpKey: function (e, trigger) {
      if (this.localDisabled) { return }
      e.preventDefault()

      if (!trigger) {
        if (!this.open) {
          this.localResults = this.formatOptions(this.options)
          this.open = true
          this.$nextTick(() => { this.prevOption(e) })
        } else {
          this.prevOption(e)
        }
      }
    },
    handleEnterKey: function (e) {
      if (this.localDisabled === true) { return }
      e.preventDefault()

      if (this.open && this.idx > -1) {
        this.selectOption()
      } else {
        if (this.inputValue !== '') {
          this.localValue = { label: this.inputValue, value: '' }
          this.hideBalloon()
        }
      }
    },
    handleOuterFocus: function () {
      if (!this.open) {
        this.$refs.input.focus()
      }
    },
    handleInnerFocus: function () {      
      if (document && document.activeElement === this.$refs.input) {
        this.localTabIndex = '-1'
      } else {
        this.localTabIndex = this.tabindex
      }
    },
    handleInnerBlur: function () {      
        this.localTabIndex = this.tabindex
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

.ui-field.--autosuggest .ui-field__input {
  font-size: 1.6rem;
  padding: 1rem;
  color: var(--color-text-primary);
  flex-grow: 1;
  outline: none;
  border: none;
  min-width: 5rem;
  background-color: transparent;
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

.ui-autosuggest-balloon {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: var(--color-bg-primary);
  z-index: 1000;
  border-radius: 0.4rem;
  border: solid 0.2rem var(--dim-brdr-primary);
  box-shadow: 0 0.2rem 0.4rem rgba(0,0,0,0.1);
  overflow: auto;
  user-select: none;
  max-height: 30rem;
}

.ui-autosuggest-balloon .ui-field-item {
  padding: 1rem 1rem 1rem 4rem;
  cursor: pointer;
  border-top: solid 0.1rem var(--color-brdr-quarternary);
  outline: none;
  position: relative;
  color: var(--color-text-primary);
}

.ui-autosuggest-balloon .ui-field-item:first-child {
  border: none;
}

.ui-autosuggest-balloon .ui-field-item.--focused  {
  background-color: var(--dim-bg-primary);
  color: var(--color-text-inverted);
}

.ui-autosuggest-balloon .ui-field-item.--selected:before {
  content: '';
  background-position: 0.5rem center;
  background-repeat: no-repeat;
  background-size: contain;
  background-image: url('../../assets/images/icon-check.svg');
  display: block;
  width: 3rem;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
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

@media (hover: hover) and (pointer: fine) {
  .ui-field.--autosuggest .ui-field-body:not(.--disabled):not(.--focused):hover {
    border-color: var(--hilite-brdr-primary);
  }

  .ui-field.--autosuggest .ui-field-body:not(.--disabled) .ui-field__icon:hover {
    opacity: 0.7;
  }

  .ui-autosuggest-balloon .ui-field-item.--selected.--focused:before,
  .ui-autosuggest-balloon .ui-field-item.--selected:hover:before {
    filter: invert(100%);
  }

  .ui-autosuggest-balloon .ui-field-item:hover {
    background-color: var(--hilite-bg-primary);
    color: var(--color-text-inverted);
    border-color: var(--hilite-bg-primary);
  }

  .ui-autosuggest-balloon .ui-field-item:hover + .ui-field-item {
    border-color: var(--hilite-bg-primary);
  }

  .ui-autosuggest-balloon .ui-field-item.--selected:hover:before {
    filter: invert(100%);
  }
}
</style>