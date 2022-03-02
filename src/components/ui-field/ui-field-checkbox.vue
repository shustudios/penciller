<template>
  <div
    :class="bodyClass"
    :name="name"
    :disabled="localDisabled"
    :tabindex="$attrs.tabindex || 0"
    v-bind="$attrs"
    @keydown.space="handleInput"
    @click="handleInput"
  >
    <div class="ui-field__icon" />
    <label
      :for="$attrs.id"
      class="ui-field__label"
      v-html="label"
    />
  </div>
</template>

<script>
import UiFieldCore from '../../mixins/ui-field-core.js'

export default {
  name: 'ui-field-checkbox',
  inheritAttrs: false,
  props: {
    form: Object,
    value: String,
    name: String,
    disabled: [String, Boolean],
    checked: [String, Boolean],
    rules: Array,
    label: String,
  },
  mixins: [UiFieldCore],
  data: function() {
    return {
      defaultValue: this.value || 'on',
      defaultChecked: this.checked,
      localChecked: this.isTrue(this.checked),
    }
  },
  watch: {
    checked: function (newValue) {
      this.localChecked = this.isTrue(newValue)
      this.localValue = newValue ? this.value : ''
    }
  },
  computed: {
    localValue: {
      get: function () {
        return this.localChecked ? this.defaultValue : ''
      },
      set: function(newValue) {
        return newValue
      }
    },
  },
  methods: {
    toggleChecked: function (e) {
      if (this.localChecked) {
        this.localChecked = false
        this.localValue = ''
      } else {
        this.localChecked = true
        this.localValue = this.defaultValue
      }

      this.$emit('click', e, this.$parent)
      this.$emit('check', this.localChecked)
    },
    handleInput: function (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      this.toggleChecked(e)
    }
  }
}
</script>

<style>
.ui-field.--checkbox .ui-field-body {
  cursor: pointer;
  position: relative;
  outline: none;
  display: flex;
  user-select: none;
  transition: all 0.3s ease-out;
}

.ui-field.--checkbox .ui-field__icon {
  width: 2rem;
  height: 2rem;
  border-radius: 0.3rem;
  border: solid 0.2rem var(--color-brdr-primary);
  transition: border 0.2s ease-out;
  background-color: var(--color-bg-primary);
  background-position: center center;
  background-repeat: no-repeat;
  background-size: 2.2rem;
  flex-shrink: 0;
}

.ui-field.--checkbox .ui-field-body.--checked .ui-field__icon {
  background-image: url('../../assets/images/icon-check.svg')
}

.ui-field.--checkbox .ui-field-body.--disabled {
  opacity: 0.5;
}

.ui-field.--checkbox .ui-field-body.--disabled,
.ui-field.--checkbox .ui-field-body.--disabled .ui-field__label {
  cursor: default;
}

.ui-field.--checkbox .ui-field__label {
  margin: 0 2rem 0 1rem;
  display: block;
  cursor: pointer;
  font-size: 1.6rem;
  color: var(--color-text-primary);
}

.ui-field.--checkbox .ui-field-body:not(.--disabled):focus .ui-field__icon {
  border-color: var(--dim-brdr-primary);
}

@media (hover: hover) and (pointer: fine) {
  .ui-field.--checkbox .ui-field-body:not(.--disabled):hover .ui-field__icon {
    border-color: var(--hilite-brdr-primary);
  }
}
</style>