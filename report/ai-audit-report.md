# AI Audit Report — HW06

**Declaration:** I use AI tools for the following tasks: interpreting the assignment, locating endpoint details in the SUT API specification, generating and reviewing test cases, identifying coverage gaps, and drafting test-case artifacts. I reviewed the outputs before adding them to the submission artifacts.

**Tool:** ChatGPT/Codex (GPT-5)  
**Session date:** 2026-08-21 (ICT)  
**Important:** This audit records design work only. It is not execution evidence; Newman reports, Postman console screenshots, and bug evidence must be added after real execution.

| ID | Date/time (ICT) | Task | Prompt | Output / attachment | Human review / changes |
| --- | --- | --- | --- | --- | --- |
| AI-01 | 2026-08-21 14:20 | Read and scaffold assignment | `đọc và cho tôi biêt 2026.HW06.API Testing_En.md : 1. trong file yêu cầu gì 2. tạo sườn cho tôi` | Assignment summary and submission scaffold. | Kept the scaffold; student must fill identity, evidence, and selected APIs. |
| AI-02 | 2026-08-21 14:20 | Record selected features/endpoints | `tôi chọn 3 cái là 2,8,14` | Mapped selections to FR-02 login, FR-08 checkout, and FR-14 category CRUD; consulted SUT API specification. | Confirmed FR-02 endpoint is `POST /api/login`. FR-14 is a feature with four CRUD endpoints, not one endpoint. |
| AI-03 | 2026-08-21 14:20 | Generate FR-02 cases | `hãy tạo cho tôi 1 bộ test case về api cho FR-02` then `35 cases phủ hết thôi còn 5 case còn lại tí tôi đề xuất` | 35 AI-generated FR-02 test cases A1-001–A1-035. | Reviewed each case: 20 VALID and 15 INCOMPLETE. Incomplete labels are due to absent error/lockout/length policies in the short API specification. |
| AI-05 | 2026-08-21 14:20 | Add selected student extensions | `JSON/content-type không chính xác, lỗi đồng thời, đặt lại bộ đếm sau khi đăng nhập thành công, mở khóa sau khi hết hạn, và khóa theo IP/tài khoản đã có kiểm tra chưa nếu chưa hãy tạo thêm cho tôi case có liên quan để test` | Added A1-036–A1-040. | Reviewed now: A1-036/A1-037 VALID; A1-038–A1-040 INCOMPLETE pending the actual lockout policy and environment. |
| AI-06 | 2026-08-21 20:19 | Build a data-driven Postman suite | `rồi làm cho tôi cái test hết 40 cái đi` | Created the Postman collection request and `postman/data/fr-02/fr02-data.json` with 40 iterations. | Student imported the suite and executed it in Postman Desktop/Newman. The observed results are execution evidence, not AI-generated content. |
| AI-07 | 2026-08-21 20:19 | Review real execution evidence and draft FR-02 report | `HW06_API_Testing.postman_collection.json tôi đã export ra kết quả rồi đọc và viết báo cáo cho tôi` and later supplied `HW06 API Testing — 23127172.postman_test_run.json`. | Read the Newman log, HTML report, and Postman Run Results export; wrote `report/fr02-execution-report.md` and updated the main report/README. | Verified 40 requests, 80 assertions, 75 pass, 5 fail. The five failures share one observed password-disclosure defect. Student must create and attach the GitHub Issue independently. |
| AI-08 | 2026-08-21 20:19 | Update the AI Audit Report | `ghi lại audit report cho tôi` | Added these audit records. | Student should check all timestamps, prompts, and summaries against their actual conversation history before submission. |
| AI-09 | 2026-08-21 20:19 | Generate FR-08 Checkout cases | `tiếp theo cho tôi tầm 35 test cases tốt cho cái FR-08 đi` | Created 35 AI-generated cases B1-001–B1-035 in `test-cases/api-2.md`. | Cases are marked PENDING/INCOMPLETE where requirements are not defined; student must perform the human audit before execution. |
| AI-10 | 2026-08-21 20:19 | Add five FR-08 student-proposed cases | `hãy bổ sung 5 case: shipping_address sai kiểu dữ liệu; total_amount là boolean/object/array; Cart có dữ liệu không hợp lệ trước checkout; Checkout thất bại không làm thay đổi trạng thái; JSON có key bị lặp (ghi vào audit)` | Added B1-036–B1-040. | Marked as pending human audit; student must verify expected behavior using the specification/SUT before execution. |
| AI-11 | 2026-08-21 20:35 | Create FR-08 Newman data-driven suite | `dựa vào api-2.md tạo data cho tôi test và script cho tôi test newman (ghi audit)` | Added `postman/data/fr-08/fr08-data.json`, an FR-08 Postman request with setup/assertion scripts, and `scripts/run-fr08-newman.sh`. | The suite covers B1-001–B1-040 but several cases require a human-controlled isolated cart/user or a confirmed policy; execution findings must be recorded separately from this generated setup. |

