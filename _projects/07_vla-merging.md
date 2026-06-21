---
layout: page
title: "Merging Robot Brains (and Why It Didn't Work)"
description: We tried to build a multi-task robot by training one expert per task and averaging their weights together — six merging operators, four adapter regimes, 63 configurations. Almost every one returned zero. This is the story of a negative result we trust.
img: assets/img/projects/vla-merging.webp
importance: 3
year: 2026
category: coursework
period: Spring 2026
permalink: /projects/vla-merging/
show_in_grid: true
---

**Ardalan Aryashad**, Danie Craig Kulandai, Kevin Ngo, Louison Lu, Raja Kumar, Shravan Shenoy, Wenwen Han<br>
**CSCI 566**: Deep Learning and its Applications &middot; Spring 2026 &middot; USC

<div class="pub-links-row" style="margin-bottom: 1.5rem;">
  <a href="/projects/vla-merging/images/CSCI566_report.pdf" target="_blank" class="pub-tag">Project Report</a>
</div>

---

We trained a robot policy to be an expert at one kitchen task, another copy to be an expert at a second, a third for a third — then tried to glue them into a single policy that could do all three, with no extra training, just by doing arithmetic on their weights. The literature says this works for language and vision models. We ran it six different ways across four different training setups — **63 merged policies in total** — and **all 21 three-way merges returned 0% success on every task.** Only seven of the remaining 42 showed any life at all, and every one of those was just the single strongest expert bleeding through.

This is a negative result, and it's the project I'm proudest of from the semester precisely _because_ it's negative. We didn't get the headline we wanted. What we got instead was a clean, stubborn finding that survived every attempt we made to explain it away — and that's worth more than a number that goes up.

## The bet: merge instead of forget

The problem that started all of this is **catastrophic forgetting**. A vision-language-action (VLA) model — a network that takes camera images, a robot's joint state, and a sentence like _"turn on the stove and put the moka pot on it"_ and outputs motor commands — is great until you ask it to learn a _second_ task. Fine-tune it on the new task and it quietly destroys everything it knew about the first. This isn't a bug, it's the default behavior of gradient descent on a moving data distribution, and it's the central obstacle to a robot that keeps learning after you deploy it.

There's a tempting escape hatch from the model-merging literature. Instead of training tasks _sequentially_ (and forgetting), train one expert per task _independently and in parallel_, then combine them after the fact with a weight-space operation — average them, add their "task vectors," keep the parameters each expert cares about most. [Model Soups](https://arxiv.org/abs/2203.05482), [task arithmetic](https://arxiv.org/abs/2212.04089), [TIES](https://arxiv.org/abs/2306.01708), [DARE](https://arxiv.org/abs/2311.03099), [Fisher merging](https://arxiv.org/abs/2111.09832) — these all recover much of multi-task training in NLP and vision, for free, with no joint training and no replay data. The bet was simple: **if merging works for VLAs too, continual learning gets a lot easier.** Train experts whenever, merge them whenever.

So we set up the cleanest head-to-head we could: same backbone, same task sequence, same evaluation, two routes to a single multi-task policy. Route one is the thing we're trying to beat — sequential fine-tuning, which forgets. Route two is the thing we're hoping wins — post-hoc merging.

