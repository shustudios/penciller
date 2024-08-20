<template>
  <div
    :tabindex="$attrs.tabindex || 0"
    ref="dropdown"
    class="ui-menu"
    v-bind="$attrs"
    @keydown.escape="handleEscapeKey"
    @keydown.enter="handleEnterKey"
    @keydown.space="handleOpenBalloon"
    @keydown.down="handleDownKey"
    @keydown.up="handleUpKey"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <div
      class="ui-menu-button"
      @click="handleBalloon"
      v-if="$slots.default"
    >
      <slot />
    </div>
    <div
      class="ui-menu-button --default"
      @click="handleBalloon"
      v-else
    >...</div>
    <ui-balloon
      ref="balloon"
      :css="balloonClass"
      :type="balloon.type"
      :local="localPosition"
      :enabled="open"
    >
      <div
        ref="menu"
        class="ui-field-menu"
      >
        <div
          ref="options"
          :key="'option_' + optionIdx"
          :data-value="option.value"
          :class="itemClass(option.value, optionIdx)"
          @click="handleBalloonInput($event, optionIdx)"
          @mouseover="handleMouseover"
          @mousedown="handleMousedown"
          v-html="option.label"
          v-for="(option, optionIdx) in localOptions"
        />
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
    options: [Object, Array],
    disabled: [String, Boolean],
    balloon: {
      type: Object,
      default: () => { return {}}
    },
  },
  mixins: [UiFieldCore],
  data () {
    return {
      idx: -1,
      localOptions: this.options,
    }
  },
  computed: {
    localPosition () {
      let output = true

      if (this.balloon.type !== 'dropdown') {
        output = false
      }

      return output
    },
    balloonClass () {
      let output = 'ui-menu-balloon'

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
    itemClass (val, idx) {
      let output = 'ui-field-item'

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

      this.handleCloseBalloon()
      this.$emit('input', val)
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
.ui-menu {
  outline: none;
  position: relative;
  user-select: none;
}

.ui-menu:focus .ui-menu-button {
  border-color: var(--dim-brdr-primary);
}

.ui-menu-button.--default {
  width: 3.4rem;
  height: 3.4rem;
  border: solid 0.2rem var(--color-brdr-primary);
  border-radius: 100%;
  text-align: center;
  cursor: pointer;
}

.ui-menu-balloon {
  outline: none;
  width: 24rem;
}

.ui-menu .ui-balloon-screen.--dropdown {
  position: absolute;
  top: 100%;
  left: auto;
  width: auto;
  right: 0;
  z-index: 1000;
  user-select: none;
}

@media (hover: hover) and (pointer: fine) {
  .ui-menu:hover .ui-menu-button.--default {
    border-color: var(--hilite-brdr-primary);
  }
}
</style>