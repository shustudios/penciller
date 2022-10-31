<template>
  <ui-form @submit="handleSubmit">
    <!-- <ui-field type="tags" name="tags" label="Find" :options="list" /> -->
    <ui-field type="checkbox" name="checkbox" label="This is a checkbox" value="tester" />
    <!-- <ui-field type="daterange" name="daterange" /> -->
    <ui-submit label="Submit" name="submit" />
    <!-- <ui-tree :options="tree" editable="true" /> -->
  </ui-form>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
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
