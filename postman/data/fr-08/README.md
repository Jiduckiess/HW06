# FR-08 Newman data

Use `fr08-data.json` as the Runner/Newman iteration file. It has one main row for each
case B1-001–B1-040. The request obtains a fresh token for `test@eshop.com` when its
`authMode` is `valid`; no token needs to be pasted into the environment.

Run the backend in a separate terminal. For a clean first result, reset its persistent
database before starting the backend:

```bash
cd eshop-sut/backend
node database.js
node server.js
```

Then run from the repository root:

```bash
bash scripts/run-fr08-newman.sh
```

The generated report is `evidence/newman/fr08-newman-report.html`.

## Deliberate execution limits

The SUT's cart is in memory, has no reset/delete endpoint, and the checkout endpoint
does not currently calculate or clear cart contents. Therefore, B1-025, B1-028–B1-032,
B1-038 and B1-039 need isolated/manual setup plus before/after evidence. The 40-row
suite still exercises their checkout request paths, but it must not be used to claim
that those state/ownership assertions have passed. B1-036 and B1-037 use one
representative non-string/non-number variant in the data file; run their other variants
manually and attach the responses.
