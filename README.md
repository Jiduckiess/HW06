# HW06 — API Testing

> Student ID: `23127172`  
> Name: `Nguyễn Chí Đức`
> Repository: [https://github.com/Jiduckiess/HW06](https://github.com/Jiduckiess/HW06)

## API selection

| API | Pool / Feature | Endpoint(s) | Rationale |
| --- | --- | --- | --- |
| API 1 | A — FR-02 Login & account lockout | `POST /api/login` | Pool A selection: FR-02 |
| API 2 | B — FR-08 Checkout | `POST /api/checkout` | Pool B selection: FR-08 |
| API 3 | C — FR-14 Category management (CRUD) | `GET/POST /api/categories`, `PUT/DELETE /api/categories/:id` | Pool C selection: FR-14 |

## Test summary

| Metric | API 1 | API 2 | API 3 | Total |
| --- | ---: | ---: | ---: | ---: |
| AI-generated cases | 35 | 35 | 35 | 105 |
| Student-added cases | 5 | 5 | 5 | 15 |
| Executed | 40 | 40 | 40 | 120 |
| Passed | 35 | 30 | 22 | 87 |
| Failed | 5 | 10 | 18 | 33 |
| Bugs detected (GitHub Issues filed) | 1 | 3 | 3 | 7 |

## Self-assessment

| Criterion | Max | Self-assessed |
| --- | ---: | ---: |
| API 1 — full pipeline | 30 | 30 |
| API 2 — full pipeline | 30 | 30 |
| API 3 — full pipeline | 30 | 30 |
| AI-driven test generator | 10 | 10 |
| **Total** | **100** | **100** |

See [report/main-report.md](report/main-report.md) for the complete report.