<div style="margin: 2rem 0;">
  <svg viewBox="0 0 880 300" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto; font-family:inherit;">
    <defs>
      <marker id="arrm" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L7,3 L0,6 Z" fill="var(--global-theme-color)"/>
      </marker>
    </defs>
    <!-- base -->
    <rect x="20" y="120" width="150" height="60" rx="6" fill="none" stroke="var(--global-text-color)" stroke-width="1.5"/>
    <text x="95" y="146" text-anchor="middle" fill="var(--global-theme-color)" font-size="12" font-weight="700">SmolVLA-LIBERO90</text>
    <text x="95" y="165" text-anchor="middle" fill="var(--global-text-color-light)" font-size="10.5">base checkpoint θ₀</text>

    <!-- experts -->
    <rect x="250" y="30" width="120" height="44" rx="6" fill="none" stroke="var(--global-text-color)" stroke-width="1.5"/>
    <text x="310" y="50" text-anchor="middle" fill="var(--global-text-color)" font-size="11.5" font-weight="600">Expert T2</text>
    <text x="310" y="66" text-anchor="middle" fill="var(--global-text-color-light)" font-size="10">moka pot</text>
    <rect x="250" y="86" width="120" height="44" rx="6" fill="none" stroke="var(--global-text-color)" stroke-width="1.5"/>
    <text x="310" y="106" text-anchor="middle" fill="var(--global-text-color)" font-size="11.5" font-weight="600">Expert T4</text>
    <text x="310" y="122" text-anchor="middle" fill="var(--global-text-color-light)" font-size="10">mugs on plates</text>
    <rect x="250" y="142" width="120" height="44" rx="6" fill="none" stroke="var(--global-text-color)" stroke-width="1.5"/>
    <text x="310" y="162" text-anchor="middle" fill="var(--global-text-color)" font-size="11.5" font-weight="600">Expert T7</text>
    <text x="310" y="178" text-anchor="middle" fill="var(--global-text-color-light)" font-size="10">soup in basket</text>

    <!-- route 2: merge -->
    <rect x="470" y="56" width="170" height="64" rx="6" fill="none" stroke="var(--global-theme-color)" stroke-width="2"/>
    <text x="555" y="82" text-anchor="middle" fill="var(--global-theme-color)" font-size="12.5" font-weight="700">Merge operator M</text>
    <text x="555" y="101" text-anchor="middle" fill="var(--global-text-color-light)" font-size="10">avg · TIES · DARE · Fisher…</text>

    <!-- route 1: sequential -->
    <rect x="470" y="150" width="170" height="64" rx="6" fill="none" stroke="var(--global-text-color)" stroke-width="1.5" stroke-dasharray="4 3"/>
    <text x="555" y="176" text-anchor="middle" fill="var(--global-text-color)" font-size="12.5" font-weight="600">Sequential FT</text>
    <text x="555" y="195" text-anchor="middle" fill="var(--global-text-color-light)" font-size="10">T2 → T4 → T7</text>

    <!-- outcomes -->
    <rect x="710" y="56" width="150" height="64" rx="6" fill="none" stroke="var(--global-theme-color)" stroke-width="1.5"/>
    <text x="785" y="80" text-anchor="middle" fill="var(--global-text-color)" font-size="12" font-weight="600">one policy,</text>
    <text x="785" y="98" text-anchor="middle" fill="var(--global-text-color)" font-size="12" font-weight="600">all tasks?</text>
    <text x="785" y="113" text-anchor="middle" fill="#c0392b" font-size="10.5" font-weight="700">→ 0%</text>

    <rect x="710" y="150" width="150" height="64" rx="6" fill="none" stroke="var(--global-text-color)" stroke-width="1.5"/>
    <text x="785" y="174" text-anchor="middle" fill="var(--global-text-color)" font-size="12" font-weight="600">newest task only,</text>
    <text x="785" y="192" text-anchor="middle" fill="var(--global-text-color)" font-size="12" font-weight="600">prior tasks lost</text>

    <!-- arrows -->
    <line x1="170" y1="150" x2="248" y2="108" stroke="var(--global-text-color-light)" stroke-width="1.3" marker-end="url(#arrm)"/>
    <line x1="170" y1="150" x2="248" y2="150" stroke="var(--global-text-color-light)" stroke-width="1.3" marker-end="url(#arrm)"/>
    <line x1="170" y1="150" x2="248" y2="55" stroke="var(--global-text-color-light)" stroke-width="1.3" marker-end="url(#arrm)"/>
    <line x1="370" y1="88" x2="468" y2="88" stroke="var(--global-theme-color)" stroke-width="1.6" marker-end="url(#arrm)"/>
    <line x1="170" y1="155" x2="468" y2="182" stroke="var(--global-text-color-light)" stroke-width="1.3" stroke-dasharray="4 3" marker-end="url(#arrm)"/>
    <line x1="640" y1="88" x2="708" y2="88" stroke="var(--global-theme-color)" stroke-width="1.6" marker-end="url(#arrm)"/>
    <line x1="640" y1="182" x2="708" y2="182" stroke="var(--global-text-color-light)" stroke-width="1.3" marker-end="url(#arrm)"/>

  </svg>
  <p style="text-align:center; font-size:0.85rem; color:var(--global-text-color-light); margin-top:0.5rem;">The two routes we compared. Merging (top, solid) trains experts independently from the same base and combines their weights with no further training. Sequential fine-tuning (bottom, dashed) is the baseline that forgets. We wanted the top path to win. It returned zero.</p>
