<template>
  <ui-form @submit="handleSubmit">
    <ui-progress />
    <ui-field type="color" name="color" :options="['#000000', '#333333', '#666666', '#999999']" />
    <ui-filter :options="occupations" :fuse="{ keys:['label', 'value'] }" />
    <ui-field type="checkbox" name="toggle" label="24 hour" @check="check => { military = check }" />
    <ui-submit label="Send" noisy="true" />
  </ui-form>
</template>

<script>
import UiFilter from '@shustudios/penciller/src/components/ui-filter/ui-filter.vue'
export default {
  name: 'App',
  components: {
    UiFilter,
  },
  data () {
    return {
      time: { time: '1:02', daytime: 'pm' },
      // time: '3:45am',
      military: false,
      occupations: [
        { label: '10010 - Financial managers', value: '10010', keywords: '' },
        { label: '10011 - Human resources managers', value: '10011', keywords: '' },
        { label: '10012 - Purchasing managers', value: '10012', keywords: '' },
        { label: '10019 - Other administrative services managers', value: '10019', keywords: '' },
        { label: '10020 - Insurance, real estate and financial brokerage managers', value: '10020', keywords: '' },
        { label: '10021 - Banking, credit and other investment managers', value: '10021', keywords: '' },
        { label: '10022 - Advertising, marketing and public relations managers', value: '10022', keywords: '' },
        { label: '10029 - Other business services managers', value: '10029', keywords: '' },
        { label: '10030 - Telecommunication carriers managers', value: '10030', keywords: '' },
        { label: '20010 - Engineering managers', value: '20010', keywords: '' },
      ],
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
