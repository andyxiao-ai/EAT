<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/eat_lockup_dark.png">
    <img alt="EAT" src="assets/eat_lockup_light.png" width="300">
  </picture>
</p>

<h3 align="center">Evolving Agent Teams</h3>
<p align="center"><em>Agents that diagnose why they stall and restructure their own team</em></p>

<p align="center">
  <a href="https://arxiv.org/abs/2610.36848"><img alt="Paper" src="https://img.shields.io/badge/Paper-NeurIPS%202026-E8A12E?style=flat-square&logo=arxiv&logoColor=white&labelColor=0E1A2B"></a>
  <a href="https://huggingface.co/datasets/eva98/eat-gym"><img alt="EAT Gym" src="https://img.shields.io/badge/%F0%9F%A4%97%20EAT%20Gym-tasks-E8A12E?style=flat-square&labelColor=0E1A2B"></a>
  <a href="https://huggingface.co/datasets/eva98/eat-evolution-traces"><img alt="Traces" src="https://img.shields.io/badge/%F0%9F%A4%97%20Traces-agent%20transcripts-E8A12E?style=flat-square&labelColor=0E1A2B"></a>
  <a href="https://github.com/caoshiyi/eat-kernels"><img alt="Kernels" src="https://img.shields.io/badge/Kernels-eat--kernels-E8A12E?style=flat-square&logo=github&logoColor=white&labelColor=0E1A2B"></a>
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/License-Apache--2.0-5C7FA3?style=flat-square&labelColor=0E1A2B"></a>
</p>

EAT is a harness in which a **supervisor** agent repeatedly designs, launches and revises a **team** of coding agents
(Claude Code) that optimize a GPU kernel (or another program, such as a robot policy) against a fixed eval. The
supervisor never writes the solution; its only output each iteration is a team configuration (roles, prompts, phases,
ownership of files and GPUs). The team does the work, the harness runs the official eval, and the supervisor reflects
on the result and evolves the team. A file system kept across all teams (learnings, evolution history, artifacts)
grounds each redesign in what earlier teams found.

<p align="center"><img alt="The EAT framework" src="assets/eat_overview.png" width="900"></p>

```
while budget remains:
    supervisor:  REFLECT on the previous team's output -> EVOLVE roles / prompts / workflow -> emit TEAM_CONFIG
    harness:     launch the team's agents phase by phase -> run the official eval -> record cost and score
```

## Quickstart

EAT is a Claude Code skill. Install it once:

```bash
git clone https://github.com/caoshiyi/EAT ~/.claude/skills/eat
```

Then open Claude Code in the repository you want to optimize and ask, e.g. *"set up EAT for this repo: maximize the
throughput of `bench.py` on GPUs 0 1, budget $200"*, or for a task of the EAT Gym: *"run the EAT Gym task
amd_kda_mi350x on GPUs 0 1 with a $300 budget"*. The skill ([`SKILL.md`](SKILL.md)) checks the machine, writes the
task files with you, records the starting score, launches the run in tmux, and later reports on it, pauses, stops or
resumes it.

## What a task provides

Any git repository becomes an EAT task with three files:

```
eat/task.md    the rules the supervisor puts into every agent's prompt: task, goal, eval, files, resources, limits
eat/eval.sh    the official eval of the committed state; prints "SCORE: <x>" (higher is better, 0 if incorrect)
eat/env.sh     optional: sourced before anything runs (venv, paths, EAT_GPUS)
```

The harness runs from inside the repository, keeps the run's record in `eat/log/` (team configs, every agent's prompt
and output, the official eval of each iteration, `BUDGET.md`) and commits each iteration as
`iter <n>: ... score=<x>`. Agents run with `--dangerously-skip-permissions`: run on a machine (or in
`cleanroom/sandbox.sh`) where that is acceptable.

