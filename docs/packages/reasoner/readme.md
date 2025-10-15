# Reasoner Service

Central reasoning service that receives error reports from other services and suggests possible resolutions.

## Endpoints

### `POST /resolve`

Body:

```json
{
  "error": "Error message"
}
```

Response:

```json
{
  "resolution": "Suggested fix"
}
```
