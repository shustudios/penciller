<template>
  <ui-form @submit="handleSubmit">
    <ui-field type="time" name="time" label="Time" :military="military" />
    <ui-field type="checkbox" name="toggle" label="24 hour" @check="check => { military = check }" />
    <ui-submit label="Send" noisy="true" />
  </ui-form>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      military: false,
      badge: {
        type: 'error',
        message: 'Test message',
      },
      tags: [
        { label: 'milk', value: 'milk' },
        { label: 'cookies', value: 'cookies' },
      ],
      list: [
        { label: 'Option One', value: 'op1' },
        { label: 'Option Two', value: 'op2' },
        { label: 'Option Three', value: 'op3' },
      ],
      tasks: [
        {
          label: 'Task One',
          subtasks: [
            {
              label: 'Task One Subtask One',
              subtasks: [],
            },
            {
              label: 'Task One Subtask Two',
              subtasks: [],
            },
          ],
        },
        {
          label: 'Task Two',
          subtasks: [],
        },
      ],
      tree: {
        label: 'Book',
        children: [
          {
            label: 'Chapter One',
            children: [
              { label: 'Paragraph One' },
              { label: 'Paragraph Two' },
              { label: 'Paragraph Three' },
              { label: 'Paragraph Four' },
              { label: 'Paragraph Five' },
            ]
          },
          { label: 'Chapter Two' },
          { label: 'Chapter Three' },
        ]
      }
    }
  },
  methods: {
    handleSubmit (form) {
      if (form) {
        form.startProcessing()
        console.log('form submitted', form.fields)
      }
    },
    handleInput (newValue) {
      this.tasks = newValue
    }
  }
}
</script>

<style>
#app {
  margin: 4rem;
}

.ui-field:not(.--daterange) {
  max-width: 30rem;
}

.ui-field.--daterange {
  max-width: 60rem;
}
</style>
