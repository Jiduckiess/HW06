# FR-14 Newman data

`fr14-data.json` has one row for every case C1-001–C1-040. Run it with:

```bash
bash scripts/run-fr14-newman.sh
```

The SUT must already be running at `http://localhost:3000`. For a clean repeatable run,
reset it first with `node database.js` from `eshop-sut/backend`, then start `node server.js`.

The suite logs in with the seeded admin/user accounts only to obtain temporary JWTs. It
creates disposable target categories for update/delete rows. Its HTML report is written
to `evidence/newman/fr14-newman-report.html`. C1-035 also creates a disposable product
to exercise deletion of a referenced category; reset the database after the run if you
need a clean SUT state.
