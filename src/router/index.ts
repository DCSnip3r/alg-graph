import { createRouter, createWebHashHistory } from 'vue-router';
import AlgGraph from '../components/AlgGraph.vue';
import ForceGraph3D from '../components/ForceGraph3D.vue';

const routes = [
  {
    path: '/',
    name: 'AlgGraph',
    component: AlgGraph,
  },
  {
    path: '/3d',
    name: 'ForceGraph3D',
    component: ForceGraph3D,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
