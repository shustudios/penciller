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
      isSelected: false,
    }
  },
  beforeUnmount () {
    this.$parent.removeTab(this)
  },
  mounted () {
    this.$parent.tabs.push(this)
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