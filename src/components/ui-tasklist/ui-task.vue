<template>
  <div
    :draggable="editable && draggable"
    :class="bodyClass"
    @mousedown="handleMouseDown"
    @dragstart="handleDragstart"
    @dragend="handleDragend"
    @drop="handleDrop"
    @dragover="handleDragover"
    @dragenter="handleDragover"
    @dragleave="handleDragout"
  >
    <div
      :class="checkClass"
      @click="toggle"
    />
    <ui-task-content
      ref="content"
      class="ui-task__input"
      :value="localValue"
      :disabled="disabled"
      @input="handleInput"
      @enter="handleEnter"
      @backspace="handleBackspace"
      @space="handleSpace"
      @focus="handleFocus"
      @blur="handleBlur"
      @mouseup="handleMouseUp"
      v-if="editable === 'true' || editable === true"
    />
    <div
      class="ui-task__input"
      @click="toggle"
      v-else
    >
      {{localValue}}
    </div>
    <div
      class="ui-task__remove"
      @mousedown="remove"
    />
  </div>
</template>

<script>
import UiTaskContent from './ui-task-content.vue'

export default {
  name: 'ui-task',
  inheritAttrs: false,
  emits: [
    'update',
    'append',
    'add',
    'remove',
    'focus',
    'blur',
    'drag',
    'drop',
    'check',
  ],
  props: {
    value: String,
    name: String,
    checked: [String, Boolean],
    disabled: [String, Boolean],
    editable: [String, Boolean],
    idx: Number,
    subIdx: Number,
  },
  components: {
    UiTaskContent,
  },
  data () {
    return {
      focused: false,
      localChecked: this.$penciller.utils.isTrue(this.checked),
      draggable: false,
      drag: false,
      over: false,
      timer: 0,
    }
  },
  watch: {
    checked (newValue) {
      this.localChecked = newValue
    }
  },
  computed: {
    localValue: {
      get () {
        return this.value
      },
      set (newValue) {
        return newValue
      }
    },
    checkClass: {
      get () {
        let output = 'ui-task__checkbox'

        if (this.$penciller.utils.isTrue(this.localChecked)) { output += ' --checked' }
        if (this.localChecked === null || this.localChecked === '') { output += ' --partial' }

        return output
      },
      set (newValue) {
        return newValue
      }
    },
    bodyClass: {
      get () {
        let output = 'ui-task'

        if (this.focused) { output += ' --focused' }
        if (this.disabled) { output += ' --disabled' }
        if (this.drag) { output += ' --drag' }
        if (this.draggable) { output += ' --draggable' }
        if (this.over) { output += ' --over' }
        if (this.subIdx !== null) { output += ' --sub' }
        if (!this.$penciller.utils.isTrue(this.editable)) { output += ' --no-edit' }

        return output
      },
      set (newValue) {
        return newValue
      }
    }
  },
  methods: {
    handleInput (newValue) {
      this.$emit('update', newValue, this.idx, this.subIdx)
    },
    handleEnter (e) {
      e.preventDefault()

      if (e.shiftKey) {
        this.$emit('append', '', this.idx)
      } else {
        this.$emit('add', '', this.idx)
      }
    },
    handleBackspace (e) {
      if (this.localValue === '' || e.shiftKey) {
        e.preventDefault()
        this.$emit('remove', this.idx, this.subIdx)
      }
    },
    handleSpace (e) {
      if (e.shiftKey) {
        e.preventDefault()
        this.toggle()
      }
    },
    handleFocus () {
      this.focused = true
      this.$emit('focus', this.idx, this.subIdx)
    },
    handleBlur () {
      this.focused = false
      this.$emit('blur', this.idx, this.subIdx)
    },
    handleMouseUp () {
      this.draggable = false
      this.clearTimer()
      window.removeEventListener('mousemove', this.clearTimer)
    },
    handleMouseDown () {
      this.clearTimer()
      this.timer = setTimeout(() => {
        this.draggable = true
      }, 400)

      window.addEventListener('mousemove', this.clearTimer)
    },
    handleDragstart () {
      this.drag = true
      this.$refs.content.$refs.input.blur()
      this.$emit('drag', this.idx, this.subIdx)
    },
    handleDragend () {
      this.drag = false
      this.draggable = false
    },
    handleDragover (e) {
      e.preventDefault()

      if (this.isValidMove()) {
        this.over = true
      }
    },
    handleDrop () {
      if (this.isValidMove()) {
        this.$emit('drop', this.idx, this.subIdx)
        this.over = false
      }
      this.draggable = false
    },
    handleDragout () {
      this.over = false
    },
    clearTimer () {
      clearTimeout(this.timer)
    },
    isValidMove () {
      let tasks = this.$parent.tasks
      let draggedTask = this.$parent.dragged.task
      let draggedSubtask = this.$parent.dragged.subtask

      if (draggedTask === this.idx && draggedSubtask === null) { return false }
      if (draggedSubtask === null && tasks && tasks[draggedTask].subtasks.length > 0) {
        return false
      } else {
        return true
      }
    },
    toggle () {
      if (this.$penciller.utils.isTrue(this.disabled)) { return }
      this.localChecked = !this.localChecked
      this.$emit('check', this.localChecked, this.idx, this.subIdx)
    },
    remove (e) {
      e.preventDefault()
      this.$emit('remove', this.idx, this.subIdx)
    }
  },
  mounted () {
    if (window) {
      window.addEventListener('mouseup', this.handleMouseUp)
    }
  }
}
</script>

