<template>
  <div
    :class="itemCSS"
    @drop="handleDrop"
    @dragover="handleDragover"
    @dragenter="handleDragover"
    @dragleave="handleDragout"
  />
</template>

<script>
export default {
  name: 'UiTreeDroptarget',
  props: {
    droppedNodeID: Array,
    draggedNodeID: Array,
    above: Boolean,
  },
  data: function () {
    return {
      over: false,
      valid: true,
    }
  },
  computed: {
    itemCSS: {
      get: function () {
        let output = 'ui-tree-droptarget'

        if (this.over) {
          output += ' --over'
        }

        if (!this.valid) {
          output += ' --invalid'
        }

        return output
      },
      set: function (newValue) {
        return newValue
      }
    }
  },
  methods: {
    handleDrop: function () {
      this.over = false

      if (this.isValidMove()) {
        this.$emit('drop', [ ...this.draggedNodeID ], [ ...this.droppedNodeID ])
      }
    },
    handleDragover: function (e) {
      e.preventDefault()

      this.over = true

      if (this.isValidMove()) {
        this.valid = true
      } else {
        this.valid = false
      }
    },
    handleDragout: function () {
      this.over = false
    },
    isValidMove: function () {
      let output = true

      if (this.droppedNodeID.length > this.draggedNodeID.length) {
        if (this.droppedNodeID.join('.').indexOf(this.draggedNodeID.join('.')) === 0) {
          output = false
        }
      }

      return output
    }
  }
}
</script>

<style scoped>
.ui-tree-droptarget {
  height: 2rem;
  border-radius: 0.3rem;
  position: relative;
}

.ui-tree-droptarget:before {
  content: '';
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 100%;
  position: absolute;
  left: -0.9rem;
  top: calc(50% - 0.4rem);
  border: solid 0.3rem var(--color-brdr-secondary);
  opacity: 0;
}

.ui-tree-droptarget:after {
  content: '';
  height: 1rem;
  width: 100%;
  position: absolute;
  left: 0;
  top: calc(50% - 0.1rem);
  border-top: solid 0.3rem var(--color-brdr-secondary);
  display: block;
  opacity: 0;
}

.ui-tree-droptarget.--over:before,
.ui-tree-droptarget.--over:after {
  opacity: 1;
}

.ui-tree-droptarget.--over.--invalid:before,
.ui-tree-droptarget.--over.--invalid:after {
  border-color: var(--color-brdr-primary);
}
</style>