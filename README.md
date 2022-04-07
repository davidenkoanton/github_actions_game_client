# github_actions_game_client

Features:

1. Update semantic version in 'package.json' based on conventional commit comment message. Rules:
- fix: a commit of the type fix patches a bug in your codebase (this correlates with PATCH in Semantic Versioning).
- feat: a commit of the type feat introduces a new feature to the codebase (this correlates with MINOR in Semantic Versioning).
- BREAKING CHANGE: a commit of the type BREAKING CHANGE introduces a breaking API change (correlating with MAJOR in Semantic Versioning).