## AI-01 — Assignment interpretation and scaffold

**Prompt**

```text
đọc và cho tôi biêt 2026.HW06.API Testing_En.md :
1. trong file yêu cầu gì
2. tạo sườn cho tôi
```

**Output**

The AI summarized the requirement to select one feature/API from each of Pools A, B, and C; produce at least 35 AI-generated cases per selected API; audit them; add at least five student cases; execute using Postman/Newman with `X-Student-Id`; provide CI/CD, bug reports, AI audit, critique, generator design, and evidence. It created the report, Postman, workflow, generator, evidence, and test-case templates in this repository.

**Human review**

The assignment file was read directly. The scaffold is only a template; no execution evidence or fabricated results were added.

## AI-02 — Feature selection and endpoint check

**Prompt**

```text
tôi chọn 3 cái là 2,8,14
```

**Output**

The AI interpreted the choices as FR-02 (login and account lockout), FR-08 (checkout), and FR-14 (category management CRUD). It checked the SUT API specification and identified `POST /api/login` for FR-02.

**Human review**

The feature mapping was accepted. The student still needs to confirm that the chosen set is not duplicated within the group and clarify with the TA if “three APIs” is interpreted as exactly three endpoints rather than three selected features.

## AI-03 — Initial FR-02 test suite

**Prompt**

```text
hãy tạo cho tôi 1 bộ test case về api cho FR-02
35 cases phủ hết thôi còn 5 case còn lại tí tôi đề xuất
```

**Output**

Created A1-001–A1-035 in [../test-cases/api-1.md](../test-cases/api-1.md). Coverage includes valid login/schema, missing/empty/malformed/type/boundary input partitions, injection and enumeration risks, and lockout transitions.

**Human review**

Accepted 20 cases as VALID. Marked 15 as INCOMPLETE rather than inventing status codes or lockout rules not stated by the specification. These must be refined after reviewing the implementation or executing against the SUT.

## AI-05 — Five student extensions

**Prompts**

```text
JSON/content-type không chính xác, lỗi đồng thời, đặt lại bộ đếm sau khi đăng nhập thành công,
mở khóa sau khi hết hạn, và khóa theo IP/tài khoản đã có kiểm tra chưa nếu chưa hãy tạo thêm cho tôi case có liên quan để test
```

**Output**

Created five additional cases A1-036–A1-040 for malformed JSON/Content-Type, concurrent failed logins, reset of failed-attempt counter after success, expiry-based automatic unlock, and IP-versus-account lockout keying.

**Human review**

The additions are appropriate and non-duplicative. A1-036 and A1-037 are VALID test ideas. A1-038 to A1-040 remain INCOMPLETE because the specification does not define reset, expiry, or keying behavior; the student must determine these from approved requirements or observed SUT behavior before grading a test as failed.

## AI-06 — Data-driven Postman suite

**Prompt**

```text
rồi làm cho tôi cái test hết 40 cái đi
```

**Output**

Created a data-driven `POST /api/login` request in `postman/HW06_API_Testing.postman_collection.json` and the 40-row input file `postman/data/fr-02/fr02-data.json`. The suite references iteration data through `pm.iterationData` and adds `X-Student-Id: 23127172` in a collection pre-request script.

**Human review**

The student imported the collection and data file into Postman Desktop, selected 40 iterations, and ran it against the local SUT. The actual response/status/assertion data was produced by Postman/Newman and retained separately as evidence.

