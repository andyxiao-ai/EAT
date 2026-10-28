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

<p align="center"><img alt="EAT runs: official score at the end of every iteration" src="assets/eat_curves.gif" width="100%"></p>

<table align="center">
<tr>
<td align="center" width="33%"><h1>3.01×</h1><b>AMD MI350X</b><br><sub>Kimi Delta Attention prefill<br>over vLLM's ROCm kernels</sub></td>
<td align="center" width="33%"><h1>2.42×</h1><b>NVIDIA B200</b><br><sub>KDA serving kernel over FlashKDA<br>clean room: no web</sub></td>
<td align="center" width="33%"><h1>62.1</h1><b>RoboDojo, 42 tasks</b><br><sub>held-out score; leaderboard #1: 55.3<br>start (Pi_05): 11.4</sub></td>
</tr>
</table>

<p align="center"><b>One supervisor agent. No hand-written solution.</b> It designs a team of coding agents, watches it work,
diagnoses why it stalls, and rebuilds the team, for as long as the budget lasts.</p>

## Demo: a robot policy written by agents

The starting policy is the Pi_05 VLA. The EAT team replaced it with Python code that calls the frozen Pi_05 and, at
runtime, Claude, and raised RoboDojo's leaderboard score from 11.4 to **62.1 on held-out seeds, above every entry on
the leaderboard (55.3, Oct 26, 2026)**. Same scene, left: Pi_05; right: the team's code policy.

<p align="center"><img alt="RoboDojo make_kong: Pi_05 vs. the EAT code policy" src="assets/robodojo_make_kong.gif" width="100%"></p>
<p align="center"><sub><code>make_kong</code> (Mahjong): task score 16.7 → 97.2. <a href="assets/robodojo_make_kong.mp4">Full video</a></sub></p>

<table>
<tr>
<td width="50%"><img alt="RoboDojo arrange_largest_number" src="assets/robodojo_arrange.gif" width="100%"></td>
<td width="50%"><img alt="RoboDojo classify_objects_by_language" src="assets/robodojo_cbl.gif" width="100%"></td>
</tr>
<tr>
<td align="center"><sub><code>arrange_largest_number</code>: task score 2.5 → 88.3</sub></td>
<td align="center"><sub><code>classify_objects_by_language</code>: task score 3.3 → 80.0</sub></td>
</tr>
</table>

## Results

| task | hardware | start | EAT | iterations |
|---|---|---|---|---|
| Kimi Delta Attention prefill | AMD MI350X | vLLM ROCm KDA kernels | **3.01×** mean speedup (independently verified) | 73 |
| Kimi Delta Attention prefill, **clean room** | NVIDIA B200 | FlashKDA | **2.42×** on 26 serving workloads, **3.35×** on Int21 (production kernel); 3.48× Int21 in the harness | 26 + 16 |
| MoE expert offload: Qwen3.8-Flash-Next, 79 GB, MLX 4-bit | Apple M4 Pro, 48 GB | naive offload engine | TBD | TBD |
| RoboDojo code policy, 42 tasks | 4-8 AWS g6e (L40S) | Pi_05 (11.44) | **62.08** on held-out seeds (leaderboard #1: 55.3) | 51 |

Kernel speedups are geomeans from each task's official eval, with correctness as a hard gate. The B200 run was a clean
room: no network beyond the model API, and no KDA kernel newer than its FlashInfer starting snapshot.

<p align="center"><img alt="Full runs on four settings" src="assets/fig_new_domains.png" width="100%"></p>
<p align="center"><sub>Score at the end of each iteration, from the paper (Figure 7). (a) MI350X, from a port of vLLM's
kernels. (b) B200, from a port of FlashInfer's KDA kernels. (c) MoE offload from the naive engine; star: final engine on
the recorded sessions. (d) RoboDojo: dev (seed 1) and held-out (seeds 0, 2) scores, with leaderboard references as of
Oct 26, 2026.</sub></p>

**Everything is released.** The kernels, packaged for inference engines (vLLM-style serving interface with paged state
and prefix-cache checkpoints): [eat-kernels](https://github.com/caoshiyi/eat-kernels). Every supervisor and agent
transcript, team config, note and per-iteration kernel or policy:
[eva98/eat-evolution-traces](https://huggingface.co/datasets/eva98/eat-evolution-traces). The tasks, at the state each
run started from: [EAT Gym](https://huggingface.co/datasets/eva98/eat-gym).

## How it works

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
