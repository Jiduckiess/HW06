# API 3 — FR-14 Category management (CRUD)

**Endpoints:** `GET /api/categories`, `POST /api/categories`, `PUT /api/categories/:id`, `DELETE /api/categories/:id`  
**Common header:** `X-Student-Id: 23127172`  
**Security rule:** `POST`, `PUT`, and `DELETE /api/categories` are data-changing admin operations and require a valid admin JWT with `role = "admin"`. `GET /api/categories` is public because FR-12 restricts the category mutation endpoints, not the list endpoint.  
**Seed data:** IDs `1–3` exist after `node database.js`. Use names prefixed `HW06-23127172-` so created data can be identified and cleaned up.

> **Human-audit note:** The labels below are AI-proposed audit results. Confirm them against the assignment/SUT and record real outcomes before submission. `INCOMPLETE` means the exact business policy is not specified; run it as a robustness/characterization test, not as a definite defect oracle.

| ID | Source | Objective / partition or transition | Preconditions | Request data / step | Expected result | Security / schema assertion | Proposed audit | Audit reasoning | Actual / evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C1-001 | AI | Admin views category list | Valid admin token | `GET /api/categories` | `200`; list contains seeded categories | Array items contain numeric `id` and string `name` | VALID | FR-14 gives the admin view function | |
| C1-002 | AI | Unauthenticated category list | No token | `GET /api/categories` | `200`; public category list is returned | Response exposes only category fields | VALID | Corrected against FR-12: only category mutation endpoints are restricted to admin | |
| C1-003 | AI | Regular user views categories | Valid normal-user token | `GET /api/categories` | `200`; same public category contract | Token presence does not change or broaden the public data | VALID | Category listing supports ordinary product/category browsing and is not listed as a protected mutation | |
| C1-004 | AI | List response schema | Valid admin token | `GET /api/categories` | `200`; stable JSON array | Every item has only expected public fields; IDs are unique | VALID | Basic read/schema contract | |
| C1-005 | AI | List has no sensitive/internal data | Valid admin token | `GET /api/categories` | `200` | No password, JWT, database stack trace, or unrelated user fields | VALID | Response-minimization/security check | |
| C1-006 | AI | Create a valid category | Valid admin token | `POST /api/categories` body `{"name":"HW06-23127172-Electronics"}` | Success; returns new positive ID | Created name is visible in a subsequent admin list request | VALID | Main create path | |
| C1-007 | AI | Create with missing name | Valid admin token | `POST` body `{}` | `400`; no category created | No generated ID/side effect | VALID | FR-14 requires category name | |
| C1-008 | AI | Create with empty name | Valid admin token | `POST` body `{"name":""}` | `400`; no category created | Empty name must not persist | VALID | Explicit FR-14 rule | |
| C1-009 | AI | Create with whitespace-only name | Valid admin token | `POST` body `{"name":"   "}` | `400`; no category created | Trim/blank validation | VALID | Whitespace-only is semantically empty | |
| C1-010 | AI | Create Unicode/Vietnamese name | Valid admin token | `POST` body `{"name":"Thiết bị điện tử – Đà Nẵng"}` | Success | Subsequent GET preserves UTF-8 exactly | VALID | Localized input coverage | |
| C1-011 | AI | Maximum-length category name | Valid admin token | Name at configured maximum, then one character longer | Accept boundary or safely reject over-limit | No truncation, DB error, or `500` | INCOMPLETE | FR-14 does not specify a length limit | |
| C1-012 | AI | Duplicate category name | Valid admin token | Create the same name twice | Follow documented uniqueness policy consistently | No unexpected `500` | INCOMPLETE | Uniqueness is not specified for categories | |
| C1-013 | AI | Non-string name types | Valid admin token | Send `null`, number, array, and object as `name` in separate requests | Each is rejected with 4xx; no category created | Strict string validation; no coercion | VALID | Contract shows `name` as a required string | |
| C1-014 | AI | Mass-assignment fields on create | Valid admin token | Valid `name` plus `id`, `role`, `user_id`, `created_at` | Ignore/reject extras; server assigns identity | Client cannot choose ID/ownership/internal fields | VALID | Prevents mass assignment | |
| C1-015 | AI | SQL injection payload in name | Valid admin token | `{"name":"x'); DROP TABLE categories; --"}` | Store literal text or safely reject | Later `GET /api/categories` remains usable; no DB error | VALID | Injection-resilience test | |
| C1-016 | AI | Stored XSS payload in name | Valid admin token | `{"name":"<script>alert(1)</script>"}` then view it in admin UI | Safely encode/reject payload | Script must not execute in the UI | INCOMPLETE | Requires browser/UI evidence in addition to API response | |
| C1-017 | AI | Malformed create JSON | Valid admin token | Invalid raw JSON, e.g. `{"name":` | `400`; no category created | No parser stack trace or `500` | VALID | Safe request parsing | |
| C1-018 | AI | Wrong/missing create Content-Type | Valid admin token | Valid JSON with absent or `text/plain` Content-Type | Safe 4xx or documented parsing policy | Never `500`/partial category | INCOMPLETE | Accepted transport policy is unspecified | |
| C1-019 | AI | Create without token | No token | Valid create body | `401`; no category created | Auth required before mutation | VALID | Admin-only mutation | |
| C1-020 | AI | Create with normal-user token | Valid normal-user token | Valid create body | `403`; no category created | Role is checked, not merely token presence | VALID | Admin-only mutation | |
| C1-021 | AI | Create with malformed/expired token | Invalid token | Valid create body | `401`/`403`; no category created | No token diagnostics/stack trace | VALID | Authentication boundary | |
| C1-022 | AI | Update an existing category | Valid admin token; create a disposable category | `PUT /api/categories/{createdId}` body `{"name":"HW06-23127172-Updated"}` | Success; later GET shows only this category renamed | Server targets only path ID | VALID | The API specification explicitly defines `PUT /api/categories/:id` as part of Category CRUD | |
| C1-023 | AI | Update with missing name | Valid admin token; existing category | `PUT /api/categories/{id}` body `{}` | `400`; name remains unchanged | Required-name rule also applies on update | VALID | Updating to no name violates FR-14’s mandatory-name rule | |
| C1-024 | AI | Update with blank/whitespace name | Valid admin token; existing category | `PUT` with `""`, then `"   "` | `400`; original name remains | No blank category name persists | VALID | Required-name rule also applies on update | |
| C1-025 | AI | Update non-existent category | Valid admin token; record list first | `PUT /api/categories/999999` with a valid name | `404` or documented no-op; no new category | Do not return false success | INCOMPLETE | Non-existent update status is unspecified | |
| C1-026 | AI | Malformed category ID on update | Valid admin token | Test `0`, negative, decimal, nonnumeric, and SQLi-like IDs | Safe 4xx/404; no category changes | No SQL error or broad unintended update | INCOMPLETE | Exact path-parameter validation policy is unspecified | |
| C1-027 | AI | Update without token | No token; existing category | Valid `PUT` | `401`; name unchanged | Authentication precedes mutation | VALID | Admin-only mutation | |
| C1-028 | AI | Update with normal-user token | Valid normal-user token; existing category | Valid `PUT` | `403`; name unchanged | Role authorization is enforced | VALID | Admin-only mutation | |
| C1-029 | AI | Delete a disposable category | Valid admin token; create category and record ID | `DELETE /api/categories/{createdId}` | Success; later GET no longer contains ID | Only target category is removed | VALID | Main delete path | |
| C1-030 | AI | Delete non-existent category | Valid admin token; record category list | `DELETE /api/categories/999999` | `404` or documented no-op; existing categories unchanged | No false-success/mutation | INCOMPLETE | Non-existent delete policy is unspecified | |
| C1-031 | AI | Malformed ID on delete | Valid admin token | Test `0`, negative, decimal, nonnumeric, SQLi-like IDs | Safe 4xx/404; no category changes | No SQL error/broad delete | INCOMPLETE | Exact path-parameter validation policy is unspecified | |
| C1-032 | AI | Delete without token | No token; disposable category exists | `DELETE /api/categories/{id}` | `401`; category remains | Authentication precedes mutation | VALID | Admin-only mutation | |
| C1-033 | AI | Delete with normal-user token | Valid normal-user token; disposable category exists | `DELETE /api/categories/{id}` | `403`; category remains | Role authorization is enforced | VALID | Admin-only mutation | |
| C1-034 | AI | Full CRUD state path and isolation | Valid admin token; unique disposable name | Create → GET verifies ID/name → update → GET verifies change → delete → GET verifies absence | All states occur in order; unrelated seeded categories unchanged | IDs map to the intended record only | VALID | End-to-end FR-14 lifecycle and regression guard | |
| C1-035 | AI | Delete referenced category / concurrent mutation | Valid admin token; category linked to product or two admin clients | Attempt delete while referenced; separately send competing update/delete | Preserve referential integrity and consistent final state | No orphaned product, `500`, or partial mutation | INCOMPLETE | Referential-integrity and concurrency policies are not stated | |

