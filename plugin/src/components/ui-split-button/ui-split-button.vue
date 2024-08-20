<template>
    <div class="ui-field --split-button">
      <div :class="bodyClass">
        <button
          type="button"
          :class="'ui-field__button'"
          :disabled="localDisabled"
          @click="$emit('click')"
        >
            {{ localLabel }}
        </button>
        <ui-badge
          :key="keyID"
          :badge="localBadge"
          v-if="localBadge"
          @click="showBadge"
        />
        <div class="ui-field-menu" @click="handleBalloon">
          <div class="ui-field__caret" />
        </div>
        <ui-balloon
          ref="balloon"
          :css="balloon.css"
          :type="balloon.type"
          :container="localContainer"
          :enabled="open"
        >
          <slot />
        </ui-balloon>
      </div>
    </div>
</template>

<script>
import UiBadge from '../ui-badge/ui-badge.vue'
import UiBalloon from '../ui-balloon/ui-balloon.vue'

export default {
  name: 'ui-split-button',
  emits: [
    'click',
    'update',
  ],
  props: {
    label: String,
    badge: Object,
    noisy: [String, Boolean],
    disabled: [String, Boolean],
    balloon: {
      type: Object,
      default: () => { return {}}
    }
  },
  components: {
    UiBadge,
    UiBalloon,
  },
  data () {
    return {
      localBadge: this.badge,
      localDisabled: this.disabled,
      keyID: 0,
      form: this.getFormComponent(this),
      open: false,
    }
  },
  watch: {
    badge (newValue) {
      this.localBadge = newValue
    },
    label (newValue) {
      this.localLabel = newValue
    },
    disabled (newValue) {
      this.localDisabled = newValue
    }
  },
  computed: {
    localContainer: {
      get () {
        if (this.$attrs.hasOwnProperty('container')) {
            return this.$attrs.container
        } else {
            return null
        }
      },
      set (newValue) {
        return newValue
      }
    },
    localLabel: {
      get () {
        return this.label
      },
      set (newValue) {
        this.$emit('update', newValue)
        return newValue
      }
    },
    bodyClass: {
      get () {
        let output = 'ui-field-body'

        if (this.disabled) { output += ' --disabled' }
        if (this.open) { output += ' --open' }

        return output
      },
      set (newValue) {
        return newValue
      }
    },
    balloonClass () {
      let output = 'ui-split-button-balloon'

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
    toggle (e) {
      if (this.disabled) { return }

      e.preventDefault()
      e.stopPropagation()

      this.open = !this.open
    },
    showBadge () {
      let dialog = this.localBadge

      if (dialog.type === 'wait') { return }
      if (!dialog.confirm) {
        dialog.confirm = {
          label: 'Ok',
          func: this.form.hideDialog
        }
      }

      this.form.dialogEnabled = true
      this.form.dialog = dialog
    },
    getFormComponent (component) {
      if (component.$parent) {
        if (component.$parent.$options._componentTag === 'ui-form') {
          return component.$parent
        } else {
          return this.getFormComponent(component.$parent)
        }
      }
    },
    handleBalloon (e) {
      if (this.localDisabled) { return }
      e.preventDefault()
      e.stopPropagation()

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
  },
  mounted () {
    if (typeof document === 'object') {
      document.addEventListener('click', this.handleCloseBalloon)
    }
  },
  beforeUnmount () {
    if (typeof document === 'object') {
      document.removeEventListener('click', this.handleCloseBalloon)
    }
  },
  beforeDestroy () {
    if (typeof document === 'object') {
      document.removeEventListener('click', this.handleCloseBalloon)
    }
  }
}
</script>

<style>
.ui-field.--split-button {
  display: table;
}

.ui-field.--split-button .ui-field-body {
  display: inline-flex;
  box-shadow: 0.2rem 0.2rem var(--shade);
  border: solid 0.2rem var(--color-brdr-primary);
  border-radius: 0.3rem;
  position: relative;
  transition: all 0.3s ease-out;
}

.ui-field.--split-button .ui-field-body.--disabled {
  box-shadow: none;
}

.ui-field.--split-button .ui-field__button {
  padding: 1rem 6rem 1rem 3rem;
  font-size: 1.6rem;
  font-weight: 400;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  text-decoration: none;
  text-align: left;
  transition: all 0.2s ease-out;
  border: none;
  outline: none;
  cursor: pointer;
  user-select: none;
  flex-grow: 1;
  position: relative;
}

.ui-field.--split-button .ui-field__button:disabled {
  opacity: 0.5;
  cursor: default;
  border-color: var(--color-brdr-primary);
}

.ui-field.--split-button .ui-field__button:focus {
  border-color: var(--dim-brdr-primary);
}

.ui-field.--split-button .ui-badge {
  top: calc(50% - 1.5rem);
  right: 5rem;
}

.ui-field.--split-button .ui-field-menu {
  width: 4rem;
  border-left: solid 0.1rem var(--color-brdr-quarternary);
  cursor: pointer;
  flex-shrink: 0;
}

.ui-field.--split-button .ui-field-body.--disabled .ui-field-menu {
  cursor: default;
}

.ui-field.--split-button .ui-field__caret {
  content: '';
  width: 100%;
  height: 100%;
  display: block;
  background: url('../../assets/images/icon-cheveron-down.svg') center center no-repeat;
  background-size: 2.4rem;
  opacity: 0.5;
  transition: transform 0.2s ease-out;
}

.ui-field.--split-button .ui-field-body.--open {
  border-color: var(--dim-brdr-primary);
}

.ui-field.--split-button .ui-field-body.--open .ui-field__caret {
  transform: rotate(180deg);
  opacity: 1;
}

/* .ui-split-button-balloon {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: var(--color-bg-primary);
  z-index: 100;
  border-radius: 0.4rem;
  border: solid 0.2rem var(--dim-brdr-primary);
  box-shadow: 0 0.2rem 0.4rem rgba(0,0,0,0.1);
  overflow: auto;
  user-select: none;
  max-height: 30rem;
} */

@media (hover: hover) and (pointer: fine) {
  .ui-field.--split-button .ui-field-body:not(.--disabled):not(.--open):hover {
    border-color: var(--hilite-brdr-primary);
  }

  .ui-field.--split-button .ui-field-body:not(.--disabled) .ui-field-menu:hover {
    background-color: var(--hilite-bg-primary);
  }

  .ui-field.--split-button .ui-field-body:not(.--disabled) .ui-field-menu:hover .ui-field__caret {
    filter: invert(100%);
    opacity: 1;
  }
}
</style>