# Helpdesk AI Backend

Backend for helpdesk application with AI-powered ticket processing.

## API Endpoints

### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user (protected)

### Tickets

- `POST /tickets` - Create ticket (protected)
- `GET /tickets` - List tickets (protected)
- `GET /tickets/:id` - Get ticket details (protected)
- `PUT /tickets/:id` - Update ticket status (protected)

### Knowledge Base

- `GET /knowledge-base` - Search articles
- `POST /knowledge-base` - Create article (admin only)

### AI Actions

- `GET /ai-actions/:ticketId` - Get AI processing history (protected)

### Health

- `GET /health` - Server status

## Flow

1. **User Authentication**
   - Register/login to get JWT token
   - Use token for protected routes

2. **Ticket Creation**
   - User creates support ticket
   - System triggers AI processing automatically

3. **AI Processing Pipeline**
   - Summarizer: Creates ticket summary
   - Classifier: Categorizes ticket type
   - Sentiment: Analyzes user mood
   - Researcher: Searches knowledge base
   - Reply Writer: Generates response suggestions

4. **Real-time Updates**
   - Socket.io provides live progress updates
   - Users see AI processing status in real-time

5. **Knowledge Base**
   - AI agents search existing articles
   - Admins can add new knowledge articles
   - Full-text search available

## Tech Stack

- Node.js, Express, MongoDB
- JWT authentication
- Socket.io for real-time updates
- Google Gemini AI integration
- Express validation middleware
