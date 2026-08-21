# [BUG-01] Successful login response exposes `user.password`

## Environment

- Base URL: `http://localhost:3000`
- Endpoint: `POST /api/login`
- Header: `X-Student-Id: 23127172`
- Test account: `test@eshop.com` (do not publish the password in the Issue)

## Steps to reproduce

1. Send a valid login request for the seeded test user.
2. Inspect the JSON response body.

## Expected result

The response may contain a token and safe user profile fields, but it must never include a password or password hash.

## Actual result

The successful response contains `user.password`.

## Impact

Any client, proxy log, browser extension, or compromised frontend that receives the response can obtain credentials. This can lead to account compromise and password-reuse attacks.

## Evidence

- FR-02 Newman assertions: A1-001, A1-023, A1-035, A1-038, A1-040.
- [FR-02 execution report](../report/fr02-execution-report.md)
- Attach: `<redacted Postman/Newman screenshot showing user.password>`

## Suggested fix

Return an explicit safe user DTO, for example `{ id, name, email, role }`, rather than returning the database user object.

## Labels

`bug`, `security`, `high`
