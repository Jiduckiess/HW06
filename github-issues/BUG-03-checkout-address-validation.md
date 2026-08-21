# [BUG-03] Checkout accepts missing or null `shipping_address`

## Environment

- Base URL: `http://localhost:3000`
- Endpoint: `POST /api/checkout`
- Header: `X-Student-Id: 23127172`
- Auth: valid JWT

## Steps to reproduce

1. Send a checkout request with a valid `total_amount` but omit `shipping_address`.
2. Send another request with `"shipping_address": null`.

## Expected result

The API rejects a missing or non-string required shipping address with a 4xx validation response and creates no order.

## Actual result

Both inputs return `200 OK` and create checkout orders.

## Impact

Orders can be created without a deliverable address, causing fulfilment failures and invalid business records.

## Evidence

- FR-08 cases B1-011, B1-036, B1-039.
- [FR-08 execution report](../report/fr08-execution-report.md)
- Attach: `<redacted Postman/Newman screenshot>`

## Suggested fix

Validate the request schema before creating an order: `shipping_address` must be a trimmed, non-empty string. Return `400 Bad Request` on invalid input.

## Labels

`bug`, `validation`, `high`