</div>

## Getting the robot to train at all

Before any of the science, there was a wall of plumbing, and that's the part I owned first. We picked **SmolVLA** — a compact ~450M-parameter open VLA built into Hugging Face's LeRobot ecosystem — over the much larger OpenVLA (7B), because you cannot run a six-operator × four-regime sweep on a model you can only fine-tune once a day. Reproducibility and iteration speed beat raw capacity here, and that choice is the only reason the sweep was finishable.

My first real contribution was making our second benchmark, **RoboTwin 2.0**, actually loadable. RoboTwin is a dual-arm manipulation benchmark with 50 tasks and 100k+ trajectories, but it ships in its own HDF5 layout that LeRobot can't read. So I wrote a strict converter that pulls the raw RoboTwin trajectories, extracts the four camera streams, the dual-arm end-pose state, and the 14-dimensional action vector, and re-packs all of it into [LeRobot dataset v3.0](https://github.com/huggingface/lerobot) format — the `meta/`, `data/`, `videos/` file layout the training pipeline expects:

```python
# the schema the converter pins RoboTwin onto — no path inference, no fallbacks
ACTION_PATH = "joint_action/vector"
STATE_PATHS = ["endpose/left_endpose",  "endpose/left_gripper",
               "endpose/right_endpose", "endpose/right_gripper"]
CAMERA_PATHS = {"front_camera_rgb": "observation/front_camera/rgb",
                "head_camera_rgb":  "observation/head_camera/rgb",
                "left_camera_rgb":  "observation/left_camera/rgb",
                "right_camera_rgb": "observation/right_camera/rgb"}
```

I deliberately made it _narrow_ — one task config in, one dataset out, fixed paths only, no clever inference. When you're about to build an experiment on top of a data pipeline, the last thing you want is a converter that silently guesses and hands you subtly-wrong tensors. A loud failure on a missing key is a feature. On top of the converter I wrote a one-command wrapper that downloads a task from the Hub and converts it end to end, so anyone on the team could go from a task name to a trainable dataset without touching the internals.

From there I built the full SmolVLA training pipeline in Google Colab — the LeRobot `lerobot-train` runs, checkpoint saving every 500 steps, the works — and shipped trained checkpoints to the rest of the team. Those checkpoints became the raw material everyone else's merging and evaluation experiments ran on. A lot of this project was that kind of unglamorous infrastructure, and it's genuinely where I learned the most: a VLA experiment lives or dies on whether the data and checkpoints are trustworthy long before any operator gets applied.

The full experimental design came together as three ways to produce a policy from the same base:

{% include figure.liquid path="projects/vla-merging/images/pipeline.webp" alt="Three policy-generation pipelines: expert, sequential, and merged" caption="The three routes to a policy, all starting from SmolVLA pre-trained on LIBERO-90. Experts are fine-tuned independently per task. Sequential policies continue fine-tuning along T2→T4→T7. Merged policies combine independently-trained experts with one of six operators and no extra training. Everything downstream is a comparison between the last two." class="img-fluid rounded" %}

