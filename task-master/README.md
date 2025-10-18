# Task Master - Python server

This small Flask server accepts free-form user messages, splits them into multiple todo tasks, and assigns per-task timers.

## Quick start

1. Create a virtual environment and activate it (macOS / zsh):

```
python3 -m venv .venv
source .venv/bin/activate
```

2. Install dependencies:

```
pip install -r requirements.txt
```

3. Run the server:

```
python src/app/server.py
```

The server runs on http://0.0.0.0:5000 by default.

## Endpoints

- POST /messages
  - Body: JSON { "message": "Buy milk (10m); Walk dog (30m)\nCall Alice (5m)", "default_minutes": 15 }
  - Splits the message by newlines/semicolons and creates tasks. Time specs in the form `(10m)`, `(30s)`, `(2h)` are supported per-item. If an item has no time spec, `default_minutes` is used.

- GET /tasks
  - Returns all tasks.

- GET /tasks/<task_id>
  - Returns a specific task.

- POST /tasks
  - Create a single task: { "title": "Task name", "timer_minutes": 10 }

- POST /tasks/<task_id>/complete
  - Mark a task completed.

- DELETE /tasks/<task_id>
  - Delete a task.

- GET /health
  - Health check.

## Example curl

Create tasks from a message:

```
curl -X POST http://localhost:5000/messages -H "Content-Type: application/json" -d '{"message":"Buy milk (10m); Walk dog (30m)\nCall Alice","default_minutes":5}'
```

List tasks:

```
curl http://localhost:5000/tasks
```

## Notes

- This implementation uses an in-memory store. For production, swap with a database.
- A background thread marks tasks as `expired` when their due time passes.
