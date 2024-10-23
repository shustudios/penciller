<template>
  <ui-form @submit="handleSubmit">
    <ui-repeater
      :template="template"
      :values="values"
      min="1"
      max="4"
      v-slot="inst"
      @update="handleUpdate"
    >
      <div class="ui-cols">
        <ui-field
          type="text"
          :name="'inst[' + inst.idx + '][val]'"
          :value="inst.val"
          label="Text"
          @input="val => handleInput('val', val, inst.idx)"
          class="--expanded"
        />
        <ui-field
          type="select"
          :name="'inst[' + inst.idx + '][sel]'"
          label="Select"
          :options="options"
          :value="inst.sel"
          @input="val => handleInput('sel', val, inst.idx)"
          class="--expanded"
        />
      </div>
    </ui-repeater>
    <ui-field type="text" name="text" label="Text" focus="true" />
    <ui-submit name="submit" label="Submit" />
  </ui-form>
</template>

<script>
export default {
  data: function () {
    return {
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
    handleUpdate: function (newValue) {
      this.values = newValue
    },
    handleInput: function (prop, val, idx) {
      this.values[idx][prop] = val
    },
    handleSubmit: function (form) {
      if (form) {
        form.startProcessing()
        console.log('--', form)
        form.endProcessing()
      }
    },
  }
}
</script>

<style>
#app {
  margin: 5rem;
}

.ui-form {
  max-width: 60rem;
}

@media screen and (max-width: 550px) {
  .ui-cols {
    display: block !important;
  }
}
</style>