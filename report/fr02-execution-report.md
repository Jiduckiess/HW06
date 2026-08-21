# FR-02 Execution Report — Login and Account Lockout

**Student ID:** 23127172  
**SUT:** `http://localhost:3000`  
**Endpoint:** `POST /api/login`  
**Test suite:** `FR-02 data-driven suite (A1-001–A1-040)`  
**Evidence:** [Postman Run Results JSON](../postman/results/fr-02/HW06%20API%20Testing%20%E2%80%94%2023127172.postman_test_run.json), [Newman terminal log](../evidence/terminal/FR-02.txt), and [Newman HTML report](../evidence/newman/fr02-newman-report.html)

## Execution result

| Metric | Result |
| --- | ---: |
| Planned cases / iterations | 40 |
| Requests executed | 40 |
| Test scripts executed | 40 |
| Assertions executed | 80 |
| Assertions passed | 75 |
| Assertions failed | 5 |
| Average response time | 1 ms |
| Total duration | 509 ms |

The Postman export records a finished run at `2026-08-21T12:58:02.487Z`, using environment `HW06 Local`, with 75 passed and 5 failed assertions. The terminal log shows the pre-request script sent `X-Student-Id: 23127172` on every iteration. Requests were sent to `http://localhost:3000/api/login`.

## Observed response-status summary

| Cases | Observed status | Interpretation |
| --- | --- | --- |
| A1-001, A1-023, A1-035, A1-038, A1-040 | 200 | Valid credentials / permitted account-isolation scenarios returned a token and user object. |
| A1-002–A1-022, A1-024–A1-032 | 401 | Invalid credentials and malformed/domain-security input scenarios were rejected. |
| A1-033, A1-034, A1-037, A1-039 | 403 | Account-lockout state was active. |
| A1-036 | 400 | Malformed JSON was rejected. |

## Failed assertions and defect finding

The five failed assertions are A1-001, A1-023, A1-035, A1-038, and A1-040. Each returned `200 OK`, a JWT token, and a `user` object; however, the `user` object contained a `password` property. The same defect caused all five failures.

| Bug ID | Title | Severity | Reproducibility | Evidence |
| --- | --- | --- | --- | --- |
| BUG-01 | Login response exposes the user's password in the `user` object | High | Reproduced in five successful-login scenarios | Failed assertions in `FR-02.txt`; HTML Newman report |

**Expected:** A login response must never expose password data.  
**Actual:** The `user` object contains a `password` field.  
**Impact:** A client, browser log, proxy, or compromised frontend can obtain credentials, enabling account compromise and password-reuse attacks.

## Limitations and follow-up

- A1-037 records a lockout-state observation only; it does not prove a true concurrent race condition. Use a concurrent client/script for that test.
- A1-039 ran while the account was locked; it does not verify automatic unlock after expiry. Run it separately after the lock duration.
- Create GitHub Issue `BUG-01`, attach a redacted response screenshot, and add the Issue URL to the main report.
- Capture the Postman Console and Postman Desktop Runner summary to complete the required Postman evidence.
