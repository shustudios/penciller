<template>
  <div :class="bodyClass">
    <div
      class="ui-field__label --start"
      v-if="localStartLabel"
      v-html="localStartLabel"
    />
    <div ref="group" class="ui-field-group">
      <div
        ref="scrubber"
        class="ui-field__scrubber"
        :style="{ opacity: (localValue === null) ? 0:1 }"
        @mousedown="handleMouseDown"
      />
      <div
        class="ui-field__marker --start"
        @click="handleClick($event, 0)"
      />
      <div
        class="ui-field__marker"
        v-for="(preset, idx) in presets"
        :key="'preset_' + idx"
        :style="markerPosition(preset)"
        @click="handleClick($event, preset)"
      />
      <div class="ui-field__gutter" />
      <div
        class="ui-field__marker --end"
        @click="handleClick($event, 1)"
      />
    </div>
    <div
      class="ui-field__label --end"
      v-if="localEndLabel"
      v-html="localEndLabel"
    />
  </div>
</template>

<script>
import UiFieldCore from '../../mixins/ui-field-core.js'

export default {
  name: 'ui-field-slider',
  props: {
    form: Object,
    startLabel: String,
    endLabel: String,
    disabled: [String, Boolean],
    fieldValue: Number,
    name: String,
    presets: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  mixins: [UiFieldCore],
  data () {
    return {
      slide: null,
      isDown: false,
      lastValue: 0,
    }
  },
  computed: {
    localValue: {
      get () {
        return this.fieldValue
      },
      set (newValue) {
        if (!newValue) { newValue = 0 }
        this.$emit('input', newValue)
        return newValue
      }
    },
    localStartLabel () {
      return this.startLabel
    },
    localEndLabel () {
      return this.endLabel
    },
    bodyClass () {
      let output = 'ui-field-body'

      if (this.localDisabled) { output += ' --disabled' }
      if (this.isDown) { output += ' --down' }

      return output
    }
  },
  watch: {
    localValue (newValue) {
      this.slideTo(newValue, true)
    }
  },
  methods: {
    startSlide (e) {
      if (this.localDisabled) { return }
      
      if (e.button === 0) {
        this.isDown = true
        this.slide = {
          target: e.currentTarget,
          startX: e.clientX,
          offsetX: e.currentTarget.offsetLeft
        }

        this.$parent.$emit('start')
        window.addEventListener('mousemove', this.doSlide)
      }
    },
    doSlide (e) {
      let containerRec = this.slide.target.parentNode.getBoundingClientRect()
      let targetRec = this.slide.target.getBoundingClientRect()
      let x = e.clientX - this.slide.startX + this.slide.offsetX

      if (x < 0) { x = 0 }
      if (x > (containerRec.width - targetRec.width)) {
        x = (containerRec.width - targetRec.width)
      }

      let value = x / (containerRec.width - targetRec.width)

      this.slide.target.style.left = x + 'px'
      this.$emit('input', value)
    },
    stopSlide () {
      this.$emit('stop')
      this.isDown = false
      this.slide = null
      window.removeEventListener('mousemove', this.doSlide)
    },
    slideTo (value, skipEmit) {
      if (this.localDisabled) { return }

      let scrubber = this.$refs.scrubber

      if (scrubber) {
        let containerRec = scrubber.parentNode.getBoundingClientRect()
        let scrubberRec = scrubber.getBoundingClientRect()

        let x = (containerRec.width - scrubberRec.width) * value

        this.localValue = value
        scrubber.style.left = x + 'px'

        if (!skipEmit) {
          this.$emit('input', value)
        }
      }
    },
    markerPosition (preset) {
      let scrubber = this.$refs.scrubber
      let output = ''

      if (scrubber) {
        let containerRec = scrubber.parentNode.getBoundingClientRect()
        let scrubberRec = scrubber.getBoundingClientRect()

        output = {
          left: ((containerRec.width - scrubberRec.width) * preset) + 'px'
        }
      }

      return output
    },
    handleClick (e, amt) {
      if (this.localDisabled) { return }
      e.preventDefault()

      this.slideTo(amt)
    },
    handleMouseDown (e) {
      if (this.localDisabled) { return }
      e.preventDefault()
      
      this.startSlide(e)
    },
    handleResize () {
      this.slideTo(this.localValue, true)
      this.$forceUpdate()
    }
  },
  mounted () {
    if (this.form) { this.form.register(this) }

    if (typeof document === 'object') {
      window.addEventListener('mouseup', this.stopSlide)
      this.resizeObserver = new ResizeObserver(this.handleResize)
      this.resizeObserver.observe(this.$refs.group)
    }

    this.slideTo(this.localValue)
    this.$nextTick(this.$forceUpdate)
  },
  beforeDestroy () {
    if (this.form) { this.form.unRegister(this) }

    if (typeof document === 'object') {
      window.removeEventListener('mouseup', this.stopSlide)
      this.resizeObserver.disconnect()
    }
  }
}
</script>

<style>
.ui-field.--slider .ui-field-body {
  user-select: none;
  display: flex;
  align-items: center;
  width: 100%;
}

.ui-field.--slider .ui-field-body.--disabled {
  opacity: 0.5;
}

.ui-field.--slider .ui-field-body:not(.--disabled) .ui-field__marker,
.ui-field.--slider .ui-field-body:not(.--disabled) .ui-field__scrubber {
  cursor: pointer;
}

.ui-field.--slider .ui-field__label {
  width: auto;
  display: block;
}

.ui-field.--slider .ui-field__label.--start {
  text-align: right;
  margin-right: 1rem;
}

.ui-field.--slider .ui-field__label.--end {
  margin-left: 1rem;
}

.ui-field.--slider .ui-field-group {
  height: 1.2rem;
  position: relative;
  flex-grow: 1;
  width: 100%;
}

.ui-field.--slider .ui-field__marker {
  width: 0.9rem;
  height: 1.2rem;
  position: absolute;
  top: 0;
  z-index: 1;
}

.ui-field.--slider .ui-field__marker:not(.--start):not(.--end) {
  animation: ui-field--marker 0.3s ease-out;
}

.ui-field.--slider .ui-field__marker.--start {
  left: -0.5rem;
}

.ui-field.--slider .ui-field__marker.--end {
  right: -0.5rem;
}

.ui-field.--slider .ui-field__marker:before {
  content: '';
  width: 0.2rem;
  height: 100%;
  position: absolute;
  display: block;
  top: 0;
  left: calc(50% - 0.1rem);
  background-color: var(--color-brdr-primary);
}

.ui-field.--slider .ui-field__marker:after {
  content: '';
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 100%;
  position: absolute;
  display: block;
  margin: 0 auto;
  top: calc(50% - 0.9rem);
  left: calc(50% - 1rem);
}

.ui-field.--slider .ui-field__marker:not(.--start):not(.--end):before {
  width: 0.9rem;
  height: 0.9rem;
  top: 0.1rem;
  left: calc(50% - 0.4rem);
  border-radius: 100%;
  background-color: var(--color-brdr-primary);
}

.ui-field.--slider .ui-field__gutter {
  height: 1.2rem;
  position: relative;
}

.ui-field.--slider .ui-field__gutter:after {
  content: '';
  background-color: var(--color-brdr-primary);
  position: absolute;
  top: calc(50% - 0.1rem);
  left: 0;
  height: 0.2rem;
  width: 100%;
}

.ui-field.--slider .ui-field-body.--down .ui-field__scrubber:after {
  opacity: 0.2;
  background-color: var(--dim-bg-primary);
}

.ui-field.--slider .ui-field__scrubber {
  width: 1.2rem;
  height: 1.2rem;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
}

.ui-field.--slider .ui-field__scrubber:before {
  content: '';
  background-color: var(--dim-brdr-primary);
  border-radius: 100%;
  height: 100%;
  width: 100%;
  display: block;
  position: absolute;
  top: calc(50% - 0.6rem);
  left: calc(50% - 0.6rem);
  z-index: 2;
}

.ui-field.--slider .ui-field__scrubber:after {
  content: '';
  opacity:0;
  border-radius: 100%;
  height: 3rem;
  width: 3rem;
  display: block;
  position: absolute;
  top: calc(50% - 1.5rem);
  left: calc(50% - 1.5rem);
  z-index: 1;
  transition: opacity 0.3s ease-out 0.2s;
}

@keyframes ui-field--marker {
  0% { opacity: 0 }
  100% { opacity: 1 }
}

@media (hover:hover) and (pointer:fine) {
  .ui-field.--slider .ui-field-body:not(.--disabled) .ui-field__scrubber:hover:after {
    opacity: 0.2;
    background-color: var(--dim-bg-primary);
  }

  .ui-field.--slider .ui-field-body:not(.--disabled) .ui-field__marker:hover:before {
    background-color: var(--dim-bg-primary);
  }
}
</style>