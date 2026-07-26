import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import BoothPage from '../pages/BoothPage.vue'
import ContactPage from '../pages/ContactPage.vue'
import MoviePage from '../pages/MoviePage.vue'
import PricingPage from '../pages/PricingPage.vue'
import WorksPage from '../pages/WorksPage.vue'
import NightOverPage from '../pages/NightOverPage.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/booth', component: BoothPage },
    { path: '/movie', component: MoviePage },
    { path: '/pricing', component: PricingPage },
    { path: '/contact', component: ContactPage },
    { path: '/works', component: WorksPage },
    {
      path: '/nightover/:page?',
      component: NightOverPage,
      meta: {
        standalone: true,
        title: 'NIGHTOVER — 機能リファレンス',
      },
    },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = typeof to.meta.title === 'string' ? to.meta.title : 'ACM'
})

export default router