## AI-07 — Evidence review and report drafting

**Prompt**

```text
HW06_API_Testing.postman_collection.json tôi đã export ra kết quả rồi đọc và viết báo cáo cho tôi
```

The student subsequently provided the Postman Desktop Run Results export:

```text
HW06 API Testing — 23127172.postman_test_run.json
```

**Output**

The AI read the execution artifacts and drafted `report/fr02-execution-report.md`. It reported 40 executed requests, 80 assertions, 75 passed assertions, and 5 failed assertions. The failures consistently showed that the successful-login `user` object included a `password` property.

**Human review**

The metrics were checked against the Postman Run Results export (`status: finished`, `totalPass: 75`, `totalFail: 5`) and the Newman terminal log. The password-disclosure finding is documented as BUG-01, but must be filed by the student on GitHub with a real, redacted screenshot before it is considered complete.

## AI-08 — Audit update

**Prompt**

```text
ghi lại audit report cho tôi
```

**Output and human review**

This audit report was expanded to include construction of the data-driven suite, review of execution artifacts, and report drafting. The student remains responsible for checking this audit against the actual session history and for preserving the original evidence files.

## AI-09 — FR-08 Checkout test-case generation

**Prompt**

```text
tiếp theo cho tôi tầm 35 test cases tốt cho cái FR-08 đi
nhớ ghi vào audit
```

**Output**

Created B1-001–B1-035 in [../test-cases/api-2.md](../test-cases/api-2.md). The cases cover `total_amount` and `shipping_address` partitions, authorization, IDOR/ownership, client-side total manipulation, empty-cart and duplicate-checkout states, concurrency, transport parsing, and response-schema/security checks.

**Human review**

This is an AI-generated draft, not a completed human audit. The student must inspect the API specification and SUT behavior, then replace each `PENDING` label with `VALID`, `INVALID`, or `INCOMPLETE` and record the reason before final submission.

## AI-10 — Five FR-08 student-proposed extensions

**Prompt**

```text
hãy bổ sung 5 case:
1. shipping_address sai kiểu dữ liệu
2. total_amount là boolean/object/array
3. Cart có dữ liệu không hợp lệ trước checkout
4. Checkout thất bại không làm thay đổi trạng thái
5. JSON có key bị lặp
(ghi vào audit)
```

**Output**

Added B1-036–B1-040 to `test-cases/api-2.md`. The cases cover non-string address types, nonnumeric amount types, invalid cart contents, no-side-effect behavior after a failed checkout, and duplicate JSON keys.

**Human review**

The student selected the five coverage gaps. Their test ideas are retained as student-proposed extensions, but their final audit label and expected status must be determined from the specification and real SUT results.

## AI-11 — FR-08 data-driven Newman setup

**Prompt**

```text
dựa vào api-2.md tạo data cho tôi test và script cho tôi test newman (ghi audit)
```

**Output**

Created the 40-row data file at [../postman/data/fr-08/fr08-data.json](../postman/data/fr-08/fr08-data.json), added the `FR-08 data-driven suite (B1-001 to B1-040)` request and its login/setup/assertion scripts to the Postman collection, and added [../scripts/run-fr08-newman.sh](../scripts/run-fr08-newman.sh). The request adds the required `X-Student-Id` through the existing collection script and obtains a token using the seeded test user.

**Human review**

This is generated test infrastructure, not execution evidence. The backend has no cart reset endpoint and its cart is in-memory, so cases involving cart state, repeat checkout, ownership, or corrupt carts need isolated/manual setup and before/after evidence. The student must run the command, save the actual Newman output/report, inspect failures, and update the FR-08 results report; no pass/fail result is claimed here.

## AI-12 — FR-08 execution-evidence analysis

**Prompt**

```text
[Postman run-result JSON] và [fr08-newman-report.html] đọc 2 này và ghi lại kết quả chạy được
```

**Output and human review**

