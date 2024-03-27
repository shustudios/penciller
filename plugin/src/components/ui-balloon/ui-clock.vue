<template>
  <div
    ref="clock"
    class="ui-clock"
    @click.stop
  >
    <div ref="face" class="ui-clock-face">
      <div class="ui-clock-hours">
        <div
          :class="hourClass(item.label)"
          v-for="(item, idx) in hourItems"
          :key="'hr' + idx"
          :style="'top: ' + item.t + 'px; left: ' + item.l + 'px; z-index:1'"
          @click="handleHour(item.label)"
        >
          <div class="ui-clock-label --sub" :data-label="item.label" v-if="item.sub" />
          <div class="ui-clock-label" v-else>{{ item.label }}</div>
        </div>
      </div>

      <div class="ui-clock-minutes">
        <div
          :class="minuteClass(item.label)"
          v-for="(item, idx) in minuteItems"
          :key="'min' + idx"
          :style="'top: ' + item.t + 'px; left: ' + item.l + 'px; transform: rotate(' + ((360/60)*idx) + 'deg);'"
          @click="handleMinute(item.label)"
        >
          <div class="ui-clock-label --sub" :style="'transform: rotate(-' + ((360/60)*idx) + 'deg);'" :data-label="item.label" v-if="item.sub" />
          <div class="ui-clock-label" v-else>{{ item.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ui-clock',
  emits: [
    'hour',
    'minute'
  ],
  props: {
    hour: [String, Number],
    hourStep: Number,
    minute: [String, Number],
    minuteStep: Number,
    labels: Boolean,
    military: Boolean,
    parent: null,
  },
  data () {
    return {
      open: false,
    }
  },
  computed: {
    hourIncrement () {
      return Math.round(this.hourStep)
    },
    minuteIncrement () {
      return Math.round(this.minuteStep)
    },
    hourItems () {
      let output = []
      let radius = (this.parent.clientWidth - 90) / 2
      let count = this.military ? 24 : 12
      let offset = count / (4 * this.hourIncrement)

      count = count / this.hourIncrement

      for (let i=0; i<count; i++) {
        let l = radius * Math.cos(2 * Math.PI * (i - offset) / count)
        let t = radius * Math.sin(2 * Math.PI * (i - offset) / count)
        let sub = ((i % offset) !== 0)
        let label = i * this.hourIncrement

        if (this.labels) {
          sub = false
        }
        
        if (label === 0) {
          label = count * this.hourIncrement
        }

        output.push({ label, sub, t, l })
      }

      return output
    },
    minuteItems () {
      let output = []
      let radius = (this.parent.clientWidth - 26) / 2
      let count = 60 / this.minuteIncrement
      let offset = 15 / this.minuteIncrement

      for (let i=0; i<count; i++) {
        let l = radius * Math.cos(2 * Math.PI * (i - offset) / count)
        let t = radius * Math.sin(2 * Math.PI * (i - offset) / count)
        let n = i * this.minuteIncrement

        if (n < 10) { n = '0' + n }

        output.push({ label:n, sub:true, t, l })
      }

      return output
    },
  },
  methods: {
    hourClass (h) {
      let output = 'ui-clock-hour'
      let hour = this.hour

      if (!this.military && hour > 12) {
        hour = hour - 12
      }

      if (hour == Number(h)) {
        output += ' --selected'
      }

      return output
    },
    minuteClass (m) {
      let output = 'ui-clock-minute'

      if (this.minute == Number(m) && this.minute !== '') {
        output += ' --selected'
      }

      return output
    },
    handleHour (newValue) {
      this.$emit('hour', String(newValue))
    },
    handleMinute (newValue) {
      this.$emit('minute', String(newValue))
    }
  },
  mounted () {
    if (this.$refs.face) {
      this.$nextTick(() => { // bug fix for observer
        this.$refs.face.style.paddingBottom = '100%'
      })
    }
  }
}
</script>
<style>
.ui-clock {
  background-color: var(--color-bg-primary);
  border-radius: 0.4rem;
  border: solid 0.2rem var(--dim-brdr-primary);
  box-shadow: 0.2rem 0.2rem var(--shade);
  overflow: auto;
  user-select: none;
  padding: 1rem;
  overflow: hidden;
  color: var(--color-text-primary);
  cursor: pointer;
}

.ui-clock-face {
  width: 100%;
  border-radius: 100%;
  counter-increment: hour;
  position: relative;
}

.ui-clock-hours {
  position: absolute;
  top: calc(50% - 1.5rem);
  left: calc(50% - 1.5rem);
  width: 100%;
  height: 100%;
  border-radius: 100%;
}

.ui-clock-hour {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 3rem;
  height: 3rem;
  border-radius: 100%;
}

.ui-clock-minutes {
  position: absolute;
  top: calc(50% - 1.5rem);
  left: calc(50% - 0.4rem);
  width: 100%;
  height: 100%;
  border-radius: 100%;
}

.ui-clock-minute {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 0.8rem;
  height: 3rem;
}

.ui-clock-label {
  font-size: 1.6rem;
  width: 2.6rem;
  height: 2.6rem;
  padding: 0.4rem;
  border-radius: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

.ui-clock-label.--sub:after {
  content: '';
  display: block;
  width: 0.4rem;
  height: 0.4rem;
  background-color: var(--color-text-secondary);
  border-radius: 100%;
}

.ui-clock-minute:hover {
  z-index: 2;
}

.ui-clock-hour.--selected,
.ui-clock-minute.--selected {
  z-index: 99;
}

.ui-clock-hour.--selected .ui-clock-label,
.ui-clock-minute.--selected .ui-clock-label {
  background-color: var(--color-bg-secondary);
}

.ui-clock-hour:hover:not(.--selected),
.ui-clock-minute:hover:not(.--selected) {
  z-index: 100;
}

.ui-clock-hour:hover:not(.--selected) .ui-clock-label,
.ui-clock-minute:hover:not(.--selected) .ui-clock-label {
  background-color: var(--hilite-bg-primary);
  color: var(--color-text-inverted);
}

.ui-clock-hour.--selected .ui-clock-label.--sub:before,
.ui-clock-minute.--selected .ui-clock-label.--sub:before,
.ui-clock-hour:hover .ui-clock-label.--sub:before,
.ui-clock-minute:hover .ui-clock-label.--sub:before {
  content: attr(data-label);
  width: 2.4rem;
  height: 2.4rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.ui-clock-hour.--selected .ui-clock-label.--sub:after,
.ui-clock-minute.--selected .ui-clock-label.--sub:after,
.ui-clock-hour:hover .ui-clock-label.--sub:after,
.ui-clock-minute:hover .ui-clock-label.--sub:after {
  display: none;
}
</style>