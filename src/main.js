import Vue from 'vue'
import { generateFilePath } from '@nextcloud/router'
import { getRequestToken } from '@nextcloud/auth'
import { translate as t, translatePlural as n } from '@nextcloud/l10n'

import App from './App.vue'

// CSP配置
__webpack_nonce__ = btoa(getRequestToken())

// 创建Vue应用
Vue.mixin({ methods: { t, n } })

export default new Vue({
    el: '#app',
    render: h => h(App),
}) 