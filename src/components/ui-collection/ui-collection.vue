<template>
  <div class="ui-collection">
    <table ref="items" class="ui-collection-items" v-if="display === 'table'">
      <thead>
        <template>
          <slot
            name="head"
          />
        </template>
      </thead>
      <tbody>
        <template
          v-for="(item, index) in results"
        >
          <slot
            name="body"
            v-bind="item"
            :idx="index"
          />
        </template>
      </tbody>
    </table>
    <div ref="items" class="ui-collection-items" v-else>
      <div
        class="ui-collection-item"
        :key="'itm' + index"
        v-for="(item, index) in results"
      >
        <slot
          name="body"
          :idx="index"
          v-bind="item"
        />
      </div>
    </div>
    <div class="ui-loader" :class="disabledClass" v-if="loader === 'button'">
      <ui-field
        type="button"
        name="more"
        :class="buttonClass"
        :disabled="!hasMore() || disabled"
        :badge="isLoading ? { type: 'wait' } : null"
        @click="getMore"
      />
    </div>
    <div class="ui-paginator" v-if="loader === 'paginate'">
      <div class="ui-paginator-ctrls" :class="disabledClass">
        <a :class="prevClass" @click="prevPage()" />
        <input
          ref="input"
          type="number"
          class="ui-paginator__input"
          :value="localPage"
          :disabled="disabled"
          @click="handleClick"
          @blur="handleBlur"
          @keydown.enter="handleInput"
        />
        <a :class="nextClass" @click="nextPage()" />
        <ui-badge
          :value="{ type: 'wait' }"
          v-if="isLoading"
        />
      </div>
      <div class="ui-paginator__label">
        of {{ localTotal }}
      </div>
    </div>
  </div>
</template>

<script>
import UiField from '../ui-field/ui-field.vue'
import UiBadge from '../ui-badge/ui-badge.vue'

export default {
  name: 'ui-collection',
  emits: [
    'getPage',
    'update:page',
  ],
  components: {
    UiField,
    UiBadge,
  },
  props: {
    options: Array,
    remote: Boolean,
    loader: String,
    display: String,
    max: [String, Number],
    page: [String, Number],
    total: [String, Number],
    delay: [String, Number],
    scrolltarget: String,
  },
  data () {
    return {
      disabled: false,
      timer: null,
      localMax: Number(this.max) || 9999999,
      isLoading: false,
    }
  },
  watch: {
    options () {
      this.disabled = false
      this.isLoading = false
      clearTimeout(this.timer)
    }
  },
  computed: {
    localPage () {
      let output = 1

      if (this.page) {
        output = Number(this.page)
      }

      return output
    },
    localTotal () {
      let output = 1

      if (this.remote) {
        if (this.total) {
          output = this.total
        }
      } else {
        output = Math.ceil(this.options.length / this.localMax)
      }

      return output
    },
    localDelay () {
      let output = 400

      if (this.delay) {
        output = this.delay * 1000
      }

      return output
    },
    results () {
      if (this.loader === 'paginate' && typeof window === 'object') {
        window.scrollTo(0, 0);
      }

      if (this.remote) {
        return this.options
      } else {
        return this.getPage(this.localPage)
      }
    },
    disabledClass () {
      let output = ''

      if (this.disabled) {
        output += ' --disabled'
      }

      return output
    },
    prevClass () {
      let output = "ui-paginator__button --prev"

      if (this.localPage < 2 || this.disabled) {
        output += ' --disabled'
      }

      return output
    },
    nextClass () {
      let output = "ui-paginator__button --next"

      if (this.localPage >= this.localTotal || this.disabled) {
        output += ' --disabled'
      }

      return output
    },
    buttonClass () {
      let output = 'ui-loader-button'

      if (this.isLoading) {
        output += ' --loading'
      }

      return output
    }
  },
  methods: {
    getMore () {
      if (this.remote) {
        this.nextPage()
      } else {
        this.localMax += Number(this.max)
      }
    },
    hasMore () {
      if (this.remote) {
        return this.localPage < this.localTotal
      } else {
        return this.results.length < this.options.length
      }
    },
    canGetMore () {
      if (!this.$refs.items) { return }

      let _contents = this.$refs.items.getBoundingClientRect()
      let _bound = document.documentElement.clientHeight

      if (_contents.bottom < _bound && this.hasMore()) {
        return true
      } else {
        return false
      }
    },
    handleScroll () {
      if (this.canGetMore()) {
        this.getMore()
      }
    },
    getPage (i) {
      let start = (i-1) * this.localMax
      let end = start + Number(this.localMax)

      return this.options.slice(start, end)
    },
    getPageRemotely (i) {
      this.isLoading = true
      this.wait()
      this.$emit('getPage', i)
    },
    nextPage () {
      if (this.disabled) { return }
      if (this.localPage < this.localTotal) {
        if (this.remote) {
          this.getPageRemotely(this.localPage + 1)
        } else {
          this.$emit('update:page', this.localPage + 1)   
        }
      }
    },
    prevPage () {
      if (this.disabled) { return }
      if (this.localPage > 1) {
        if (this.remote) {
          this.getPageRemotely(this.localPage - 1)
        } else {
          this.$emit('update:page', this.localPage - 1)   
        }
      }
    },
    handleInput (e) {
      if (this.disabled) { return }

      let pg = e.currentTarget.value

      if (pg > this.localTotal) { pg = this.localTotal }
      if (pg < 1) { pg = 1 }

      if (this.remote) {
        this.getPageRemotely(pg)
      } else {
        this.$emit('update:page', pg)
        this.$refs.input.blur()
      }
    },
    handleClick (e) {
      e.currentTarget.value = ''
    },
    handleBlur (e) {
      e.currentTarget.value = this.localPage
    },
    pgClass (i) {
      let output = 'ui-pagination-item'

      if (i === this.localPage) {
        output += ' --active'
      }

      return output
    },
    wait () {
      this.disabled = true
      this.timer = setTimeout(() => { this.isLoading = true }, this.localDelay)
    }
  },
  updated () {
    if (this.loader === 'scroll') {
      if (this.canGetMore() && this.hasMore()) {
        this.getMore()
      }
    }
  },
  mounted () {
    if (this.loader === 'scroll') {
      let target = document

      if (this.scrolltarget && this.$el) {
        target = this.$el.closest(this.scrolltarget)
      }

      if (typeof target !== 'undefined') {
        target.addEventListener('scroll', this.handleScroll)
      }

      if (this.canGetMore() && this.hasMore()) {
        this.getMore()
      }
    }
  }
}
</script>

