<template>
  <div
    :class="itemCSS"
    @dragenter="handleDragover"
    @dragover="handleDragover"
    @dragleave="handleDragleave"
    @drop="handleDrop"
  >{{id}}
  </div>
</template>

<script>
export default {
  name: 'ui-task-drop',
  emits: ['drop'],
  props: {
    id: String,
  },
  data () {
    return {
      over: false,
    }
  },
  computed: {
    itemCSS: {
      get () {
        let output = 'ui-task__drop'

        if (this.over) {
          output += ' --over'
        }

        return output
      },
      set (newValue) {
        return newValue
      }
    }
  },
  methods: {
    handleDrop () {
      if (this.isValidMove()) {
        this.$emit('drop')
        this.over = false
      }
    },
    handleDragover (e) {
      e.preventDefault()

      if (this.isValidMove()) {
        this.over = true
      }
    },
    handleDragout () {
      this.over = false
    },
    handleDragleave () {
      this.over = false
    },
    isValidMove () {
      return true
    }
  }
}
</script>

<style scoped>
.ui-task__drop {
  height: 2.5rem;
  position: relative;
  opacity: 0;
  margin: -0.75rem 0;
}

.ui-task__drop:before {
  content: '';
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 100%;
  position: absolute;
  top: calc(50% - 0.4rem);
  left: -0.9rem;
  border: solid 0.3rem var(--color-brdr-secondary);
}

.ui-task__drop:after {
  content: '';
  width: 100%;
  position: absolute;
  top: calc(50% - 0.1rem);
  left: 0;
  border-top: solid 0.3rem var(--color-brdr-secondary);
  display: block;
}

.ui-task__drop.--over {
  opacity: 1;
  transition: all 0.3s ease-out;
}
</style>