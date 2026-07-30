---
"@wc-toolkit/cem-inheritance": patch
---

Allow mixins to be placed in a local variable

When the CEM analyzer encounters `const Mixed = mixin(Base); class Foo extends Mixed {}`,
it produces `superclass.name = "Mixed"` instead of `"Base"`, breaking the inheritance chain.

This patch:
- During the CEM analyzer `analyzePhase`, detects variable declarations initialized
  with chained mixin calls (e.g. `mixin1(mixin2(Base))`) and records the mapping.
- During `packageLinkPhase`, replaces any class `superclass.name` that references a
  mixin variable with the resolved base class name before processing inheritance.
- Exposes a `mixinVariableMap` option on `CemInheritanceOptions` for the direct API path.
