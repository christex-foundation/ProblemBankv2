---
name: christex-engineering-workflow
description: Use this skill when the task involves Git workflow, branch creation, commits, pull requests, code review feedback, repository contribution standards, or setting up contributor documentation for a repo. Especially use it in Christex Foundation repositories or when the user asks how to create a branch, when to commit, how to work on feedback, how to open or update a PR, or how to follow trunk-based development with short-lived feature branches. Do not use this skill for unrelated product ideation, design critique, or general writing tasks that do not involve repo workflow or contribution process.
---

# Christex Engineering Workflow

## Purpose
Provide consistent Git/PR guidance and generate or update repo contribution docs aligned with trunk-based development and short-lived branches.

## When To Use This
Use this skill when the task asks for any of the following:
- Git workflow guidance
- Branch creation or naming guidance
- Commit timing/frequency guidance
- Pull request creation/update guidance
- Review feedback handling
- Repo contribution standards
- Creating or updating contribution docs for the repository

## When Not To Use This
Do not use this skill when the task is unrelated to repository workflow, including:
- Product ideation with no repo process component
- Design critique with no Git/PR workflow request
- General writing tasks unrelated to contribution standards

## Core Workflow Standards
Enforce these standards:
- Use short-lived feature branches.
- Follow trunk-based development.
- Never push directly to `main`.
- Make small logical commits.
- Keep PRs small and reviewable.
- Address PR feedback on the same branch unless explicitly instructed otherwise.

## Non-Negotiables
- No direct pushes to `main`.
- Every change goes through a PR.
- Branches must be short-lived.
- Do not group unrelated changes in one branch or one PR.

## Required Git Context Checks
Inspect current state before Git workflow decisions:

```bash
git status
git branch --show-current
git log --oneline -5
```

If repository-specific conventions already exist, preserve them unless they conflict with the standards above.

## Standard Git Flow
Use this default sequence:
1. Checkout `main`.
2. Pull latest `main`.
3. Create a short-lived feature branch.
4. Make focused changes.
5. Commit in logical chunks.
6. Push branch.
7. Open PR to `main`.
8. Address feedback on the same branch.
9. Merge quickly after approval.

Example commands:

```bash
git checkout main
git pull origin main
git checkout -b feature/<task-name>
# make focused changes
git add <files>
git commit -m "feat: <summary>"
git push -u origin feature/<task-name>
```

## Branch Naming
Allowed prefixes:
- `feature/`
- `bugfix/`
- `chore/`
- `docs/`
- `refactor/`
- `hotfix/`

Good branch names:
- `feature/refresh-prayerwalk-home-copy`
- `bugfix/fix-mobile-checkin-validation`
- `docs/update-contributing-pr-flow`
- `refactor/simplify-route-guards`
- `chore/remove-unused-images`
- `hotfix/fix-prod-login-timeout`

Bad branch names:
- `update`
- `new-branch`
- `test`
- `my-work`
- `fix-stuff`

Map one branch to one focused task or one feedback round.

When asked to "create a branch", propose a concrete name based on task scope.

## Commit Guidance
Default answer to "when should I commit":
- Commit when a logical unit of work is complete and reviewable.

How often to commit:
- Commit after each meaningful, self-contained change.
- Avoid tiny noisy commits per keystroke.
- Avoid waiting so long that unrelated edits accumulate.

Commit message prefixes:
- `feat:`
- `fix:`
- `docs:`
- `refactor:`
- `chore:`
- `test:`

Example commit messages:
- `feat: improve prayer walk registration UX`
- `fix: prevent duplicate walk check-ins`
- `docs: add branch naming conventions`
- `refactor: simplify attendance aggregation`
- `chore: remove dead utility functions`
- `test: add coverage for walk session filters`

## PR Guidance
Expect every PR to include:
- Clear summary
- Why/context or linked issue (if applicable)
- Focused list of what changed
- Testing notes or verification steps
- Screenshots/recordings for UI changes

Keep PRs small, focused, and easy to review.

