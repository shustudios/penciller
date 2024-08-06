<template>
  <div
    class="ui-tab-content"
    :class="{ '--selected': isSelected }"
  >
    <slot />
  </div>
</template>

<script>
export default {
  name: 'ui-tab',
  props: {
    label: String,
    selected: Boolean,
  },
  data () {
    return {
      isSelected: this.selected,
      idx: 0,
    }
  },
  watch: {
    selected: function (newValue) {
      if (newValue === true) {
        this.$parent.select(this.idx)
      }
    }
  },
  beforeUnmount () {
    this.$parent.removeTab(this)
    this.idx = this.$parent.tabs.length-1
  },
  mounted () {
    this.$parent.tabs.push(this)
    this.idx = this.$parent.tabs.length-1
  }
}
</script>

<style>
.ui-tab-content {
  padding: 1rem 0;
  display: none;
}

.ui-tab-content.--selected {
  display: block;
}
</style>