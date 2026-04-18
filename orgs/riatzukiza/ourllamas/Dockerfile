FROM public.ecr.aws/docker/library/python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY src /app/src
COPY templates /app/templates

CMD ["sh", "-lc", "uvicorn src.main:app --host 0.0.0.0 --port ${OUR_LLAMAS_PORT:-18134}"]