# API 1 — FR-02 Login and account lockout (`POST /api/login`)

**Specification:** JSON body: `email`, `password`; successful response: `200 OK` with JWT `token` and `user`.  
**Common header:** `X-Student-Id: 23127172`  
**Test data:** replace `valid.user@example.com` / `ValidPassword123!` with an isolated active test account.

> The API description omits some error schemas and maximum lengths, but the SUT requirements define FR-02 lockout behavior: failed-login count increases by exactly 1, three consecutive failures lock the account for 30 seconds, and the error must not reveal the cause. Error status codes remain observational unless specified.

| ID | Source | Objective / partition or transition | Preconditions | Request body | Expected result | Security / schema assertion | Audit | Audit reasoning | Actual / evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A1-001 | AI | Happy path | Active user | Valid email + valid password | `200 OK` | JSON contains non-empty `token` and `user`; no password | VALID | Directly specified | |
| A1-002 | AI | Email case variation | Active user | Mixed-case email + valid password | Consistent accept/reject per policy | Authenticated identity is correct | INCOMPLETE | Normalization unspecified | |
| A1-003 | AI | Email with surrounding spaces | Active user | ` valid.user@example.com ` + valid password | Consistent trim/reject behavior | No account confusion | INCOMPLETE | Whitespace policy unspecified | |
| A1-004 | AI | Password with surrounding spaces | Active user | Valid email + password with spaces added | Reject unless spaces are part of password | No password echoed | VALID | Password must match exactly | |
| A1-005 | AI | Missing email | None | `{ "password":"ValidPassword123!" }` | Reject; no token | Safe error JSON, no stack trace | VALID | Required field absent | |
| A1-006 | AI | Missing password | None | `{ "email":"valid.user@example.com" }` | Reject; no token | Safe error JSON, no stack trace | VALID | Required field absent | |
| A1-007 | AI | Missing body fields | None | `{}` | Reject; no token | No user/token fields | VALID | Required fields absent | |
| A1-008 | AI | Empty email | None | Empty email + any password | Reject; no token | Safe error | VALID | Invalid partition | |
| A1-009 | AI | Empty password | None | Valid email + empty password | Reject; no token | Safe error | VALID | Invalid partition | |
| A1-010 | AI | Both values empty | None | Both empty strings | Reject; no token | Safe error | VALID | Invalid partition | |
| A1-011 | AI | Invalid email without `@` | None | `invalid-email` + password | Reject; no token | No `500` | VALID | Invalid email format | |
| A1-012 | AI | Invalid email missing local part | None | `@example.com` + password | Reject; no token | No `500` | VALID | Invalid email format | |
| A1-013 | AI | Invalid email missing domain | None | `user@` + password | Reject; no token | No `500` | VALID | Invalid email format | |
| A1-014 | AI | Whitespace-only values | None | Both values are spaces | Reject; no token | No reflected credentials | VALID | Invalid partition | |
| A1-015 | AI | Excessive email length | None | Email over configured maximum | Safe reject/handling | Bounded response time; no `500` | INCOMPLETE | Max length unspecified | |
| A1-016 | AI | Excessive password length | None | Password over configured maximum | Safe reject/handling | Bounded response time; no `500` | INCOMPLETE | Max length unspecified | |
| A1-017 | AI | Unicode email | None | `người-dùng@example.com` + password | Consistent accept/reject | No encoding error / account confusion | INCOMPLETE | i18n policy unspecified | |
| A1-018 | AI | Unicode/special-char password | User with such password | Valid email + exact special-character password | Authenticate only on exact match | Password never returned | INCOMPLETE | Needs test account | |
| A1-019 | AI | Email is number | None | `email: 12345` | Reject; no token | Strict type validation | VALID | Wrong type | |
| A1-020 | AI | Password is number | None | `password: 12345` | Reject; no token | Strict type validation | VALID | Wrong type | |
| A1-021 | AI | Email is null | None | `email: null` | Reject; no token | No `500` | VALID | Null invalid | |
| A1-022 | AI | Password is null | None | `password: null` | Reject; no token | No `500` | VALID | Null invalid | |
| A1-023 | AI | Mass-assignment attempt | Active user | Valid credentials + `"role":"admin"` | Login may succeed/reject, but input role is ignored | Returned role is actual role, not admin | VALID | Role-escalation coverage | |
| A1-024 | AI | SQL injection in email | None | Email `"' OR '1'='1' --"` | Reject; no token | No SQL error/data disclosure | VALID | Injection coverage | |
| A1-025 | AI | SQL injection in password | None | Valid email + password `"' OR '1'='1' --"` | Reject; no token | No SQL error/token | VALID | Injection coverage | |
| A1-026 | AI | NoSQL/operator injection | None | `email:{"$ne":""}`, `password:{"$ne":""}` | Reject; no token | Strict JSON type validation | VALID | Type-confusion security | |
| A1-027 | AI | XSS payload in email | None | `<script>alert(1)</script>@x.test` | Reject safely | Any reflected output must be encoded | INCOMPLETE | UI rendering needs separate proof | |
| A1-028 | AI | Unknown valid-format email | None | Unknown email + arbitrary password | Reject; no token | Same status/schema/message class as A1-029; no account disclosure | VALID | FR-02 requires errors not to reveal the cause | |
| A1-029 | AI | Known email, wrong password | Active user | Valid email + wrong password | Reject; no token | Same status/schema/message class as A1-028; no account disclosure | VALID | FR-02 requires errors not to reveal the cause | |
| A1-030 | AI | User-enumeration timing | Active + unknown user | Repeat A1-028/A1-029 | No reliable timing distinction | Record samples/median | INCOMPLETE | Measurement criterion required | |
| A1-031 | AI | First failed login | Isolated user, reset state | Valid email + wrong password | Reject; account remains usable | No token; a following valid login succeeds | VALID | FR-02 defines a consecutive-failure counter; first failure must not lock | |
| A1-032 | AI | Attempt immediately before threshold | Reset user; threshold is 3 | Two wrong-password attempts, then valid credentials | Account is not locked after attempt 2; valid login succeeds | No lockout bypass; response contains no token on failures | VALID | FR-02 explicitly sets threshold to 3 consecutive failures | |
| A1-033 | AI | Attempt reaches lockout threshold | Reset user; threshold is 3 | Three wrong-password attempts, then valid credentials within 30 s | Account is locked after attempt 3; valid login is rejected during lock | No token; capture lock response without relying on an unspecified status | VALID | FR-02 explicitly sets threshold to 3 and lock duration to 30 seconds | |
| A1-034 | AI | Correct password during lockout | User locked in A1-033; retry before 30 s expires | Valid credentials | No token while lock is active | No lockout bypass | VALID | FR-02 explicitly defines a 30-second temporary lock | |
| A1-035 | AI | Lockout isolation between accounts | Account A locked; B active | Valid credentials for B | B authenticates successfully | Token/user belongs only to B | VALID | The lock is an account state; A's lock must not block B | |

