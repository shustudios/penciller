<template>
  <div
    ref="dropdown"
    :class="bodyClass"
    v-bind="$attrs" >
    <div
      ref="title"
      :class="titleClass"
      :tabindex="tabindex"
      @click="handleClick"
      @keydown.space="handleSpaceKey"
      @keydown.enter="handleEnterKey"
      @keydown.down="handleDownKey"
      @keydown.up="handleUpKey"
      @keydown.escape="handleEscapeKey"
    >
      <div class="ui-field__titlelabel" v-html="localLabel" />
      <div class="ui-field__titlecaret" />
    </div>
    <ui-balloon
      ref="menu"
      transition="slide"
      :class="balloonClass"
      :container="container"
      :enabled="open"
      @close="handleCloseBalloon"
    >
      <!-- <div
        ref="options"
        v-for="(option, idx) in localOptions"
        :key="'option_' + idx"
        :data-value="option.value"
        :class="optionClass(option, idx)"
        @click="handleOptionClick($event, idx)"
        @mousedown="handleMousedown"
        @mouseover="handleMouseover"
        v-html="option.label"
      /> -->
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
            @mousedown="handleMousedown"
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
          @mousedown="handleMousedown"
        >
          {{ option.label }}
        </div>
      </template>
    </ui-balloon>
  </div>
</template>

<script>
import UiFieldCore from '../../mixins/ui-field-core.js'
import UiBalloon from '../ui-balloon/ui-balloon.vue'

