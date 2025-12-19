// Leaderboard Durable Object
export class LeaderboardDO {
    constructor(state, env) {
        this.state = state;
        this.env = env;
        this.sessions = new Set(); // WebSocket connections
    }

    async fetch(request) {
        const url = new URL(request.url);

        // Handle WebSocket upgrade
        if (request.headers.get('Upgrade') === 'websocket') {
            return this.handleWebSocket(request);
        }

        // Handle API requests
        if (url.pathname === '/submit') {
            return this.handleSubmitScore(request);
        }

        if (url.pathname === '/get') {
            return this.handleGetLeaderboard(request);
        }

        if (url.pathname === '/delete') {
            return this.handleDeletePlayer(request);
        }

        return new Response('Not found', { status: 404 });
    }

    async handleWebSocket(request) {
        const pair = new WebSocketPair();
        const [client, server] = Object.values(pair);

        // Accept the WebSocket connection
        server.accept();

        // Add to active sessions
        this.sessions.add(server);

        // Send current leaderboard immediately
        const leaderboard = await this.getLeaderboard();
        server.send(JSON.stringify({
            type: 'update',
            leaderboard: leaderboard
        }));

        // Handle messages from client
        server.addEventListener('message', async (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'submit') {
                    await this.submitScore(data.playerId, data.playerName, data.score);
                    // Broadcast update to all clients
                    await this.broadcastLeaderboard();
                }
            } catch (error) {
                console.error('WebSocket message error:', error);
            }
        });

        // Remove from sessions when closed
        server.addEventListener('close', () => {
            this.sessions.delete(server);
        });

        return new Response(null, {
            status: 101,
            webSocket: client,
        });
    }

    async handleSubmitScore(request) {
        try {
            const { playerId, playerName, score } = await request.json();

            if (!playerId || !playerName || typeof score !== 'number') {
                return new Response('Invalid request', { status: 400 });
            }

            await this.submitScore(playerId, playerName, score);
            await this.broadcastLeaderboard();

            return new Response(JSON.stringify({ success: true }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    async handleGetLeaderboard(request) {
        try {
            const leaderboard = await this.getLeaderboard();
            return new Response(JSON.stringify({ leaderboard }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    async handleDeletePlayer(request) {
        try {
            const { playerId } = await request.json();

            if (!playerId) {
                return new Response('Player ID is required', { status: 400 });
            }

            await this.deletePlayer(playerId);
            await this.broadcastLeaderboard();

            return new Response(JSON.stringify({ success: true, message: `Player ${playerId} deleted` }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    async submitScore(playerId, playerName, score) {
        // Get current scores
        const scores = await this.state.storage.get('scores') || {};

        // Update or add player score
        scores[playerId] = {
            playerName,
            score,
            timestamp: Date.now()
        };

        // Keep only top 100 players to limit storage
        const sortedPlayers = Object.entries(scores)
            .sort((a, b) => {
                // Sort by score descending, then by timestamp ascending (older = higher rank for ties)
                if (b[1].score !== a[1].score) {
                    return b[1].score - a[1].score;
                }
                return a[1].timestamp - b[1].timestamp;
            })
            .slice(0, 100);

        const limitedScores = Object.fromEntries(sortedPlayers);

        // Save to storage
        await this.state.storage.put('scores', limitedScores);
    }

    async deletePlayer(playerId) {
        const scores = await this.state.storage.get('scores') || {};

        if (scores[playerId]) {
            delete scores[playerId];
            await this.state.storage.put('scores', scores);
            return true;
        }

        return false;
    }

    async getLeaderboard(limit = 10) {
        const scores = await this.state.storage.get('scores') || {};

        // Sort and format leaderboard
        const leaderboard = Object.entries(scores)
            .sort((a, b) => {
                if (b[1].score !== a[1].score) {
                    return b[1].score - a[1].score;
                }
                return a[1].timestamp - b[1].timestamp;
            })
            .slice(0, limit)
            .map(([playerId, data], index) => ({
                rank: index + 1,
                playerId,
                playerName: data.playerName,
                score: data.score
            }));

        return leaderboard;
    }

    async broadcastLeaderboard() {
        const leaderboard = await this.getLeaderboard();
        const message = JSON.stringify({
            type: 'update',
            leaderboard: leaderboard
        });

        // Send to all connected WebSocket clients
        for (const session of this.sessions) {
            try {
                session.send(message);
            } catch (error) {
                // Remove failed sessions
                this.sessions.delete(session);
            }
        }
    }
}
