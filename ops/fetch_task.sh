#!/bin/bash
# Install a task from the EAT Gym (Hugging Face dataset $EAT_GYM, default eva98/eat-gym; Harbor task format) into
# this checkout.
#     bash ops/fetch_task.sh <task> [--setup] [--revision <rev>] [--from <local eat-gym dir>]
# Copies the task's environment/workspace/ here (tasks/<task>/, tools/eval_<task>.*, ...), its team rules to
# agent_team/requirements/<task>.md and its row and rules into CLAUDE.md. --setup also runs environment/setup.sh (venv,
# reference repositories, baselines) with the paths of ops/env.sh; without it the command to run is printed.
set -euo pipefail
TASK="${1:?usage: fetch_task.sh <task> [--setup] [--revision <rev>] [--from <dir>]}"; shift
REV=main FROM="" SETUP=0
while [ $# -gt 0 ]; do
    case "$1" in
        --setup) SETUP=1; shift ;;
        --revision) REV="$2"; shift 2 ;;
        --from) FROM="$2"; shift 2 ;;
        *) echo "unknown argument $1" >&2; exit 2 ;;
    esac
done
export EAT_TASK="${EAT_TASK:-$TASK}"
source "$(dirname "$0")/env.sh"
GYM="${EAT_GYM:-eva98/eat-gym}"

if [ -z "$FROM" ]; then
    FROM="$EAT_WORK/gym"
    command -v hf >/dev/null || { echo "needs the Hugging Face CLI: pip install -U huggingface_hub" >&2; exit 1; }
    hf download "$GYM" --repo-type dataset --revision "$REV" --include "$TASK/*" --local-dir "$FROM" >/dev/null
fi
SRC="$FROM/$TASK"
[ -f "$SRC/task.toml" ] || { echo "no task '$TASK' in $FROM" >&2; exit 1; }

cp -R "$SRC/environment/workspace/." "$EAT_ROOT/"
(cd "$SRC/environment/workspace" && find . -type f \( -name '*.sh' -o -name '*.py' \) -exec chmod +x "$EAT_ROOT/{}" \;)
mkdir -p "$EAT_ROOT/agent_team/requirements"
cp "$SRC/eat/requirements.md" "$EAT_ROOT/agent_team/requirements/$TASK.md"
python3 - "$EAT_ROOT/CLAUDE.md" "$SRC/eat/claude_row.md" "$TASK" <<'PY'
import re, sys
path, sec_path, task = sys.argv[1:]
doc = open(path).read()
sec = open(sec_path).read().strip("\n").split("\n")
row, rules = sec[0], "\n".join(sec[1:]).strip("\n")
rows_end, rules_end = "<!-- end of task rows -->", "<!-- end of task rules -->"
doc = "\n".join(l for l in doc.split("\n") if not l.startswith(f"| `{task}` |"))
doc = re.sub(rf"<!-- task:{task} -->\n.*?<!-- /task:{task} -->\n\n?", "", doc, flags=re.S)
doc = doc.replace(rows_end, f"{row}\n{rows_end}")
if rules:
    doc = doc.replace(rules_end, f"<!-- task:{task} -->\n{rules}\n<!-- /task:{task} -->\n\n{rules_end}")
open(path, "w").write(doc)
PY
python3 - "$SRC/task.toml" <<'PY'
import sys, tomllib
t = tomllib.load(open(sys.argv[1], "rb"))
m, e = t["metadata"], t["environment"]
print(f"installed {t['task']['name'].split('/')[-1]}: {t['task']['description']}")
print(f"  hardware: {m['hardware']} (task.toml: {e.get('gpus', 0)} GPUs of {e.get('gpu_types') or 'any type'})")
print(f"  sources:  {m['readable_sources']}")
print(f"  eval:     {m['eat_eval_cmd']}   (EVAL_CMD for agent_team/launch_stateless.sh)")
PY
echo "  environment: $SRC/environment/README.md"
if [ "$SETUP" = 1 ]; then
    bash "$SRC/environment/setup.sh"
else
    echo "  set up with: bash $SRC/environment/setup.sh   (after source ops/env.sh; or rerun with --setup)"
fi