<style>
.ui-task {
  display: flex;
  border: dashed 0.2rem var(--color-brdr-quarternary);
  border-radius: 0.4rem;
  background: var(--color-bg-primary);
}

.ui-task.--over:not(.--sub) {
  background-color: var(--color-bg-secondary);
  border-color: transparent;
  transition: all 0.3s ease-out;
}

.ui-task.--over:not(.--sub) .ui-task__input {
  color: var(--color-bg-primary);
}

.ui-task.--sub:before {
  content: '';
  width: 3rem;
  height: 3rem;
  flex-grow: 0;
  flex-shrink: 0;
  margin: 0.6rem 0 0 1rem;
  background: url(../../assets/images/icon-arrow-return.svg) center center no-repeat;
  background-size: 1.8rem;
  opacity: 0.4;
}

.ui-task.--no-edit {
  border-style: solid;
}

.ui-task.--drag .ui-task__remove {
  display: none !important;
}

.ui-task__checkbox {
  width: 2.1rem ;
  height: 2.1rem;
  border: solid 0.2rem var(--color-brdr-secondary);
  border-radius: 0.3rem;
  margin: 1rem 0 0 1rem;
  flex-shrink: 0;
  flex-grow: 0;
  cursor: pointer;
  user-select: none;
}

.ui-task__checkbox.--checked {
  background-color: var(--color-bg-inverted);
  border-color: transparent;
}

.ui-task__checkbox.--partial {
  background-color: var(--color-bg-inverted);
  border-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
}

.ui-task__checkbox.--checked:after {
  content: '';
  width: 100%;
  height: 100%;
  display: block;
  background: url(../../assets/images/icon-check.svg) center center no-repeat;
  background-size: 2.4rem;
  filter: invert(100%);
}

.ui-task__checkbox.--partial:after {
  content: '';
  width: 1rem;
  height: 0.2rem;
  display: block;
  background-color: var(--color-bg-primary);
}

.ui-task__checkbox.--checked + .ui-task__input {
  text-decoration: line-through;
  color: var(--color-text-secondary);
}

.ui-task__input {
  font-size: 1.6rem;
  padding: 1rem 4.6rem 1rem 1rem;
  color: var(--color-text-primary);
  background-color: transparent;
  border: none;
  outline: none;
  display: block;
  width: 100%;
}

.ui-task.--no-edit .ui-task__input {
  cursor: pointer;
}

.ui-task__input::placeholder {
  color: var(--color-text-tertiary);
}

.ui-task.--focused {
  border-color: var(--dim-brdr-primary);
  border-style: solid;
  padding-right: 0;
}

.ui-task.--focused.--draggable {
  border-style: dashed;
}

.ui-task.--focused .ui-task__input {
  padding-right: 1rem;
}

.ui-task.--disabled {
  opacity: 0.5;
  cursor: default;
}

.ui-task__remove {
  width: 2.6rem;
  height: 2.6rem;
  flex-shrink: 0;
  flex-grow: 0;
  cursor: pointer;
  margin: 0.7rem 1rem 0 0;
  display: none;
}

.ui-task.--focused .ui-task__remove {
  display: block;
}

.ui-task__remove:after {
  content: '';
  width: 100%;
  height: 100%;
  display: block;
  background: url(../../assets/images/icon-x.svg) center center no-repeat;
  background-size: 1.2rem;
  opacity: 0.5;
}
</style>