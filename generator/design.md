# AI-driven API Test Generator — Design

## Goal

Given the SUT API specification, produce reviewable API test cases covering input partitions, state transitions, security requirements, and response schemas.

## Self-drawn diagram

The editable Mermaid flow is in [diagram.md](diagram.md). Review it, make a small design or wording adjustment yourself, then use Mermaid Live Editor / Draw.io to export it as `generator/diagram.png` if a PNG is required by the submission form.

## Pseudocode

```text
function generateTests(specification, selectedEndpoints, securityRules):
    model = parseSpecification(specification)
    for endpoint in selectedEndpoints:
        parameters = extractParameters(model, endpoint)
        partitions = deriveDomainPartitions(parameters)
        transitions = deriveStateTransitions(model, endpoint)
        schemaChecks = deriveSchemaAssertions(model, endpoint)
        prompt = buildConstrainedPrompt(endpoint, partitions, transitions,
                                       securityRules, schemaChecks)
        candidates = callLLM(prompt)
        tests = validateAgainstSpecification(candidates, model)
        tests = deduplicate(tests)
        coverage = measureCoverage(tests, partitions, transitions,
                                   securityRules, schemaChecks)
        while coverage.hasGaps():
            tests += callLLM(buildGapPrompt(endpoint, coverage.gaps))
            tests = validateAgainstSpecification(deduplicate(tests), model)
        exportTestCaseTable(tests)
        exportPostmanRequests(tests)
    return testsForHumanAudit()
```

## Human controls

- Verify every endpoint, request field, status code, and schema assertion against the specification.
- Mark every AI test `VALID`, `INVALID`, or `INCOMPLETE`.
- Add missing security/state cases before execution.
