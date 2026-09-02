#!/bin/bash
# Stop hook: appends a CHANGELOG.md entry summarizing what Claude did for the
# most recently completed prompt in this session's transcript.
set -euo pipefail

input="$(cat)"
transcript_path="$(printf '%s' "$input" | jq -r '.transcript_path // empty')"
cwd="$(printf '%s' "$input" | jq -r '.cwd // empty')"

[ -n "$transcript_path" ] && [ -f "$transcript_path" ] || exit 0

project_dir="${cwd:-$PWD}"
changelog="$project_dir/CHANGELOG.md"
state_dir="$project_dir/.claude/hooks"
state_file="$state_dir/.last_logged_prompt_id"
mkdir -p "$state_dir"

# The last human-typed message marks the start of the most recent prompt
# cycle. Assistant lines don't carry promptId, so everything from this
# message's timestamp to end-of-file is "what was done for this prompt."
last_pid="$(jq -r 'select(.promptId != null) | .promptId' "$transcript_path" | tail -n1)"
[ -n "$last_pid" ] || exit 0

prev_pid="$(cat "$state_file" 2>/dev/null || true)"
[ "$prev_pid" = "$last_pid" ] && exit 0

prompt_line="$(jq -c --arg pid "$last_pid" '
  select(.promptId == $pid and .type == "user" and (.message.content | type == "string"))
' "$transcript_path" | tail -n1)"

prompt_text="$(printf '%s' "$prompt_line" | jq -r '.message.content' | tr '\n' ' ')"
prompt_ts="$(printf '%s' "$prompt_line" | jq -r '.timestamp')"

summary="$(jq -r --arg ts "$prompt_ts" '
  select(.type == "assistant" and .timestamp >= $ts) |
  .message.content[]? | select(.type == "text") | .text
' "$transcript_path")"

files="$(jq -r --arg ts "$prompt_ts" '
  select(.type == "assistant" and .timestamp >= $ts) |
  .message.content[]? | select(.type == "tool_use" and (.name == "Write" or .name == "Edit" or .name == "NotebookEdit")) |
  .input.file_path // empty
' "$transcript_path" | sort -u)"

[ -f "$changelog" ] || printf '# Changelog\n\nAuto-generated log of what Claude Code did on this project, one entry per prompt.\n' > "$changelog"

{
  printf '\n## %s\n\n' "$(date '+%Y-%m-%d %H:%M %Z')"
  printf '**Prompt:** %s\n\n' "${prompt_text:0:600}"
  if [ -n "$summary" ]; then
    printf '**What was done:**\n\n%s\n\n' "$summary"
  fi
  if [ -n "$files" ]; then
    printf '**Files changed:**\n\n'
    printf '%s\n' "$files" | sed 's|^|- |'
    printf '\n'
  fi
} >> "$changelog"

printf '%s' "$last_pid" > "$state_file"
exit 0
