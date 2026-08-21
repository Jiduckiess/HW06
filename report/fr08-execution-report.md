# FR-08 Execution Report — Checkout

**Student ID:** 23127172  
**SUT:** `http://localhost:3000`  
**Endpoint:** `POST /api/checkout`  
**Test suite:** `FR-08 data-driven suite (B1-001–B1-040)`  
**Evidence:** [Postman Run Results JSON](../postman/data/fr-08/HW06%20API%20Testing%20%E2%80%94%2023127172.postman_test_run.json) and [Newman HTML report](../evidence/newman/fr08-newman-report.html)

## Execution result

| Metric | Result |
| --- | ---: |
| Planned cases / iterations | 40 |
| Requests executed by Newman | 88 |
| Assertions executed | 114 |
| Assertions passed | 103 |
| Assertions failed | 11 |
| Case rows with one or more failed assertions | 10 |
| Skipped tests | 0 |
| Average response time | 1 ms |
| Newman total duration | 754 ms |

The Postman export records a **finished** run at `2026-08-21T14:21:57.467Z`, with `totalPass: 103` and `totalFail: 11`. The Newman report independently records 40 iterations, 114 assertions, 11 failed tests, 0 skipped tests, 88 HTTP requests (the checkout calls plus setup/verification calls), and a 754 ms run duration. The selected environment was `HW06 Local`.

## Failed assertions and interpretation

| Case(s) | Observed result | Interpretation |
| --- | --- | --- |
| B1-011, B1-039 | Missing `shipping_address` returned `200`, not `400`. | Confirmed validation defect: checkout accepts a required address as missing. |
| B1-036 | `shipping_address: null` returned `200`, not `400`. | Same confirmed address-type validation defect. |
| B1-026 | Sent `total_amount: 1`; stored order total was `1`, expected server-calculated `30000000`. | Confirmed client-controlled price/tampering defect. |
| B1-027 | Sent `total_amount: 99999999`; stored order total was `99999999`, expected `30000000`. | Same confirmed price-tampering defect. |
| B1-037 | Sent `total_amount: true`; stored order total was coerced to `1`, expected `30000000`. | Same confirmed type-coercion/price-tampering defect. |
| B1-033 | Valid JSON with `Content-Type: text/plain` returned `500`. | Confirmed robustness defect: unsupported/mislabelled content type causes an internal server error. |
| B1-028 | Expected `400` but received `200`. | Not a confirmed empty-cart defect: the data-driven run did not isolate/reset the cart before this row. Re-run with demonstrated empty cart. |
| B1-030 | Expected `400` but received `200`. | Not a confirmed duplicate-checkout defect: this row alone does not perform the first checkout then the repeat in the same precondition. |
| B1-038 | Expected `400` but received `200`. | Not a confirmed corrupt-cart defect: the required invalid cart setup was not performed by the one-request data row. |

## Confirmed defects to file as GitHub Issues

| Bug ID | Summary | Severity | Reproduction evidence |
| --- | --- | --- | --- |
| BUG-02 | `POST /api/checkout` trusts and persists client-supplied `total_amount` (including boolean coercion). | Critical | B1-026, B1-027, B1-037 |
| BUG-03 | Checkout accepts missing or `null` `shipping_address`. | High | B1-011, B1-036, B1-039 |
| BUG-04 | Checkout with valid JSON labelled `text/plain` produces HTTP 500 instead of a safe client error. | Medium | B1-033 |

Expected corrective behavior: validate the request schema, calculate price only from authoritative products/cart data on the server, reject invalid types with a 4xx response, and never expose a parser/application exception as 500 for a client input error.

## Execution limitations and follow-up

- Do not claim B1-025, B1-028–B1-032, B1-038, or B1-039 state/ownership conditions as passed from this run alone. They need isolated user/cart setup and before/after `GET /api/cart` / `GET /api/orders/my-orders` evidence.
- Create GitHub Issues BUG-02 through BUG-04 with redacted Postman/Newman screenshots and add their URLs to the main report.
- Preserve the Postman Runner summary screenshot and Postman Console screenshot showing `X-Student-Id: 23127172`.
