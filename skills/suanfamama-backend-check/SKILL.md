---
name: suanfamama-backend-check
description: Check if the Suanfamama API backend is available and responding. Use when the user asks about backend status, service health, or API connectivity.
---

# Suanfamama Backend Check

Check the availability and health of the Suanfamama API backend.

## Configuration

The backend URL is configured via environment variable:

- `SUANFAMAMA_API_URL`: Base URL (default: `https://api.openai.com` as placeholder)
- `SUANFAMAMA_API_HEALTH_PATH`: Health endpoint path (default: `/status`)

## How to Check

1. **Use the `web_fetch` tool** to make a `GET` request to `{SUANFAMAMA_API_URL}{SUANFAMAMA_API_HEALTH_PATH}`
2. **Evaluate response**:
   - **Available**: HTTP 200-299 with valid response
   - **Unavailable**: HTTP 4xx/5xx, timeout, or network error
   - **Degraded**: Slow response time (>5 seconds) or partial service

3. **Report findings**:
   - Status: Available / Unavailable / Degraded
   - Response time: Xms
   - HTTP status code
   - Any error messages or relevant response data

## Example Usage

User: "Is the backend up?"
→ Check https://api.openai.com/status and report status

User: "Check Suanfamama API health"
→ Perform health check and return detailed status

## Notes

- The current URL (`https://api.openai.com`) is a placeholder for testing
- Update to `https://api.suanfamama.com` when the backend is deployed
- Use 10-second timeout for health checks
- Cache results for 30 seconds to avoid spamming requests
