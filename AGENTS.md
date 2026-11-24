# Repository notes

## Commit messages

Every commit is a release, and its subject line is only the new version number in semver form:

```
v1.2.0

- Add the Teaching Experience card.
- Fix the chat box going blank on errors.
```

- **Subject:** `vMAJOR.MINOR.PATCH`, nothing else.
- **Body:** a blank line, then short bullets describing what changed. Trailers such as `Co-Authored-By` go after the bullets.
- **Which number to bump:**
  - MAJOR: a redesign, or a change that breaks how the site or chat works (for example a new chat API shape).
  - MINOR: a new feature, page, section or project card.
  - PATCH: fixes, copy and content edits, and dependency or security updates.
- **Keep versions in sync:** set the same version in `ui/package.json` and `chat/package.json`, and in the `version` fields of their `package-lock.json` files.
- **One version per push:** squash work-in-progress commits into a single version commit before pushing.
