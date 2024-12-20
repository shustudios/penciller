<template>
  <transition
    :name="'balloon-screen-trans-' + type"
    @after-enter="showContent = true"
  >
    <div
      ref="screen"
      :style="screenPlacement"
      :class="'ui-balloon-screen --' + type"
      :key="screenKey"
      v-if="showScreen"
    >
      <transition
        :name="'balloon-trans-' + type"
        @after-leave="showScreen = false"
        @enter="handleEnter"
        @after-enter="$emit('opened')"
      >
        <div
          ref="balloon"
          :tabindex="tabIdx"
          :style="balloonPlacement"
          :class="'ui-balloon ' + css + ' ' + direction"
          @click="handleClick"
          v-if="showContent"
        >
          <slot />
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'ui-balloon',
  emits: [
    'close',
    'mousedown',
    'opened',
    'blur',
  ],
  props: {
    container: String,
    enabled: Boolean,
    css: String,
    local: Boolean,
    type: {
      type: String,
      default: () => 'dropdown'
    },
    stop: {
      type: Boolean,
      default: () => true
    }
  },
  data () {
    return {
      parent: null,
      localWidth: '',
      localX: 0,
      localY: 0,
      prevState: {},
      direction: '',
      showContent: false,
      showScreen: false,
      screenKey:0,
    }
  },
  computed: {
    localContainer: {
      get () {
        let output = document.documentElement

        if (this.container) {
          if (this.$parent.$el) {
            output = this.$parent.$el.closest(this.container)
          }
        }

        return output
      },
      set (newValue) {
        return newValue
      }
    },
    tabIdx: function () {
      let output = 0

      if (this.local) {
        output = -1
      }

      return output
    },
    screenPlacement: function () {
      let output = ''

      if (this.type === 'drawer') {
        output = { top:window.scrollY + 'px' } // position:fixed mobile bugfix
      } else {
        output = this.getPlacement()
      }

      return output
    },
    balloonPlacement: function () {
      let output = ''

      if (this.type === 'drawer') {
        output = this.getPlacement()
      }

      return output
    },
  },
  watch: {
    local () {
      this.init()
    },
    enabled (newValue) {
      if (newValue === true || newValue === 'true') {
        this.screenKey++ // position:fixed mobile bugfix
        this.showScreen = true
        document.dispatchEvent(new CustomEvent('ui-close', { detail: this.parent }))
      } else {
        this.showContent = false
      }
    }
  },
  methods: {
    init () {
      let el = this.$el
      this.parent = this.$el.parentElement
      
      if (this.local) {
        if (this.$parent.$el !== this.parent) {
          this.$parent.$el.appendChild(el)
        }
      } else {
        if (!this.container) {
          document.body.appendChild(el)
        } else {
          this.localContainer.appendChild(el)
        }
      }

      if (this.parent) {
        this.prevState = this.parent.getBoundingClientRect()
      }

      window.addEventListener('wheel', this.handleWheel, { passive: false })
      window.addEventListener('touchmove', this.handleWheel, { passive: false })
      window.addEventListener('resize', this.handleViewchange)
    },
    teardown () {
      if (this.$el && this.parent) {
        this.parent.appendChild(this.$el)
      }

      window.removeEventListener('wheel', this.handleWheel)
      window.removeEventListener('touchmove', this.handleWheel)
      window.removeEventListener('resize', this.handleViewchange)
    },
    getPlacement () {
      let output = ''
        
      switch (this.type) {
        case 'dropdown':
          if (!this.local) {
            output += 'width: ' + this.localWidth + 'px;'
            output += 'left: ' + this.localX + 'px;'
            output += 'top: ' + this.localY + 'px;'
          }
          break

        case 'drawer':
          output += 'top: calc(100% - ' + this.localY + 'px);'
          break
      }

      return output
    },
    updatePosition () {
      if (!this.$el || !this.$el.getBoundingClientRect) { return }

      let _parent = this.parent.getBoundingClientRect()
      let _container = this.localContainer.getBoundingClientRect()
      let _balloon = this.$refs.balloon.getBoundingClientRect()

      let _balloonStyle = getComputedStyle(this.$el)
      let _balloonMargins = parseInt(_balloonStyle.marginTop) + parseInt(_balloonStyle.marginBottom)
      let _balloonOuterHeight = _balloon.height + _balloonMargins

      let _scrollY = document.documentElement.scrollTop
      let _topBound = 0
      let _btmBound = document.documentElement.clientHeight
      let _pos = _parent.bottom

      if (this.localContainer !== document.documentElement) {
        _topBound = _container.top
        _btmBound = _container.bottom
      }

      let _spaceAbove = _parent.top - _topBound
      let _spaceBelow = _btmBound - _parent.bottom
      let _hasSpaceBelow = _spaceBelow > _balloonOuterHeight

      if (_hasSpaceBelow) {
        this.direction = ''
        _pos = _parent.bottom
      } else {
        this.direction = 'rev'
        if (_spaceAbove > _spaceBelow) {
          _pos = _parent.top - _balloonOuterHeight
        } else {
          _pos = _parent.bottom
        }
      }

      switch (this.type) {
        case 'dropdown':
          if (!this.local) {
            this.localWidth = _parent.width
            this.localX = _parent.left
            this.localY = _pos + _scrollY
          }
          break

        case 'drawer':
          this.localX = 0
          this.localY = _balloonOuterHeight
          break
      }

      this.prevState = _parent
    },
    objChanged (obj1, obj2) {
      let output = false

      for (let i in obj1) {
        if (!obj2[i] || obj1[i] !== obj2[i]) {
          output = true
        }
      }

      return output
    },
    handleClick (e) {
      if (this.stop) {
        e.stopPropagation()
      }
    },
    handleWheel (e) {
      if (this.enabled) {
        if (e.target.closest('.ui-balloon')) {
          return
        } else {
          e.preventDefault()
          e.stopPropagation()
        }
      }
    },
    handleEnter () {
      this.$nextTick(this.updatePosition)
    },
    handleViewchange () {
      this.$emit('close')
    },
    handleClose (e) {
      if (e.detail !== this.parent) {
        this.$emit('close')
      }
    },
  },
  mounted () {
      this.init()

      if (typeof document === 'object') {
        document.addEventListener('ui-close', this.handleClose)
      }
  },
  beforeDestroy () {
      this.teardown()
  }
}
</script>

