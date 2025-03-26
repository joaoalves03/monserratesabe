import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/Home.vue')
    },
    {
        path: '/game/:id',
        name: 'Game',
        component: () => import('@/views/Game.vue')
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        children: [
            {
                path: 'questions',
                name: 'Questions',
                component: () => import("@/views/dashboard/Questions.vue"),
            },
            {
                path: 'categories',
                name: 'Categories',
                component: () => import("@/views/dashboard/Categories.vue"),
            },
            {
                path: 'teams',
                name: 'Teams',
                component: () => import("@/views/dashboard/Teams.vue"),
            },
            {
                path: 'previewer',
                name: 'Previewer',
                component: () => import("@/views/dashboard/Previewer.vue"),
            },
        ]
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router