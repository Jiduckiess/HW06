# CI evidence

`ci-pass-7bb12f3.png` is retained as historical evidence that GitHub Actions could check out the SUT submodule. That run used `continue-on-error`, so it is **not** the required strict all-pass run.

The strict CI baseline applies `ci/sut-fixes.patch` to the pinned SUT submodule, resets the SUT between feature suites, and fails the job on any Newman assertion failure. Local verification before the CI push produced:

| Suite | Assertions | Failed |
| --- | ---: | ---: |
| FR-02 | 80 | 0 |
| FR-08 | 113 | 0 |
| FR-14 | 91 | 0 |

After the workflow runs on GitHub, save a screenshot of the green strict run here and add its run URL to `report/main-report.md`. A later intentional one-assertion failure will be committed and run separately for the assignment's required red CI sample, then reverted.
