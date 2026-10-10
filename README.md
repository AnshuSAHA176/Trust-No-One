# 🎭 Trust No One

**Trust No One** is an AI-powered multiplayer social deduction game where players investigate a mysterious incident, question each other, and try to discover the traitor hiding among them.

Can you identify the Gaddar before it's too late? Remember — not everyone is telling the truth.

## 🎮 Game Overview

Each game features **4 players**:

- 🕵️ **1 Gaddar** — the traitor who tries to hide their identity.
- 🤝 **3 Partners** — investigators who work together to uncover the truth.

The game generates a mystery scenario filled with clues, alibis, suspicious events, and conflicting statements. Players communicate in real time while AI-controlled characters ask questions and respond according to their personalities and secret information.

## ✨ Features

- **AI-generated mysteries:** Create suspenseful scenarios with an Indian atmosphere, humor, and unexpected clues.
- **AI-powered characters:** Bots have individual roles, personalities, private information, and alibis.
- **Real-time chat:** Exchange messages through WebSockets.
- **Dynamic questioning:** AI bots can ask other players questions and respond to incoming questions.
- **Role-based deception:** Partners investigate while the Gaddar strategically deflects suspicion.
- **Backend-controlled game state:** The backend manages player roles, game phases, and game progression.
- **Voting and elimination:** Planned gameplay functionality for identifying and eliminating suspicious players.

## 🕹️ How to Play

1. **Start a game** — a mystery scenario is generated.
2. **Receive your role** — discover whether you are a Partner or the Gaddar.
3. **Investigate** — examine the scenario, clues, timelines, and alibis.
4. **Question players** — ask questions and compare answers.
5. **Find contradictions** — identify suspicious behavior and inconsistent stories.
6. **Vote and eliminate** — vote for the player you suspect, once voting is implemented.
7. **Reveal the outcome** — determine whether the Partners exposed the Gaddar or the Gaddar survived.

## 🧠 AI Architecture

The project uses LangGraph to organize AI workflows.

**Scenario generation**
- Generates mystery settings, incidents, evidence, and timelines.

**Question generation**
- Selects another player and generates a short, relevant question.
- Uses conversation history to avoid repetitive questions.

**Response generation**
- Generates character-based replies using role, personality, alibi, private information, and conversation history.

The LLM generates dialogue, while the backend remains responsible for authoritative game state and win conditions.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Python | Core backend language |
| Django | Backend framework |
| Django REST Framework | REST API |
| PostgreSQL | Persistent data storage |
| pgvector | Vector database extension, if used by the current implementation |
| Django Channels | WebSocket communication |
| Daphne | ASGI server |
| Redis | Channel layer and task infrastructure |
| Celery | Background AI tasks |
| LangChain | LLM integration |
| LangGraph | AI workflow orchestration |
| Groq API | Language model inference |

## 🏗️ Architecture

```text
Player / Game Client
        |
        v
 Django REST API
        |
        +------ PostgreSQL
        |
        +------ Django Channels
        |             |
        |          WebSocket
        |             |
        |          Live Chat
        |
        +------ Celery
                    |
                 Redis
                    |
                    v
             LangGraph Workflows
                    |
                    v
                 Groq API
                    |
                    v
           AI Question / Reply
                    |
                    v
          Save and Broadcast
```

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Docker
- `uv`
- A Groq API key

### 1. Clone the repository

```bash
git clone https://github.com/AnshuSAHA176/Trust_No_One.git
cd Trust_No_One
```

### 2. Install dependencies

```bash
uv sync
```

### 3. Configure environment variables

Create a `.env` file using the variable names expected by your Django settings.

Example:

```env
DJANGO_SECRET_KEY=your-secret-key
DEBUG=True

DATABASE_URL=your-database-url

GROQ_API_KEY=your-groq-api-key

REDIS_URL=redis://127.0.0.1:6378/0
```

Adjust the database and Redis variables to match your actual configuration. Never commit real API keys or production secrets.

### 4. Start PostgreSQL

If your existing PostgreSQL container is already configured, reuse it. Otherwise, create a suitable PostgreSQL container with persistent storage and the required extensions.

### 5. Run migrations

```bash
uv run python src/manage.py migrate
```

Use the correct `manage.py` path if your project structure differs.

### 6. Start Django

```bash
uv run python src/manage.py runserver
```

### 7. Start Celery

Run the Celery worker using your project's actual Celery application module:

```bash
uv run celery -A YOUR_CELERY_APP worker --loglevel=info --concurrency=1
```

Replace `YOUR_CELERY_APP` with the module that exposes your Celery application.

### 8. Connect the game client

Authenticate through your existing API and connect to the configured game WebSocket endpoint. The WebSocket route and authentication requirements depend on your current Channels configuration.

## 🔐 Security and Game Integrity

- Player roles must be assigned and validated by the backend.
- Clients must not be allowed to change their own roles or authoritative game state.
- Validate that messages and actions belong to the authenticated player and correct game.
- Voting must be validated server-side before votes are counted.
- Keep API keys and database credentials in environment variables.

## 🗺️ Roadmap

- [x] User registration and authentication
- [x] Game model and scenario generation
- [x] AI player question generation
- [x] AI player responses
- [x] Real-time chat infrastructure
- [ ] Voting phase and vote submission
- [ ] Elimination system
- [ ] Tie handling and vote results
- [ ] Automated win-condition checks
- [ ] Improved bot-turn orchestration
- [ ] Game history and statistics
- [ ] Frontend game interface

*The checklist should be updated to match the implementation in the repository.*

## 🎯 Project Goal

The goal of Trust No One is to combine real-time multiplayer communication, AI-driven character behavior, and social deduction into a mystery game where every conversation could reveal a clue — or hide the truth.

**Question everyone. Trust no one. Find the Gaddar.**

## 👨‍💻 Author

**Anshu Saha**

GitHub: [@AnshuSAHA176](https://github.com/AnshuSAHA176)

## 📄 License

Choose a license before distributing the project publicly. Until a license is added, reuse and redistribution permissions are not explicitly granted.
