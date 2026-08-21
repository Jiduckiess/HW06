# [BUG-06] Normal users can mutate categories

## Environment

- Base URL: `http://localhost:3000`
- Endpoints: `POST`, `PUT`, `DELETE /api/categories`
- Header: `X-Student-Id: 23127172`
- Auth: valid JWT for normal user `test@eshop.com`

## Steps to reproduce

1. Log in as the normal seeded user and obtain a JWT.
2. Send `POST /api/categories` with a valid name.
3. Send `PUT /api/categories/{id}` with a valid name.
4. Send `DELETE /api/categories/{id}`.

## Expected result

Each mutation is rejected with `403 Forbidden`; only a JWT whose role is `admin` may mutate categories.

## Actual result

Each request returns `200 OK`; a normal user can create, update, and delete categories.

## Impact

Any authenticated customer can alter shared catalog reference data, causing integrity loss and potential denial of service for product browsing/administration.

## Evidence

- FR-14 cases C1-020, C1-028, C1-033.
- [FR-14 execution report](../report/fr14-execution-report.md)
- Attach: `<redacted normal-user JWT/Postman screenshot>`

## Suggested fix

Add role middleware after JWT authentication for every category mutation, e.g. reject unless `req.user.role === "admin"`.

## Labels

`bug`, `security`, `authorization`, `critical`