We ran the headline study on three deliberately hard **LIBERO** tasks — T2 _"turn on the stove and place the moka pot on it,"_ T4 _"put the white mug on the left plate and the yellow-and-white mug on the right plate,"_ and T7 _"put both the alphabet soup and cream cheese box in the basket."_ T2 is one coordinated motion; T4 and T7 each demand juggling two separate objects. And to make sure no finding was an accident of one benchmark, we trained experts under four parameter budgets: full fine-tuning (FFT, ~457M trainable params) and three LoRA adapter regimes — standard rank 64 (~3M), a tied-A variant (~1.5M), and a tiny rank 8 (~0.37M).

## The experts work — but only on their own task

First, the good news: the individual experts learned. Best-validation success rate per task, per regime:

<figure class="report-table">
  <table>
    <thead>
      <tr><th class="l">Task</th><th>FFT (457M)</th><th>LoRA r=64 (3.0M)</th><th>Tied-A (1.5M)</th><th>LoRA r=8 (0.37M)</th></tr>
    </thead>
    <tbody>
      <tr><th class="l"><strong>T2</strong> (moka pot)</th><td>96%</td><td>76%</td><td>76%</td><td>72%</td></tr>
      <tr><th class="l"><strong>T4</strong> (mugs on plates)</th><td>60%</td><td>26%</td><td>18%</td><td>14%</td></tr>
      <tr><th class="l"><strong>T7</strong> (soup in basket)</th><td>62%</td><td>32%</td><td>22%</td><td>28%</td></tr>
    </tbody>
  </table>
  <figcaption>LIBERO single-task expert performance across adapter regimes — best-validation success rate over 50 episodes. Full fine-tuning (FFT) leads on every task, and the FFT&ndash;LoRA gap widens with task difficulty.</figcaption>
</figure>

Two things jump out. T2 is the easy one — every regime clears 72%. And the gap between full fine-tuning and LoRA _widens_ with task difficulty (20 points on T2, 34 on T4, 30 on T7): the two-object tasks need capacity that a small adapter just can't hold. That already tells you adapter _capacity_, not adapter _form_, is what limits the hard tasks — a thread that comes back later.

But the more important table is this one. We took each expert and evaluated it on _all three_ tasks, to check whether any of them had accidentally picked up general skill:

<figure class="report-table">
  <table>
    <thead>
      <tr><th class="l">Regime</th><th class="l">Expert</th><th>Eval T2</th><th>Eval T4</th><th>Eval T7</th></tr>
    </thead>
    <tbody>
      <tr><th scope="rowgroup" rowspan="3">LoRA r=64</th><td class="l">Expert T2</td><td><strong>76%</strong></td><td>0%</td><td>0%</td></tr>
      <tr><td class="l">Expert T4</td><td>0%</td><td><strong>26%</strong></td><td>0%</td></tr>
      <tr><td class="l">Expert T7</td><td>0%</td><td>0%</td><td><strong>32%</strong></td></tr>
    </tbody>
    <tbody>
      <tr><th scope="rowgroup" rowspan="3">FFT</th><td class="l">Expert T2</td><td><strong>96%</strong></td><td>0%</td><td>0%</td></tr>
      <tr><td class="l">Expert T4</td><td>0%</td><td><strong>60%</strong></td><td>0%</td></tr>
      <tr><td class="l">Expert T7</td><td>0%</td><td>0%</td><td><strong>62%</strong></td></tr>
    </tbody>
  </table>
  <figcaption>Cross-evaluation of LoRA r=64 and FFT experts on all three tasks. Every off-diagonal cell is exactly 0% &mdash; the experts are true specialists with no incidental cross-task ability.</figcaption>
</figure>

Every off-diagonal cell is _exactly_ zero. Even FFT — with 150× more trainable parameters — produces no incidental cross-task ability. These are pure specialists. The consequence is sharp and it frames everything after: **any merged policy that succeeds on more than one task must get that ability from the merge itself.** There's no latent shared skill hiding in the experts for an operator to surface. The merge has to do real work, or nothing happens.

## Sequential fine-tuning: it forgets, exactly as feared

