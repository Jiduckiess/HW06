# [BUG-07] Category parser/content-type errors expose implementation details

## Environment

- Base URL: `http://localhost:3000`
- Endpoint: `POST /api/categories`
- Header: `X-Student-Id: 23127172`
- Auth: valid admin JWT

## Steps to reproduce

1. Send malformed JSON such as `{"name":` with `Content-Type: application/json`.
2. Send valid JSON with `Content-Type: text/plain`.
3. Inspect status and response body.

## Expected result

The API returns a sanitized 4xx validation/parsing response. It must not contain a JavaScript stack trace, source filename, or line number.

## Actual result

Malformed JSON exposes a stack-trace pattern. The `text/plain` request returns `500 Internal Server Error` and exposes a stack-trace pattern.

## Impact

Implementation details help attackers fingerprint the application and turn routine bad input into server errors.

## Evidence

- FR-14 cases C1-017 and C1-018.
- [FR-14 execution report](../report/fr14-execution-report.md)
- Attached evidence: [BUG-07.png](BUG-07.png) (redacted Issue screenshot)

## Suggested fix

Install a final Express error handler that recognizes JSON parsing errors and unsupported media types, returns only a stable error code/message, and logs the stack server-side only.

## Labels

`bug`, `security`, `error-handling`, `medium`
