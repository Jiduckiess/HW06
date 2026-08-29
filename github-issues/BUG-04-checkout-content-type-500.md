# [BUG-04] Checkout with `text/plain` JSON causes HTTP 500

## Environment

- Base URL: `http://localhost:3000`
- Endpoint: `POST /api/checkout`
- Header: `X-Student-Id: 23127172`
- Auth: valid JWT

## Steps to reproduce

1. Send a syntactically valid JSON checkout body.
2. Set `Content-Type: text/plain`.
3. Inspect the response.

## Expected result

The API rejects unsupported or mislabelled content safely with a documented 4xx response, without creating an order or exposing implementation details.

## Actual result

The API returns `500 Internal Server Error`.

## Impact

Malformed client transport can trigger a server exception, reduces API reliability, and may reveal implementation details in error responses.

## Evidence

- FR-08 case B1-033.
- [FR-08 execution report](../report/fr08-execution-report.md)
- Attached evidence: [BUG-04.png](BUG-04.png) (redacted Issue screenshot)

## Suggested fix

Validate supported media types and ensure an error handler maps invalid/absent parsed bodies to a sanitized `400` or `415` response.

## Labels

`bug`, `robustness`, `medium`
