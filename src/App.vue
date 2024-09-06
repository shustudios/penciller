<template>
  <ui-form id="Form" @submit="handleSubmit">
    <ui-field
      type="password"
      name="my-field"
      label="Field"
      autocomplete="off"
      :disabled="disabled"
    />
    <a @click="disabled = !disabled">Toggle</a>
    <ui-submit name="submit" label="Submit" />
  </ui-form>
</template>

<script>
export default {
  data: function () {
    return {
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
    handleSubmit: function (form) {
      if (form) {
        form.startProcessing()
        form.disable()

        setTimeout(() => {
          form.endProcessing()
          console.log(form)
        }, 3000)
      }
    },
  }
}
</script>

<style>
#app {
  margin: 5rem;
}

.ui-field {
  width: 100%;
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