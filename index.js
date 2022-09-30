import './src/assets/styles/reset.css'
import './src/assets/styles/variables.css'
import './src/assets/styles/layout.css'

import Penciller from './src/includes/penciller.js'

import UiBadge from './src/components/ui-badge/ui-badge.vue'
import UiDialog from './src/components/ui-dialog/ui-dialog.vue'
import UiField from './src/components/ui-field/ui-field.vue'
import UiForm from './src/components/ui-form/ui-form.vue'
import UiSubmit from './src/components/ui-submit/ui-submit.vue'


export default {
    install(Vue) {
        Vue.config.globalProperties.$penciller = new Penciller()
        
        let prefix = Vue.config.globalProperties.$penciller.prefix

        Vue.component(prefix + 'Badge', UiBadge)
        Vue.component(prefix + 'Dialog', UiDialog)
        Vue.component(prefix + 'Field', UiField)
        Vue.component(prefix + 'Form', UiForm)
        Vue.component(prefix + 'Submit', UiSubmit)
    }
}