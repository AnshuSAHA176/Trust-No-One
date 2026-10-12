# 🎭 Trust No One — Real Backend Integration & Architecture Report

## 1. Executive Summary
The frontend for **Trust No One** is fully connected to the real Django REST Framework backend and Django Channels ASGI WebSocket server. All random features, mock fallback tokens, fake bot responses, and simulated scenarios have been removed.

---

## 2. Real API Endpoints Discovered & Frontend Usage

| # | Endpoint | Method | Backend View / Handler | Frontend Usage |
|---|---|---|---|---|
| 1 | `/register/` | `POST` | `apps.accounts.views.RegisterView` | Real registration form with email and password (min 8 chars) validation. |
| 2 | `/login/` | `POST` | `apps.accounts.views.LoginView` | Real login yielding SimpleJWT `{ access, refresh }` tokens. |
| 3 | `/game/` | `GET` | `apps.game.views.GameView` | Fetches real list of games created by the user (`id`, `status`, `created_at`). |
| 4 | `/game/` | `POST` | `apps.game.views.GameView` | Creates game chamber with player `name`. Triggers server-side Groq scenario generation and assigns 4 participants (1 human, 3 AI bots). |
| 5 | `/game/<id>/start/` | `POST` | `apps.game.views.StartGameView` | Starts the pending game chamber on the server and returns `first_turn: { player_id, is_human }`. |
| 6 | `/game/<id>/vote/` | `POST` | `apps.game.views.VoteView` | Casts player accusation vote (`target: <player_uuid>`). Validates self-voting prevention and enforces 1 vote per player constraint. |
| 7 | `/game/<id>/vote/` | `GET` | `apps.game.views.VoteView` | Retrieves real-time vote tally and ballot counts across all participants. |
| 8 | `/game/<id>/finish/` | `POST` | `apps.game.views.GameFinnishedView` | Authoritative win condition evaluation. Identifies eliminated suspect and declares `winner` ("partner", "gaddar", or "Draw"). |
| 9 | `/conversation/history/?game=<id>` | `GET` | `apps.conversation.views.ConversationHistoryView` | Retrieves persistent chat transcript for the game. |
| 10 | `/conversation/message/` | `POST` | `apps.conversation.views.MessageView` | REST fallback for transmitting messages. |
| 11 | `/ws/games/<id>/chat/?token=<token>` | `WS` | `apps.conversation.consumer.ChatConsumer` | Real-time bi-directional WebSocket conversation with Django Channels. |

---

## 3. What Mocked / Fake Features Were Removed
1. **Mock Session Provisioning**: Removed automatic fake token generation (`mock_jwt_*`) and fake emails.
2. **Fake Scenarios**: Removed hardcoded `DEFAULT_SCENARIOS`.
3. **Simulated Bot Responses**: Removed client-side setTimeout bot reply generation (`simulateBotResponse`).
4. **Mock Game Factory**: Removed `createMockGame` with hardcoded participant arrays and fake personalities.
5. **Invented Outcomes**: Eliminated frontend-computed voting and victory states. The frontend now exclusively reflects server responses.

---

## 4. Backend Nuances & Missing Capabilities
- **Public Scenario & Alibi Exposure**: During `POST /game/`, the backend generates rich mystery scenarios and private alibis using Groq and writes them to PostgreSQL. However, the existing DRF `POST /game/` response view omits `scenario` and `player.private_information` from its return dictionary, and there is no detail endpoint `GET /game/<id>/`. The frontend accurately reflects the server-assigned role and player IDs, and clearly indicates this contract constraint in the Secret Dossier.
- **WebSocket Human Broadcast**: In `apps/conversation/consumer.py`, when a human player submits a message, the consumer broadcasts `"message": "send"`. The frontend detects this signal and automatically refetches `/conversation/history/?game=<id>` to keep the transcript synchronized with the server.
- **No Backend Logout Route**: Django REST Framework uses stateless JWTs without a token blacklist endpoint. Logout is handled cleanly on the client by purging stored tokens and notifying reactive subscribers.

---

## 5. Environment Configuration
The frontend uses Vite's built-in development proxy (`frontend/vite.config.ts`) pointing to `http://127.0.0.1:8001`.

Optional environment variables in `frontend/.env`:
```env
VITE_API_BASE_URL=
VITE_WS_URL=ws://127.0.0.1:8001
```

---

## 6. How to Start the Full Application

### 1. Ensure Prerequisites
Docker containers for Postgres (`pgvector` port 5435) and Redis (port 6378) must be running.

### 2. Start Django Backend (Daphne ASGI)
```bash
uv run python src/manage.py runserver 127.0.0.1:8001
```

### 3. Start Celery Worker (for AI Bot Question & Vote Processing)
```bash
uv run celery -A config worker --loglevel=info --concurrency=1
```

### 4. Start Vite Frontend
```bash
cd frontend
npm run dev
```
Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser.
