import './src/assets/styles/reset.css'
import './src/assets/styles/variables.css'
import './src/assets/styles/layout.css'

import Penciller from './src/includes/penciller.js'

import UiBadge from './src/components/ui-badge/ui-badge.vue'
import UiCalendar from './src/components/ui-balloon/ui-calendar.vue'
import UiCollection from './src/components/ui-collection/ui-collection.vue'
import UiCreditCard from './src/components/ui-credit-card/ui-credit-card.vue'
import UiDialog from './src/components/ui-dialog/ui-dialog.vue'
import UiField from './src/components/ui-field/ui-field.vue'
import UiFilter from './src/components/ui-filter/ui-filter.vue'
import UiForm from './src/components/ui-form/ui-form.vue'
import UiMenu from './src/components/ui-menu/ui-menu.vue'
import UiProgress from './src/components/ui-progress/ui-progress.vue'
import UiRepeater from './src/components/ui-repeater/ui-repeater.vue'
import UiSplitButton from './src/components/ui-split-button/ui-split-button.vue'
import UiSubmit from './src/components/ui-submit/ui-submit.vue'
import UiTab from './src/components/ui-tabset/ui-tab.vue'
import UiTabset from './src/components/ui-tabset/ui-tabset.vue'
import UiTasklist from './src/components/ui-tasklist/ui-tasklist.vue'
import UiTree from './src/components/ui-tree/ui-tree.vue'

export default {
  install(app) {
    let prefix

    if (app.prototype) {
      // Vue 2
      app.prototype.$penciller = new Penciller()
      prefix = app.prototype.$penciller.prefix
    } else {
      // Vue 3
      app.config.globalProperties.$penciller = new Penciller()
      prefix = app.config.globalProperties.$penciller.prefix
    }

    app.component(`${prefix}Badge`, UiBadge)
    app.component(`${prefix}Calendar`, UiCalendar)
    app.component(`${prefix}Collection`, UiCollection)
    app.component(`${prefix}CreditCard`, UiCreditCard)
    app.component(`${prefix}Dialog`, UiDialog)
    app.component(`${prefix}Field`, UiField)
    app.component(`${prefix}Filter`, UiFilter)
    app.component(`${prefix}Form`, UiForm)
    app.component(`${prefix}Menu`, UiMenu)
    app.component(`${prefix}Progress`, UiProgress)
    app.component(`${prefix}Repeater`, UiRepeater)
    app.component(`${prefix}SplitButton`, UiSplitButton)
    app.component(`${prefix}Submit`, UiSubmit)
    app.component(`${prefix}Tab`, UiTab)
    app.component(`${prefix}Tabset`, UiTabset)
    app.component(`${prefix}Tasklist`, UiTasklist)
    app.component(`${prefix}Tree`, UiTree)
  }
}