Before merging, we ran the baseline we were trying to beat. Start from the strongest expert (T2), continue training on T4, then on T7, measuring all three tasks at each stage:

<figure class="report-table">
  <table>
    <thead>
      <tr><th class="l">Regime</th><th class="l">Stage</th><th>T2</th><th>T4</th><th>T7</th></tr>
    </thead>
    <tbody>
      <tr><th scope="rowgroup" rowspan="3">LoRA r=64</th><td class="l">T2 only</td><td>76%</td><td>0%</td><td>0%</td></tr>
      <tr><td class="l">T2 &rarr; T4</td><td><strong>0%</strong></td><td>42%</td><td>0%</td></tr>
      <tr><td class="l">T2 &rarr; T4 &rarr; T7</td><td><strong>0%</strong></td><td><strong>0%</strong></td><td>24%</td></tr>
    </tbody>
    <tbody>
      <tr><th scope="rowgroup" rowspan="3">FFT</th><td class="l">T2 only</td><td>96%</td><td>0%</td><td>0%</td></tr>
      <tr><td class="l">T2 &rarr; T4</td><td><strong>0%</strong></td><td>44%</td><td>0%</td></tr>
      <tr><td class="l">T2 &rarr; T4 &rarr; T7</td><td><strong>0%</strong></td><td><strong>0%</strong></td><td>24%</td></tr>
    </tbody>
  </table>
  <figcaption>Sequential fine-tuning. Each row reports per-task success rate at the end of that stage; bold zeros mark catastrophic forgetting of a previously mastered task.</figcaption>
</figure>

This is catastrophic forgetting in its purest form. Training on T4 _immediately_ wipes T2 to zero — even though T2 was the _starting point_. The next stage wipes T2 and T4 both. And it happens identically under FFT, so it isn't a small-adapter problem; it's a property of sequential adaptation itself. There's a silver lining buried in it, though: under LoRA, the T2→T4 stage hits **42%** on T4, _better_ than the 26% you get training T4 from the base. Initializing from a related task is a genuinely stronger starting point — there's positive _forward_ transfer. The skill is consumable forward in time. It just isn't recoverable backward. Hold that thought.

### The same story on a second robot

I ran the parallel continual-learning study on **RoboTwin's** dual-arm robot, on two deliberately similar tasks — _Click Bell_ and _Click Alarm Clock_ — to see whether the forgetting pattern held on a completely different embodiment and benchmark. It did, and the training loss tells the story before any success number does:

{% include figure.liquid path="projects/vla-merging/images/robotwin_loss.webp" alt="Training loss across the source-to-target task switch on RoboTwin" caption="The moment of forgetting, made visible. As continual training crosses from the source task to the target task, the loss spikes hard — the model is being forced to overwrite representations it had settled into — and then re-converges more slowly than it did the first time. You can see the robot paying to forget." class="img-fluid rounded" %}

{% include figure.liquid path="projects/vla-merging/images/robotwin_forgetting.webp" alt="Per-task success rate as continual training progresses on RoboTwin" caption="Per-task success as continual training runs. A short burst of continual training (≈250 steps) can briefly help the new task without fully erasing the old one — but push further and the original task's success rate collapses. Same catastrophic-forgetting signature as LIBERO, on a different robot." class="img-fluid rounded" %}

There was a second lesson hiding in the RoboTwin runs: distribution shift is brutal. Each task has a clean in-distribution (ID) version and an out-of-distribution (OOD) version with cluttered tables and changed backgrounds.

{% include figure.liquid path="projects/vla-merging/images/id_ood.webp" alt="In-distribution vs out-of-distribution RoboTwin scenes" caption="In-distribution (left) versus out-of-distribution (right) RoboTwin scenes — the OOD setting just adds clutter and a busier background. Success rates fell sharply across every model in the OOD column. A policy that looks solid in a clean scene can be very far from robust." class="img-fluid rounded" %}

So going in, both routes were behaving as the literature predicted: sequential forgets, but at least it works on the most recent task. Now merging just had to clear that low bar.