## Coverage checklist

| Area | Cases |
| --- | --- |
| Read/list and response schema | C1-001–C1-005 |
| Create, name partitions, parser/transport | C1-006–C1-018 |
| Create authentication and authorization | C1-019–C1-021 |
| Update and ID partitions | C1-022–C1-028 |
| Delete and ID partitions | C1-029–C1-033 |
| Full state lifecycle and integrity/concurrency | C1-034–C1-035 |

**Count:** 35 AI-generated test cases.  
**Human-audit summary:** 26 VALID, 9 INCOMPLETE, 0 INVALID.

## Student-proposed extensions and human audit

| ID | Source | Objective / transition | Preconditions | Request data / steps | Expected result | Human audit | Why the AI missed it | Actual / evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C1-036 | Student | Reject names made only of non-ASCII whitespace | Valid admin token; record category count | Submit separate creates using tab/newline, non-breaking space (`U+00A0`), and ideographic space (`U+3000`) as `name` | Each request is rejected; category count and existing records remain unchanged | VALID | The AI covered ordinary spaces but did not expand the “empty name” equivalence class to Unicode whitespace | |
| C1-037 | Student | Reject non-string names during update | Valid admin token; disposable existing category | Update the same ID with `name: null`, a number, array, and object in separate reset runs | Every update is rejected; original name and all other categories remain unchanged | VALID | The AI covered type confusion on create but did not apply the same required-name partition to update | |
| C1-038 | Student | Ensure path ID wins over body mass-assignment fields on update | Valid admin token; disposable categories A and B | `PUT /api/categories/{A.id}` with a valid new name plus `{"id": B.id, "role":"admin"}` | Only A's name changes; A/B IDs remain unchanged; B is untouched | VALID | The AI tested mass assignment on create but omitted the equivalent update attack and path/body ID conflict | |
| C1-039 | Student | Prevent stale deleted IDs from affecting later categories | Valid admin token; disposable category A | Create A → delete A → create B → attempt update and delete using stale `A.id` | Stale-ID operations do not modify/delete B or any other category; B remains readable | VALID | The AI tested arbitrary nonexistent IDs but missed a state-derived stale ID after a real delete/create lifecycle | |
| C1-040 | Student | Preserve valid punctuation and JSON-escaped characters in a category name | Valid admin token | Create `HW06-23127172-Điện tử \"Cao cấp\" / IoT & Nhà thông minh`, then read, update, and delete it | Create/update succeed; GET preserves the exact decoded string; delete removes only that category | VALID | The AI covered Unicode and injection separately but missed a legitimate complex name exercising JSON escaping throughout CRUD | |

**Count after extensions:** 35 AI-generated cases + 5 student-proposed cases = **40 total**.
