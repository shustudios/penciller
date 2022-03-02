<template>
  <div class="ui-repeater">

    <div
      ref="fieldsets"
      v-for="(fieldset, idx) in localFields"
      :class="fieldsetClass(idx)"
      :key="'fieldset_' + idx"
    >
      <div class="ui-fieldset-body">
        <slot v-bind="fieldset" :idx="idx" />
      </div>
      <div class="ui-fieldset-ctrls">
        <div
          :class="viewClass(idx)"
          @click="toggleView(idx)"
          v-if="isCollapsible"
        />
        <div :class="switchClass" v-if="isMoveable" @click.stop>
          <div class="ui-fieldset__icon --switch" @click="toggleSwitchMenu(idx)" />
          <div :class="switchMenuClass(idx)">
            <div
              class="switch__button"
              @click="moveFieldsetUp(idx)"
              v-if="idx > 0"
            >
              Move Up
            </div>
            <div
              class="switch__button"
              @click="moveFieldsetDown(idx)"
              v-if="idx < localFields.length - 1"
            >
              Move Down
            </div>
          </div>
        </div>
        <div
          :class="deleteClass"
          @click="deleteFieldset(idx)"
        />
      </div>
    </div>

    <ui-field
      type="button"
      name="add"
      class="--add"
      :label="label || 'Add'"
      :disabled="!canAdd"
      @click="addFieldset"
    />

  </div>
</template>

<script>
import UiField from '../ui-field/ui-field.vue'

export default {
  name: 'ui-repeater',
  props: {
    collapsed: Array,
    reorder: [String, Boolean],
    label: String,
    values: {
      type: Array,
      default: function () {
        return []
      }
    },
    template: Object,
  },
  components: {
    UiField,
  },
  data: function() {
    return {
      switchMenu: -1,
      localCollapsed: this.collapsed,
    }
  },
  computed: {
    isCollapsible: function () {
      let output = false

      if (Array.isArray(this.collapsed)) {
        output = true
      }

      return output
    },
    isMoveable: function () {
      let output = false

      if (this.localFields.length > 1) {
        if (this.reorder === true || this.reorder === 'true') {
          output = true
        }
      }

      return output
    },
    canAdd: {
      get: function () {
        let output = true

        if (this.localFields.length >= this.localMax) {
          output = false
        }

        if (!this.template || Object.keys(this.template).length === 0) {
          if (this.localFields.length == 0) {
            output = false
          }
        }

        return output
      },
      set: function (newValue) {
        return newValue
      }
    },
    localFields: {
      get: function () {
        let output = JSON.parse(JSON.stringify(this.values))

        if (this.localMin) {
          if (output.length < this.localMin) {
            let count = this.localMin - output.length

            if (count > 0) {
              for (let fieldIdx=0; fieldIdx<count; fieldIdx++) {
                output.push(this.template)
              }

              this.$emit('update', output)
            }
          }
        }

        return output
      },
      set: function (newValue) {
        return newValue
      }
    },
    localMax: {
      get: function () {
        if (!isNaN(this.$attrs.max)) {
          return this.$attrs.max
        } else {
          return null
        }
      },
      set: function (newValue) {
        return newValue
      }
    },
    localMin: {
      get: function () {
        if (!isNaN(this.$attrs.min)) {
          return this.$attrs.min
        } else {
          return 1
        }
      },
      set: function (newValue) {
        return newValue
      }
    },
    deleteClass: {
      get: function () {
        let output = 'ui-fieldset__icon --delete'

        if (this.localFields.length <= this.localMin) {
          output += ' --disabled'
        }

        return output
      },
      set: function (newValue) {
        return newValue
      }
    },
    switchClass: {
      get: function () {
        let output = 'ui-fieldset-switch'

        if (this.localFields.length <= this.localMin) {
          output += ' --disabled'
        }

        return output
      },
      set: function (newValue) {
        return newValue
      }
    },
  },
  methods: {
    moveFieldsetUp: function (idx) {
      let snip = this.localFields.splice(idx, 1)[0]
      this.localFields.splice(idx - 1, 0, snip)
      this.switchMenu = -1

      this.$emit('update', JSON.parse(JSON.stringify(this.localFields)))
    },
    moveFieldsetDown: function (idx) {
      let snip = this.localFields.splice(idx, 1)[0]
      this.localFields.splice(idx + 1, 0, snip)
      this.switchMenu = -1

      this.$emit('update', JSON.parse(JSON.stringify(this.localFields)))
    },
    addFieldset: function () {
      let fieldset = {}
      let lastField = this.localFields[this.localFields.length - 1]

      if (this.template) {

        fieldset = this.template

      } else {

        for (let key in lastField) {
          if (lastField.hasOwnProperty(key)) {
            fieldset[key] = ''
          }
        }

      }

      this.localFields.push(fieldset)
      this.$emit('update', JSON.parse(JSON.stringify(this.localFields)))
    },
    deleteFieldset: function (idx) {
      if (this.localFields.length > this.localMin) {
        this.localFields.splice(idx, 1)
        this.$emit('update', JSON.parse(JSON.stringify(this.localFields)))
      }
    },
    toggleView: function (idx) {
      if (this.localCollapsed.includes(idx)) {
        this.localCollapsed.splice(this.localCollapsed.indexOf(idx), 1)
      } else {
        this.localCollapsed.push(idx)
      }

      this.$emit('view', this.localCollapsed)
    },
    toggleSwitchMenu: function (idx) {
      if (this.switchMenu === idx) {
        this.switchMenu = -1
      } else {
        this.switchMenu = idx
        document.dispatchEvent(new CustomEvent('ui-close', { detail: this.$parent.$el }))
      }
    },
    switchMenuClass: function (idx) {
      let output = 'switch-menu'

      if (idx === this.switchMenu) {
        output += ' --enabled'
      }

      if (idx > 0 && idx < (this.localFields.length-1)) {
        output += ' --full'
      }

      return output
    },
    viewClass: function (idx) {
      let output = 'ui-fieldset__icon'

      if (Array.isArray(this.localCollapsed) && this.localCollapsed.includes(idx)) {
        output += ' --show'
      } else {
        output += ' --hide'
      }

      return output
    },
    fieldsetClass: function (idx) {
      let output = 'ui-fieldset'

      if (Array.isArray(this.localCollapsed) && this.localCollapsed.includes(idx)) {
        output += ' --hidden'
      }

      return output
    },
    handleBodyClick: function () {
      this.switchMenu = -1
    },
    handleClose: function (e) {
      if (e.detail !== this.$parent.$el) {
        this.switchMenu = -1
      }
    }
  },
  mounted: function () {
    if (typeof document === 'object') {
      document.body.addEventListener('click', this.handleBodyClick)
      document.addEventListener('ui-close', this.handleClose)
    }
  }
}
</script>

