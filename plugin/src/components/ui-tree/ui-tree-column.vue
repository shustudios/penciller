<template>
  <ul class="ui-tree-items">
    <li
      v-for="(node, i) in nodes"
      :class="nodeCSS(node.id)"
      :key="i"
    >
      <ui-tree-droptarget
        :droppedNodeID="node.id"
        :draggedNodeID="draggedNodeID"
        @drop="handleDrop"
        v-if="i == 0 && level > 0"
      />
      <ui-tree-node
        ref="nodes"
        :label="node.label"
        :meta="node.meta"
        :nodeID="node.id"
        :droppedNodeID="inside(node.id)"
        :draggedNodeID="draggedNodeID"
        :parentNode="parentNode"
        :key="node.id.join('_')"
        :alert="node.alert"
        :editable="editable"
        @drag="handleDrag"
        @drop="handleDrop"
        @select="handleSelect(i)"
        @add="handleAdd(i)"
        @alert="handleAlert"
      />
      <ui-tree-droptarget
        :droppedNodeID="next(node.id)"
        :draggedNodeID="draggedNodeID"
        @drop="handleDrop"
        v-if="level > 0"
      />
    </li>
  </ul>
</template>

<script>
/**
 * Gotcha: ui-tree-node needs a key property to prevent vue from
 * using a cached version, which prevents the line paths from updating.
 * This can occur when sibling nodes have the same child nodes.
 */
import UiTreeNode from './ui-tree-node.vue'
import UiTreeDroptarget from './ui-tree-droptarget.vue'

export default {
  name: 'ui-tree-column',
  emits: [
    'drag',
    'drop',
    'select',
    'add',
    'alert',
  ],
  props: {
      level: Number,
      nodes: Array,
      current: Array,
      draggedNodeID: Array,
      parentNode: null,
      editable: Boolean,
  },
  components: {
      UiTreeNode,
      UiTreeDroptarget,
  },
  data () {
      return {
      }
  },
  computed: {
  },
  methods: {
      nodeCSS (id) {
        let output = 'ui-tree-item'

        if (this.current) {
          if (this.current[this.level-1] == id[this.level-1]) {
            output += ' --selected'
          }

          if (id.join('.') == this.current.join('.')) {
            output += ' --current'
          }
        }

        return output
      },
      next (id) {
        let output = [...id]
        
        if (output) {
          let pos = Number(output[output.length-1]) + 1
          output[output.length-1] = String(pos)
        }

        return output
      },
      inside (id) {
        let output = [...id]
        output.push(String(0))
        return output
      },
      refID (nodeID) {
        if (nodeID) {
          return 'node_' + nodeID.join('_')
        } else {
          return 'root'
        }
      },
      handleDrag (id) {
        this.$emit('drag', id)
      },
      handleDrop (from, to) {
        this.$emit('drop', from, to)
      },
      handleSelect (i) {
        this.$emit('select', this.nodes[i])
      },
      handleAdd (i) {
        this.$emit('add', this.nodes[i])
      },
      handleAlert (alert) {
        this.$emit('alert', alert)
      }
  }
}
</script>

<style>
.ui-tree-items {
  margin: auto 0 auto 4rem;
  padding: 0 0 0 4rem;
  list-style: none;
}

.ui-tree-item {
  margin: 0 auto;
  padding: 0;
  position: relative;
}

.ui-tree-item.--selected .ui-tree-label {
  background-color: var(--color-bg-inverted);
  color: var(--color-text-inverted);
  border-color: transparent;
}

.ui-tree-item.--selected .ui-tree-node__path {
  z-index: 1;
}

.ui-tree-item.--selected .ui-tree-node__line {
  stroke: var(--dim-brdr-primary);
  stroke-dasharray: none;
}

.ui-tree-item.--current .ui-tree-label {
  background-color: var(--color-bg-inverted);
  color: var(--color-text-inverted);
}

.ui-tree-item.--current .ui-tree-label__btn {
  display: block;
}
</style>