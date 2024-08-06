<template>
  <div ref="tree" class="ui-tree">
    <div
      class="ui-tree-column-container"
      :style="{ zIndex: columns.length - i }"
      v-for="(col, i) in columns"
      :key="i"
    >
      <div
        ref="columns"
        class="ui-tree-column"
      >
        <ui-tree-column
          ref="cols"
          :current="currentNodeID"
          :draggedNodeID="draggedNodeID"
          :nodes="col.nodes"
          :level="i"
          :parentNode="col.parentNode"
          :editable="localEditable"
          @select="handleSelect"
          @add="handleAdd"
          @drag="handleDrag"
          @drop="handleDrop"
          @alert="handleAlert"
        />
      </div>
    </div>
  </div>
</template>

<script>
import UiTreeColumn from './ui-tree-column.vue'

export default {
  name: 'ui-tree',
  emits: [
    'select',
    'add',
    'alert',
    'reorder',
  ],
  props: {
    options: Object,
    value: Array,
    editable: [Boolean, String],
  },
  components: {
    UiTreeColumn,
  },
  data () {
    return {
      currentNodeID: this.value || [],
      draggedNodeID: null,
    }
  },
  computed: {
    localEditable () {
      let output = false

      if (this.editable === true ||  this.editable === 'true') {
        output = true
      }

      return output
    },
    columns: {
      get () {
        let output = [{ nodes: [{ ...this.options, id:[] }] }]

        if (this.currentNodeID) {
          let nodeID = []
          output.push({ nodes: this.getNodes(nodeID) })

          for (let i in this.currentNodeID) {
            nodeID.push(this.currentNodeID[i])
            let nodes = this.getNodes(nodeID)

            if (nodes.length > 0) {
              output.push({ nodes })
            }
          }
        }

        return output
      },
      set (newValue) {
        return newValue
      }
    }
  },
  watch: {
    value (newValue) {
      this.currentNodeID = newValue
    }
  },
  methods: {
    handleSelect (nodeObj) {
      this.selectNode(nodeObj.id)
      this.currentNodeID = nodeObj.id
      this.$emit('select', [...nodeObj.id])

      if (this.$refs.tree) {
        let tree = this.$refs.tree.parentNode
        setTimeout(() => {
          tree.scrollTo({ top:tree.scrollTop, left: tree.scrollWidth, behavior: 'smooth' })
        }, 10)
      }
    },
    handleAdd (nodeObj) {
      this.$emit('add', [...nodeObj.id])
    },
    handleAlert (alert) {
      this.$emit('alert', alert)
    },
    selectNode (nodeID) {
      let nodes = this.getNodes(nodeID)
      
      this.columns.splice(nodeID.length + 1)

      if (nodes.length > 0) {
        this.columns.push({ nodes })
      }
    },
    getParentNode (nodeID) {
      let output = null
      let path = [...nodeID]

      if (path.length > 0) {
        path.pop()

        let col = path.length
        let itm = (path.length > 0) ? path[col-1] : 0
        
        output = this.$refs.cols[col].$refs.nodes[Number(itm)]
      }

      return output
    },
    getNodes (nodeID) {
      let option = this.parseNode(nodeID)
      let nodes = []

      if (option) {
        if (option.children) {
          option = option.children
        }

        if (Array.isArray(option)) {
          for (let i in option) {
            let id = [ ...nodeID ]
            let alert = null

            if (option[i].alert) {
              alert = option[i].alert
            }

            id.push(i)
            nodes.push({
              label: option[i].label,
              meta: option[i].meta,
              id,
              alert
            })
          }
        }
      }

      return nodes
    },
    parseNode (nodeID) {
      let output = this.options.children

      if (nodeID) {
        for (let i in nodeID) {
          let pos = nodeID[i]

          if (output.children) {
            output = output.children[pos]
          } else {
            output = output[pos]
          }
        }
      }

      return output
    },
    getOptions (nodeID) {
      let output = this.options.children

      if (nodeID) {
        for (let i in nodeID) {
          let pos = nodeID[i]

          if (output[pos].children) {
            output = output[pos].children
          } else {
            output = output[pos]
          }
        }
      }

      return output
    },
    handleDrop (fromID, toID) {
      if (fromID.join('.') === toID.join('.')) {
        return
      }

      let fromCol = fromID.length - 1
      let toCol = toID.length - 1
      let to = [...toID]
      let from = [...fromID]
      let toPos = to.pop()
      let fromPos = from.pop()
      let toOptions = this.getOptions(to)
      let fromOptions = this.getOptions(from)

      let snip = fromOptions.splice(fromPos, 1)[0]

      if (fromCol === toCol) {
        if (toPos > fromOptions.length) {
            toPos = fromOptions.length
        } else {
          if (fromPos < toPos) {
            toPos = toPos - 1
          }
        }
      }

      if (fromCol < toCol) {
        let toParentPos = to[toCol-1]
        
        if (toParentPos > fromPos) {
          toID[fromCol] = Number(toID[fromCol]) - 1
        }
      }

      if (Array.isArray(toOptions)) {
        toOptions.splice(toPos, 0, snip)
      } else {
        toOptions.children = [snip]
      }

      if (fromPos < this.currentNodeID[fromCol]) {
        toID[fromCol] = this.currentNodeID[fromCol] - 1
      }
      
      toID[toID.length-1] = toPos
      this.currentNodeID = toID
      this.$emit('reorder', this.options, toID)
    },
    handleDrag (id) {
        this.draggedNodeID = id
    }
  },
}
</script>

<style>
.ui-tree {
  display: flex;
  justify-content: flex-start;
}

.ui-tree-column-container {
  flex-shrink: 0;
  animation: treemap-fade 0.3s ease-out;
  display: flex;
  align-items: center;
}

.ui-tree-column-container:last-child {
  border: none;
}

.ui-tree-column-container:first-child .ui-tree-node__path {
  display: none;
}

.ui-tree-column {
  padding-right: 4rem;
  margin-left: calc(-4rem - 0.2rem);
  height: 100%;
  display: flex;
  align-items: center;
  overflow-y: auto;
  position: relative;
}

@keyframes treemap-fade {
  0% { opacity: 0 }
  100% { opacity: 1 }
}
</style>