export default {
  name: 'ui-field-select',
  inheritAttrs: false,
  components: {
    UiBalloon,
  },
  props: {
    style: Object,
    form: Object,
    fieldValue: [String, Number],
    options: [Object, Array],
    name: String,
    disabled: [String, Boolean],
    placeholder: String,
    container: null,
    rules: {
      type: Array,
      default: () => ['required']
    }
  },
  mixins: [UiFieldCore],
  data () {
    return {
      inlinestyle: '',
      idx: -1,
      blurlock: false,
    }
  },
  computed: {
    localLabel: {
      get () {
        let output = '- select -'
        let option = this.getOptionByValue(this.localValue)

        if (option) { output = option.label }
        else if (this.placeholder) { output = this.placeholder }
        
        return output
      },
      set (newValue) {
        return newValue
      }
    },
    localOptions () {
      return this.formatOptions(this.options)
    },
    balloonClass () {
      let output = 'ui-select-balloon'

      if (this.open) {
        output += ' --open'
      }

      if (this.$attrs.hasOwnProperty('balloonClass')) {
        output += ' ' + this.$attrs.balloonClass
      }

      return output
    },
    titleClass () {
      let output = 'ui-field__title'

      if (this.$penciller.utils.isUndefined(this.localValue)) {
        output += ' --placeholder'
      }

      return output
    }
  },
  methods: {
    toggleBalloon (e) {
      if (this.localDisabled) { return }

      e.preventDefault()
      e.stopPropagation()

      if (this.$penciller.utils.isUndefined(this.fieldValue)) {
        this.idx = -1
      }
      
      this.open = !this.open
    },
    itemClass (val, idx) {
      let output = 'ui-field-item'

      if (this.isInSelection(val)) {
        output += ' --selected'
      }

      if (this.focused === idx) {
        output += ' --focused'
      }

      return output
    },
    optionClass (option, idx) {
      let output = 'ui-field-item'

      if (this.localValue === option.value) { output += ' --selected' }
      if (this.focused === (idx + 1)) { output += ' --focused' }
      if (option.css) { output += ' ' + option.css }

      return output
    },
    isInSelection (val) {
      let output = false

      if (this.localValue.includes(val)) {
        output = true
      }

      return output
    },
    prevOption (e) {
      if (this.localDisabled) { return }
      if (!this.open) {
        this.open = true
        return
      }

      e.preventDefault()
      this.idx--

      if (this.idx < 0) {
        this.idx = this.$refs.options.length - 1;
      }

      this.focused = this.idx
    },
    nextOption (e) {
      if (this.localDisabled) { return }
      if (!this.open) {
          this.open = true
          return
      }

      e.preventDefault()
      this.idx++

      if (this.idx > this.$refs.options.length - 1) {
        this.idx = 0
      }

      this.focused = this.idx
    },
    getOptionByIdx (idx) {
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
    getOptionByValue (val) {
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
    selectOption (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      let option = this.getOptionByIdx(this.idx)
      let val = option.value

      this.open = false
      this.localLabel = option.label
      this.$emit('input', val)
    },
    formatOptions (options) {
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
    handleMousedown (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      this.blurlock = true
    },
    handleMouseover (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      this.focused = false
    },
    handleClick (e) {
      if (this.localDisabled) { return }

      this.toggleBalloon(e)
    },
    handleSpaceKey (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      if (this.open) {
        if (this.idx < 0) {
          this.open = false
        } else {
          this.selectOption(e)
        }
      } else {
        this.open = true
      }
    },
    handleEnterKey (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      if (this.open) {
        this.selectOption(e)
      }
    },
    handleDownKey (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      if (!this.open) {
        this.open = true
      }

      this.nextOption(e)
      this.$refs.options[this.idx].scrollIntoView(false)
    },
    handleUpKey (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      if (!this.open) {
        this.open = true
      }

      this.prevOption(e)
      this.$refs.options[this.idx].scrollIntoView(false)
    },
    handleOptionClick (e, idx) {
      if (this.localDisabled) { return }
      e.stopPropagation();

      this.idx = idx
      this.selectOption(e)
    },
    handleBlur () {
      if (this.blurlock !== true) {
        this.open = false
        this.focused = false
      }

      this.blurlock = false
    },
  },
  mounted () {
    if (this.form) { this.form.register(this) }

    if (typeof document === 'object') {
      document.addEventListener('click', this.handleBodyClick)
    }

    this.$refs.title.addEventListener('focus', this.handleFocus)
    this.$refs.title.addEventListener('blur', this.handleBlur)
  },
  beforeDestroy () {
    if (this.form) { this.form.unRegister(this) }

    this.$refs.title.removeEventListener('focus', this.handleFocus)
    this.$refs.title.removeEventListener('blur', this.handleBlur)

    if (typeof document === 'object') {
      document.removeEventListener('click', this.handleBodyClick)
    }
  }
}
</script>

<style>
.ui-field.--select .ui-field-body {
  position: relative;
  user-select: none;
}

.ui-field.--select .ui-field__title {
  font-size: 1.6rem;
  padding: 1rem;
  border-radius: 0.4rem;
  border: solid 0.2rem var(--color-brdr-primary);
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  resize: none;
  display: block;
  width: 100%;
  transition: all 0.3s ease-out;
  outline: none;
  cursor: pointer;
  position: relative;
}

.ui-field.--select .ui-field__title.--placeholder {
  color: var(--color-text-tertiary);
}

.ui-field.--select .ui-field__titlecaret {
  position: absolute;
  top: 0;
  right: 0;
  width: 4rem;
  height: 100%;
  background: url('../../assets/images/icon-cheveron-down.svg') center center no-repeat;
  opacity: 0.3;
  transition: transform 0.2s ease-out;
}

.ui-field.--select .ui-field-body.--open .ui-field__titlecaret {
  opacity: 0.7;
  transform: rotate(180deg);
}

.ui-field.--select .ui-field-body.--disabled .ui-field__title {
  cursor: default;
  opacity: 0.5;
}

.ui-field.--select .ui-field-body.--open .ui-field__title,
.ui-field.--select .ui-field-body:not(.--disabled).--focused .ui-field__title  {
  border-color: var(--dim-brdr-primary);
}

.ui-select-balloon {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  z-index: 1000;
  border-radius: 0.4rem;
  border: solid 0.2rem var(--dim-brdr-primary);
  background-color: var(--color-bg-primary);
  box-shadow: 0.2rem 0.2rem var(--shade);
  overflow: auto;
  user-select: none;
  max-height: 30rem;
}

.ui-select-balloon .ui-field-item {
  padding: 1rem 1rem 1rem 4rem;
  cursor: pointer;
  border-top: solid 0.1rem var(--color-brdr-quarternary);
  outline: none;
  position: relative;
  color: var(--color-text-primary);
}

.ui-select-balloon .ui-field-item:first-child {
  border: none;
}

.ui-select-balloon .ui-field-item.--selected:before {
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

.ui-select-balloon .ui-field-item.--focused  {
  background-color: var(--dim-bg-primary);
  color: var(--color-text-inverted);
  border-color: var(--dim-bg-primary);
}

.ui-select-balloon .ui-field-item.--focused + .ui-field-item {
  border-color: var(--dim-bg-primary);
}

.ui-select-balloon .ui-field-item.--focused:before {
  filter: invert(100%);
}

.ui-select-balloon .ui-field-itemgroup {
  border-top: solid 0.2rem var(--color-brdr-primary);
  background-color: var(--color-bg-primary);
}

.ui-select-balloon .ui-field-itemgroup + .ui-field-item,
.ui-select-balloon .ui-field-itemgroup .ui-field-itemgroup__label + .ui-field-item {
  border-top: none;
}

.ui-select-balloon .ui-field-itemgroup__label {
  padding: 0.5rem 1rem;
  outline: none;
  color: var(--color-text-secondary);
  background-color: var(--color-bg-primary);
  border-bottom: solid 0.2rem var(--color-brdr-primary);
  font-size: 1.3rem;
  position: sticky;
  top: 0;
  z-index: 1;
}

.ui-select-balloon .ui-field-itemgroup__label:after {
  content: ":";
}

@media (hover: hover) and (pointer: fine) {
  .ui-field.--select .ui-field-body:not(.--disabled):not(.--focused):hover .ui-field__title {
    border-color: var(--hilite-brdr-primary);
  }

  .ui-field.--select .ui-field-body:not(.--disabled) .ui-field__titlecaret:hover {
    opacity: 0.7;
  }

  .ui-select-balloon .ui-field-item:hover {
    background-color: var(--hilite-bg-primary);
    color: var(--color-text-inverted);
    border-color: var(--hilite-bg-primary);
  }

  .ui-select-balloon .ui-field-item:hover + .ui-field-item {
    border-color: var(--hilite-bg-primary);
  }

  .ui-select-balloon .ui-field-item.--selected:hover:before {
    filter: invert(100%);
  }
}
</style>