import './src/assets/styles/reset.css'
import './src/assets/styles/variables.css'
import './src/assets/styles/layout.css'

import Penciller from './src/includes/penciller.js'

import UiBadge from './src/components/ui-badge/ui-badge.vue'
import UiCollection from './src/components/ui-collection/ui-collection.vue'
import UiDialog from './src/components/ui-dialog/ui-dialog.vue'
import UiField from './src/components/ui-field/ui-field.vue'
import UiForm from './src/components/ui-form/ui-form.vue'
import UiProgress from './src/components/ui-progress/ui-progress.vue'
import UiRepeater from './src/components/ui-repeater/ui-repeater.vue'
import UiSplitButton from './src/components/ui-split-button/ui-split-button.vue'
import UiSubmit from './src/components/ui-submit/ui-submit.vue'
import UiTabset from './src/components/ui-tabset/ui-tabset.vue'
import UiTasklist from './src/components/ui-tasklist/ui-tasklist.vue'
import UiTree from './src/components/ui-tree/ui-tree.vue'


export default {
    install(Vue) {
        Vue.config.globalProperties.$penciller = new Penciller()
        
        let prefix = Vue.config.globalProperties.$penciller.prefix

        Vue.component(prefix + 'Badge', UiBadge)
        Vue.component(prefix + 'Collection', UiCollection)
        Vue.component(prefix + 'Dialog', UiDialog)
        Vue.component(prefix + 'Field', UiField)
        Vue.component(prefix + 'Form', UiForm)
        Vue.component(prefix + 'Progress', UiProgress)
        Vue.component(prefix + 'Repeater', UiRepeater)
        Vue.component(prefix + 'SplitButton', UiSplitButton)
        Vue.component(prefix + 'Submit', UiSubmit)
        Vue.component(prefix + 'Tabset', UiTabset)
        Vue.component(prefix + 'Tasklist', UiTasklist)
        Vue.component(prefix + 'Tree', UiTree)
    }
}