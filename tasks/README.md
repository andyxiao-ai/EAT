# Tasks

Tasks live in the EAT Gym, the Hugging Face dataset [eva98/eat-gym](https://huggingface.co/datasets/eva98/eat-gym)
(Harbor task format).
Install one into this checkout with

```bash
bash ops/fetch_task.sh <task> --setup   # the dataset README lists the tasks
```

It writes `tasks/<task>/`, the task's eval under `tools/`, `agent_team/requirements/<task>.md` and any task-specific
infrastructure, and adds the task to `CLAUDE.md`.
