<template>
  <div class="ui-tasklist">
    <div
      class="ui-task-group"
      v-for="(task, i) in localValue"
      :key="'task'+i"
      @keydown.up="handlePrevFocus"
      @keydown.down="handleNextFocus"
    >
      <ui-task-drop @drop="handleDrop(0, null)" v-if="i === 0" />
      <ui-task
        type="task"
        ref="tasks"
        :name="name + '_' + i"
        :value="task.label"
        :checked="task.completed"
        :disabled="disabled"
        :editable="editable"
        :idx="i"
        :subIdx="null"
        @add="handleAdd"
        @append="handleAppend"
        @remove="handleRemove"
        @check="handleCheck"
        @focus="handleFocus"
        @blur="handleBlur"
        @drag="handleDrag"
        @drop="handleDropInto"
        @update="handleUpdate"
      />
      <ui-task-drop @drop="handleDrop(i, 0)" v-if="task.subtasks.length > 0" />
      <div
        class="ui-subtasks"
        v-for="(subtask, j) in task.subtasks"
        :key="'task' + i + '_' + j"
      >
        <ui-task
          type="task"
          :ref="'subtasks_' + i"
          :name="name + '_' + i + '_' + j"
          :value="subtask.label"
          :checked="subtask.completed"
          :disabled="disabled"
          :editable="editable"
          :idx="i"
          :subIdx="j"
          @add="handleAdd"
          @append="handleAppend"
          @remove="handleRemove"
          @check="handleCheck"
          @focus="handleFocus"
          @blur="handleBlur"
          @drag="handleDrag"
          @update="handleUpdate"
        />
        <ui-task-drop @drop="handleDrop(i, j+1)"  v-if="j < task.subtasks.length - 1" />
      </div>
      <ui-task-drop @drop="handleDrop(i+1, null)" />
    </div>
    <div
      class="ui-task-add"
      v-if="editable === 'true' || editable === true"
    >
      <ui-task-content
        ref="input"
        :class="addClass"
        :disabled="disabled"
        :placeholder="placeholder"
        :value="addValue"
        @enter="addTask"
        @up="focusList"
        @focus="addFocus = true"
        @blur="addFocus = false"
        @input="handleInput"
      />
      <div class="ui-field --button">
        <ui-field-button
          label="Add"
          @click="addTask"
        />
      </div>
    </div>
  </div>
</template>

<script>
import UiTask from './ui-task.vue'
import UiTaskDrop from './ui-task-drop.vue'
import UiTaskContent from './ui-task-content.vue'
import UiFieldButton from '../ui-field/ui-field-button.vue'