## Review Feedback Rules
When asked to "work on feedback":
- Stay on the current PR branch by default.
- Add follow-up commits that address requested feedback.
- Open a new branch only when explicitly instructed.
- Keep changes scoped to feedback plus necessary safety fixes.

## File Generation And Maintenance
When requested to create or update contribution standards, create or update these files:
1. `CONTRIBUTING.md`
2. `.github/pull_request_template.md`
3. `docs/branch-naming-guide.md`

Prefer updating existing files over creating duplicates.
Inspect current repository docs first; preserve existing style/tone where possible.

### CONTRIBUTING.md Requirements
Write plain-language guidance that is friendly to technical and non-technical contributors.
Include:
- The standard 9-step workflow listed in this skill
- Commit message guidance for `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `test:`
- PR expectations (summary, context/issue link if applicable, screenshots for UI changes, testing notes)
- Non-negotiables (no direct pushes to `main`, every change via PR, short-lived branches, no unrelated grouped changes)

Suggested structure:

```markdown
# Contributing

## Workflow
1. Checkout `main`
2. Pull latest `main`
3. Create a short-lived branch
4. Make focused changes
5. Commit in logical chunks
6. Push branch
7. Open PR to `main`
8. Address feedback on same branch
9. Merge quickly after approval

## Commit Messages
Use:
- feat:
- fix:
- docs:
- refactor:
- chore:
- test:

## Pull Request Expectations
- Clear summary
- Linked issue/context if applicable
- Screenshots for UI changes
- Testing notes

## Non-Negotiables
- No direct pushes to main
- Every change goes through PR
- Branches are short-lived
- Do not mix unrelated changes
```

### .github/pull_request_template.md Requirements
Include these sections:
- Summary
- Why this change
- What changed
- How to test
- Screenshots / recordings
- Checklist

Checklist must include:
- Branch is focused and short-lived
- Commits are clear
- No unrelated changes included
- Tests/build checked or verification explained
- Screenshots attached if UI changed
- Ready for review

Suggested template:

```markdown
## Summary

## Why this change

## What changed

## How to test

## Screenshots / recordings

## Checklist
- [ ] Branch is focused and short-lived
- [ ] Commits are clear
- [ ] No unrelated changes are included
- [ ] Tests/build checked, or verification steps explained
- [ ] Screenshots attached if UI changed
- [ ] Ready for review
```

### docs/branch-naming-guide.md Requirements
Include:
- Why branch naming matters
- Allowed prefixes (`feature/`, `bugfix/`, `chore/`, `docs/`, `refactor/`, `hotfix/`)
- Good and bad examples
- Rule that one branch maps to one focused task or one feedback round
- Rule that PR feedback normally stays on the same branch

Suggested structure:

```markdown
# Branch Naming Guide

## Why naming matters
...

## Allowed prefixes
- feature/
- bugfix/
- chore/
- docs/
- refactor/
- hotfix/

## Good examples
...

## Bad examples
...

## Scope rule
One branch = one focused task or one feedback round.

## PR feedback rule
Address PR feedback on the same branch unless explicitly told otherwise.
```

## Consistent Q&A Defaults
Use these default responses unless repo policy overrides them:
- "When should I commit?" -> Commit when a logical unit of work is complete and reviewable.
- "How often should I commit?" -> After each meaningful self-contained change, not every tiny edit.
- "New branch or current branch for feedback?" -> Stay on the current PR branch for normal feedback.
- "How do we keep main healthy?" -> Use short-lived branches, small PRs, frequent integration, and no direct pushes to `main`.

## Negative Examples To Avoid Accidental Triggering
Do not trigger this skill for requests like:
- "Brainstorm homepage ideas"
- "Give design feedback on this mockup"
- "Rewrite this marketing copy"
- "Draft social media captions"

## Output Style
- Be direct.
- Be practical.
- Stay repo-oriented.
- Prefer concrete commands over abstract advice.
- Align all recommendations with Christex Foundation workflow.
