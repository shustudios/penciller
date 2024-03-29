<template>
  <div
    class="ui-field --submit"
  >
    <div
      class="ui-field-outergroup"
    >
      <ui-badge
        :key="badgeKey"
        :badge="localBadge"
        v-if="localBadge"
        @click="showDialog"
      />
      <button
        ref="input"
        type="submit"
        :class="'ui-field__button'"
        :disabled="localDisabled"
      >
        {{ label }}
      </button>
    </div>
  </div>
</template>

<script>
import UiBadge from '../ui-badge/ui-badge.vue'

export default {
  name: 'ui-submit',
  emits: ['click'],
  props: {
    label: String,
    badge: Object,
    noisy: [String, Boolean],
    disabled: Boolean,
  },
  components: {
    UiBadge,
  },
  data () {
    return {
      badgeKey: 0,
      form: this.getFormComponent(this),
      localBadge: this.badge,
      localDisabled: this.disabled,
      defaultDisabled: (this.disabled === 'true' || this.disabled === true),
    }
  },
  computed: {
    localNoisy: {
      get () {
        if (this.noisy === true || this.noisy === 'true') {
          return true
        } else {
          return false
        }
      },
      set (newValue) {
        return newValue
      }
    },
  },
  watch: {
    disabled (newValue) {
      this.localDisabled = newValue
    }
  },
  methods: {
    showDialog () {
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
        if (component.$parent.$options.name) {
          if (component.$parent.$options.name === 'ui-form') {
            return component.$parent
          }
        } else if (component.$parent.$options._componentTag) {
          if (component.$parent.$options._componentTag === 'ui-form') {
            return component.$parent
          } else {
            return this.getFormComponent(component.$parent)
          }
        }
      }
    },
    focus () {
      if (this.$refs.input) {
        this.$refs.input.focus()
      }
    },
    blur () {
      if (this.$refs.input) {
        this.$refs.input.blur()
      }
    },
  },
  mounted () {
    if (this.form) { this.form.register(this) }
  },
  beforeDestroy () {
    if (this.form) { this.form.unRegister(this) }
  }
}
</script>

<style>
.ui-field.--submit .ui-field__button {
  display: inline-block;
  padding: 1rem 3rem;
  border-radius: 0.3rem;
  font-size: 1.6rem;
  font-weight: 400;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  text-decoration: none;
  text-align: center;
  transition: all 0.2s ease-out;
  border: solid 0.2rem var(--color-brdr-primary);
  outline: none;
  cursor: pointer;
  user-select: none;
  box-shadow: 0.2rem 0.2rem var(--shade);
  width: 100%;
}

.ui-field.--submit .ui-field__button:disabled {
  opacity: 0.5;
  cursor: default;
  box-shadow: none;
}

.ui-field.--submit .ui-field__button:focus {
  border-color: var(--dim-brdr-primary);
}

@media (hover: hover) and (pointer: fine) {
  .ui-field.--submit .ui-field__button:not(:disabled):not(:focus):hover {
    border-color: var(--hilite-brdr-primary);
  }
}
</style>