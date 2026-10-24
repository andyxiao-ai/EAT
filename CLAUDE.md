# GPU Kernel Optimization Tasks

Each task under `tasks/` provides a baseline, production-shaped workloads, a reference implementation and a
starting kernel. The goal is to **maximize `mean_vs_base`** = mean(baseline_latency / your_latency) across the
task's eval workloads; correctness on every workload is a hard constraint.

## Tasks
| Task | Kernel | Baseline | Target GPU | Workloads |
|------|--------|----------|------------|-----------|
<!-- end of task rows -->

Tasks are installed from the EAT Gym with `bash ops/fetch_task.sh <task>`, which adds them to this table and their rules below.

## Eval
```bash
python tools/eval_<task>.py --quick   # a few workloads, fast feedback
python tools/eval_<task>.py           # all workloads; the official score
```
Baseline latencies are recorded once in `tasks/<task>/baseline_*.json`; never re-record them.

## Task layout
```
tasks/<task>/
  program.md      task description, algorithm, API, rules specific to the task — read it in full
  kernel.cu       candidate kernel (edit this), with kernel.h and main.cpp (PyTorch extension)
  kernel.py       optional Gluon/Triton candidate, if the task allows it
  reference.py    pure-PyTorch reference
  solutions/      saved kernel checkpoints
  results.tsv     experiment log (commit, mean_vs_base, passed, total, status, description)
```

## Rules
<!-- end of task rules -->

- Follow `tasks/<task>/program.md`: it states which sources may be read, which baselines may be profiled, and
  what form the final kernel may take.
- Never modify the eval, the reference, the baselines or their recorded latencies.
- Commit every kept improvement; log every experiment (kept, discarded, crashed) in `results.tsv`.
- Use only the GPUs you were assigned. Do not push to any git remote.
