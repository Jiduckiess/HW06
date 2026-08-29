# GitHub Issues evidence

All confirmed defects were filed as GitHub Issues in the project repository on 2026-08-21. Each Issue is open and includes its own redacted Postman/Newman screenshot evidence.

| Bug ID | GitHub Issue | Status | Evidence represented | Screenshot copy |
| --- | --- | --- | --- | --- |
| BUG-01 | [#1 — Successful login response exposes `user.password`](https://github.com/Jiduckiess/HW06/issues/1) | Open | FR-02 successful-login schema failures | [BUG-01.png](../github-issues/BUG-01.png) |
| BUG-02 | [#2 — Checkout trusts client-controlled `total_amount`](https://github.com/Jiduckiess/HW06/issues/2) | Open | FR-08 B1-026/B1-027 price-tampering failures | [BUG-02.png](../github-issues/BUG-02.png) |
| BUG-03 | [#3 — Checkout accepts missing or null `shipping_address`](https://github.com/Jiduckiess/HW06/issues/3) | Open | FR-08 B1-011/B1-036/B1-039 validation failures | [BUG-03.png](../github-issues/BUG-03.png) |
| BUG-04 | [#4 — Checkout with `text/plain` JSON causes HTTP 500](https://github.com/Jiduckiess/HW06/issues/4) | Open | FR-08 B1-033 robustness failure | [BUG-04.png](../github-issues/BUG-04.png) |
| BUG-05 | [#5 — Category create/update accepts invalid required names](https://github.com/Jiduckiess/HW06/issues/5) | Open | FR-14 name validation failures | [BUG-05.png](../github-issues/BUG-05.png) |
| BUG-06 | [#6 — Normal users can mutate categories](https://github.com/Jiduckiess/HW06/issues/6) | Open | FR-14 authorization failures | [BUG-06.png](../github-issues/BUG-06.png) |
| BUG-07 | [#7 — Category parser/content-type errors expose implementation details](https://github.com/Jiduckiess/HW06/issues/7) | Open | FR-14 C1-017/C1-018 parsing/error-handling failures | [BUG-07.png](../github-issues/BUG-07.png) |

> The source screenshots are embedded in their GitHub Issues. Do not commit raw Newman HTML or unredacted responses, as they may contain JWTs or credentials.
