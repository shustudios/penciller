<template>  
  <ui-form id="Form" @submit="handleSubmit">
    <ui-field
      type="radio"
      name="transition"
      label="Display"
      :value="localTrans"
      :options="trans"
      @input="val => localTrans = val"
      :rules="[]"
    />
    <div class="ui-cols">
      <ui-field
        type="autosuggest"
        name="autosuggest"
        label="Field 2"
        :options="options"
        :rules="[]"
      />
      <ui-field
        type="tags"
        name="tags"
        label="Tags"
        :options="options"
        :balloon="{ type: localTrans }"
        :rules="[]"
      />
      <ui-menu
        :options="options"
        :balloon="{ type: localTrans }"
        @input="handleInput"
      />
    </div>
    <ui-field
      type="textarea"
      label="Textarea"
      name="textarea"
    />
    <div class="ui-cols">
      <ui-field
        type="select"
        name="select"
        label="Options"
        :balloon="{ type: localTrans }"
        :options="options"
        :rules="[]"
      />
      <ui-field
        type="color"
        name="color"
        label="Color"
        :balloon="{ type: localTrans }"
        :rules="[]"
      />
    </div>
    <ui-split-button
      label="Test"
    >
      <div style="height: 10rem" />
    </ui-split-button>
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
      localTrans: 'dropdown',
      trans: [
        { label: 'Default', value: 'dropdown' },
        { label: 'Drawer', value: 'drawer' },
      ],
    }
  },
  computed: {
  },
  methods: {
    handleSubmit: function (form) {
      if (form) {
        console.log(form.fields)
      }
    },
    handleInput: function (val) {
      console.log('--->', val)
    }
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