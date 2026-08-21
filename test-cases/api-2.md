# API 2 — FR-08 Checkout (`POST /api/checkout`)

**Specification:** authenticated request with JSON fields `total_amount` and `shipping_address`.  
**Common header:** `X-Student-Id: 23127172`  
**Required auth:** `Authorization: Bearer <valid-user-token>`  
**Important:** Use isolated test users/orders, because successful checkout creates persistent orders.

> FR-08 is the primary oracle: the backend must recompute the total from the authenticated user's cart, must not trust client-supplied `total_amount`, and must clear the cart after a successful checkout. Where the specification does not define an error status, length, precision, idempotency, or transport policy, the case is marked **INCOMPLETE** rather than asserting an arbitrary result.

| ID | Source | Objective / partition or transition | Preconditions | Request data / step | Expected result | Security / schema assertion | Audit | Audit reasoning | Actual / evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| B1-001 | AI | Happy-path checkout | Valid user token; cart with items | Positive total; normal address | Success response; one order created with status `pending` | Positive order identifier if returned; correct owner; stored total equals server-calculated cart total; cart clears | VALID | Covers the specified authenticated success path and FR-08 postconditions | |
| B1-002 | AI | Minimum positive integer amount | Valid token | `total_amount: 1` | Accept/reject per business minimum | No `500`; order only if valid | INCOMPLETE | Minimum amount unspecified | |
| B1-003 | AI | Zero amount | Valid token; valid nonempty cart | `total_amount: 0` | Reject; no order | No zero-value order | INVALID | FR-08 requires server-side recalculation; rejection is not the only conforming behavior. Correct oracle: client value must not determine the stored total | |
| B1-004 | AI | Negative amount | Valid token; valid nonempty cart | `total_amount: -1` | Reject; no order | No negative-value order | INVALID | FR-08 requires server-side recalculation; rejection is not the only conforming behavior. Correct oracle: no negative/client-controlled total is stored | |
| B1-005 | AI | Decimal amount | Valid token | `total_amount: 100.5` | Accept/reject only per currency rule | Stored value must not be silently rounded unexpectedly | INCOMPLETE | Currency precision unspecified | |
| B1-006 | AI | Very large amount | Valid token | Maximum/overflow-sized number | Reject safely or preserve exact valid value | No overflow/negative conversion/`500` | INCOMPLETE | Maximum amount unspecified | |
| B1-007 | AI | Amount is string | Valid token; valid nonempty cart | `total_amount: "200000"` | Reject; no order | Strict numeric type validation | INVALID | The rejection oracle is unsupported; the server may ignore the client field and use its own calculated total | |
| B1-008 | AI | Amount is nonnumeric string | Valid token; valid nonempty cart | `total_amount: "abc"` | Reject; no order | No `500` or coercion | INVALID | The required invariant is no client-controlled total, not necessarily rejection | |
| B1-009 | AI | Amount is null | Valid token; valid nonempty cart | `total_amount: null` | Reject; no order | No null stored | INVALID | The required invariant is no null/client-controlled stored total; the request may be rejected or safely recalculated | |
| B1-010 | AI | Amount is missing | Valid token; valid nonempty cart | Omit `total_amount` | Reject; no order | Validation error; no order ID | INVALID | FR-08 says the backend calculates the total from the cart; unconditional rejection is not established | |
| B1-011 | AI | Address is missing | Valid token | Omit `shipping_address` | Reject; no order | Validation error; no order ID | VALID | Required field absent | |
| B1-012 | AI | Empty address | Valid token | `shipping_address: ""` | Reject; no order | No empty address stored | INCOMPLETE | The body includes an address, but the specification does not define empty-string validation | |
| B1-013 | AI | Whitespace-only address | Valid token | `shipping_address: "   "` | Reject; no order | No whitespace-only address stored | INCOMPLETE | Trim/blank-address policy is not specified | |
| B1-014 | AI | Minimal plausible address | Valid token | Short nonempty address | Accept/reject consistently | No truncation/corruption | INCOMPLETE | Address rules unspecified | |
| B1-015 | AI | Very long address | Valid token | Address exceeds configured maximum | Safe reject/handling | No SQL error/`500` | INCOMPLETE | Length limit unspecified | |
| B1-016 | AI | Unicode/Vietnamese address | Valid token | `123 Đường Lê Lợi, Quận 1, TP.HCM` | Success if other data valid | UTF-8 address preserved exactly | VALID | Vietnamese SUT needs Unicode coverage | |
| B1-017 | AI | Special punctuation in address | Valid token | Apartment, slash, hyphen, comma | Success/reject consistently | No malformed stored data | INCOMPLETE | Address character policy unspecified | |
| B1-018 | AI | SQL injection in address | Valid token | `x'); DROP TABLE orders; --` | Store as literal text or reject safely; system remains usable | No SQL error; no destructive action; later queries still work | VALID | SEC-05 requires parameterized queries; safe literal storage and safe rejection are both conforming | |
| B1-019 | AI | XSS payload in address | Valid token | `<script>alert(1)</script>` | Reject/sanitize safely | Rendered order history must not execute script | INCOMPLETE | Requires API + UI verification | |
| B1-020 | AI | Extra role/user fields | Valid token | Valid body + `user_id`, `role`, `status` | Ignore/reject extra fields | Order owner/status must be server-controlled | VALID | Mass-assignment/role escalation | |
| B1-021 | AI | Missing Authorization | No token | Valid body | `401`/auth rejection; no order | No order created | VALID | Authentication required by spec | |
| B1-022 | AI | Malformed Bearer token | Invalid token | Valid body | Auth rejection; no order | No `500` or token leakage | VALID | Authentication partition | |
| B1-023 | AI | Expired/invalid JWT | Expired token | Valid body | Auth rejection; no order | No `500` | VALID | Authentication partition | |
| B1-024 | AI | Regular user checkout authorization | Valid normal-user token | Valid body | Success if conditions valid | Order `user_id` equals token subject | VALID | Ownership check | |
| B1-025 | AI | Token ownership / IDOR | Tokens for user A and B | Checkout as A, read created order using B | B is denied access to A's order | No cross-user order disclosure, with or without B's token | VALID | FR-11 requires users to see only their own orders; the detail endpoint exists in the API specification | |
| B1-026 | AI | Manipulated total lower than cart sum | Valid cart with known server-calculated total | Checkout with `total_amount` lower than cart total | Checkout uses the server-calculated cart total; client value is ignored | Stored order total exactly matches the server calculation | VALID | Direct FR-08 price-tampering requirement | |
| B1-027 | AI | Manipulated total higher than cart sum | Valid cart with known server-calculated total | Checkout with inflated `total_amount` | Checkout uses the server-calculated cart total; client value is ignored | Stored order total exactly matches the server calculation | VALID | Direct FR-08 integrity requirement | |
| B1-028 | AI | Checkout empty cart | Valid token; empty cart | Valid positive body | Reject; no order | No order with no items | VALID | Checkout state rule | |
| B1-029 | AI | Checkout valid cart creates pending order | Valid token; cart prepared | Valid body | One order created, initial status `pending` | Verify via order-history/detail endpoint | VALID | FR-10 state integration | |
| B1-030 | AI | Repeat identical checkout | Valid token; cart prepared once | Complete checkout, then immediately repeat the same request without rebuilding the cart | First checkout succeeds and clears the cart; second request creates no second order from the old cart | Exactly one order is created from the prepared cart | VALID | FR-08 cart clearing supplies the oracle without assuming an idempotency-key policy | |
| B1-031 | AI | Concurrent duplicate checkout | Valid token; cart prepared | Send two checkout requests concurrently | At most one order/charge if idempotency required | Record order count and IDs | INCOMPLETE | Needs concurrent client/tool | |
| B1-032 | AI | Cart state after successful checkout | Valid token; cart prepared | Checkout then `GET /api/cart` | Cart is empty after successful checkout | No stale items remain | VALID | FR-08 explicitly requires the cart to be cleared after success | |
| B1-033 | AI | Content-Type absent/wrong | Valid token | Valid JSON with missing or `text/plain` content type | Reject safely or parse only per policy | No malformed order / `500` | INCOMPLETE | Transport rule unspecified | |
| B1-034 | AI | Malformed JSON body | Valid token | Invalid JSON | `400`/safe reject; no order | No parser stack trace | VALID | Request parsing security | |
| B1-035 | AI | Response schema and sensitive data | Valid token; valid checkout | Valid body | Success response shape matches the confirmed contract | No JWT, password, secret, or unrelated private data | INCOMPLETE | The API specification does not define the exact checkout success schema; confirm whether only `message` and `orderId` are allowed | |

