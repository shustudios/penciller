<template>
  <div
    ref="menu"
    :tabindex="tabindex"
    :class="bodyClass"
    v-bind="$attrs"
    @keydown.down="handleDownKey"
    @keydown.up="handleUpKey"
    @keydown.space="handleSpaceKey"
    @keydown.enter="handleEnterKey"
    @blur="handleBlur"
  >
    <template
      v-for="(option, groupIdx) in localOptions"
    >
      <div
        class="ui-field-itemgroup"
        v-if="option.children"
        :key="'optiongroup_' + groupIdx"
      >
        <div class="ui-field-itemgroup__label">
          {{ option.label }}
        </div>
        <div
          ref="options"
          v-for="child in option.children"
          :key="'option_' + child.idx"
          :data-value="child.value"
          :class="itemClass(child.value, child.idx)"
          @click="handleOptionClick($event, child.idx)"
          @mouseover="handleMouseover"
        >
        {{ child.label }}
        </div>
      </div>

      <div
        ref="options"
        v-else
        :key="'option_' + option.idx"
        :data-value="option.value"
        :class="itemClass(option.value, option.idx)"
        @click="handleOptionClick($event, option.idx)"
        @mouseover="handleMouseover"
      >
        {{ option.label }}
      </div>
    </template>
  </div>
</template>

<script>
import UiFieldCore from '../../mixins/ui-field-core.js'

export default {
  name: 'ui-field-multiselect',
  inheritAttrs: false,
  props: {
    form: Object,
    value: Array,
    name: String,
    options: [Object, Array],
    disabled: [String, Boolean],
    rules: {
      type: Array,
      default: () => ['required']
    }
  },
  mixins: [UiFieldCore],
  data: function() {
    return {
      idx: -1,
      count: 0,
    }
  },
  computed: {
    localValue: {
      get: function () {
        return this.value || []
      },
      set: function(newValue) {
        this.$emit('input', newValue)
        return newValue
      }
    },
    localOptions: function () {
      return this.formatOptions(this.options)
    },
  },
  methods: {
    itemClass: function(val, idx) {
      let output = 'ui-field-item'

      if (this.isInSelection(val)) {
        output += ' --selected'
      }

      if (this.focused === idx) {
        output += ' --focused'
      }

      return output
    },
    prevOption: function() {
      if (this.localDisabled) { return }
      this.idx--

      if (this.idx < 0) {
        this.idx = this.$refs.options.length - 1;
      }

      this.focused = this.idx
    },
    nextOption: function() {
      if (this.localDisabled) { return }
      this.idx++

      if (this.idx > this.$refs.options.length - 1) {
        this.idx = 0
      }

      this.focused = this.idx
    },
    toggleItem: function() {
      if (this.localDisabled) { return }

      let option = this.getOptionByIdx(this.idx)
      let val = option.value

      if (this.isInSelection(val)) {
        this.removeFromSelection(val)
      } else {
        this.addToSelection(option)
      }

      this.$emit('input', this.localValue)
    },
    addToSelection: function(val) {
      this.localValue.push({ label: val.label, value: val.value })
    },
    removeFromSelection: function(val) {
      for (let idx=0; idx<this.localValue.length; idx++) {
        if (this.localValue[idx].value === val) {
          this.localValue.splice(idx, 1)
          break
        }
      }
    },
    isInSelection: function(val) {
      let output = false

      for (let i=0; i<this.localValue.length; i++) {
        if (this.localValue[i].value == val) {
          output = true
          break
        }
      }

      return output
    },
    getOptionByIdx: function (idx) {
      let output

      for (let itemIdx=0; itemIdx<this.localOptions.length; itemIdx++) {
        if (this.localOptions[itemIdx].idx === idx) {
          output = this.localOptions[itemIdx]
          break
        } else if (this.localOptions[itemIdx].children) {
          for (let childIdx=0; childIdx<this.localOptions[itemIdx].children.length; childIdx++) {
            if (this.localOptions[itemIdx].children[childIdx].idx === idx) {
              output = this.localOptions[itemIdx].children[childIdx]
              break
            }
          }
        }
      }

      return output
    },
    getOptionByValue: function (val) {
      let output

      for (let itemIdx=0; itemIdx<this.localOptions.length; itemIdx++) {
        if (this.localOptions[itemIdx].value === val) {
          output = this.localOptions[itemIdx]
          break
        } else if (this.localOptions[itemIdx].children) {
          for (let childIdx=0; childIdx<this.localOptions[itemIdx].children.length; childIdx++) {
            if (this.localOptions[itemIdx].children[childIdx].value === val) {
              output = this.localOptions[itemIdx].children[childIdx]
              break
            }
          }
        }
      }

      return output
    },
    formatOptions: function (options) {
      let output = options
      let count = 0

      if (typeof options === 'object' && !Array.isArray(options)) {
        output = []
        
        for (let key in options) {
          output.push({ label: options[key], value: key })
        }
      } else {

        for (let itemIdx=0; itemIdx<options.length; itemIdx++) {
          if (options[itemIdx].children) {
            for (let childIdx=0; childIdx<options[itemIdx].children.length; childIdx++) {
              options[itemIdx].children[childIdx].idx = count
              count++
            }
          } else {
            options[itemIdx].idx = count
            count++
          }
        }
      }

      return output
    },
    handleOptionClick: function(e, idx) {
      if (this.localDisabled) { return }
      e.preventDefault()

      this.idx = idx
      this.toggleItem()
    },
    handleEnterKey: function (e) {
      if (this.localDisabled) { return }
      e.preventDefault()
      e.stopPropagation()

      this.toggleItem()
    },
    handleSpaceKey: function (e) {
      if (this.localDisabled) { return }
      e.preventDefault()
      e.stopPropagation()

      this.toggleItem()
    },
    handleMouseover: function (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      this.focused = false
    },
  },
}
</script>

