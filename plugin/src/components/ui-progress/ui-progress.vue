<template>
  <div class="ui-progress" :style="itemStyle">
    <div class="ui-progress__step --first" />
    <div class="ui-progress__step --middle" />
    <div class="ui-progress__step --last" />
  </div>
</template>

<script>
export default {
  name: 'ui-progress',
  props: {
    delay: [String, Number],
  },
  computed: {
    itemStyle: {
      get () {
        let output = ''

        if (!isNaN(this.delay)) {
          output = 'animation-delay:' + this.delay + 's'
        }

          return output
      },
      set (newValue) {
        return newValue
      }
    }
  }
}
</script>

<style>
.ui-progress {
  width: 4.8rem;
  height: 2rem;
  display: flex;
  opacity: 0;
  justify-content: space-between;
  align-items: center;
  animation: ui-progress-fade 0.6s ease-out forwards;
}

.ui-progress.--small {
  width: 2.4rem;
  height: 1rem;
}

.ui-progress__step {
  width: 25%;
  padding-top: 25%;
  background-color: var(--color-bg-inverted);
  border-radius: 100%;
  animation: ui-progress-pulse 2s infinite ease-out;
}

.ui-progress__step.--first {
  animation-delay: 0;
}

.ui-progress__step.--middle {
  animation-delay: 0.1s;
}

.ui-progress__step.--last {
  animation-delay: 0.2s;
}

@keyframes ui-progress-fade {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes ui-progress-pulse {
  0% { transform: translateY(0); }
  10% { transform: translateY(-100%); }
  20% { transform: translateY(0); }
}
</style>