The [EAT Gym](https://huggingface.co/datasets/eva98/eat-gym) holds the tasks of the paper in this form (and in the
[Harbor](https://harborframework.com) task format, so they also run with any Harbor agent), each at the state an EAT
run started from. `bash ops/fetch_task.sh <task> <dir> --setup` installs one as its own repository.

## Running by hand

```bash
cd <task repository>
bash eat/eval.sh                                   # the starting score
tmux new-session -d -s eat_run "EAT_GPUS='0 1' bash ~/.claude/skills/eat/agent_team/launch_stateless.sh \
    --persistent 50 3 300 2>&1 | tee -a .work/eat.log"   # 50 iterations, teams of up to 3, $300
```

Arguments: `--persistent` (one supervisor session for the whole run) or `--stateless` (a new one every iteration),
max iterations, max team size, budget in dollars, first iteration (to resume). Optional settings (environment):

| variable | effect |
|---|---|
| `SUPERVISOR_MODEL` | model of the supervisor session (default: the CLI default) |
| `AGENT_MODELS` | comma-separated models a role may pick with a `**Model:**` line in the team config; roles without one use the default model |
| `SUPERVISOR_REFRESH_COST` | persistent mode: after a supervisor turn (with its retries) that cost more than this many dollars, the next iteration starts a new supervisor session with a handover note telling it to read the record and reassess the team design (default: off) |
| `RESUME_SESSION_ID` | persistent mode: continue this supervisor session (with the first iteration as the last argument) |
| `EAT_PAUSE_FILE` | wait before each iteration while this file exists (e.g. while you run a held-out eval) |
| `AGENT_TIMEOUT_ENFORCE` | `1`: stop an agent at its role's `**Timeout:**` |
| `CLAUDE_EXTRA_DISALLOWED` | extra tools to disable for every session (`WebSearch,WebFetch` for clean-room runs) |

An agent that is stopped is resumed once for a final report (so its findings and its cost are recorded), and
background processes it left running are stopped. A resumed persistent supervisor session is booked only for the cost
added since it was last booked.

## Layout

```
SKILL.md                 the skill: setup, launch, status, pause, stop, resume
agent_team/
  launch_stateless.sh    supervisor loop (persistent or stateless supervisor sessions), budget accounting
  launch_team.sh         runs one team: parses TEAM_CONFIG, launches agents per phase, official eval, TEAM_OUTPUT.md
  parse_team_config.py   TEAM_CONFIG -> per-role prompt files and a phase plan
  extract_result.py      final text of a `claude --print --output-format json` run
  SUPERVISOR.md          the supervisor's instructions (how to reflect and evolve, not how to solve the task)
ops/
  fetch_task.sh          install a task of the EAT Gym as its own repository
  env.sh                 run settings shared by the scripts below
  pick_eval_gpu.sh       pick an idle GPU from $EAT_GPUS (ROCm or NVIDIA)
  verify_iter.py         re-run an iteration's commit independently (3 evals + optional extra check)
  curve_data.py          export per-iteration cost / score / team / ships as JSON
  curve_loop.sh          export the curve every 5 min and verify each new best automatically
  gpu_run                run a command on an NVIDIA GPU nobody else uses (used by the clean room)
cleanroom/
  sandbox.sh             bubblewrap sandbox: only listed sources visible, network only to the Anthropic API
  allowlist_proxy.py     HTTPS CONNECT proxy that only passes the allowlisted hosts (logs every request)
  tcp2unix.py            bridge from the sandbox's loopback to the proxy socket
  audit_clean_traces.py  scan every tool call in a run's transcripts for web use, network, forbidden sources
  audit_code_overlap.py  line-level overlap of the candidate code with allowed vs forbidden sources
  audit_after_iter.sh    run both audits after iteration N completes
```

### Clean-room runs

To show that a result was not copied from code released after a cutoff, run the whole loop inside
`cleanroom/sandbox.sh` with only pre-cutoff sources mounted (`EAT_ALLOWED_RO`), web tools disabled
(`CLAUDE_EXTRA_DISALLOWED=WebSearch,WebFetch`) and network limited to the Anthropic API by the proxy; then audit
the transcripts and the produced code with `cleanroom/audit_*.py`.

## Results

<p align="center"><img alt="Full runs on four settings" src="assets/fig_new_domains.png" width="900"></p>
<p align="center"><sub>Harness score at the end of each iteration. (a) MI350X, from a port of vLLM's kernels. (b) B200,
from a port of FlashInfer's KDA kernels. (c) MoE offload from the naive engine; star: final engine on the recorded
sessions. (d) RoboDojo, 42 tasks: dev (seed 1) and held-out (seeds 0, 2) scores, with leaderboard references as of
Oct 26, 2026. (Figure 7 of the paper.)</sub></p>

| task | hardware | baseline | result | iterations |
|---|---|---|---|---|
| `amd_kda_mi350x`: Kimi Delta Attention prefill | AMD MI350X | vLLM ROCm KDA kernels | 3.01x mean speedup (independently verified; harness 2.99-3.03x) | 73 |
| `b200_kda_clean`: Kimi Delta Attention prefill, clean room | NVIDIA B200 | FlashKDA | 2.42x on the serving set, 3.35x on the Int21 workloads (geomean) | 26 + 16 |
| `ftm_qwen4_offload`: MoE expert-offload serving (Qwen3.8-Flash-Next, MLX 4-bit, 79 GB) | Apple M4 Pro, 48 GB | naive offload engine | TBD | TBD |
| `robodojo_codepolicy`: RoboDojo code policy (10 tasks, all 42 from iteration 37) | 4-8 AWS g6e (L40S) | Pi_05 on every task (11.44 on the leaderboard) | 62.08 on held-out seeds 0 / 2, all 42 tasks, leaderboard formula (leaderboard best on Oct 26, 2026: 55.3) | 51 |

Kernel speedups are geomeans from each task's official eval; correctness is a hard gate. `b200_kda_clean` ran in the
clean room (no network, no KDA kernels newer than its FlashInfer starting snapshot).

The KDA kernels are released in [eat-kernels](https://github.com/caoshiyi/eat-kernels), packaged for inference
engines (`kda/mi350x`, `kda/b200`: vLLM-style serving interface with paged state and prefix-cache checkpoints;
`_plain` variants for plain calls). The full evolution traces (every supervisor and agent transcript, team configs,
notes, per-iteration kernels and policies) are in the Hugging Face dataset
[eva98/eat-evolution-traces](https://huggingface.co/datasets/eva98/eat-evolution-traces) (`amd_kda_mi350x/`,
`b200_kda_clean/`, `robodojo_codepolicy/`).

### RoboDojo demo

The team's policy is Python code that calls the frozen Pi_05 VLA and, at runtime, Claude. Below, the same
`make_kong` (Mahjong) scene with the starting Pi_05 policy (left, task score 16.7) and the evolved code policy
(right, 97.2). [Full video](assets/robodojo_make_kong.mp4).

<p align="center"><img alt="RoboDojo make_kong: Pi_05 vs. the EAT code policy" src="assets/robodojo_make_kong.gif" width="900"></p>

## Citation

```bibtex
@inproceedings{cao2026eat,
  title     = {Evolving Agent Teams},
  author    = {Cao, Shiyi and Mao, Ziming and Li, Dacheng and Gonzalez, Joseph E. and Stoica, Ion},
  booktitle = {Advances in Neural Information Processing Systems (NeurIPS)},
  year      = {2026},
  url       = {https://arxiv.org/abs/2610.36848}
}
```

## License

Apache-2.0. Tasks installed from the EAT Gym bring their own NOTICE for the third-party code they contain.
