<template>
  <div
      :class="itemCSS"
  >
    <div
      class="ui-tree-label"
      :draggable="editable"
      @dragstart="handleDragstart"
      @dragend="handleDragend"
      @drop="handleDrop"
      @dragover="handleDragover"
      @dragenter="handleDragover"
      @dragleave="handleDragout"
      @click="$emit('select')"
    >
      <span class="ui-tree-label__text">{{ localLabel }}</span>
      <div class="ui-tree-label__btn" @click="$emit('add')" v-if="canAdd" />
      <ui-badge
        v-model="localAlert"
        v-if="localAlert"
        @click="handleAlert"
      />
    </div>
    <svg
      class="ui-tree-node__path"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
    >
      <path
        class="ui-tree-node__line"
        d="M 2 17 L 80 17"
        stroke="black"
        :stroke-width="2"
        fill="transparent"
      />
    </svg>
  </div>
</template>

<script>
import UiBadge from '../ui-badge/ui-badge.vue'

export default {
  name: 'ui-tree-node',
  emits: [
    'select',
    'add',
    'alert',
    'drag',
    'drop',
  ],
  props: {
    nodeID: Array,
    draggedNodeID: Array,
    droppedNodeID: Array,
    parentNode: null,
    label: String,
    alert: Object,
    editable: Boolean,
  },
  components: {
    UiBadge,
  },
  data () {
    return {
      strokeWidth: 2,
      borderWidth: 2,
      observer: null,
      over: false,
      drag: false,
      nodeElm: null,
      parentElm: null,
      pathElm: null,
      lineElm: null,
      droptargetElm: null,
      columnElm: null,
      parentColumnElm: null,
      valid: true,
    }
  },
  computed: {
    canAdd () {
      let output = false

      if (!this.alert && this.editable) {
        output = true
      }

      return output
    },
    itemCSS: {
      get () {
        let output = 'ui-tree-node'

        if (this.over) { output += ' --over' }
        if (this.drag) { output += ' --drag' }
        if (!this.valid) { output += ' --invalid' }

        return output
      },
      set (newValue) {
        return newValue
      }
    },
    localLabel: {
      get () {
          if (this.label) {
            return this.label
          } else {
            return 'Untitled'
          }
      },
      set (newValue) {
        return newValue
      }
    },
    localAlert: {
      get () {
        if (this.alert) {
          return this.alert
        } else {
          return null
        }
      },
      set (newValue) {
        return newValue
      }
    }
  },
  methods: {
    registerElements () {
      if (!this.$el) { return }

      let parentComponent = this.$parent.$parent.getParentNode(this.nodeID)

      if (parentComponent) {
        this.nodeElm = this.$el
        this.parentElm = parentComponent.$el
        this.columnElm = this.$el.parentElement.parentElement.parentElement
        this.parentColumnElm = parentComponent.$el.parentElement.parentElement.parentElement
        this.pathElm = this.nodeElm.getElementsByClassName('ui-tree-node__path')[0]
        this.lineElm = this.nodeElm.getElementsByClassName('ui-tree-node__line')[0]
        this.droptargetElm = this.nodeElm.parentElement.getElementsByClassName('ui-tree-droptarget')[0]

        this.renderPaths()
      }
    },
    renderPaths () {
      if (this.nodeElm && this.nodeElm.parentElement && this.parentElm && this.parentElm.parentElement) {
        let droptargetOffset = 0

        if (this.nodeID[this.nodeID.length-1] == 0) {    
          droptargetOffset = this.droptargetElm.offsetHeight
        }

        let nodeOffsetTop = this.nodeElm.parentElement.offsetTop + droptargetOffset
        let parentOffsetTop = this.parentElm.offsetTop + this.parentElm.parentElement.offsetTop + this.columnElm.scrollTop

        let nodeCenterPos = nodeOffsetTop + (this.nodeElm.offsetHeight / 2)
        let parentCenterPos = parentOffsetTop + (this.parentElm.offsetHeight / 2) - this.parentColumnElm.scrollTop
        let centerDiff = Math.max(nodeCenterPos, parentCenterPos) - Math.min(nodeCenterPos, parentCenterPos)

        let top = (this.nodeElm.offsetHeight / 2) - (this.strokeWidth/2)
        let height = parentCenterPos - nodeCenterPos + this.strokeWidth
        let width = this.nodeElm.parentElement.offsetLeft

        let startY = Math.round(this.strokeWidth / 2)
        let endY = Math.round(this.strokeWidth / 2)
        let bezX = Math.round(width / 2)

        if (nodeCenterPos > parentCenterPos) {
          top = (parentCenterPos - nodeOffsetTop) - (this.strokeWidth/2)
          height = Math.round(nodeOffsetTop + (this.nodeElm.offsetHeight / 2)) - parentCenterPos + this.strokeWidth
          endY = centerDiff
        } else {
          startY = centerDiff
        }

        if (startY < this.strokeWidth) { startY = this.strokeWidth/2 }
        if (endY < this.strokeWidth) { endY = this.strokeWidth/2 }

        this.pathElm.style.top = Math.round(top) + 'px'
        this.pathElm.style.right = '100%'
        this.pathElm.style.width = width + 'px'
        this.pathElm.style.height = Math.round(height) + 'px'

        let linepath = 'M 0 ' + startY + ' C ' + bezX + ' ' + startY + ', ' + bezX + ' ' + endY + ', ' + width + ' ' + endY
        this.lineElm.setAttributeNS(null, 'd', linepath)
      }

      // disable to use console.log
      this.observer = requestAnimationFrame(this.renderPaths)
    },
    handleDragstart () {
      this.drag = true
      this.$emit('drag', this.nodeID)
    },
    handleDragend () {
      this.drag = false
    },
    handleDragover (e) {
      e.preventDefault()

      this.over = true

      if (this.isValidMove()) {
        this.valid = true
      } else {
        this.valid = false
      }
    },
    handleDrop () {
      this.over = false

      if (this.isValidMove()) {
        this.$emit('drop', [ ...this.draggedNodeID ], [ ...this.droppedNodeID ])
      }
    },
    handleDragout () {
      this.over = false
    },
    handleAlert () {
      this.$emit('alert', this.alert)
    },
    isValidMove () {
      if (this.droppedNodeID.join('.').indexOf(this.draggedNodeID.join('.')) === 0) {
        return false
      } else {
        return true
      }
    }
  },
  mounted () {
    window.cancelAnimationFrame(this.observer);
    this.observer = undefined;

    this.$nextTick(this.registerElements)
  },
  updated () {
    window.cancelAnimationFrame(this.observer);
    this.observer = undefined;

    this.$nextTick(this.registerElements)
  },
  destroyed () {
    window.cancelAnimationFrame(this.observer);
    this.observer = undefined;
  },
}
</script>

