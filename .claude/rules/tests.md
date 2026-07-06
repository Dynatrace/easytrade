---
description: Testing conventions and anti-patterns for all EasyTrade service stacks
globs: **/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*_test.go,**/*Test.java,**/test/**/*.cs
---

# Testing Conventions

## Anti-Patterns

- NEVER mock the database unless integration testing against a real DB is impossible
- NEVER skip assertions — a test with no assertions is not a test
- Do NOT use `sleep` or arbitrary timeouts to wait for async behavior

## Patterns

- Test behavior, not implementation — assert on outputs and side effects, not internal calls
- One logical assertion per test case
- For Java: use `./gradlew test --tests "com.dynatrace.easytrade.SomeTest"` to run a single test
- For Go: use `go test ./path/to/pkg -run TestName` to run a single test
- For .NET: use `dotnet test --filter "FullyQualifiedName~SomeTest"`

## Naming

- Test names describe the scenario: `[function]_[scenario]_[expectedResult]`
- Java test classes end in `Test` (e.g., `AccountServiceTest`)
- Go test functions start with `Test` (e.g., `TestGetInstruments`)
