import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import PhraseText from './components/PhraseText'

createApp(App).component('PhraseText', PhraseText).use(router).mount('#app')