## Coverage checklist

| Area | Cases |
| --- | --- |
| Success and schema | A1-001–A1-004 |
| Required fields, formats, type, boundaries | A1-005–A1-022 |
| Security | A1-023–A1-030 |
| Lockout transitions | A1-031–A1-035 |

**Count before extensions:** 35 AI-generated cases; **student-added cases:** 0.

## Student-proposed extensions and human audit

| ID | Objective / transition | Preconditions | Request / steps | Expected result | Human audit | Audit reasoning | Evidence to capture |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A1-036 | Reject malformed JSON and inappropriate `Content-Type` | Active user; lockout state reset | (1) Invalid JSON with `application/json`; (2) valid JSON with `text/plain`; (3) valid JSON without `Content-Type`. | Safely reject; no token, `500`, or parser detail. | VALID | These are distinct request-parsing partitions absent from the first 35 cases. Exact status/error body must be observed. | Headers/body, status, response, console. |
| A1-037 | Detect concurrent-failure race condition in lockout | Isolated account; threshold 3; reset state | Send 3 incorrect logins concurrently, then valid credentials; repeat three times. | No token at/after lockout; concurrency cannot bypass counting. | VALID | Important state-transition/security test. Requires a runner capable of concurrency. | Timestamps, all results, final login result. |
| A1-038 | Confirm successful login resets prior failed-attempt counter | Isolated account; threshold 3 | Two failures → one success → one failure → valid login. | Final valid login succeeds; the earlier success broke the consecutive-failure sequence. | VALID | “Three consecutive failures” implies a successful login resets the failed sequence. | Ordered request log and final result. |
| A1-039 | Confirm automatic unlock after expiry | Isolated account; threshold 3; duration 30 s | Lock account; retry just before 30 s and just after 30 s. | No token before expiry; successful login after expiry, allowing small clock/network tolerance. | VALID | FR-02 explicitly defines a temporary 30-second lock. | Elapsed time and before/after responses. |
| A1-040 | Determine whether lockout is keyed by account, IP, or both | Two accounts; two controlled IPs/proxies if available | Lock A from IP-1; test A from IP-2 and B from both IPs. | Behavior matches security policy; B must not be blocked by A's lockout. | INCOMPLETE | Keying policy is unspecified and a second controlled IP may not be available locally. | IP/proxy setup and result matrix. |

**Count after extensions:** 35 AI-generated cases + 5 student-proposed cases = **40 total**.

## Human corrections for remaining incomplete AI cases

The following cases remain incomplete as originally generated because the source did not define a policy or because the oracle was not executable. They must be treated as corrected characterization/robustness tests, not silently left unresolved:

| ID | Correction for the final test suite |
| --- | --- |
| A1-002 | Use a known account and record the observed case policy; pass if either rejection is consistent or acceptance authenticates the same user without account confusion. Mark as characterization. |
| A1-003 | Use a known account and record trim/reject behavior; never accept a different account or issue a token for an unintended identity. |
| A1-015 | Replace “over configured maximum” with a concrete stress value (for example, 10,000 characters); require no 500, no token, and bounded completion. |
| A1-016 | Replace “over configured maximum” with a concrete stress value (for example, 10,000 characters); require no 500, no token, and bounded completion. |
| A1-017 | Create an explicitly Unicode test account if supported; otherwise require safe rejection with no 500 and no token. |
| A1-018 | Split into separate ASCII-special-character and Unicode-password cases with concrete seeded credentials. |
| A1-027 | Keep the API assertion limited to safe rejection/no token/no raw parser error; cover rendered XSS separately in a UI test. |
| A1-030 | Define a sample plan (for example, 30 paired requests), compare medians, and label the result observational unless a timing threshold is approved. |

The SUT requirements define the lockout values used above: three consecutive failures, a 30-second lock, and no cause disclosure.
