# Dalta AI Backend Server

A production-ready Express.js backend server for the Dalta AI chat application with authentication, conversation management, and semantic search capabilities.

## Features

- **Authentication**: JWT-based user authentication with signup/login
- **Conversation Management**: Create, retrieve, and delete conversations
- **Chat API**: Send messages and receive AI responses
- **Search**: Full-text search across conversations and messages
- **OpenAPI Documentation**: Complete API specification for integration

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

\`\`\`bash
npm install
\`\`\`

### Environment Variables

Create a `.env` file in the server directory:

\`\`\`
PORT=3001
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
\`\`\`

### Running the Server

\`\`\`bash
npm run dev
\`\`\`

The server will start on `http://localhost:3001`

### Demo Credentials

- Email: `demo@dalta.ai`
- Password: `demo123`

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### Conversations

- `GET /api/conversations` - List user conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/:conversationId` - Get conversation with messages
- `DELETE /api/conversations/:conversationId` - Delete conversation

### Chat

- `POST /api/chat` - Send message and get response

### Search

- `GET /api/search?q=query` - Search conversations and messages

## OpenAPI Specification

The complete OpenAPI specification is available in `openapi.json`. You can view it using:

- Swagger UI: https://editor.swagger.io (paste the openapi.json content)
- ReDoc: https://redoc.ly (paste the openapi.json content)

## Database Integration

Currently uses in-memory storage. For production, integrate with:

- PostgreSQL with Prisma ORM
- MongoDB with Mongoose
- Supabase for managed PostgreSQL

## Security Considerations

1. **Password Hashing**: Use bcrypt to hash passwords before storing
2. **JWT Secret**: Use a strong, randomly generated secret in production
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limiting**: Implement rate limiting on authentication endpoints
5. **Input Validation**: Validate all user inputs
6. **CORS**: Configure CORS appropriately for your frontend domain

## Deployment

### Docker

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
\`\`\`

### Vercel

\`\`\`bash
vercel deploy
\`\`\`

### Heroku

\`\`\`bash
heroku create dalta-ai-api
git push heroku main
\`\`\`

## Testing

\`\`\`bash
npm test
\`\`\`

## Contributing

Contributions are welcome! Please follow the existing code style and add tests for new features.

## License

MIT