## The merge that never worked

It didn't clear the bar. It didn't get off the ground. Here's the central result — all six operators, applied to all three LoRA regimes, evaluated on every task. **Every single cell is zero:**

<figure class="report-table">
  <table>
    <thead>
      <tr><th class="spacer"></th><th class="group" colspan="3">LoRA r=64</th><th class="group" colspan="3">Tied-A</th><th class="group" colspan="3">LoRA r=8</th></tr>
      <tr><th class="l">Strategy</th><th>T2</th><th>T4</th><th>T7</th><th>T2</th><th>T4</th><th>T7</th><th>T2</th><th>T4</th><th>T7</th></tr>
    </thead>
    <tbody>
      <tr><th class="l">Linear averaging</th><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
      <tr><th class="l">Magnitude (max-weight)</th><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
      <tr><th class="l">Task arithmetic</th><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
      <tr><th class="l">DARE</th><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
      <tr><th class="l">TIES</th><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
      <tr><th class="l">Fisher</th><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
    </tbody>
  </table>
  <figcaption>Triple-merge results. Six operators applied to all three LoRA adapter regimes, evaluated on each task (T2, T4, T7). Every one of the 21 three-way merges returns 0% on every task.</figcaption>
</figure>

Twenty-one three-way merges, zero successes, full stop. The naive baseline (linear average) fails, the clever sign-aware ones (TIES) fail, the redundancy-pruning one (DARE) fails, and the most theoretically principled one — Fisher merging, which explicitly weights each parameter by how much each task _cares_ about it — fails just as completely. That uniformity is itself a clue: when the dumb method and the smart method fail identically, the problem usually isn't the method.

We wondered if combining all three at once was simply too much, so we backed off to **pairs** — every pair, every operator, on the two low-capacity regimes, 42 configurations. Only seven were non-zero, and the pattern in them is almost eerie:

<figure class="report-table">
  <table>
    <thead>
      <tr><th class="l">Strategy</th><th class="l">Pair / adapter set</th><th>Result</th></tr>
    </thead>
    <tbody>
      <tr><th class="l">Magnitude pruning</th><td class="l">{T2, T7} / Tied-A</td><td><strong>8% on T2</strong></td></tr>
      <tr><th class="l">TIES</th><td class="l">{T2, T7} / r=8</td><td>4% on T2</td></tr>
      <tr><th class="l">Linear averaging</th><td class="l">{T2, T4} / Tied-A</td><td>2% on T2</td></tr>
      <tr><th class="l">Linear averaging</th><td class="l">{T2, T7} / Tied-A</td><td>2% on T2</td></tr>
      <tr><th class="l">Linear averaging</th><td class="l">{T2, T7} / r=8</td><td>2% on T2</td></tr>
      <tr><th class="l">Task arithmetic (&alpha;=0.4)</th><td class="l">{T2, T7} / Tied-A</td><td>2% on T2</td></tr>
      <tr><th class="l">Task arithmetic (&alpha;=0.7)</th><td class="l">{T2, T7} / Tied-A</td><td>2% on T2</td></tr>
    </tbody>
  </table>
  <figcaption>All non-zero pair-merge cells (out of 42 configurations). Every non-zero result is on T2, and only when T2&rsquo;s expert is one of the two merged adapters.</figcaption>
</figure>

_Every_ non-zero result is on T2 — the strongest expert — and _only_ when T2's own adapter is in the merge. T4 and T7 never recover, in any configuration, ever. Merging isn't blending two skills into one policy. At its absolute best, it's letting the single dominant expert leak a fraction of its behavior through while the other expert contributes nothing. That's not multi-task learning; it's the strongest specialist surviving, slightly damaged.

## Was the 8% real, or just luck?

A 2–8% success rate over 50 episodes is close enough to noise that I didn't want to trust it on faith — a policy could "succeed" by flailing into the right configuration. So we pulled the actual rollout videos of the two strongest cells and watched them frame by frame. The 8% cell (tied-A magnitude merge of {T2, T7}) is unambiguous:

