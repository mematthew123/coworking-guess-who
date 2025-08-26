import { definePlugin } from 'sanity';
import { BarChartIcon } from '@sanity/icons';
import { route } from 'sanity/router';
import GameAnalyticsTool from './GameAnalyticsTool';

export const gameAnalytics = definePlugin(() => {
    return {
        name: 'game-analytics',
        tools: [
            {
                name: 'game-analytics',
                title: 'Game Analytics',
                icon: BarChartIcon,
                component: GameAnalyticsTool,
                route: route.create('/*'),
            },
        ],
    };
});
