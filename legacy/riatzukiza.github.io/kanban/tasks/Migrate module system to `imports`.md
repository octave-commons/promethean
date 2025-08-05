
## Description

Browsers have implemented the `import` syntax for regular scripts included via script tags. This makes much of the bundling we currently do largely unnessisary.
The system should be refactored to use `import` over `require`
## Related Epics

- [[devops pipeline]]
## Requirements

- All require calls to project files are replaced with identical import statements.
	- This excludes any requires that are made to externally included bundles.
- All module.export assignments are replaced with identical export statements
- All code continues to work as before.
## Tasks 

- [x] Refactor shared code to use import pattern ✅ 2025-02-05
- [ ] Refactor obstacles code to use import pattern
- [x] Refactor crash-landed code to use import pattern ✅ 2025-02-05
- [ ] Refactor red-black-tree visualization code to use import pattern
- [ ] Refactor benchmarking code to use import pattern
