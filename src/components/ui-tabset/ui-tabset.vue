<template>
  <div class="ui-tabset">
    <div ref="tabs" class="ui-tabs">
      <a
        v-for="(tab, i) in tabs"
        class="ui-tab"
        :class="{ '--selected': selectedTab == i }"
        :key="i"
        @click="select(i, $event)"
        @keyup.space="select(i, $event)"
        :tabindex="setTabindex(i)"
      >
        {{tab.label}}
      </a>
    </div>
    <slot />
  </div>
</template>

<script>
export default {
  name: 'ui-tabset',
  data: function() {
    return {
      tabs: [],
      selectedTab: null,
    }
  },
  methods: {
    setTabindex(i) {
      if (i === this.selectedTab) {
        return false
      } else {
        return '0'
      }
    },
    select(i, e) {
      if (e) { e.preventDefault(); }

      this.deselectAll()
      this.selectedTab = i
      this.tabs[i].isSelected = true
      this.$emit('change', i)
    },
    deselectAll() {
      for (let i=0; i<this.tabs.length; i++) {
        this.tabs[i].isSelected = false
      }
    }
  },
  mounted() {
    for (let i=0; i<this.tabs.length; i++) {
      if (this.tabs[i].selected) {
        this.select(i)
        break;
      }
    }
  }
}
</script>

<style>
.ui-tabs {
  display: flex;
  padding: 0 2rem;
  border-bottom: dashed 0.2rem var(--color-brdr-quarternary);
}

.ui-tab {
  display: block;
  padding: 1.5rem 2rem;
  border-width: 0.2rem 0.2rem 0 0.2rem;
  border-style: dashed;
  border-color: transparent;
  border-radius: 0.4rem 0.4rem 0 0;
  margin: 0 1rem -0.2rem 1rem;
  cursor: pointer;
  user-select: none;
  text-align: center;
  transition: all 0.2s ease-out;
  outline: none;
}

.ui-tab.--selected {
  background-color: var(--color-bg-primary);
  border-color: var(--color-brdr-quarternary);
}

</style>