import html from './index.html';
import { LeaderboardDO } from './LeaderboardDO.js';

export { LeaderboardDO };

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // API Routes
        if (url.pathname.startsWith('/api/leaderboard')) {
            // Get Durable Object instance
            const id = env.LEADERBOARD.idFromName('global-leaderboard');
            const stub = env.LEADERBOARD.get(id);

            // Handle WebSocket upgrade
            if (url.pathname === '/api/leaderboard/ws') {
                return stub.fetch(request);
            }

            // Handle score submission
            if (url.pathname === '/api/leaderboard/submit' && request.method === 'POST') {
                return stub.fetch(new Request(url.origin + '/submit', {
                    method: 'POST',
                    headers: request.headers,
                    body: request.body
                }));
            }

            // Handle get leaderboard
            if (url.pathname === '/api/leaderboard/get') {
                return stub.fetch(new Request(url.origin + '/get'));
            }

            // Handle player deletion
            if (url.pathname === '/api/leaderboard/delete' && request.method === 'POST') {
                return stub.fetch(new Request(url.origin + '/delete', {
                    method: 'POST',
                    headers: request.headers,
                    body: request.body
                }));
            }
        }

        // Serve HTML for all other routes
        return new Response(html, {
            headers: {
                'content-type': 'text/html;charset=UTF-8',
            },
        });
    },
};
