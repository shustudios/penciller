<template>
  <div class="ui-field --submit">
    <div class="ui-field-outergroup">
      <ui-badge
        :key="badgeKey"
        v-model="localBadge"
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
  props: {
    label: String,
    badge: Object,
    noisy: [String, Boolean],
    disabled: Boolean,
  },
  components: {
    UiBadge,
  },
  data: function() {
    return {
      badgeKey: 0, // allows alert badge to reanimate,
      form: this.getFormComponent(this),
      localBadge: this.badge,
      localDisabled: this.disabled,
      defaultDisabled: (this.disabled === 'true' || this.disabled === true),
    }
  },
  computed: {
    localNoisy: {
      get: function () {
        if (this.noisy === true || this.noisy === 'true') {
          return true
        } else {
          return false
        }
      },
      set: function (newValue) {
        return newValue
      }
    },
  },
  watch: {
    disabled: function (newValue) {
      this.localDisabled = newValue
    }
  },
  methods: {
    showDialog: function () {
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
    getFormComponent: function (component) {
      if (component.$parent) {
        if (component.$parent.$options._componentTag === 'ui-form') {
          return component.$parent
        } else {
          return this.getFormComponent(component.$parent)
        }
      }
    },
    focus: function () {
      if (this.$refs.input) {
        this.$refs.input.focus()
      }
    },
    blur: function () {
      if (this.$refs.input) {
        this.$refs.input.blur()
      }
    },
  },
  mounted: function () {
    if (this.form) { this.form.register(this) }
  },
  beforeDestroy: function () {
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