<style>
.ui-loader {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.ui-loader:before,
.ui-loader:after {
  content: '';
  flex-grow: 1;
  border-top: dashed 0.2rem var(--color-brdr-quarternary);
}

.ui-loader .ui-field.--button {
  margin-bottom: 0;
}

.ui-loader-button {
  position: relative;
  z-index: 1;
  margin: 0 2rem;
}

.ui-loader-button .ui-field__button{
  margin: 0;
}

.ui-loader-button .ui-field__button:after {
  content: 'Load More'
}

.ui-loader-button .ui-field__button:disabled:after {
  content: 'No More Items'
}

.ui-loader-button.--loading .ui-field__button:disabled:after {
  content: 'Loading...'
}

.ui-paginator {
  display: flex;
  align-items: center;
}

.ui-paginator-ctrls {
  display: flex;
  border: solid 0.2rem var(--color-brdr-primary);
  border-radius: 0.4rem;
  transition: all 0.3s ease-out;
  background: var(--color-bg-primary);
  width: 16rem;
  position: relative;
}

.ui-paginator-ctrls.--disabled .ui-paginator__input,
.ui-paginator-ctrls.--disabled .ui-paginator__button {
  opacity: 0.5;
}

.ui-paginator-ctrls .ui-badge {
  top: -1.5rem;
  right: -1.5rem;
}

.ui-paginator__input {
  font-size: 1.6rem;
  padding: 1rem;
  color: var(--color-text-primary);
  background-color: transparent;
  border: none;
  outline: none;
  display: block;
  width: 100%;
  text-align: center;
  -moz-appearance: textfield;
  min-width: 5rem;
  box-shadow: none;
}

.ui-paginator__input::-webkit-inner-spin-button, 
.ui-paginator__input::-webkit-outer-spin-button { 
-webkit-appearance: none; 
margin: 0; 
}

.ui-paginator__button {
  cursor: pointer;
  user-select: none;
  flex: 0 0 4rem;
  border-width: 0 0 0 0.2rem;
  border-style: solid;
  border-radius: 0;
  border-color: var(--color-brdr-primary);
  transition: border 0.3s ease-out;
  padding: 0;
  box-shadow: none;
}

.ui-paginator__button.--prev {
  border-width: 0 0.2rem 0 0;
}

.ui-paginator__button:before {
  content: '';
  width: 100%;
  height: 100%;
  background-size: 2.4rem;
  background-position: center center;
  background-repeat: no-repeat;
  display: block;
  opacity: 0.5;
}

.ui-paginator__button.--disabled:before {
  opacity: 0.2;
}

.ui-paginator__button.--prev:before {
  background-image: url('../../assets/images/icon-arrow-left.svg');
}

.ui-paginator__button.--next:before {
  background-image: url('../../assets/images/icon-arrow-right.svg');
}

.ui-paginator__label {
  margin-left: 2rem;
  word-spacing: 1rem;
  font-size: 1.8rem;
}

@media (hover: hover) and (pointer: fine) {
  .ui-paginator-ctrls:not(.--disabled):hover,
  .ui-paginator-ctrls:hover .ui-paginator__button:not(.--disabled) {
    border-color: var(--hilite-brdr-primary);
  }

  .ui-paginator-ctrls:not(.--disabled) .ui-paginator__input:hover {
    background-color: var(--hilite-bg-primary);
    color: var(--color-text-inverted);
  }

  .ui-paginator__button:not(.--disabled):hover {
    background-color: var(--hilite-bg-primary);
  }

  .ui-paginator__button:not(.--disabled):hover:before {
    filter: invert(100);
    opacity: 1;
  }
}

.ui-paginator__button:not(.--disabled):active {
  background-color: var(--dim-bg-primary);
}

.ui-paginator-ctrls:focus-within,
.ui-paginator-ctrls:focus-within .ui-paginator__button {
  border-color: var(--hilite-brdr-primary);
}
</style>