Read both supplied artifacts and created [fr08-execution-report.md](fr08-execution-report.md). The two sources agree on 40 iterations, 114 assertions, 103 passes, 11 failures, and no skipped tests. The report identifies confirmed defects in client-controlled total price, address validation, and `text/plain` error handling. It explicitly does **not** claim empty-cart, duplicate-checkout, corrupt-cart, or rollback defects from this run because their required state setup was not demonstrated. The student must review the classifications and create the real GitHub Issues/screenshots before submission.

## AI-13 — FR-14 Category CRUD test-case generation

**Prompt**

```text
Hãy tạo cho tôi test case cho FR-14 cho tôi
```

**Output and human review**

Created 35 AI-generated cases C1-001–C1-035 in [../test-cases/api-3.md](../test-cases/api-3.md). They cover category list/create/update/delete, the mandatory-name rule, admin JWT/role boundaries, malformed transport, injection/XSS, ID partitions, and the complete lifecycle. The proposed audit has 25 VALID and 10 INCOMPLETE cases; the student must confirm the unfinished policies and add five student-proposed cases before execution.

## AI-14 — FR-14 data-driven Newman setup

**Prompt**

```text
tôi đã tự thêm 5 case nữa hãy giúp tôi tạo data test cho FR-14 cũng như script chạy newman
```

**Output and human review**

Read the student-added C1-036–C1-040 cases and created [../postman/data/fr-14/fr14-data.json](../postman/data/fr-14/fr14-data.json), the FR-14 request/scripts in the Postman collection, and [../scripts/run-fr14-newman.sh](../scripts/run-fr14-newman.sh). The generated setup logs in as needed and makes disposable categories for update/delete cases. Run results remain unclaimed until the student runs Newman, saves its artifacts, and verifies stateful/complex cases manually where the single-row flow cannot fully prove the multi-step precondition.

## AI-15 — FR-14 execution-evidence analysis

**Prompt**

```text
[Postman run-result JSON] và [fr14-newman-report.html] đây là 2 kết quả ghi lại kết quả cho tôi (ghi audit)
```

**Output and human review**

Read both supplied artifacts and created [fr14-execution-report.md](fr14-execution-report.md). Both sources report 40 iterations, 92 assertions, 72 passes, 20 failures, and 0 skipped tests. The report groups confirmed input-validation, missing-role-authorization, and unsafe parser/content-type defects as BUG-05 through BUG-07. It keeps absent/malformed/stale-ID `200` responses as a characterization finding because the FR-14 audit lists the exact status policy as incomplete. The student must review the classifications and create actual GitHub Issues/screenshots before submission.

## AI-16 — Git commits, push, and CI/CD setup

**Prompt**

```text
hãy push tạm lần lượt theo từng pool một lên GitHub và tôi còn muốn làm CI/CD nữa
```

**Output and human review**

Initialized the outer repository, configured the supplied GitHub remote, and pushed separate commits for Pool A/FR-02, Pool B/FR-08, and Pool C/FR-14. Added `.github/workflows/api-tests.yml`: it installs the backend/Newman, initializes and starts the SUT, then runs each pool with its data file. Plaintext seed credentials and sensitive local Newman HTML exports were deliberately kept out of Git; CI does not upload raw reports because they can contain passwords/JWTs. The workflow reads `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `TEST_USER_EMAIL`, and `TEST_USER_PASSWORD` from GitHub Secrets. The student must add those Secrets, open the Actions run, and capture a real redacted workflow screenshot for the final report.

## AI-17 — CI submodule checkout correction

**Trigger**

The first manually triggered Actions run failed because the outer repository stores `eshop-sut` as a Git submodule.

**Output and human review**

Updated `actions/checkout` with `submodules: recursive` so the GitHub runner receives `eshop-sut/backend` before dependency installation and SUT startup. The student must rerun the workflow after this commit and confirm that all four Actions Secrets are set.

## AI-18 — CI pass evidence recorded

**Trigger**

The student supplied an Actions screenshot showing `HW06 API tests #3` passed after commit `7bb12f3`.

**Output and human review**

Updated the CI/CD section of [main-report.md](main-report.md) with the initial failure cause, fix commit, confirmed passing run, and 30-second duration. The screenshot is still only present in the conversation; the student must save it under `evidence/ci/ci-pass-7bb12f3.png` before final submission.
