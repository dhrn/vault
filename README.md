# Document Vault

AI-powered document vault application for uploading, processing, and managing documents with automatic summarization and markdown conversion.

## Features

- **Document Upload**: Upload PDF, TXT, DOC, DOCX files (max 10MB)
- **AI Processing**: Automatic summary and markdown generation using AI
- **Multiple AI Providers**: Support for Claude (Anthropic) and OpenAI via LangChain
- **Local Storage**: Files stored on local filesystem
- **PostgreSQL**: Document metadata and processing status

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Axios

### Backend
- NestJS + TypeScript
- TypeORM + PostgreSQL
- LangChain (AI abstraction)
- Mammoth (DOCX processing)
- PDF-Parse (PDF processing)

## Prerequisites

- Node.js 18+
- Yarn
- Docker & Docker Compose
- API key for either:
  - Anthropic (Claude)
  - OpenAI

## Quick Start

### Docker (Recommended)

The easiest way to run the application is using Docker Compose:

```bash
# 1. Set up environment
cp .env.example .env
# Edit .env and add your API keys

# 2. Start all services (PostgreSQL + API + Frontend)
docker-compose up --build

# 3. Access the application
# - Frontend: http://localhost
# - API: http://localhost:3000/api
```

### Local Development

#### 1. Clone and Install Dependencies

```bash
yarn install
```

#### 2. Set Up Environment Variables

Copy the example env file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` and set:

```env
# Choose your AI provider: claude or openai
AI_PROVIDER=claude

# For Claude (Anthropic)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# For OpenAI
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o
```

#### 3. Start Database Only

```bash
docker-compose up -d postgres
```

This will start PostgreSQL on port 5432.

#### 4. Build Applications

```bash
# Build frontend
cd apps/vault
yarn build

# Build backend
cd ../api
yarn build
```

#### 5. Run Backend

```bash
cd apps/api
yarn dev
```

The API will be available at `http://localhost:3000`.

#### 6. Run Frontend (Development)

In a new terminal:

```bash
cd apps/vault
yarn dev
```

The frontend will be available at `http://localhost:4200`.

## Database Management

### Reset Database (Clean Start)

If you need to completely reset the database:

```bash
# Stop containers and remove volumes
docker-compose down -v

# Start fresh
docker-compose up -d
```

The database schema will be automatically created when you start the backend (TypeORM synchronize is enabled).

### Database Credentials

- Host: `localhost:5432`
- Database: `vault_db`
- User: `vault_user`
- Password: `vault_password`

## AI Provider Configuration

The application uses LangChain to support multiple AI providers. Switch between providers by changing the `AI_PROVIDER` environment variable.

### Using Claude (Anthropic)

```env
AI_PROVIDER=claude
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

### Using OpenAI

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
```

## Project Structure

```
org/
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── documents/  # Document CRUD
│   │   │   │   ├── processors/ # Text extraction
│   │   │   │   └── services/   # AI, Storage
│   │   │   ├── entities/       # TypeORM entities
│   │   │   └── config/         # Database config
│   │   ├── Dockerfile          # API Docker image
│   │   └── package.json
│   └── vault/                  # React frontend
│       ├── src/
│       │   ├── app/           # Main app component
│       │   ├── components/    # UI components
│       │   ├── hooks/         # React Query hooks
│       │   └── lib/           # Utilities
│       ├── Dockerfile         # Frontend Docker image
│       ├── nginx.conf         # Nginx configuration
│       └── package.json
├── docker-compose.yml         # Multi-service orchestration
├── .dockerignore              # Docker build exclusions
├── .env.example              # Environment template
└── README.md
```

## API Endpoints

- `POST /documents/upload` - Upload a document
- `GET /documents` - List all documents
- `GET /documents/:id` - Get document details
- `DELETE /documents/:id` - Delete a document
- `GET /documents/:id/download` - Download original document

## Troubleshooting

### Foreign Key Constraint Error

If you encounter a foreign key constraint error when deleting documents, reset the database:

```bash
docker-compose down -v
docker-compose up -d
```

### TypeORM Synchronization

The application uses `synchronize: true` in development, which automatically creates/updates the database schema. In production, use proper migrations.

## Docker Deployment

### Quick Deploy

```bash
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

### Architecture

The Docker deployment includes:
- **PostgreSQL**: Database service
- **API**: NestJS backend in Node.js Alpine container
- **Vault**: React frontend served by Nginx

All services run on an isolated Docker network with health checks and automatic restart policies.

### Common Docker Commands

```bash
# Rebuild images
docker-compose build --no-cache

# Scale API instances
docker-compose up -d --scale api=2

# Database backup
docker exec org-vault-postgres pg_dump -U vault_user vault_db > backup.sql

# View container status
docker-compose ps

# Clean everything (including volumes)
docker-compose down -v
```

## License

Private - All Rights Reserved
