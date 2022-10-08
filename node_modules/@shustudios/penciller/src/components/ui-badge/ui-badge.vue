<template>
  <div
    :class="badgeClass"
    @click="$emit('click', badge)"
  >
    <svg
      class="ui-badge-progress"
      width="28"
      height="28"
      v-if="hasSpinner"
    >
      <circle
        class="ui-badge-progress__icon"
        cx="11"
        cy="11"
        r="11"
        stroke-width="2.7"
        :style="lineStyle"
      />
    </svg>
  </div>
</template>

<script>
export default {
  name: 'ui-badge',
  emits: ['click'],
  props: {
    badge: Object,
  },
  computed: {
    hasSpinner () {
      let output = false

      if (!this.$penciller.utils.isUndefined(this.badge)) {
        if (this.badge.type == 'wait' || this.badge.type === 'progress') {
          output = true
        }
      }

      return output
    },
    lineStyle () {
      let output = ''
      let amt = this.badge.progress

      if (!isNaN(amt) ) {
        if (amt < 1) { amt = 1 }
        if (amt > 100) { amt = 100 }

        output = {
          strokeDashoffset: 67 - ((this.badge.progress/100) * 67),
        }
      }

      return output
    },
    badgeClass () {
      let output = 'ui-badge'

      if (!this.$penciller.utils.isUndefined(this.badge)) {
        if (this.badge.type) {
          output += ' --' + this.badge.type
        }
      }

      return output
    }
  }
}
</script>

<style>
.ui-badge {
  position: absolute;
  top: -1rem;
  right: -1rem;
  width: 3rem;
  height: 3rem;
  padding: 0.2rem;
  border-radius: 100%;
  color: var(--color-text-inverted);
  background-color: var(--dim-bg-primary);
  border: solid 0.3rem var(--color-bg-primary);
  display: none;
  justify-content: center;
  align-items: center;
  font-family: sans-serif;
  cursor: pointer;
  transition: transform 0.2s ease-out;
  animation: ui-badge-open 0.3s ease-in-out;
  z-index:10;
}

.ui-badge.--error {
  display: flex;
}

.ui-badge.--error:after {
  content: '';
  width: 100%;
  height: 100%;
  display: block;
  background: url('../../assets/images/icon-exclaim.svg') center center no-repeat;
  background-size: 80%;
}

.ui-badge.--restricted {
  display: flex;
}

.ui-badge.--restricted:after {
  content: '';
  width: 100%;
  height: 100%;
  display: block;
  background: url('../../assets/images/icon-minus.svg') center center no-repeat;
  background-size: 90%;
  filter: invert(100%);
}

.ui-badge.--ok {
  display: block;
  animation: ui-badge-pulse 4s infinite ease-in-out 2s;
}

.ui-badge.--ok:after {
  content: '';
  width: 100%;
  height: 100%;
  display: block;
  background: url('../../assets/images/icon-check.svg') center center no-repeat;
  background-size: 2.4rem;
  filter: invert(100%);
}

.ui-badge.--timeout {
  background: var(--dim-bg-primary) url('../../assets/images/icon-error.svg') center center no-repeat;
  background-size: contain;
  display: block;
  animation: ui-badge-pulse 4s infinite ease-in-out 2s;
}

.ui-badge.--wait {
  background-color: var(--color-bg-primary);
  display: block;
  cursor: default;
  animation: ui-badge-spin 2s infinite linear;
}

.ui-badge.--progress {
  background-color: var(--color-bg-primary);
  display: block;
  cursor: default;
  transform: rotate(-90deg);
}

.ui-badge-progress {
  margin: -0.1rem 0 0 -0.1rem;
  overflow: visible;
}

.ui-badge-progress__icon {
  stroke: var(--dim-bg-primary);
  fill: var(--color-bg-primary);
  stroke-dasharray: 67;
  stroke-dashoffset: 0;
  stroke-linecap: round;
}

.ui-badge.--wait .ui-badge-progress__icon {
  animation: ui-badge-worm 2s infinite ease-out;
}

.ui-badge.--progress .ui-badge-progress__icon {
  stroke-dasharray: 67;
  stroke-dashoffset: -67;
  stroke: var(--color-go);
}

@media (hover: hover) and (pointer: fine) {
  .ui-badge:not(.--progress):hover {
    transform: scale(1.25,1.25);
  }
}

@keyframes ui-badge-open {
  0% { transform: scale(1,1); }
  40% { transform: scale(1.3,1.3); }
  75% { transform: scale(0.95,0.95); }
  100% { transform: scale(1,1); }
}

@keyframes ui-badge-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(359deg); }
}

@keyframes ui-badge-pulse {
  0% { transform: scale(1,1); }
  4% { transform: scale(1.25,1.25); }
  8% { transform: scale(1,1); }
  12% { transform: scale(1.25,1.25); }
  16% { transform: scale(1,1); }
  100% { transform: scale(1,1); }
}

@keyframes ui-badge-worm {
  0% { stroke-dasharray: 67; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 67; stroke-dashoffset: -67; }
  100% { stroke-dasharray: 67; stroke-dashoffset: -134; }
}
</style>