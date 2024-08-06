<template>
  <ui-form>
    <ui-field type="date" name="date" />
    <ui-submit label="Submit" name="submit" />
  </ui-form>
</template>

<script>
import Calculator from './calculator.vue'
export default {
  name: 'App',
  components: {
    Calculator,
  },
  data () {
    return {
      form: null,
      currentTab: null,
      showTab: false,
      tabKey: 1,
      defaults: '',
      selectedTag: null,
      time: { time: '1:02', daytime: 'pm' },
      // time: '3:45am',
      military: false,
      textval: null,
      occupations: [
        { label: 'Child One', value: 'one' },
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
      ],
      cityOptions: [
        { label: 'Airdrie', value: '' },
        { label: 'Alix', value: '' },
        { label: 'Andrew', value: '' },
        { label: 'Athabasca', value: '' },
        { label: 'Barrhead', value: '' },
        { label: 'Bashaw', value: '' },
        { label: 'Bentley', value: '' },
        { label: 'Blackfalds', value: '' },
        { label: 'Bow Island', value: '' },
        { label: 'Calgary', value: '' },
        { label: 'Coleman', value: '' },
        { label: 'Delburne', value: '' },
        { label: 'Devon', value: '' },
        { label: 'Dewberry', value: '' },
        { label: 'Drayton Valley', value: '' },
        { label: 'Edmonton', value: '' },
        { label: 'Edson', value: '' },
        { label: 'Elk Point', value: '' },
        { label: 'Elnora', value: '' },
        { label: 'Entwistle', value: '' },
        { label: 'Fairview', value: '' },
        { label: 'Fort McMurray', value: '' },
        { label: 'Fort Saskatchewan', value: '' },
        { label: 'Gibbons', value: '' },
        { label: 'Grand Cache', value: '' },
        { label: 'Grand Prairie', value: '' },
        { label: 'Grimshaw', value: '' },
        { label: 'High River', value: '' },
        { label: 'Hinton', value: '' },
        { label: 'Innisfail', value: '' },
        { label: 'Jasper', value: '' },
        { label: 'Lac La Biche', value: '' },
        { label: 'Lacombe', value: '' },
        { label: 'Lamont', value: '' },
        { label: 'Leduc', value: '' },
        { label: 'Legal', value: '' },
        { label: 'Lethbridge', value: '' },
        { label: 'Lloydminister', value: '' },
        { label: 'Medicine Hat', value: '' },
        { label: 'Morinville', value: '' },
        { label: 'Mundare', value: '' },
        { label: 'Okotoks', value: '' },
        { label: 'Plamondon', value: '' },
        { label: 'Ponoka', value: '' },
        { label: 'Provost', value: '' },
        { label: 'Red Deer', value: '' },
        { label: 'Redcliff', value: '' },
        { label: 'Rimbey', value: '' },
        { label: 'Sangudo', value: '' },
        { label: 'Sherwood Park', value: '' },
        { label: 'Slave Lake', value: '' },
        { label: 'Spruce Grove', value: '' },
        { label: 'St. Albert', value: '' },
        { label: 'St. Paul', value: '' },
        { label: 'Stony Plain', value: '' },
        { label: 'Sylvan Lake', value: '' },
        { label: 'Three Hills', value: '' },
        { label: 'Tsuut\'ina', value: '' },
        { label: 'Wabamun', value: '' },
        { label: 'Westlock', value: '' },
        { label: 'Whitecourt', value: '' },
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
  computed: {
    changed: function () {
      let output = false

      if (this.form) {
        if (JSON.stringify(this.form.values) !== this.defaults) {
          output = true
        }
      }

      return output
    }
  },
  methods: {
    testRule (val) {
      return 'hello'
    },
    handleInit (form) {
      this.form = form
    },
    handleSubmit (form) {
      
    },
    handleUpdate (form) {
      this.form = form
    },
    handleInput (newValue) {
      console.log('---', newValue)
      setTimeout(() => {
        this.$refs.form.triggerSubmit()
      }, 10)
    },
    handleToggle () {
      this.showTab = !this.showTab
      this.tabKey++
    },
    handleClear () {
      this.$refs.form.reset()
    },
    handleTab () {
      console.log('chabg')
    },
    isTab (tab) {
      let output = false

      if (tab === this.currentTab) {
        output = true
      }

      return output
    }
  },
  mounted: function () {
    this.currentTab = 'gic'
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
