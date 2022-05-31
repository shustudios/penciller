import './src/assets/styles/reset.css'
import './src/assets/styles/variables.css'
import './src/assets/styles/layout.css'

import Penciller from './src/includes/penciller.js'
import Validator from './src/includes/validator.js'

import UiBadge from './src/components/ui-badge/ui-badge.vue'
import UiCollection from './src/components/ui-collection/ui-collection.vue'
import UiCreditCard from './src/components/ui-credit-card/ui-credit-card.vue'
import UiDialog from './src/components/ui-dialog/ui-dialog.vue'
import UiField from './src/components/ui-field/ui-field.vue'
import UiFilter from './src/components/ui-filter/ui-filter.vue'
import UiForm from './src/components/ui-form/ui-form.vue'
import UiProgress from './src/components/ui-progress/ui-progress.vue'
import UiRepeater from './src/components/ui-repeater/ui-repeater.vue'
import UiSplitButton from './src/components/ui-split-button/ui-split-button.vue'
import UiSubmit from './src/components/ui-submit/ui-submit.vue'
import UiTab from './src/components/ui-tabset/ui-tab.vue'
import UiTabset from './src/components/ui-tabset/ui-tabset.vue'
import UiTasklist from './src/components/ui-tasklist/ui-tasklist.vue'
import UiTree from './src/components/ui-tree/ui-tree.vue'


export default {
    install(Vue, options) {
        if (!options) {
            options = { prefix: 'Ui' }
        }

        if (!options.prefix) {
            options.prefix = 'Ui'
        }

        Vue.prototype.$penciller = new Penciller()
        Vue.prototype.$validator = new Validator()

        Vue.component(options.prefix + 'Badge', UiBadge)
        Vue.component(options.prefix + 'Collection', UiCollection)
        Vue.component(options.prefix + 'CreditCard', UiCreditCard)
        Vue.component(options.prefix + 'Dialog', UiDialog)
        Vue.component(options.prefix + 'Field', UiField)
        Vue.component(options.prefix + 'Filter', UiFilter)
        Vue.component(options.prefix + 'Form', UiForm)
        Vue.component(options.prefix + 'Progress', UiProgress)
        Vue.component(options.prefix + 'Repeater', UiRepeater)
        Vue.component(options.prefix + 'SplitButton', UiSplitButton)
        Vue.component(options.prefix + 'Submit', UiSubmit)
        Vue.component(options.prefix + 'Tab', UiTab)
        Vue.component(options.prefix + 'Tabset', UiTabset)
        Vue.component(options.prefix + 'Tasklist', UiTasklist)
        Vue.component(options.prefix + 'Tree', UiTree)
    }
}