# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- `CONTEXT.md` at the repo root
- `docs/adr/` for architecture decisions relevant to the area being changed

If a relevant file does not exist yet, proceed without blocking. The domain-modeling workflow creates and sharpens these files as terms and decisions become concrete.

## File structure

This is a single-context repo:

```text
/
├── CONTEXT.md
├── docs/
│   └── adr/
└── src/
```

## Use the glossary's vocabulary

When naming game systems, player states, enemy roles, upgrades, or progression beats, prefer the exact terms defined in `CONTEXT.md`.

## Flag ADR conflicts

If a proposed design or code change contradicts an existing ADR, surface that conflict explicitly instead of silently overriding it.
