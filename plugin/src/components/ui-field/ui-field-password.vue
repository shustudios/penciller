<template>
  <div :class="bodyClass">
    <input
      ref="input"
      class="ui-field__input"
      :type="localType"
      :name="name"
      :disabled="localDisabled"
      :value="localValue"
      :maxlength="maxlength"
      @input="handleInput"
      v-bind="$attrs"
    />
    <a
      :class="generateClass"
      @click="handleGenerate"
      v-if="localGenerate"
    />
    <a
      class="ui-field__icon"
      :class="'--' + localType"
      @click="handleClick"
      v-if="localMask !== null"
    />
  </div>
</template>

<script>
import UiFieldCore from '../../mixins/ui-field-core.js'

export default {
  name: 'ui-field-password',
  inheritAttrs: false,
  props: {
    form: Object,
    fieldValue: String,
    label: String,
    name: String,
    disabled: [String, Boolean],
    generate: [String, Boolean],
    maxlength: [ String, Number ],
    options: [Object, Array],
    mask: {
      type: [String, Boolean],
      default: () => true
    },
    focus: [String, Boolean],
    select: [String, Boolean],
    balloon: Object,
    rules: {
        type: Array,
        default: () => ['required', 'password']
    }
  },
  mixins: [UiFieldCore],
  data () {
    return {
      processing: false,
      localType: 'password',
    }
  },
  watch: {
    mask () {
      this.localType = this.getType()
    },
    fieldValue () {
      this.processing = false
    }
  },
  computed: {
    localGenerate () {
      return this.$penciller.utils.isTrue(this.generate)
    },
    localMask () {
      let output = this.$penciller.utils.isTrue(this.mask)

      if (this.localGenerate) {
        output = false
      }

      return output
    },
    generateClass () {
      let output = 'ui-field__icon --generate'
        
      if (this.processing === true) {
        output += ' --processing'
      }

      return output
    },
  },
  methods: {
    afterMount () {
      this.localType = this.getType()
    },
    getType () {
      let output = 'password'

      if (!this.localMask) {
        output = 'text'
      }

      return output
    },
    toggleType () {
      if (this.localType === 'password') {
        this.localType = 'text'
      } else {
        this.localType = 'password'
      }
    },
    handleInput (e) {
      let newValue = e.currentTarget.value
      this.$emit('input', newValue, e)
    },
    handleGenerate (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      this.processing = true
      this.$emit('start')
    },
    handleClick (e) {
      if (this.localDisabled) { return }
      e.preventDefault()

      this.toggleType()
    },
  }
}
</script>

<style>
.ui-field.--password .ui-field-body {
  display: flex;
  border: solid 0.2rem var(--color-brdr-primary);
  border-radius: 0.4rem;
  transition: all 0.3s ease-out;
  background: var(--color-bg-primary);
}

.ui-field.--password .ui-field__input {
  font-size: 1.6rem;
  padding: 1rem;
  border: none;
  color: var(--color-text-primary);
  background-color: transparent;
  outline: none;
  display: block;
  width: 100%;
}

.ui-field.--password .ui-field__input::-ms-reveal {
  display: none
}

.ui-field.--password .ui-field__input::placeholder {
  color: var(--color-text-tertiary);
}

.ui-field.--password .ui-field-body.--focused {
  border-color: var(--dim-brdr-primary);
}

.ui-field.--password .ui-field-body.--disabled {
  opacity: 0.5;
}

.ui-field.--password .ui-field-body.--disabled .ui-field__icon {
  cursor: default;
}

.ui-field.--password .ui-field__icon {
  display: block;
  flex: 0 0 4rem;
  background-position: center center;
  background-repeat: no-repeat;
  background-size: 2.4rem;
  cursor: pointer;
  opacity: 0.3;
}

.ui-field.--password .ui-field__icon.--generate {
  background-image: url('../../assets/images/icon-reload.svg');
  transform: rotate(0deg);
}

.ui-field.--password .ui-field__icon.--text {
  background-image: url('../../assets/images/icon-view.svg');
  margin-right: 0.5rem
}

.ui-field.--password .ui-field__icon.--password {
  background-image: url('../../assets/images/icon-hide.svg');
  margin-right: 0.5rem
}

.ui-field.--password .ui-field__icon.--generate.--processing {
  animation: ui-password-processing 2s linear infinite;
  transition: none;
}

@media (hover: hover) and (pointer: fine) {
  .ui-field.--password .ui-field-body:not(.--disabled):not(.--focused):hover {
    border-color: var(--hilite-brdr-primary);
  }

  .ui-field.--password .ui-field-body:not(.--disabled) .ui-field__icon:hover {
    opacity: 0.7;
  }
}

@keyframes ui-password-processing {
  0% { transform: rotate(0deg) }
  100% { transform: rotate(-360deg) }
}
</style>