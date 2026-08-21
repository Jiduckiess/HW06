# Generator flow diagram

> Student review note: this Mermaid source is editable. Review the flow, then make at least one design decision or wording change yourself before submission, and record that change in the report.

```mermaid
flowchart TD
    A[Read API specification] --> B[Parse endpoints, parameters,<br/>authentication and schemas]
    B --> C[Select FR-02, FR-08, FR-14]
    C --> D[Build coverage model]
    D --> D1[Domain partitions]
    D --> D2[State transitions]
    D --> D3[Security abuse cases]
    D --> D4[Response-schema checks]
    D1 --> E[Constrained LLM prompt]
    D2 --> E
    D3 --> E
    D4 --> E
    E --> F[Generate candidate test cases]
    F --> G[Validate against specification]
    G --> H{Duplicate or coverage gap?}
    H -- Yes --> I[Refine prompt and regenerate]
    I --> F
    H -- No --> J[Human audit:<br/>VALID / INVALID / INCOMPLETE]
    J --> K[Add five student cases]
    K --> L[Generate Postman collection<br/>and JSON data rows]
    L --> M[Execute with Newman]
    M --> N[Report results, bugs and CI evidence]
```

## Student-owned design choices

- Coverage is planned before the LLM is prompted, so the output can be measured against domain, state, security, and schema requirements.
- Generated cases are not executed automatically until a human audit is completed.
- Bug reports use observed Newman/Postman output only; the generator does not invent execution results.