<style>
.ui-tree-node {
  position: relative;
  user-select: none;
}

.ui-tree-label {
  border-radius: 0.5rem;
  border: solid 0.2rem var(--color-brdr-primary);
  background-color: var(--color-bg-primary);
  width: 16rem;
  font-size: 1.4rem;
  text-align: center;
  cursor:pointer;
  user-select: none;
  display: flex;
  position: relative;
}

.ui-tree-label:before {
  content: '';
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 100%;
  position: absolute;
  left: -0.9rem;
  top: calc(50% - 0.4rem);
  border: solid 0.3rem var(--color-brdr-secondary);
  background-color: var(--color-bg-primary);
  display: none;
  z-index: 2;
}

.ui-tree-label__text {
  flex-grow: 1;
  padding: 0.75rem 2rem;
}

.ui-tree-node.--over .ui-tree-label {
  border-color: var(--color-brdr-secondary);
}

.ui-tree-node.--over .ui-tree-label:before {
  display: block;
}

.ui-tree-node.--invalid.--over .ui-tree-label {
  color: var(--color-text-tertiary);
}

.ui-tree-node.--invalid.--over .ui-tree-label,
.ui-tree-node.--invalid.--over .ui-tree-label:before {
  border-color: var(--color-brdr-primary);
}

.ui-tree-node.--drag .ui-tree-label__btn {
  display: none !important;
}

.ui-tree-label__btn {
  width: 4rem;
  display: none;
  cursor: pointer;
  border-left: 0.2rem solid var(--dim-brdr-primary);
  flex-shrink: 0;
}

.ui-tree-label__btn:after {
  content: '';
  width: 100%;
  height: 100%;
  display: block;
  background: url('../../assets/images/icon-plus.svg') center center no-repeat;
  background-size: 2rem;
  border-radius: 100%;
  filter: invert(100%);
}

.ui-tree-node__path {
  position: absolute;
  width: 0;
  height: 0;
}

.ui-tree-node__line {
  stroke: var(--color-brdr-primary);
  stroke-dasharray: 5;
}
</style>