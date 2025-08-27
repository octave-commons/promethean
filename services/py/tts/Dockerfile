# syntax=docker/dockerfile:1
ARG BASE_IMAGE=base-python-pipenv
FROM ${BASE_IMAGE}

# Install dependencies
COPY Pipfile Pipfile.lock ./
RUN pipenv install --deploy --ignore-pipfile

# Copy source code
COPY . .

EXPOSE 5001

CMD ["pipenv", "run", "uvicorn", "--host", "0.0.0.0", "--port", "5001", "app:app"]
