# Watchog Backend

Node.js Express server for Watchog application.

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`

## Running the Server

### Development mode (with auto-restart):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000` by default.

## API Endpoints

- `GET /` - Welcome message
- `GET /api/health` - Health check endpoint
- `POST /api/data` - Sample data endpoint

## Project Structure

```
backend/
├── src/
│   ├── config/       # Configuration files
│   ├── controllers/  # Route controllers
│   ├── routes/       # API routes
│   └── server.js     # Main server file
├── .env.example      # Example environment variables
├── .gitignore        # Git ignore rules
└── package.json      # Project dependencies
```
