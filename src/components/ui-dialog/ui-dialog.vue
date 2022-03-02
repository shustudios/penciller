<template>
  <transition name="dialog-fade" @after-enter="showContent = true">
    <div ref="screen" class="ui-dialog-screen" @scroll="hijackScroll" v-if="showScreen">

      <transition name="dialog-fade" @after-leave="showScreen = false">
        <div class="ui-dialog" v-if="showContent">

          <div v-if="message" v-html="message" class="ui-dialog-content" />
          <slot v-else class="ui-dialog-content" />
          <div class="ui-dialog-ctrls">

            <div class="ui-dialog-ctrl">
              <ui-field
                type="button"
                name="cancel"
                :label="cancel.label"
                :disabled="isWaiting"
                :class="cancel.css"
                :key="cancel.key"
                @click="cancel.func"
                v-if="hasCancel"
              />
            </div>

            <div class="ui-dialog-ctrl">
              <ui-field
                type="button"
                name="confirm"
                :label="confirm.label"
                :disabled="isWaiting"
                :class="confirm.css"
                :key="confirm.key"
                @click="confirm.func"
                v-if="hasConfirm"
              />
              <ui-badge
                v-model="badge"
                v-if="isWaiting"
              />
            </div>

          </div>

        </div>
      </transition>

    </div>
  </transition>
</template>

<script>
import UiBadge from '../ui-badge/ui-badge.vue'
import UiField from '../ui-field/ui-field.vue'

export default {
  name: 'ui-dialog',
  props: {
    message: String,
    confirm: Object,
    cancel: Object,
    enabled: [String, Boolean],
  },
  components: {
    UiField,
    UiBadge,
  },
  data: function () {
    return {
      showScreen: false,
      showContent: false,
      badge: { type: 'wait' },
    }
  },
  watch: {
    enabled: function (newValue) {
      if (newValue === true || newValue === 'true') {
        this.showScreen = true
      } else {
        this.showContent = false
      }
    }
  },
  computed: {
    isWaiting: function () {
      if (this.confirm && this.confirm.wait) {
        return true
      } else {
        return false
      }
    },
    hasCancel: function () {
      if (this.cancel) {
        if (typeof this.cancel.label === 'string' && typeof this.cancel.func === 'function') {
          return true
        }
      }

      return false
    },
    hasConfirm: function () {
      if (this.confirm) {
        if (typeof this.confirm.label === 'string' && typeof this.confirm.func === 'function') {
          return true
        }
      }
      
      return false
    }
  },
  methods: {
    hijackScroll: function (e) {
      e.preventDefault()
    }
  }
}
</script>

<style>

.ui-dialog-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--vellum);
  z-index: 1000;
  justify-content: center;
  align-items: center;
  font-size: 1.6rem;
  line-height: 1.25em;
  display: flex;
}

.ui-dialog {
  max-width: 34rem;
  max-height: 26rem;
  background-color: var(--color-bg-primary);
  padding: 4rem;
  border-radius: 0.4rem;
  border: solid 0.2rem var(--color-brdr-primary);
  min-width: 20rem;
  flex-direction: column;
  text-align: center;
  color: var(--color-text-primary);
}

.ui-dialog-content {
  flex-grow: 1;
}

.ui-dialog-ctrls {
  display: flex;
  justify-content: center;
}

.ui-dialog-ctrl {
  margin-top: 3rem;
  position: relative;
}

.ui-dialog .ui-field.--button {
  user-select: none;
  margin-bottom: 0;
}

.ui-dialog-ctrl:first-child .ui-field.--button {
  margin-right: 1rem;
}

.dialog-fade-enter-active, .dialog-fade-leave-active {
  transition: all 0.3s ease-out;
}

.dialog-fade-enter, .dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter.ui-dialog {
  transform: scale(0.95);
}
</style>