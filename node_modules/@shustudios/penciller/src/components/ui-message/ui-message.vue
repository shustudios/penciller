<template>
  <div
    :class="messageClass"
    v-html="value.message"
  />
</template>

<script>
export default {
  name: 'ui-message',
  props: {
    value: Object,
  },
  computed: {
    messageClass () {
      let output = 'ui-message'

      if (this.value !== null) {
        if (this.value.type) {
          output += ' --' + this.value.type
        }
      }

      return output
    }
  }
}
</script>

<style>
.ui-message {
  margin: 0.4rem 0 0 0;
  padding: 0.4rem 0.6rem;
  border-radius: 0.3rem;
  display: none;
  justify-content: center;
  align-items: center;
  font-family: sans-serif;
  font-size: 1.3rem;
  animation: ui-message-open 0.3s ease-in-out;
  z-index:1;
  background-color: var(--color-text-secondary);
  color: var(--color-text-inverted);
}

.ui-message .ui-code:before,
.ui-message .ui-code:after {
  content: "'";
}

.ui-message.--error {
  display: block;
  background-color: var(--dim-bg-primary);
}

.ui-message.--restricted {
  display: block;
  background-color: var(--dim-bg-primary);
}

@keyframes ui-message-open {
  0% { transform: scale(1,1); }
  40% { transform: scale(1.05, 1.05); }
  75% { transform: scale(0.95, 0.95); }
  100% { transform: scale(1, 1); }
}
</style>