<style>
.ui-repeater {
  margin-bottom: 3rem;
}

.ui-repeater .ui-field {
  margin-bottom: 1rem;
}

.ui-repeater .ui-field.--add {
  display: table;
}

.ui-repeater__separator {
  height: 0.2rem;
  background-color: var(--color-brdr-primary);
  margin: 0 0 2.5rem 0;
}

.ui-fieldset {
  display: flex;
  align-items: center;
  padding-bottom: 1rem;
  margin-bottom: 2rem;
  border-bottom: dashed 0.2rem var(--color-brdr-quarternary);
}

.ui-fieldset.--hidden .ui-fieldset-body {
  height: 0;
}

.ui-fieldset.--hidden:before {
  content: ' -- Field collapsed -- ';
  display: inline-block;
  color: var(--color-text-tertiary);
  padding: 1.5rem 0;
  width: 100%;
}

.ui-fieldset.--hidden .ui-fieldset-ctrls > *:not(.--show) {
  display: none;
}

.ui-fieldset-body {
  flex-grow: 1;
}

.ui-fieldset__icon {
  width: 6rem;
  height: 4rem;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 2.4rem;
  opacity: 0.4;
  cursor: pointer;
}

.ui-fieldset__icon.--disabled {
  display: none;
  cursor: default;
}

.ui-fieldset__icon.--hide { background-image: url('../../assets/images/icon-hide.svg'); }
.ui-fieldset__icon.--show { background-image: url('../../assets/images/icon-view.svg'); }
.ui-fieldset__icon.--delete { background-image: url('../../assets/images/icon-trash.svg'); }
.ui-fieldset__icon.--switch { background-image: url('../../assets/images/icon-switch-vertical.svg'); background-size: 2rem; }

.ui-fieldset-switch {
  position: relative;
  z-index: 10;
}

.switch-menu {
  padding: 0.5rem;
  position: absolute;
  top: calc(50% - 2.5rem);
  right: 100%;
  width: 14rem;
  background-color: var(--color-bg-primary);
  border: solid 0.2rem var(--dim-brdr-primary);
  border-radius: 0.4rem;
  z-index: 1;
  display: none;
  user-select: none;
}

.switch-menu.--enabled {
  display: block;
}

.switch-menu.--full {
  top: calc(50% - 5rem);
}

.switch-menu:before,
.switch-menu:after {
  content: '';
  position: absolute;
  top: calc(50% - 0.8rem);
  left: 100%;
  border-width: 0.8rem;
  border-style: solid;
  border-color: transparent transparent transparent var(--dim-brdr-primary);
  z-index: 1;
}

.switch-menu:after {
  border-left-color: var(--color-bg-primary);
  z-index: 2;
  left: calc(100% - 0.3rem);
}

.switch__button {
  padding: 0.5rem 2rem;
  border-radius: 0.4rem;
  background-color: var(--color-bg-secondary);
  text-align: center;
  cursor: pointer;
  margin-bottom: 0.5rem;
}

.switch__button:last-child {
  margin: 0;
}

@media (hover: hover) and (pointer: fine) {
  .ui-fieldset__icon:not(.--disabled):hover {
    opacity: 0.7;
  }

  .switch__button:hover {
    background-color: var(--hilite-bg-primary);
    color: var(--color-text-inverted);
  }
}
</style>