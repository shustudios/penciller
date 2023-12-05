<template>
  <!-- <ui-tabset>
    <ui-tab label="another" v-if="showTab" :key="tabKey" />
    <ui-tab label="Test" class="test" selected />
  </ui-tabset>
  <ui-field
    type="button"
    label="toggle"
    name="toggle"
    @click="handleToggle"
  /> -->
  <ui-form ref="form" @submit="handleSubmit">
    <!-- <ui-progress /> -->
    <!-- <ui-field type="color" name="color" :options="['#000000', '#333333', '#666666', '#999999']" /> -->
    <ui-field type="select" name="occ" :options="occupations" value="10011" />
    <ui-field type="number" name="txt" label="Name" value="2" />
    <!-- <ui-filter :options="occupations" :fuse="{ keys:['label', 'value'] }" /> -->
    <!-- <ui-field type="checkbox" name="toggle" label="24 hour" @check="check => { military = check }" /> -->
    <ui-submit label="Send" noisy="true" />
    <ui-field type="button" name="clear" label="clear" @click="handleClear" />
  </ui-form>
</template>

<script>
// import UiTabset from '@shustudios/penciller/src/components/ui-tabset/ui-tabset.vue'
// import UiTab from '@shustudios/penciller/src/components/ui-tabset/ui-tab.vue'
// import UiFilter from '@shustudios/penciller/src/components/ui-filter/ui-filter.vue'
export default {
  name: 'App',
  components: {
    // UiTabset,
    // UiTab,
    // UiFilter,
  },
  data () {
    return {
      showTab: false,
      tabKey: 1,
      time: { time: '1:02', daytime: 'pm' },
      // time: '3:45am',
      military: false,
      occupations: [
        { label: 'Test', children:[
          { label: 'Child One', value: 'one' }
        ]},
        { label: 'Another', children: [
          { label: '10010 - Financial managers', value: '10010', keywords: '', css:'--bold' },
          { label: '10011 - Human resources managers', value: '10011', keywords: '' },
          { label: '10012 - Purchasing managers', value: '10012', keywords: '' },
          { label: '10019 - Other administrative services managers', value: '10019', keywords: '' },
          { label: '10020 - Insurance, real estate and financial brokerage managers', value: '10020', keywords: '' },
          { label: '10021 - Banking, credit and other investment managers', value: '10021', keywords: '' },
          { label: '10022 - Advertising, marketing and public relations managers', value: '10022', keywords: '' },
          { label: '10029 - Other business services managers', value: '10029', keywords: '' },
          { label: '10030 - Telecommunication carriers managers', value: '10030', keywords: '' },
          { label: '20010 - Engineering managers', value: '20010', keywords: '' },
        ]},
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
    },
    handleToggle () {
      this.showTab = !this.showTab
      this.tabKey++
    },
    handleClear () {
      this.$refs.form.reset()
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

.ui-select-balloon .ui-field-item.--bold {
  font-weight: 600;
}
</style>