<div style="display:grid; grid-template-columns: repeat(5, 1fr); gap:0.4rem; margin:1.5rem 0;">
  {% include figure.liquid path="projects/vla-merging/images/t2_recovery_1.webp" alt="Initial" class="img-fluid rounded" %}
  {% include figure.liquid path="projects/vla-merging/images/t2_recovery_2.webp" alt="Knob turn" class="img-fluid rounded" %}
  {% include figure.liquid path="projects/vla-merging/images/t2_recovery_3.webp" alt="Approach pot" class="img-fluid rounded" %}
  {% include figure.liquid path="projects/vla-merging/images/t2_recovery_4.webp" alt="Grasp pot" class="img-fluid rounded" %}
  {% include figure.liquid path="projects/vla-merging/images/t2_recovery_5.webp" alt="Pot placed" class="img-fluid rounded" %}
</div>
<p style="text-align:center; font-size:0.85rem; color:var(--global-text-color-light); margin-top:-0.5rem;">The strongest surviving merge (tied-A, magnitude pruning of {T2, T7}, 8% on T2), left to right: the gripper deliberately closes on the stove knob and rotates it to light the burner, then crosses the workspace, grasps the moka pot, and sets it down. Both sub-skills of T2 are intact, executed with coordinated motion — this is retained structure, not a lucky flail.</p>

The second-strongest cell (rank-8 TIES of {T2, T7}, 4%) is the more interesting one, because it shows the behavior _decaying_ in a meaningful way:

<div style="display:grid; grid-template-columns: repeat(5, 1fr); gap:0.4rem; margin:1.5rem 0;">
  {% include figure.liquid path="projects/vla-merging/images/r8_recovery_1.webp" alt="Initial" class="img-fluid rounded" %}
  {% include figure.liquid path="projects/vla-merging/images/r8_recovery_2.webp" alt="Approach knob" class="img-fluid rounded" %}
  {% include figure.liquid path="projects/vla-merging/images/r8_recovery_3.webp" alt="Gripper open" class="img-fluid rounded" %}
  {% include figure.liquid path="projects/vla-merging/images/r8_recovery_4.webp" alt="Over knob" class="img-fluid rounded" %}
  {% include figure.liquid path="projects/vla-merging/images/r8_recovery_5.webp" alt="Knob brushed" class="img-fluid rounded" %}
  {% include figure.liquid path="projects/vla-merging/images/r8_recovery_6.webp" alt="Burner lit" class="img-fluid rounded" %}
  {% include figure.liquid path="projects/vla-merging/images/r8_recovery_7.webp" alt="Crossing" class="img-fluid rounded" %}
  {% include figure.liquid path="projects/vla-merging/images/r8_recovery_8.webp" alt="Reaching" class="img-fluid rounded" %}
  {% include figure.liquid path="projects/vla-merging/images/r8_recovery_9.webp" alt="Pot grasped" class="img-fluid rounded" %}
  {% include figure.liquid path="projects/vla-merging/images/r8_recovery_10.webp" alt="Pot placed" class="img-fluid rounded" %}
</div>
<p style="text-align:center; font-size:0.85rem; color:var(--global-text-color-light); margin-top:-0.5rem;">The 4% cell, same task. The pick-and-place half survives cleanly (bottom row: cross, grasp, place). But the knob is no longer turned with a deliberate grasp — the burner happens to ignite because the arm <em>brushes past</em> the knob on its way to the pot. The coarse motor primitive (pick-and-place) outlives the fine one (rotational grasp-and-turn). Merging degrades skill granularity before it degrades the skill entirely.</p>

That granularity story — coarse primitives surviving, fine ones dissolving first — is exactly what you'd expect if merging preserves a _fading copy_ of the dominant expert rather than recombining structure from several. It confirmed the 8% is real, and it confirmed what kind of "real" it is.

## Why it failed — and why we believe the failure

