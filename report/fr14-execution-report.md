# FR-14 Execution Report — Category CRUD

**Student ID:** 23127172  
**SUT:** `http://localhost:3000`  
**Endpoints:** `GET/POST/PUT/DELETE /api/categories`  
**Test suite:** `FR-14 data-driven suite (C1-001–C1-040)`  
**Evidence:** [Postman Run Results JSON](../postman/data/fr-14/HW06%20API%20Testing%20%E2%80%94%2023127172.postman_test_run.json) and [Newman HTML report](../evidence/newman/fr14-newman-report.html)

## Execution result

| Metric | Result |
| --- | ---: |
| Planned cases / iterations | 40 |
| Newman HTTP requests | 96 |
| Assertions executed | 92 |
| Assertions passed | 72 |
| Assertions failed | 20 |
| Case rows with one or more failed assertions | 18 |
| Skipped tests | 0 |
| Average response time | 1 ms |
| Newman total duration | 764 ms |

The Postman export records a **finished** run at `2026-08-21T15:11:30.264Z` with `totalPass: 72` and `totalFail: 20`. The Newman report independently records 40 iterations, 96 requests (including login and disposable-category setup calls), 92 assertions, 20 failures, and no skipped tests. The selected environment was `HW06 Local`.

## Failed assertions and interpretation

| Cases | Observed result | Classification |
| --- | --- | --- |
| C1-007, C1-008, C1-009 | Create with missing, empty, or whitespace-only `name` returned `200` instead of `400`. | Confirmed required-name validation defect. |
| C1-013 | Create with `name: null` returned `200`. | Confirmed type-validation defect. |
| C1-023, C1-024 | Update with missing/empty `name` returned `200`. | Confirmed required-name validation defect on update. |
| C1-036 | Tab/newline-only category name returned `200`. | Confirmed blank-equivalence validation defect. |
| C1-037 | Update with `name: null` returned `200`. | Confirmed type-validation defect on update. |
| C1-020, C1-028, C1-033 | A normal user JWT could create, update, and delete categories; each returned `200`, not `403`. | Confirmed missing admin-role authorization. |
| C1-017 | Malformed JSON gave a 4xx response, but the HTML error response exposed a JavaScript stack-trace pattern. | Confirmed error-information disclosure. |
| C1-018 | Valid JSON labelled `text/plain` produced `500` and exposed a stack-trace pattern. | Confirmed unsafe content-type/error handling. |
| C1-025, C1-026, C1-030, C1-031, C1-039 | Update/delete of non-existent, malformed, or stale IDs returned `200`, not `404`/safe rejection. | Characterization finding. The current FR-14 audit marks exact non-existent-ID status as incomplete, so do not file this as a confirmed functional bug until the API owner confirms the intended contract. |

## Confirmed defects to file as GitHub Issues

| Bug ID | Summary | Severity | Reproduction evidence |
| --- | --- | --- | --- |
| BUG-05 | Category create/update accepts missing, blank, Unicode-whitespace, and `null` names despite the mandatory-name rule. | High | C1-007–C1-009, C1-013, C1-023–C1-024, C1-036–C1-037 |
| BUG-06 | Category mutations require a JWT but do not enforce the `admin` role; a normal user can create, update, and delete. | Critical | C1-020, C1-028, C1-033 |
| BUG-07 | Category request parsing/content-type failures expose stack traces; `text/plain` JSON causes HTTP 500. | Medium | C1-017, C1-018 |

Expected corrective behavior: enforce `req.user.role === "admin"` on category mutations; validate `name` as a trimmed, non-empty string on both create and update; use a consistent 4xx error response for malformed JSON/unsupported media; and return a clear `404`/no-op contract for absent IDs.

## Follow-up

- File GitHub Issues BUG-05 through BUG-07 with redacted request/response screenshots and add their URLs to the main report.
- Retest C1-025/C1-026/C1-030/C1-031/C1-039 after confirming the intended absent-ID behavior.
- Keep the Postman Runner and Console screenshots, including the `X-Student-Id: 23127172` header evidence.
