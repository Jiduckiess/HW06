# [BUG-05] Category create/update accepts invalid required names

## Environment

- Base URL: `http://localhost:3000`
- Endpoints: `POST`, `PUT /api/categories`
- Header: `X-Student-Id: 23127172`
- Auth: valid admin JWT

## Steps to reproduce

1. Create a category with `{}`, `{"name":""}`, `{"name":"   "}`, `{"name":"\\t\\n"}`, or `{"name":null}`.
2. Create a disposable category and update it using missing, empty, or `null` `name` values.

## Expected result

`name` is mandatory and must be a trimmed, non-empty string. Invalid create/update requests return a 4xx response and leave existing data unchanged.

## Actual result

The API returns `200 OK` and accepts the invalid values.

## Impact

Invalid/blank categories pollute reference data and can break product/category selection in client applications.

## Evidence

- FR-14 cases C1-007–C1-009, C1-013, C1-023–C1-024, C1-036–C1-037.
- [FR-14 execution report](../report/fr14-execution-report.md)
- Attach: `<redacted Postman/Newman screenshot>`

## Suggested fix

Centralize category-name validation for both create and update. Require `typeof name === "string" && name.trim().length > 0`; return `400` before executing SQL.

## Labels

`bug`, `validation`, `high`