<style>
.ui-field.--multiselect .ui-field-body {
  width: 100%;
  background-color: var(--color-bg-secondary);
  z-index: 1;
  border-radius: 0.4rem;
  border: solid 0.2rem var(--color-brdr-primary);
  overflow: auto;
  user-select: none;
  max-height: 30rem;
  min-height: 16.3rem;
  outline: none;
  transition: border 0.2s ease-out;
}

.ui-field.--multiselect .ui-field-body.--disabled  {
  opacity: 0.5;
}

.ui-field.--multiselect .ui-field-body.--disabled .ui-field-item {
  cursor: default;
}

.ui-field.--multiselect .ui-field-body:not(.--disabled):focus  {
  border-color: var(--dim-brdr-primary);
}

.ui-field.--multiselect .ui-field-itemgroup {
  border-top: solid 0.2rem var(--color-brdr-primary);
  background-color: var(--color-bg-primary);
}

.ui-field.--multiselect .ui-field-itemgroup + .ui-field-item,
.ui-field.--multiselect .ui-field-itemgroup .ui-field-itemgroup__label + .ui-field-item {
  border-top: none;
}

.ui-field.--multiselect .ui-field-itemgroup__label {
  padding: 0.5rem 1rem;
  outline: none;
  color: var(--color-text-secondary);
  background-color: var(--color-canvas);
  border-bottom: solid 0.2rem var(--color-brdr-primary);
  font-size: 1.3rem;
  position: sticky;
  top: 0;
  z-index: 1;
}

.ui-field.--multiselect .ui-field-itemgroup__label:after {
  content: ":";
}

.ui-field.--multiselect .ui-field-item {
  padding: 1rem 2rem 1rem 4rem;
  cursor: pointer;
  border-top: solid 0.1rem var(--color-brdr-quarternary);
  outline: none;
  position: relative;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.ui-field.--multiselect .ui-field-item:first-child,
.ui-field.--multiselect .ui-field-itemgroup:first-child {
  border-top: none;
}

.ui-field.--multiselect .ui-field-item.--selected:before {
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

.ui-field.--multiselect .ui-field-item.--focused  {
  background-color: var(--dim-bg-primary);
  color: var(--color-text-inverted);
  border-color: var(--dim-bg-primary);
}

.ui-field.--multiselect .ui-field-item.--focused + .ui-field-item  {
  border-color: var(--dim-bg-primary);
}

.ui-field.--multiselect .ui-field-item.--focused:before {
  filter: invert(100%);
}

@media (hover: hover) and (pointer: fine) {
  .ui-field.--multiselect .ui-field-body:not(.--disabled):not(.--focused):hover {
    border-color: var(--hilite-brdr-primary);
  }

  .ui-field.--multiselect .ui-field-body:not(.--disabled):not(.--focused) .ui-field-item:hover {
    background-color: var(--hilite-bg-primary);
    color: var(--color-text-inverted);
    border-color: var(--hilite-bg-primary);
  }

  .ui-field.--multiselect .ui-field-body:not(.--disabled):not(.--focused) .ui-field-item:hover + .ui-field-item {
    border-color: var(--hilite-bg-primary);
  }

  .ui-field.--multiselect .ui-field-body:not(.--disabled) .ui-field-item.--selected:hover:before {
    filter: invert(100%);
  }
}
</style>