import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import BoothPage from '../pages/BoothPage.vue'
import ContactPage from '../pages/ContactPage.vue'
import MoviePage from '../pages/MoviePage.vue'
import PricingPage from '../pages/PricingPage.vue'
import WorksPage from '../pages/WorksPage.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/booth', component: BoothPage },
    { path: '/movie', component: MoviePage },
    { path: '/pricing', component: PricingPage },
    { path: '/contact', component: ContactPage },
    { path: '/works', component: WorksPage },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})
