<template>
  <div :class="filterClass">
    <input
      ref="input"
      class="ui-filter__input"
      type="text"
      :value="localValue"
      :placeholder="placeholder"
      :name="name"
      :disabled="disabled"
      @input="handleInput"
    />
    <div :class="itemsClass">
      {{ itemsCount }}
    </div>
  </div>
</template>

<script>
import Fuse from 'fuse.js'

export default {
  name: 'ui-filter',
  props: {
    options: { type: Array, required: true },
    name: String,
    placeholder: String,
    disabled: Boolean,
    value: String,
    focus: [String, Boolean],
    select: [String, Boolean],
    fuse: Object,
    total: [String, Number],
  },
  data: function() {
    return {
      focused: false,
      localValue: this.value,
      origOptions: null,
      count: this.options.length,
    }
  },
  computed: {
    localTotal: {
      get: function () {
        return Number(this.total)
      },
      set: function (newValue) {
        return newValue
      }
    },
    hasTotal: {
      get: function () {
        let output = false

        if(!isNaN(this.localTotal) && this.total !== null) {
          output = true
        }

        return output
      },
      set: function (newValue) {
        return newValue
      }
    },
    itemsCount: {
      get: function () {
        let output = this.count

        if (this.hasTotal && this.options.length < this.localTotal) {
          output = this.format(this.count) + ' / ' + this.format(this.localTotal)
        }

        return output
      },
      set: function (newValue) {
        return newValue
      }
    },
    filterClass: {
      get: function () {
        let output = 'ui-filter'

        if (this.disabled === 'true' || this.disabled === true) {
          output += ' --disabled'
        }

        if (this.focused) { output += ' --focused' }

        return output
      },
      set: function (newValue) {
        return newValue
      }
    },
    itemsClass: {
      get: function () {
        let output = 'ui-filter__items'

        if ((this.hasTotal && this.localTotal === 1) || (!this.hasTotal && this.count === 1)) {
          output += ' --singular'
        }

        return output
      },
      set: function (newValue) {
        return newValue
      }
    }
  },
  watch: {
    options: function (newValue) {
      this.count = newValue.length
    }
  },
  methods: {
    handleInput: function(e) {
      let newValue = e.currentTarget.value
      let fuseOptions = this.extend({
        threshold: 0.2,
        minMatchCharLength: 1,
      }, this.fuse, true)

      let output = this.origOptions
      let dict = new Fuse(this.origOptions, fuseOptions)

      if (dict !== null && newValue.length > 0) {
        let results = dict.search(newValue)
        output = []

        for (let i in results) {
          output.push(results[i].item)
        }
      }

      this.count = output.length
      this.localValue = newValue
      this.$emit('update:value', this.localValue)
      this.$emit('update:options', output)
      this.$emit('filter', output)
    },
    format: function (num) {
      let output = num

      if (num > 9999) { output = (num / 1000) + 'K' }
      if (num > 999999) { output = (num / 1000000) + 'M' }

      return output
    },
    extend: function (orig_obj, new_obj, add) {
      if (new_obj) {
        Object.keys(new_obj).forEach(key => {
          if (orig_obj.hasOwnProperty(key) || add === true) {
            orig_obj[key] = new_obj[key];
          }
        })
      }

      return orig_obj
    },
    handleFocus: function () {
      this.focused = true
    },
    handleBlur: function () {
      this.focused = false
    },
    handleDefaultFocus: function (select) {
      if (this.$refs.input) {
        this.$refs.input.focus()
        
        if (select) {
          this.$nextTick(() => {
            this.$refs.input.select()
          })
        }
      }
    },
  },
  mounted: function () {
    if (this.origOptions === null) {
      this.origOptions = this.options
    }

    this.$refs.input.addEventListener('focus', this.handleFocus)
    this.$refs.input.addEventListener('blur', this.handleBlur)

    if (this.focus) { this.handleDefaultFocus() }
    if (this.select) { this.handleDefaultFocus(true) }
  },
  beforeDestroy: function () {
    this.$refs.input.removeEventListener('focus', this.handleFocus)
    this.$refs.input.removeEventListener('blur', this.handleBlur)
  }
}
</script>

<style>
.ui-filter {
  display: flex;
  border: solid 0.2rem var(--color-brdr-primary);
  border-radius: 0.4rem;
  transition: all 0.3s ease-out;
  background: var(--color-bg-primary);
  margin: 0 0 0.5rem 0;
}

.ui-filter .ui-filter__input {
  font-size: 1.6rem;
  padding: 1rem;
  color: var(--color-text-primary);
  background-color: transparent;
  border: none;
  outline: none;
  display: block;
  width: 100%;
}

.ui-filter .ui-filter__input::placeholder {
  color: var(--color-text-tertiary);
}

.ui-filter.--focused {
  border-color: var(--dim-brdr-primary);
}

.ui-filter.--disabled {
  opacity: 0.5;
  cursor: default;
}

.ui-filter__items {
  padding: 0.4rem 1.5rem;
  margin: 0.4rem;
  border: solid 0.2rem var(--color-brdr-quarternary);
  border-radius: 0.2rem;
  white-space: nowrap;
  color: var(--color-text-secondary);
  font-size: 1.5rem;
}

.ui-filter__items:after {
  content: 'items';
}

.ui-filter__items.--singular:after {
  content: 'item';
}

@media (hover: hover) and (pointer: fine) {
  .ui-filter:not(.--disabled):not(.--focused):hover {
    border-color: var(--hilite-brdr-primary);
  }
}
</style>