#!/bin/bash
set -euo pipefail

# Only run in remote (Claude Code on the web) environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# No dependencies to install yet.
# Add install commands here as the project grows, e.g.:
#   npm install
#   pip install -r requirements.txt
