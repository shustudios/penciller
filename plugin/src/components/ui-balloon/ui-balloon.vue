<template>
  <transition
    :name="'ui-balloon-' + transition"
  >
    <div
      :style="localPlacement"
      :class="'ui-balloon-' + transition + direction"
      v-if="enabled"
      @mousedown="e => { $emit('mousedown', e) }"
    >
      <slot />
    </div>
  </transition>
</template>

<script>
export default {
  name: 'ui-balloon',
  emits: [
    'close',
    'mousedown'
  ],
  props: {
    container: String,
    enabled: Boolean,
    transition: String,
  },
  data () {
    return {
      parent: null,
      timer: null,
      localWidth: '',
      localX: 0,
      localY: 0,
      prevState: {},
      observer: null,
      direction: '',
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
    localPlacement: {
      get () {
        let output = ''
        
        output += 'width: ' + this.localWidth + 'px;'
        output += 'left: ' + this.localX + 'px;'
        output += 'top: ' + this.localY + 'px;'

        return output
      },
      set (newValue) {
        return newValue
      }
    }
  },
  watch: {
    enabled (newValue) {
      if (newValue) {
        this.timer = window.requestAnimationFrame(this.observe);
        document.dispatchEvent(new CustomEvent('ui-close', { detail: this.parent }))
      } else {
        window.cancelAnimationFrame(this.timer)
      }
    }
  },
  methods: {
    init () {
      this.parent = this.$el.parentElement

      if (!this.container) {
        document.body.appendChild(this.$el)
      } else {
        this.localContainer.appendChild(this.$el)
      }

      if (this.parent) {
        this.prevState = this.parent.getBoundingClientRect()
      }

      window.addEventListener('scroll', this.handleViewchange)
      window.addEventListener('resize', this.handleViewchange)
    },
    teardown () {
      if (this.$el && this.parent) {
        this.parent.appendChild(this.$el)
      }

      window.removeEventListener('scroll', this.handleViewchange)
      window.removeEventListener('resize', this.handleViewchange)
    },
    observe () {
      let state = this.parent.getBoundingClientRect()

      if (this.objChanged(state, this.prevState)) {
        this.$emit('close')
      }

      this.timer = window.requestAnimationFrame(this.observe);
    },
    updatePosition () {
      if (!this.$el || !this.$el.getBoundingClientRect) { return }

      let _parent = this.parent.getBoundingClientRect()
      let _container = this.localContainer.getBoundingClientRect()
      let _balloon = this.$el.getBoundingClientRect()

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

      this.localWidth = _parent.width
      this.localX = _parent.left
      this.localY = _pos + _scrollY

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
    handleViewchange () {
      this.$emit('close')
    },
    handleClose (e) {
      if (e.detail !== this.parent) {
        this.$emit('close')
      }
    }
  },
  updated () {
      if (this.enabled === true) {
          this.$nextTick(this.updatePosition)
      }
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
.ui-balloon-slide {
  margin-top: 0.5rem;
}

.ui-balloon-sliderev {
  margin-top: -0.5rem;
}

.ui-balloon-slide-enter-active, .ui-balloon-slide-leave-active {
  transition: margin-top 0.2s ease-out, opacity 0.2s ease-out;
}

.ui-balloon-slide-enter, .ui-balloon-slide-enter-from, .ui-balloon-slide-leave-to {
  margin-top: 0 !important;
  opacity: 0;
}
</style>