# syntax=docker/dockerfile:1
FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY Pipfile Pipfile.lock ./
RUN pip install --no-cache-dir pipenv && \
    pipenv install --deploy --ignore-pipfile

# Copy source code
COPY . .

EXPOSE 5001

CMD ["pipenv", "run", "uvicorn", "--host", "0.0.0.0", "--port", "5001", "app:app"]
