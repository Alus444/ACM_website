import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import BoothPage from '../pages/BoothPage.vue'
import ContactPage from '../pages/ContactPage.vue'
import MoviePage from '../pages/MoviePage.vue'
import PricingPage from '../pages/PricingPage.vue'
import WorksPage from '../pages/WorksPage.vue'
import NightOverPage from '../pages/NightOverPage.vue'
import VhsSimulatorPage from '../pages/VhsSimulatorPage.vue'

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
    {
      path: '/vhs-simulator/recipes',
      redirect: '/vhs-simulator/quick-start',
    },
    {
      path: '/vhs-simulator/rendering',
      redirect: '/vhs-simulator/preview',
    },
    {
      path: '/vhs-simulator/limits',
      redirect: '/vhs-simulator/troubleshooting',
    },
    {
      path: '/vhs-simulator/:page?',
      component: VhsSimulatorPage,
      meta: {
        standalone: true,
        title: 'ACM VHS Simulator — リファレンスマニュアル',
      },
    },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, top: 84, behavior: 'smooth' }
    return { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = typeof to.meta.title === 'string' ? to.meta.title : 'ACM'
})

export default router
