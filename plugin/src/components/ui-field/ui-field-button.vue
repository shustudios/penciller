<template>
  <button
    type="button"
    :class="'ui-field__button'"
    :disabled="localDisabled"
    @click="$emit('click', $event)"
    v-html="localLabel"
  />
</template>

<script>
import UiFieldCore from '../../mixins/ui-field-core.js'

export default {
  name: 'ui-field-button',
  inheritAttrs: false,
  emits: ['click'],
  props: {
    form: Object,
    name: String,
    disabled: [String, Boolean],
    label: String,
  },
  mixins: [UiFieldCore],
  computed: {
    localLabel: {
      get () {
        return this.label
      },
      set (newValue) {
        return newValue
      }
    },
  },
}
</script>

<style>
.ui-field.--button {
  display: inline-block;
}

.ui-field.--button .ui-field__button {
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

.ui-field.--button .ui-field__button:disabled {
  cursor: default;
  box-shadow: none;
  opacity: 0.5;
}

.ui-field.--button .ui-field__button:focus {
  border-color: var(--dim-brdr-primary);
}

.ui-field.--button .ui-field__button:active:not(:disabled) {
  transition: none;
  border-color: var(--color-active);
  box-shadow: none;
}

@media (hover: hover) and (pointer: fine) {
  .ui-field.--button:hover .ui-field__button:not(:disabled):not(:active):not(:focus) {
    border-color: var(--hilite-brdr-primary);
  }
}
</style>