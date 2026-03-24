# Health Check Patterns

## Common Health Endpoint Responses

### Minimal (status only)

```json
{
  "status": "ok"
}
```

### Standard (with timestamp)

```json
{
  "status": "healthy",
  "timestamp": "2026-03-23T12:00:00Z"
}
```

### Detailed (with services)

```json
{
  "status": "healthy",
  "timestamp": "2026-03-23T12:00:00Z",
  "version": "1.0.0",
  "services": {
    "api": "up",
    "database": "up",
    "cache": "up"
  }
}
```

### With latency info

```json
{
  "status": "healthy",
  "timestamp": "2026-03-23T12:00:00Z",
  "latency_ms": 45
}
```

## Status Classifications

| Status      | HTTP Code | Meaning                            |
| ----------- | --------- | ---------------------------------- |
| Healthy     | 200       | All systems operational            |
| Degraded    | 200       | Partial service, slow, or warnings |
| Unhealthy   | 503       | Service unavailable                |
| Maintenance | 503       | Scheduled maintenance              |

## Common Health Paths

- `/health` - Most common
- `/status` - OpenAI style
- `/healthz` - Kubernetes style
- `/api/health` - Prefixed version
- `/ping` - Simple liveness check
