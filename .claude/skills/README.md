# Repo-Specific Skills

Add `.md` files here for complex, repeatable workflows specific to this repository.

Each skill file should have YAML frontmatter:

```yaml
---
name: [skill-name]
description: >
  One-paragraph description. Include trigger phrases so the skill auto-loads.
---
```

## Suggested skills for this repo

- `problem-pattern.md` — enable/disable/verify a problem pattern and confirm it generates a Dynatrace problem card
- `service-add.md` — checklist for adding a new microservice (Dockerfile, compose entry, nginx proxy rule, DB migrations)
- `vuln-fix.md` — dependency vulnerability fix workflow across all stacks (Java/Go/Node) in one pass
