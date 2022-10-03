<template>
  <ui-form @submit="handleSubmit">
    <ui-field type="tags" name="tags" label="Find" :options="list" />
    <ui-field type="checkbox" name="checkbox" label="This is a checkbox" />
    <ui-field type="time" name="time" />
    <ui-submit label="Submit" name="submit" />
    <ui-tasklist :value="tasks" @input="handleInput" />
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
      tasks: [],
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
