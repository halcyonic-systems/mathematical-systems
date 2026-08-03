# Deploy

`deploy.yml` builds `reader/` and publishes it to GitHub Pages on every push to `main`.

**Why the catalogue is committed rather than built here.** `npm run data` verifies every
transcription against the primary texts, which are full copyrighted books held outside this
repository. A CI runner has no access to them and never should. So the verification runs on
a machine that holds the sources, and the *result* is committed — the verdicts travel, the
books do not.

The workflow's first step refuses to deploy data marked `publishable: false`, so a generous
local reading build cannot reach the public site even if it were committed by accident.
