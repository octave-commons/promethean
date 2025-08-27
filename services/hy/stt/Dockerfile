# syntax=docker/dockerfile:1
ARG BASE_IMAGE=base-python-pipenv
FROM ${BASE_IMAGE}

COPY Pipfile Pipfile.lock ./
RUN pipenv install --deploy --ignore-pipfile

COPY . .

EXPOSE 5002

CMD ["pipenv", "run", "uvicorn", "--host", "0.0.0.0", "--port", "5002", "app:app"]