## Coverage checklist

| Area | Cases |
| --- | --- |
| Amount partitions | B1-001–B1-010 |
| Shipping-address partitions | B1-011–B1-019 |
| Authorization, ownership, mass assignment | B1-020–B1-025 |
| Cart/order integrity and state | B1-026–B1-032 |
| Transport and response schema | B1-033–B1-035 |

**Count:** 35 AI-generated cases; **student-added cases:** 0.

## Student-proposed extensions and human audit

| ID | Objective / transition | Preconditions | Request data / step | Expected result | Human audit | Audit reasoning | Evidence to capture |
| --- | --- | --- | --- | --- | --- | --- | --- |
| B1-036 | Reject `shipping_address` with a non-string type | Valid token; record order count before test | Send the same valid cart with `shipping_address` set to `null`, a number, an array, and an object in separate runs. | Every variant is rejected; no order is created. | VALID | Adds missing type partitions for a field represented as a string in the API contract. | Request/response for each type; order-count check before/after. |
| B1-037 | Prevent nonnumeric client values from controlling the total | Valid token; valid cart with known server total | Send `total_amount: true`, `{ "value": 200000 }`, and `[200000]` in separate runs with a valid address. | No variant is stored/coerced as the order total; any created order uses the server-calculated cart total. | VALID | Extends FR-08 tampering coverage without assuming rejection is the only valid policy. | Request/response and stored order total for each type. |
| B1-038 | Validate corrupt cart data before checkout | Valid token; use isolated user/cart | Add cart entries containing a nonexistent product ID, quantity `0`, negative quantity, and negative price; then checkout. | Checkout rejects invalid cart or derives a valid total from authoritative product data; no invalid/client-priced order is created. | VALID | Exercises the server-side cart trust boundary omitted from the AI cases. | Cart contents, checkout response, order history/detail. |
| B1-039 | Failed checkout has no unintended state change | Valid token; cart with known items; record cart and order count | Submit a request guaranteed to fail (for example a missing/invalid address after confirming the address rule), then call `GET /api/cart` and `GET /api/orders/my-orders`. | Cart is unchanged and no new/partial order exists after rejection. | VALID | Covers transaction rollback and state preservation after failure. | Before/after cart and order-history responses. |
| B1-040 | Handle duplicate JSON key safely | Valid token; record order count before test | Send raw JSON with two `total_amount` keys, e.g. `{"total_amount":200000,"total_amount":1,"shipping_address":"123 Le Loi"}`. | Reject ambiguous payload or follow a confirmed parser policy; in all cases the stored total cannot differ from the server-calculated cart total. | INCOMPLETE | Duplicate-key parsing is unspecified; the security invariant is known, but the exact parser oracle must be confirmed. | Raw request, response, parser policy, and stored total/order-count check. |

