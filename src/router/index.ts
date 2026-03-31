import { createRouter, createWebHistory } from 'vue-router';
import { SongList } from '@chordpro/shared';
import SongView from '@/pages/SongView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/songs' },
    { path: '/songs', component: SongList },
    { path: '/song/:slug', name: 'song', component: SongView },
  ],
});

export default router;
