# [BUG-02] Checkout trusts client-controlled `total_amount`

## Environment

- Base URL: `http://localhost:3000`
- Endpoint: `POST /api/checkout`
- Header: `X-Student-Id: 23127172`
- Auth: valid JWT for the seeded test user

## Steps to reproduce

1. Prepare a cart whose authoritative total is `30000000`.
2. Send checkout with `total_amount: 1` and a valid shipping address.
3. Retrieve the created order by its returned ID.
4. Repeat with `total_amount: 99999999` or `true`.

## Expected result

The backend calculates the order total from authoritative product/cart data. The client value cannot control the stored amount.

## Actual result

The stored order total equals the submitted value: `1`, `99999999`, and boolean `true` is coerced/stored as `1`.

## Impact

An authenticated attacker can buy products for an arbitrary price or corrupt order accounting.

## Evidence

- FR-08 cases B1-026, B1-027, B1-037.
- [FR-08 execution report](../report/fr08-execution-report.md)
- Attach: `<redacted request/created-order screenshot>`

## Suggested fix

Ignore client `total_amount`; load validated cart items and product prices server-side, calculate the total in a transaction, then persist that calculated value.

## Labels

`bug`, `security`, `critical`
