# CreatorFlow AI - Backend

FastAPI backend for the CreatorFlow AI platform.

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

## Run

```bash
uvicorn main:app --reload --port 8000
```

API will be available at `http://localhost:8000`

## Endpoints

- `GET /` - Health check
- `POST /api/v1/generate` - Generate image from prompt
- `POST /api/v1/analyze-style` - Analyze creator's style from text samples