export default {
  name: "ui-tasklist",
  emits: ['input'],
  props: {
    value: Array,
    name: String,
    disabled: [String, Boolean],
    placeholder: {
      type: String,
      default: () => 'Add a task...'
    },
    editable: {
      type: [ String, Boolean ],
      default: () => true
    },
  },
  components: {
    UiTask,
    UiTaskDrop,
    UiTaskContent,
    UiFieldButton,
  },
  data () {
    return {
      addValue: '',
      focused: null,
      dragged: { task: null, subtask: null },
      localValue: JSON.parse(JSON.stringify(this.value)),
      addFocus: false,
    }
  },
  watch: {
    value (newValue) {
      this.localValue = JSON.parse(JSON.stringify(newValue))
    }
  },
  computed: {
    addClass () {
      let output = 'ui-task-add__input'

      if (this.disabled) { output += ' --disabled' }
      if (this.addFocus) { output += ' --focused' }

      return output
    }
  },
  methods: {
    addTask (e) {
      e.preventDefault()
      let taskIdx = 0
      let subtaskIdx = 0

      if (this.localValue.length > 0) {
        taskIdx = this.localValue.length
      }

      if (e.shiftKey && this.localValue.length > 0) {
        if (this.localValue[taskIdx-1].subtasks) {
          if (this.localValue[taskIdx-1].subtasks.length > 0) {
            subtaskIdx = this.localValue[taskIdx-1].subtasks.length
          }

          this.insertTask(this.addValue, taskIdx-1, subtaskIdx)
        } else {
          this.insertTask(this.addValue, taskIdx, null)
        }
      } else {
        this.insertTask(this.addValue, taskIdx, null)
      }

      this.addValue = ''
      this.updateList()
    },
    insertTask (newValue, taskIdx, subtaskIdx, focus) {
      if (subtaskIdx === null) {
        this.localValue.splice(taskIdx, 0, { label: newValue, completed: false, subtasks: [] })
      } else {
        this.localValue[taskIdx].subtasks.splice(subtaskIdx, 0, { label: newValue, completed: false, subtasks: [] })
        this.updateParentCheck(taskIdx, null)
      }
      
      if (focus) {
        this.$nextTick(() => {
          this.focusTask(taskIdx, subtaskIdx)
        })
      }
    },
    removeTask (taskIdx, subtaskIdx) {
      if (subtaskIdx === null) {
        this.localValue.splice(taskIdx, 1)

        if (this.localValue.length > 0) {
          if (taskIdx > this.localValue.length - 1) {
            this.focusTask(taskIdx - 1, null)
          }
        }

      } else {
        this.localValue[taskIdx].subtasks.splice(subtaskIdx, 1)
        this.updateParentCheck(taskIdx)

        if (this.localValue[taskIdx].subtasks.length > 0) {
          if (subtaskIdx > this.localValue[taskIdx].subtasks.length - 1) {
            this.focusTask(taskIdx, subtaskIdx - 1)
          }
        } else {
          this.focusTask(taskIdx, null)
        }
      }
    },
    moveTask (taskIdx, subtaskIdx, into) {
      let tasks = this.$penciller.utils.clone(this.localValue)
      let snip
      let idx

      if (this.dragged.subtask === null) {
        snip = tasks.splice(this.dragged.task, 1)[0]
      } else {
        snip = tasks[this.dragged.task].subtasks.splice(this.dragged.subtask, 1)[0]
      }

      if (subtaskIdx === null) {
        idx = taskIdx

        if (this.dragged.task < taskIdx && this.dragged.subtask === null) {
          idx = idx - 1
        }

        if (into) {
          if (snip.subtasks.length > 0) {
            tasks[idx].subtasks = [
              ...tasks[idx].subtasks,
              ...snip.subtasks,
            ]
          } else {
            tasks[idx].subtasks.push(snip)
          }
        } else {
          tasks.splice(idx, 0, snip)
        }

        // if (this.dragged.subtask !== null) { // not sure why I had this
        //   tasks[idx].subtasks = []
        // }
      } else {
        idx = taskIdx
        let subidx = subtaskIdx

        if (taskIdx === this.dragged.task && subtaskIdx > this.dragged.subtask) {
          subidx = subidx - 1
        }

        if (taskIdx > this.dragged.task && this.dragged.subtask === null) {
          idx = idx - 1
        }

        tasks[idx].subtasks.splice(subidx, 0, snip)
      }

      this.dragged = null
      this.localValue = tasks
      this.updateList()
    },
    updateParentCheck (taskIdx) {
      let checkCount = 0

      if (this.localValue[taskIdx].subtasks.length > 0) {
        for (let idx=0; idx<this.localValue[taskIdx].subtasks.length; idx++) {          
          if (this.localValue[taskIdx].subtasks[idx].completed) {
            checkCount++
          }
        }

        if (checkCount > 0 && checkCount === this.localValue[taskIdx].subtasks.length) {
          this.localValue[taskIdx].completed = true
        } else if (checkCount === 0) {
          this.localValue[taskIdx].completed = false
        } else {
          this.localValue[taskIdx].completed = null
        }
      }
    },
    updateChildChecks (taskIdx) {
      if (this.localValue[taskIdx].subtasks.length > 0) {
        for (let idx=0; idx<this.localValue[taskIdx].subtasks.length; idx++) {          
          this.localValue[taskIdx].subtasks[idx].completed = this.localValue[taskIdx].completed
        }
      }
    },
    updateList () {
      this.$emit('input', this.localValue)
    },
    focusList (e) {
      e.preventDefault()
      let last = this.localValue.length - 1

      if (this.localValue[last].subtasks.length > 0) {
        this.focusTask(last, this.localValue[last].subtasks.length - 1)
      } else {
        this.focusTask(last, null)
      }
    },
    focusTask (taskIdx, subtaskIdx) {
      if (subtaskIdx === null) {
        this.$refs['tasks'][taskIdx].$refs.content.$refs.input.focus()
      } else {
        this.$refs['subtasks_' + taskIdx][subtaskIdx].$refs.content.$refs.input.focus()
      }
    },
    focusNext () {
      let next = { task: this.focused.task, subtask: this.focused.subtask }

      if (this.localValue[this.focused.task].subtasks.length === 0) {
        next.task = next.task + 1
        if (next.task > this.localValue.length - 1) { next.task = 0 }
      } else {
        if (next.subtask === null) {
          next.subtask = 0
        } else {
          next.subtask = next.subtask + 1
        }
        
        if (next.subtask > this.localValue[next.task].subtasks.length - 1) {
          next.task = next.task + 1
          next.subtask = null
          if (next.task > this.localValue.length - 1) { next.task = 0 }
        }
      }

      this.focusTask(next.task, next.subtask)
    },
    focusPrev () {
      let prev = { task: this.focused.task, subtask: this.focused.subtask }

      if (this.localValue[this.focused.task].subtasks.length === 0) {
        prev.task = prev.task - 1
        if (prev.task < 0) {
          prev.task = this.localValue.length - 1
          if (this.localValue[prev.task].subtasks.length > 0) {
            prev.subtask = this.localValue[prev.task].subtasks.length - 1
          }
        } else {
          if (this.localValue[prev.task].subtasks.length > 0) {
            prev.subtask = this.localValue[prev.task].subtasks.length - 1
          }
        }
      } else {
        if (prev.subtask === null) {
          prev.task = prev.task - 1
          if (prev.task < 0) { prev.task = this.localValue.length - 1 }
          if (this.localValue[prev.task].subtasks.length > 0) {
            prev.subtask = this.localValue[prev.task].subtasks.length - 1
          }
        } else {
          prev.subtask = prev.subtask - 1
          if (prev.subtask < 0) {
            prev.subtask = null
          }
        }
      }

      this.focusTask(prev.task, prev.subtask)
    },
    handleAdd (newValue, taskIdx) {
      this.insertTask(newValue, taskIdx + 1, null, true)
    },
    handleAppend (newValue, taskIdx) {
      let subtaskIdx = 0

      if (this.localValue[taskIdx].subtasks.length > 0) {
        subtaskIdx = this.localValue[taskIdx].subtasks.length
      }
console.log(newValue, taskIdx, subtaskIdx)
      this.insertTask(newValue, taskIdx, subtaskIdx, true)
    },
    handleRemove (taskIdx, subtaskIdx) {
      if (subtaskIdx === null) {
        this.removeTask(taskIdx, null)
      } else {
        this.removeTask(taskIdx, subtaskIdx)
      }

      this.updateList()
    },
    handleCheck (check, taskIdx, subtaskIdx) {
      if (subtaskIdx === null) {
        this.localValue[taskIdx].completed = check
        this.updateChildChecks(taskIdx)
      } else {
        this.localValue[taskIdx].subtasks[subtaskIdx].completed = check
        this.updateParentCheck(taskIdx)
      }

      this.updateList()
    },
    handleFocus (taskIdx, subtaskIdx) {
      this.focused = { task: taskIdx, subtask: subtaskIdx }
    },
    handleNextFocus (e) {
      e.preventDefault()

      if (this.focused !== null) {
        this.focusNext()
      }
    },
    handlePrevFocus (e) {
      e.preventDefault()
      
      if (this.focused !== null) {
        this.focusPrev()
      }
    },
    handleBlur () {
      this.focused = null
    },
    handleDrag (taskIdx, subtaskIdx) {
      this.dragged = { task: taskIdx, subtask: subtaskIdx }
    },
    handleDrop (taskIdx, subtaskIdx) {
      this.moveTask(taskIdx, subtaskIdx)
    },
    handleDropInto (taskIdx, subtaskIdx) {
      this.moveTask(taskIdx, subtaskIdx, true)
    },
    handleUpdate (newValue, taskIdx, subtaskIdx) {

      if (subtaskIdx === null) {
        this.localValue[taskIdx].label = newValue
      } else {
        this.localValue[taskIdx].subtasks[subtaskIdx].label = newValue
      }

      this.updateList()
    },
    handleInput (newValue) {
      this.addValue = newValue
    }
  }
}
</script>

<style scoped>
.ui-tasklist {
  margin-bottom: 2rem;
}

.ui-field.--button {
  margin: 0;
}

.ui-task-add {
  display: flex;
}

.ui-task-add__input {
  font-size: 1.6rem;
  padding: 1rem 1rem 1rem 2rem;
  color: var(--color-text-primary);
  outline: none;
  display: block;
  width: 100%;
  border: solid 0.2rem var(--color-brdr-primary);
  border-radius: 0.4rem;
  transition: all 0.3s ease-out;
  background: var(--color-bg-primary);
  margin-right: 1rem;
}

.ui-task-add__input.--focused {
  border-color: var(--dim-brdr-primary);
}

.ui-task-add__input.--disabled {
  opacity: 0.5;
}

@media (hover: hover) and (pointer: fine) {
  .ui-task-add__input:not(.--disabled):not(.--focused):hover {
    border-color: var(--hilite-brdr-primary);
  }
}
</style>