**Count after extensions:** 35 AI-generated cases + 5 student-proposed cases = **40 total**.

## Human corrections for invalid and incomplete AI cases

| IDs | Final correction / execution rule |
| --- | --- |
| B1-002–B1-010 | Retain the values as tampering/type partitions, but do not use the client value as the business oracle. With one fixed valid cart, verify that no created order stores the supplied value and that any successful order uses the server-calculated total. B1-003, B1-004, and B1-007–B1-010 are `INVALID` as originally written because they require rejection without specification support. |
| B1-012–B1-015, B1-017 | Confirm an address validation policy before reporting a functional defect. Until then, run as characterization/robustness cases and always require no 500, no unsafe truncation, and no malformed stored data. |
| B1-019 | Limit the API assertion to safe storage/response and no parser error; verify script execution separately in the order-history/admin UI under SEC-04. |
| B1-031 | Run as a concurrency characterization test. Do not claim an idempotency defect unless an atomic single-cart consumption rule is confirmed; still report any duplicate order created after the cart has already been cleared. |
| B1-033 | Confirm the accepted content types; regardless of policy, malformed transport must not create an order or expose a stack trace. |
| B1-035 | Record the observed success payload and obtain/define its schema before enforcing exact fields; sensitive-data exclusion remains mandatory. |

**Human-audit summary for the 35 AI cases:** 17 VALID, 6 INVALID, 12 INCOMPLETE. All invalid/incomplete groups above have a documented final correction or characterization rule.
