# Status

## Current release candidate

- Branch: `codex/major-study-experience-upgrade-20260824`
- Base: `origin/main`
- Scope: phone-first participant journey, embedded WEB Scripture, evidence labels, local progress and notes, improved story map, public teacher-guide removal, PWA support, and validation-first deployment.
- Live site: unchanged until this branch is reviewed and merged.

## Authority boundaries

- `public/weeks.json` owns the twelve-week participant and facilitator content.
- `public/scripture_focus.json` is generated from public-domain WEB source data.
- `public/` is the only deployable directory.
- `teacher/guide.html` is generated for facilitators and intentionally excluded from GitHub Pages.
