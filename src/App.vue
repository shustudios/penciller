<template>
  <ui-calendar
    :value="myVal"
    :parent="parentElm"
    :filter="dateFilter"
    @input="handleInput"
  />
</template>

<script>
export default {
  data: function () {
    let today = new Date()
    let tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 12)

    return {
      myVal:  today,//{ year:2025, month:0, day:16 },
      dateFilter: {
        exclude: {
          /*before: { year:2025, month:0, day:6 },
          after: { year:2025, month:0, day:20 },*/
          after: tomorrow
        }
      },
      parentElm: document.body,
      template: { val:'', sel: 'op3' },
      values: [
        { val:'Hello', sel: 'op3' },
        { val:'One', sel: 'op1' },
        { val:'Two', sel: 'op2' },
      ],
      options: [
        { label: 'Option One', value:'op1' },
        { label: 'Option Two', value:'op2' },
        { label: 'Option Three', value:'op3' },
        { label: 'Option Four', value:'op4' },
        { label: 'Option Five', value:'op5' },
        { label: 'Option Six', value:'op6' },
        { label: 'Option Seven', value:'op7' },
        { label: 'Option Eight', value:'op8' },
      ],
      treeOptions: {
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
      },
      disabled: true,
    }
  },
  computed: {
  },
  methods: {
    parseArraySyntax: function (input) {
      let output = {}

      for (let key in input) {
        let convertedItem = this.parseArrayItem(key, input[key])
        if (convertedItem) {
          output[convertedItem.key] = convertedItem.val
        } else {
          output[key] = input[key]
        }
      }

      return output
    },
    parseArrayItem: function (path, val) {
      const reg = new RegExp(/\]/g)
      let output = false

      if (reg.test(path)) {
        const prop = path.split('[')[0]
        const keys = path.replace(reg, '').split('[')

        output = { key:prop, val:[]}

        for (let idx=0; idx<keys.length; idx++) {
          const key = keys[idx]

          

          if (idx >= keys.length-1) {
            output.val.push(val)
          } else {

          }
        }
      } else {

      }

      return output
    },
    handleClick: function () {
      this.$refs.form.triggerSubmit()
    },
    handleUpdate: function (newValue) {
      this.values = newValue
    },
    handleInput: function (newValue) {
      console.log(newValue)
      this.myVal = newValue
    },
    handleSubmit: function (form) {
      if (form) {
        console.log('---', form)
        // form.startProcessing()
        // console.log('--', form)
        // form.complete(true)
      }
    },
    handleTest: function () {
      console.log('close')
    }
  },
  mounted: function () {
  }
}
</script>

<style>
#app {
  margin: 5rem;
}

.ui-form {
  max-width: 50rem;
}

@media screen and (max-width: 550px) {
  .ui-cols {
    display: block !important;
  }
}
</style>