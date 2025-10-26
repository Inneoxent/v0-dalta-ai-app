# Dalta AI - Production-Ready PWA

A comprehensive AI chat application built with React, TypeScript, and Tailwind CSS. Features real-time messaging, offline-first PWA capabilities, semantic search, and a 5-agent workflow system.

## Features

- **User Authentication**: Email/password and OAuth support
- **Real-time Chat**: WebSocket-ready messaging with fallback to polling
- **Offline-First PWA**: Works completely offline with automatic sync
- **Semantic Search**: Search conversation history with embeddings
- **Accessibility**: WCAG 2.1 AA compliant
- **Dark Mode**: Modern minimal aesthetic
- **Multi-agent System**: PM, Designer, Frontend, Backend, AI Agent coordination

## Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS v4
- **State Management**: Zustand with persistence
- **Offline**: Service Worker + IndexedDB
- **Backend**: Node.js/Express or Python/FastAPI
- **AI**: OpenAI, Anthropic, or local models via AI SDK
- **Deployment**: Docker + Vercel/AWS

## Quick Start

### Development

\`\`\`bash
npm install
npm run dev
\`\`\`

Visit `http://localhost:3000`

### Demo Credentials

- Email: `demo@dalta.ai`
- Password: `demo123`

### Build for Production

\`\`\`bash
npm run build
npm start
\`\`\`

### PWA Installation

1. Open app in Chrome/Edge
2. Click install prompt or use menu → "Install app"
3. App works offline with cached assets and IndexedDB

## Project Structure

\`\`\`
dalta-ai/
├── app/
│   ├── api/              # API routes
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main app
├── components/
│   ├── auth/             # Auth components
│   ├── chat/             # Chat components
│   └── ui/               # UI primitives
├── lib/
│   ├── auth-context.tsx  # Auth state
│   ├── chat-store.ts     # Chat state (Zustand)
│   ├── offline-queue.ts  # Offline handling
│   ├── pwa-context.tsx   # PWA setup
│   └── types.ts          # TypeScript types
├── public/
│   ├── sw.js             # Service Worker
│   └── manifest.json     # PWA manifest
├── agents/
│   ├── pm/               # PM deliverables
│   ├── backend/          # Backend specs
│   └── ai/               # AI agent specs
└── __tests__/            # Unit tests
\`\`\`

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/me` - Get current user

### Chat

- `POST /api/chat` - Send message
- `GET /api/search` - Search conversations

## Offline Support

The app automatically:
- Caches assets on first load
- Queues messages when offline
- Syncs when connection restored
- Stores recent conversations in IndexedDB

## Semantic Search

Search uses embeddings for contextual relevance:
- Local approximate search (default)
- Pinecone/Weaviate integration (production)
- Automatic embedding generation
- Cached results for offline access

## Accessibility

- Keyboard navigation throughout
- Screen reader labels (ARIA)
- WCAG AA color contrast
- Focus indicators
- Dynamic font sizing support

## Testing

\`\`\`bash
npm run test
npm run test:e2e
\`\`\`

## Deployment

### Docker

\`\`\`bash
docker build -t dalta-ai .
docker run -p 3000:3000 dalta-ai
\`\`\`

### Vercel

\`\`\`bash
vercel deploy
\`\`\`

### Environment Variables

\`\`\`
NEXT_PUBLIC_API_URL=https://api.dalta.ai
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
\`\`\`

## 5-Agent Workflow

### 1. Product Manager
- Feature prioritization
- Acceptance criteria
- Sprint planning
- See: `agents/pm/acceptance-criteria.json`

### 2. UI/UX Designer
- Component library
- Design system
- Responsive layouts
- Accessibility guidelines

### 3. Frontend Developer
- React + TypeScript implementation
- PWA setup
- State management
- Unit tests

### 4. Backend/DevOps Developer
- OpenAPI specification
- REST API implementation
- Authentication
- Deployment
- See: `agents/backend/openapi.yaml`

### 5. AI/ML Agent
- Conversation orchestration
- Semantic search
- Safety filters
- Rate limiting
- See: `agents/ai/conversation-schema.json`

## Contributing

1. Follow the 5-agent workflow
2. Update acceptance criteria
3. Add tests for new features
4. Ensure WCAG AA compliance
5. Document API changes

## License

MIT
