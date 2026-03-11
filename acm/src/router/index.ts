import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import BoothPage from '../pages/BoothPage.vue'
import ContactPage from '../pages/ContactPage.vue'
import MoviePage from '../pages/MoviePage.vue'
import PricingPage from '../pages/PricingPage.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/booth', component: BoothPage },
    { path: '/movie', component: MoviePage },
    { path: '/pricing', component: PricingPage },
    { path: '/contact', component: ContactPage },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})
