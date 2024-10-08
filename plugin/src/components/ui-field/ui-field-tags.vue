<template>
  <div
    :class="bodyClass"
    :tabindex="localTabindex"
    @keydown.escape="handleEscapeKey"
    @keydown.enter="handleEnterKey"
    @keydown.down="handleDownKey"
    @keydown.up="handleUpKey"
    @focus="handleOuterFocus"
  >
    <div
      :class="tagClass(tag)"
      :key="'tag_' + i"
      v-for="(tag, i) in tags"
    >
      <template v-if="format === 'object'">{{tag.label}}</template>
      <template v-else>{{tag}}</template>
      <span
        class="ui-field-tag__close"
        v-if="!tag.disabled || tag.disabled === 'false'"
        @click="handleCloseTag($event, i)"
      />
    </div>
    <input
      type="text"
      ref="input"
      :name="name"
      :disabled="localDisabled"
      :value="inputValue"
      size="2"
      class="ui-field__input"
      autocomplete="off"
      v-bind="$attrs"
      @input="handleInput"
      @keydown="handleKeydown"
      @keyup="handleKeyup"
      @blur="handleBlur"
      @focus="handleFocus"
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
        <div class="menu-empty" v-if="localResults.length === 0" />
        <template v-else>
          <div
            ref="results"
            :class="itemClass(result, i)"
            :key="'result_' + i"
            @click="handleBalloonInput(i)"
            v-for="(result, i) in this.trimList(localResults)"
          >
            <template v-if="format === 'object'">{{result.label}}</template>
            <template v-else>{{result}}</template>
          </div>
          <div :class="overflowClass" v-if="overflow > 0">
          {{ overflow }}
          </div>
        </template>
      </div>
    </ui-balloon>
  </div>
</template>

<script>
import UiFieldCore from '../../mixins/ui-field-core.js'
import UiBalloon from '../ui-balloon/ui-balloon.vue'
import Fuse from 'fuse.js'

