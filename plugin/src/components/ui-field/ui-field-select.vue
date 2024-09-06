<template>
  <div
    ref="dropdown"
    :class="bodyClass"
    v-bind="$attrs"
  >
    <div
      ref="title"
      :class="titleClass"
      :tabindex="tabindex"
      @click="handleBalloon"
      @keydown.escape="handleEscapeKey"
      @keydown.enter="handleEnterKey"
      @keydown.space="handleOpenBalloon"
      @keydown.down="handleDownKey"
      @keydown.up="handleUpKey"
      @focus="handleFocus"
      @blur="handleBlur"
    >
      <div class="ui-field__titlelabel" v-html="localLabel" />
      <div class="ui-field__titlecaret" />
    </div>
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
        <template v-for="(option, groupIdx) in localOptions">
          <div
            class="ui-field-itemgroup"
            v-if="option.children"
            :key="'optiongroup_' + groupIdx"
          >
            <div class="ui-field-itemgroup__label" v-html="option.label" />
            <div
              ref="options"
              v-for="child in option.children"
              :key="'option_' + child.idx"
              :data-value="child.value"
              :class="itemClass(child.value, child.idx)"
              @click="handleBalloonInput($event, child.idx)"
              @mouseover="handleMouseover"
              @mousedown="handleMousedown"
              v-html="child.label"
            />
          </div>

          <div
            ref="options"
            v-else
            :key="'option_' + option.idx"
            :data-value="option.value"
            :class="itemClass(option.value, option.idx)"
            @click="handleBalloonInput($event, option.idx)"
            @mouseover="handleMouseover"
            @mousedown="handleMousedown"
            v-html="option.label"
          />
        </template>
      </div>
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
    form: Object,
    name: String,
    label: String,
    fieldValue: [String, Number],
    options: [Object, Array],
    disabled: [String, Boolean],
    placeholder: String,
    balloon: Object,
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
      localOptions: this.formatItems(this.options),
    }
  },
  computed: {
    localLabel: {
      get () {
        let output = '- select -'
        let option = this.getItemByValue(this.localValue)

        if (option) { output = option.label }
        else if (this.placeholder) { output = this.placeholder }
        
        return output
      },
      set (newValue) {
        return newValue
      }
    },
    balloonClass () {
      let output = 'ui-select-balloon'

      if (this.balloon.css) {
        output += ' ' + this.balloon.css
      }

      if (this.open) {
        output += ' --open'
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
    itemClass (val, idx) {
      let output = 'ui-field-item'

      if (val === this.localValue) {
        output += ' --selected'
      }

      if (this.idx === idx) {
        output += ' --focused'
      }

      return output
    },
    prevItem (e) {
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
    nextItem (e) {
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
    getItemByIdx (idx) {
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
    getItemByValue (val) {
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
    selectItem (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      let option = this.getItemByIdx(this.idx)
      let val = option.value

      this.localLabel = option.label
      this.$refs.title.focus()
      this.handleCloseBalloon()
      this.$emit('input', val)
    },
    formatItems (options) {
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
    },
    handleMouseover (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      this.focused = false
    },
    handleDownKey (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      if (this.open) {
        this.nextItem(e)
        this.$refs.options[this.idx].scrollIntoView(false)
      } else {
        this.handleOpenBalloon()
      }
    },
    handleUpKey (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      if (this.open) {
        this.prevItem(e)
        this.$refs.options[this.idx].scrollIntoView(false)
      } else {
        this.handleOpenBalloon()
      }
    },
    handleEnterKey (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      if (this.open) {
        this.selectItem(e)
      }
    },
    handleEscapeKey (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      if (this.open) {
        this.handleCloseBalloon()
      }
    },
    handleBalloon (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      if (this.$penciller.utils.isUndefined(this.fieldValue)) {
        this.idx = -1
      }

      if (this.open) {
        this.handleCloseBalloon()
      } else {
        this.handleOpenBalloon()
      }
    },
    handleOpenBalloon () {
      if (this.localDisabled) { return }

      this.localOptions = this.formatItems(this.options)
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
      this.selectItem(e)
    },
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

.ui-select-balloon .ui-field-menu {
  outline: none;
}

@media (hover: hover) and (pointer: fine) {
  .ui-field.--select .ui-field-body:not(.--disabled):not(.--focused):hover .ui-field__title {
    border-color: var(--hilite-brdr-primary);
  }

  .ui-field.--select .ui-field-body:not(.--disabled) .ui-field__titlecaret:hover {
    opacity: 0.7;
  }
}
</style>