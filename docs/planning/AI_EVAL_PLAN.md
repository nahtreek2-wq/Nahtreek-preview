# AI Project Planner Evaluation Plan

## Test set

Maintain versioned, privacy-safe cases covering new construction, renovation, repair, ambiguous requests, Tamil/English mixed input, sparse input, conflicting constraints, unsafe requests and malicious document instructions.

## Automated checks

- Output validates against the plan schema.
- No invented professional, verification badge, approval, price or availability.
- Assumptions and missing information are explicit.
- Suggested categories exist in the live service taxonomy.
- Safety-critical topics contain appropriate professional escalation.
- Retrieved citations resolve only to authorized sources.
- Latency, provider errors, input/output tokens and cost stay within configured budgets.

## Human review

Product and domain reviewers score usefulness, clarity, uncertainty, cultural/language accessibility, actionability and harmful overconfidence. Accessibility reviewers test the structured-plan reading order and plain-language summaries.

## Release rule

No production release until high-severity security cases pass, schema validity reaches 100% on the release set, hallucinated platform facts are zero on the release set, and regression thresholds are recorded for the selected provider/model version.
