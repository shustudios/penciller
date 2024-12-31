<template>
  <ui-form>
    <ui-field
      type="phone"
      name="phone"
      label="Phone"
      autocomplete="off"
    />
    <ui-field
      type="number"
      name="field"
      label="Field"
      autocomplete="off"
      value="1234567890.88"
      prefix="$"
    />
    <ui-field
      type="text"
      name="text"
      label="Text"
      autocomplete="off"
      format="machine"
    />
    <ui-field
      type="date"
      name="date"
      label="Date"
      autocomplete="off"
      value="2025-04-04"
    />
    <ui-field
      type="daterange"
      name="daterange"
      label="Date"
      autocomplete="off"
    />
    <ui-field
      type="color"
      name="color"
      label="Color"
      autocomplete="off"
    />
  </ui-form>
</template>

<script>
export default {
  data: function () {
    return {
      dateFilter: null,
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
      console.log('---', newValue)
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
    setTimeout(() => {
      this.dateFilter = {
        exclude: {
          before: '2024-12-12',
          after: '2024-12-25',
          // is: ['2024-12-12', '2024-12-25', '2024-12-18'],
        },
        include: {
          // before: '2024-12-06',
          // after: '2024-12-16',
          is: ['2024-12-09', '2024-12-02'],
        }
      }
    }, 5000)
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