The easy move with a negative result is to assume you broke something. So we spent most of our remaining effort trying to _make_ merging work, and each attempt ruled out an explanation instead:

- **Maybe the experts drifted too far apart in weight space.** So we merged them _early_, at step 1500 — long before either had converged or diverged much from the base. Still 0%. It's not drift.
- **Maybe the LoRA $A$ matrices conflict.** The tied-A regime freezes a shared $A$ across all experts, so the $A$ matrices are _identical_ at merge time by construction — any remaining failure has to come from the $B$ side alone. Still 0%. It's not $A$-side conflict.
- **Maybe there's too much capacity, and the experts use scattered, non-overlapping parameters.** So we squeezed each expert into rank 8 — an 8× smaller subspace that should force shared, low-dimensional structure. Still 0%. It's not excess capacity.
- **Maybe uniform operators are too blunt and we need importance weighting.** Fisher merging weights every parameter by its task-specific importance — if tasks genuinely lived in disjoint parameter subsets, Fisher should preserve each one. Still 0%, on every cell. It's not a weighting problem.

Put those together and a single explanation survives: in this setting the independently-trained adapters **do not localize each task's knowledge into a parameter subspace that any operator can pick out and recombine.** The information is there — each expert clearly works — but it isn't stored in a _combinable_ form. And that lines up perfectly with the sequential result. The representations are **positionally consumable** — a later task can build _on top of_ an earlier one and gain from it (the 42% forward-transfer bump) — but they are **not post-hoc combinable** — you can't take independently-trained copies and re-aggregate them into one working policy. Skill flows forward through fine-tuning. It does not survive averaging.

One supporting detail I'll flag, because it mattered for trusting the experts in the first place: full fine-tuned checkpoints had to be chosen by best validation rollout, not by final step, because late training was unstable and sometimes _worse_ than an earlier peak.

{% include figure.liquid path="projects/vla-merging/images/fft_checkpoints.webp" alt="Full fine-tuned expert success rate across training checkpoints for T2, T4, T7" caption="Why we never just took the last checkpoint. Success rate against training step for the three FFT experts — the curves peak and then sag, so the best-validation step (T2: 3500, T4: 3500, T7: 6000) is what fed the merges. Merging an over-trained checkpoint would have stacked one failure mode on another." class="img-fluid rounded" %}

## What I take from a result that said no

The honest headline is that **post-hoc parameter merging did not work as a continual-learning strategy for VLAs in any configuration we tried** — and we tried a lot of them. That's a real finding, and the reason I trust it is the same reason it's uncomfortable: we built four separate off-ramps for "we just did it wrong," and the result walked past every one.

I want to be clear about the fences around it. It's one ~450M backbone (SmolVLA) — a 7B model might concentrate task knowledge differently. It's three LIBERO tasks plus two RoboTwin tasks, chosen to be _hard_, not to share structure; a family of near-identical pick-and-place variants might merge far better. It's six operators out of a growing literature, and small 2–8% cells carry real Monte-Carlo noise (which is exactly why we went to the videos). I wouldn't write "merging never works for robots." I'd write that _merging is not free_ for robots the way it is for language models — and that the difference is structural, not a tuning detail.

What I keep from it is mostly a way of working. Most of my fingerprints on this project are on the parts you don't see in the result table — the RoboTwin-to-LeRobot converter that refused to guess, the Colab training pipeline, the checkpoints the rest of the team merged, the RoboTwin forgetting study that showed the same pattern on a second robot. A negative result is only believable if the scaffolding under it is trustworthy, and getting to _trust_ a finding that disappoints you is a skill I didn't really have before this. The most convincing thing we could do with "it returns zero" was to spend our energy trying to prove ourselves wrong — and report it plainly when we couldn't.

If there's a forward direction, it's the one the failure points at: stop hoping post-hoc operators will recombine experts that were never trained to be combinable, and instead bake merge-compatibility into training — shared adapter structure, joint regularization across experts, merging-aware fine-tuning. Make the brains mergeable on purpose, rather than wishing they were after the fact.