export default {
  name: 'ui-field-tags',
  inheritAttrs: false,
  components: {
    UiBalloon,
  },
  props: {
    form: Object,
    name: String,
    fieldValue: Array,
    label: String,
    options: [Array, Object],
    disabled: [String, Boolean],
    focus: [String, Boolean],
    select: [String, Boolean],
    balloon: Object,
    fuse: Object,
    locked: [String, Boolean],
    delimiters: {
      type: Array,
      default: () => [
        'Comma',
        'Semicolon',
      ]
    },
    format: {
      type: String,
      default: () => 'object',
    },
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
      focused: false,
      idx: -1,
      open: false,
      selected: [],
      overflow: 0,
      inputValue: '',
      localOptions: this.formatItems(this.options),
      localResults: [],
      localTabindex: this.$attrs.tabindex,
      keycodes: {
        semicolon: 186,
        comma: 188,
        down: 40,
        up: 38,
        enter: 13,
        backspace: 8,
        esc: 27,
      },
    }
  },
  computed: {
    tags: {
      get () {
        let output = []

        if (this.fieldValue) {
          output = this.fieldValue
        }

        return output
      },
      set (newValue) {
        return newValue
      }
    },
    localLocked () {
      return this.$penciller.utils.isTrue(this.locked)
    },
    overflowClass () {
      let output = 'ui-field__overflow'

      if (this.overflow === 1) {
        output += ' --singular'
      }

      return output
    },
    balloonClass () {
      let output = 'ui-tags-balloon'

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
    itemClass (result, idx) {
      let output = 'ui-field-item'

      for (let tagsIdx=0; tagsIdx<this.tags.length; tagsIdx++) {
        if (this.format === 'object') {
          if (this.tags[tagsIdx].value === result.value) {
            output += ' --selected'
          }
        } else {
          if (this.tags[tagsIdx] === result) {
            output += ' --selected'
          }
        }
      }

      if (this.idx === idx) {
        output += ' --focused'
      }

      return output
    },
    tagClass (tag) {
      let output = 'ui-field-tag'

      if (tag.disabled) {
        output += ' --disabled'
      }

      return output
    },
    valueIndex (val) {
      let output = -1

      if (this.format === 'object') {
        for (let itmIdx=0; itmIdx<this.localResults.length; itmIdx++) {
          if (this.localResults[itmIdx].label === val) {
            output = itmIdx
            break
          }
        }
      } else {
        output = this.localResults.indexOf(val)
      }

      return output
    },
    addFromInput (newValue, autofocus) {
      let val = newValue
      let valIdx = this.valueIndex(val)
      let invalid = false

      if (this.localDisabled) { return }

      if (this.alreadyInList(val)) {
        invalid = 'Item already in list.'
      }

      if (this.localLocked && valIdx === -1) {
        invalid = 'Input is restricted to this field\'s options.'
      }

      if (invalid) {
        this.showBadge(invalid)
      } else {
        if (this.format === 'object') {
          if (valIdx === -1) {
            this.tags.push({ label:val, value: '' })
          } else {
            this.tags.push({ label:val, value: this.localResults[valIdx].value })
          }
        } else {
          this.tags.push(val)
        }
      }
      
      this.inputValue = ''

      if (autofocus === true) {
        this.$refs.input.focus()
      }

      this.$emit('input', this.tags)
      this.handleCloseBalloon()
    },
    addFromMenu (item) {
      if (this.localDisabled) { return }

      let label = item
      let val = null

      if (this.format === 'object') {
        label = null
        val = item.value
      }

      if (this.alreadyInList(label, val)) {
        this.showBadge('Item already selected.')
      } else {
        this.tags.push(item)
      }

      this.inputValue = ''
      this.$emit('input', this.tags)
      this.$refs.input.focus()
      this.handleCloseBalloon()
    },
    alreadyInList (label, val) {
      let output = false

      if (this.format === 'object') {
        for (let itmIdx=0; itmIdx<this.tags.length; itmIdx++) {
          if (label) {
            if (this.tags[itmIdx].label === label) {
              output = true
              break
            }
          } else {
            if (this.tags[itmIdx].value === val) {
              output = true
              break
            }
          }
        }
      } else {
        if (label) {
          output = this.tags.indexOf(label) > -1
        } else {
          output = this.tags.indexOf(val) > -1
        }
      }

      return output
    },
    showBadge (msg) {   
      this.$parent.localBadage = null   
      this.$parent.localBadge = {
        type: 'restricted',
        message: msg,
      }
    },
    hideBadge () {
      this.$parent.localBadge = null
    },
    removeTag (i) {
      if (this.localDisabled) { return }

      this.localValue.splice(i,1)
      this.$refs.input.focus()

      this.$emit('input', this.localValue)
    },
    prevItem () {
      let idx = this.idx - 1

      if (idx < 0) { idx = this.$refs.results.length - 1 }
      if (idx > this.$refs.results.length - 1) { idx = this.$refs.results.length - 1 }

      this.idx = idx
    },
    nextItem () {
      let idx = this.idx + 1

      if (idx > this.$refs.results.length - 1) { idx = 0 }
      if (idx < 0) { idx = 0 }

      this.idx = idx
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
    selectItem () {
      if (this.idx > -1) {
        this.addFromMenu(this.localResults[this.idx])
      }
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
    handleKeydown (e) {
      if (this.localDisabled) { return }
      let key = e.code || e.which

      this.hideBadge()

      if (key === 'Backspace' || key === this.keycodes.backspace) {
        if (e.currentTarget.selectionStart === 0 && this.tags.length > 0) {
          this.removeTag(this.localValue.length-1)
        }
      }
    },
    handleKeyup (e) {
      if (this.localDisabled) { return }
      
      let val = e.currentTarget.value.slice(0, -1)
      let key = e.code || e.which

      for (let deIdx=0; deIdx<this.delimiters.length; deIdx++) {
        let delimiter = this.delimiters[deIdx]

        if (typeof delimiter == 'string') {
          if (key === delimiter) { this.addFromInput(val, true) }
        }
      }
    },
    handleFocus (e) {
      this.focused = true
      this.$emit('focus', e)
      this.localTabindex = -1
    },
    handleOuterFocus (e) {
      this.focused = true
      this.$refs.input.focus()
      this.$emit('focus', e)
    },
    handleBlur (e) {
      setTimeout(() => {
        if (this.inputValue !== '') {
          this.addFromInput(this.inputValue)
        }
      }, 100)

      this.localTabindex = this.$attrs.tabindex
      this.focused = false
      this.$emit('blur', e)
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
          this.addFromInput(this.inputValue)
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
      let listener = this.getListener('query')

      this.inputValue = label

      if (listener) {
        this.$emit('query', label)
      } else {
        this.queryItems(label)
      }
    },
    handleCloseTag (e, idx) {
      if (this.localDisabled) { return }
      e.preventDefault()

      this.removeTag(idx)
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
      this.open = true
    },
    handleCloseBalloon () {
      this.idx = -1
      this.open = false
    },
    handleBalloonInput (i) {
      this.addFromMenu(this.localResults[i])
    },
  },
}
</script>

<style>
.ui-field.--tags .ui-field-body {
  border-radius: 0.4rem;
  border: solid 0.2rem var(--color-brdr-primary);
  background: var(--color-bg-primary);
  width: 100%;
  transition: all 0.3s ease-out;
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  outline: none;
  padding: 0 4rem 0 0;
}

.ui-field.--tags .ui-field-body.--open {
  border-color: var(--dim-brdr-primary);
}

.ui-field.--tags .ui-field-body.--invalid .ui-field__input {
  text-decoration: line-through;
}

.ui-field.--tags .ui-field__input {
  font-size: 1.6rem;
  padding: 1rem;
  color: var(--color-text-primary);
  flex-grow: 1;
  outline: none;
  border: none;
  background-color: transparent;
}

.ui-field.--tags .ui-field__input::placeholder {
  color: var(--color-text-tertiary);
}

.ui-field.--tags .ui-field__icon {
  position: absolute;
  top: 0;
  right: 0;
  width: 4rem;
  height: 4rem;
  background: url('../../assets/images/icon-tag.svg') center center no-repeat;
  opacity: 0.3;
}

.ui-field.--tags .ui-field-body:not(.--disabled) .ui-field__icon {
  cursor: pointer;
}

.ui-field.--tags .ui-field-body.--open .ui-field__icon {
  opacity: 0.7;
}

.ui-field.--tags .ui-field-body.--disabled {
  cursor: default;
  opacity: 0.5;
}

.ui-field.--tags .ui-field-body:not(.--disabled).--focused  {
  border-color: var(--dim-brdr-primary);
}

.ui-tags-balloon .menu-empty {
  padding: 3rem;
  text-align: center;
  color: var(--color-text-tertiary);
}

.ui-tags-balloon .menu-empty:before {
  content: 'No items.'
}

.ui-tags-balloon .ui-field__overflow {
  color: var(--color-text-secondary);
  padding: 1rem 1rem 1rem 4rem;
}

.ui-tags-balloon .ui-field__overflow:before {
  content: '+ ';
}

.ui-tags-balloon .ui-field__overflow:after {
  content: ' more items';
}

.ui-tags-balloon .ui-field__overflow.--singular:after {
  content: ' more item';
}

.ui-field.--tags .ui-field-tag {
  font-size: 1.4rem;
  padding: 0.3rem 1rem 0.4rem 1rem;
  color: var(--color-text-primary);
  background-color: var(--color-bg-secondary);
  border-radius: 0.2rem;
  margin: 0.5rem 0 0.5rem 0.5rem;
  display: flex;
  align-items: center;
}

.ui-field.--tags .ui-field-tag.--disabled {
  color: var(--color-text-tertiary);
  padding: 0.5rem 3rem 0.5rem 1rem;
}

.ui-field.--tags .ui-field-tag__close {
  background-color: var(--color-bg-inverted);
  width: 2.1rem;
  height: 2.1rem;
  margin-left: 1rem;
  background: url('../../assets/images/icon-x-circle.svg') center center no-repeat;
  background-size: contain;
  opacity: 0.3;
}

.ui-field.--tags .ui-field-body:not(.--disabled) .ui-field-tag__close {
  cursor: pointer;
}

@media (hover: hover) and (pointer: fine) {
  .ui-field.--tags .ui-field-body:not(.--disabled):not(.--focused):hover {
    border-color: var(--hilite-brdr-primary);
  }

  .ui-field.--tags .ui-field-body:not(.--disabled) .ui-field__icon:hover {
    opacity: 0.7;
  }

  .ui-field.--tags .ui-field-body:not(.--disabled) .ui-field-tag__close:hover {
    opacity: 0.7;
  }
}
</style>