<style>
.ui-balloon-screen {
  outline: none;
}

.ui-balloon .ui-field-item {
  padding: 1rem 1rem 1rem 4rem;
  cursor: pointer;
  border-top: solid 0.1rem var(--color-brdr-quarternary);
  outline: none;
  position: relative;
  color: var(--color-text-primary);
}

.ui-balloon .ui-field-item:first-child {
  border: none;
}

.ui-balloon .ui-field-item.--selected:before {
  content: '';
  background-position: 0.5rem center;
  background-repeat: no-repeat;
  background-size: contain;
  background-image: url('../../assets/images/icon-check.svg');
  display: block;
  width: 3rem;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.ui-balloon .ui-field-item.--focused  {
  background-color: var(--dim-bg-primary);
  color: var(--color-text-inverted);
  border-color: var(--dim-bg-primary);
}

.ui-balloon .ui-field-item.--focused + .ui-field-item {
  border-color: var(--dim-bg-primary);
}

.ui-balloon .ui-field-item.--focused:before {
  filter: invert(100%);
}

.ui-balloon .ui-field-itemgroup {
  border-top: solid 0.2rem var(--color-brdr-primary);
  background-color: var(--color-bg-primary);
}

.ui-balloon .ui-field-itemgroup + .ui-field-item,
.ui-balloon .ui-field-itemgroup .ui-field-itemgroup__label + .ui-field-item {
  border-top: none;
}

.ui-balloon .ui-field-itemgroup__label {
  padding: 0.5rem 1rem;
  outline: none;
  color: var(--color-text-secondary);
  background-color: var(--color-bg-primary);
  border-bottom: solid 0.2rem var(--color-brdr-primary);
  font-size: 1.3rem;
  position: sticky;
  top: 0;
  z-index: 1;
}

.ui-balloon .ui-field-itemgroup__label:after {
  content: ":";
}

/* Dropdown Type */
.ui-balloon-screen.--dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  z-index: 1000;
  user-select: none;
}

.ui-balloon-screen.--dropdown .ui-balloon {
  border-radius: 0.4rem;
  border: solid 0.2rem var(--dim-brdr-primary);
  background-color: var(--color-bg-primary);
  box-shadow: 0.2rem 0.2rem var(--shade);
  margin-top: 0.5rem;
  max-height: 30rem;
  overflow: auto;
}

.ui-balloon-screen.--dropdown .ui-balloonrev {
  margin-top: -0.5rem;
}

.balloon-trans-dropdown-enter-active,
.balloon-trans-dropdown-leave-active {
  transition: margin-top 0.2s ease-out, opacity 0.2s ease-out;
}

.balloon-trans-dropdown-enter,
.balloon-trans-dropdown-enter-from,
.balloon-trans-dropdown-leave-to {
  margin-top: 0 !important;
  opacity: 0;
}



/* Drawer Type */

.ui-balloon-screen.--drawer {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  overflow: hidden;
  z-index: 1000;
  background-color: var(--vellum-inverted);
}

.ui-balloon-screen.--drawer .ui-balloon {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  border-radius: 1rem 1rem 0 0;
  background-color: var(--color-bg-primary);
  box-shadow: 0.2rem 0.2rem var(--shade);
  overflow: auto;
  user-select: none;
  max-height: 34rem;
}

.ui-balloon-screen.--drawer .ui-field-item {
  padding: 2rem 2rem 2rem 4rem;
}

.balloon-screen-trans-drawer-enter-active,
.balloon-screen-trans-drawer-leave-active {
  transition: opacity 0.2s ease-out;
}

.balloon-screen-trans-drawer-enter,
.balloon-screen-trans-drawer-enter-from,
.balloon-screen-trans-drawer-leave-to {
  opacity: 0 !important;
}

.balloon-trans-drawer-enter-active,
.balloon-trans-drawer-leave-active {
  transition: top 0.2s ease-out;
}

.balloon-trans-drawer-enter,
.balloon-trans-drawer-enter-from,
.balloon-trans-drawer-leave-to {
  top: 100% !important;
}


@media (hover: hover) and (pointer: fine) {
  .ui-balloon .ui-field-item:hover {
    background-color: var(--hilite-bg-primary);
    color: var(--color-text-inverted);
    border-color: var(--hilite-bg-primary);
  }

  .ui-balloon .ui-field-item:hover + .ui-field-item {
    border-color: var(--hilite-bg-primary);
  }

  .ui-balloon .ui-field-item.--selected:hover:before {
    filter: invert(100%);
  }
}

</style>