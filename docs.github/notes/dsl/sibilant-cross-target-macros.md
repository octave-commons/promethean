A target system for Sibilant lets macros emit different code depending on the chosen language. By setting `(target "js")` or `(target "py")`, macros such as `def-async` output the correct syntax for each runtime. Helper functions maintain the current target, enabling reusable DSL constructs across JS and Python.

Related notes: [sibilant-meta-namespace-dispatch], [template-based-compilation] [../../unique/index|unique/index]

#tags: #sibilant #crosscompile #macros
