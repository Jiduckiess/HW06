# CI evidence

`ci-pass-7bb12f3.png` is retained as historical evidence that GitHub Actions could check out the SUT submodule. That run used `continue-on-error`, so it is **not** the required strict all-pass run.

The strict CI baseline applies `ci/sut-fixes.patch` to the pinned SUT submodule, resets the SUT between feature suites, and fails the job on any Newman assertion failure. Local verification before the CI push produced:

| Suite | Assertions | Failed |
| --- | ---: | ---: |
| FR-02 | 80 | 0 |
| FR-08 | 113 | 0 |
| FR-14 | 91 | 0 |

Verified strict all-pass run: [GitHub Actions #32505802850](https://github.com/Jiduckiess/HW06/actions/runs/32505802850) for commit `1e6e571`.

Verified intentional failure: [GitHub Actions #32505900553](https://github.com/Jiduckiess/HW06/actions/runs/32505900553) for commit `1998d99`. Only the A1-001 expected-status oracle was changed from `200` to `201`; the endpoint correctly returned `200`, so the run failed as intended. The following commit restores `200`.

Save a screenshot of both runs in this folder before final submission.
