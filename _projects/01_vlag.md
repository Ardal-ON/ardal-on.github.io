---
layout: page
title: "VLAG: Graph-Based Planning for Vision-Language-Action Models"
description: A modular Mixture-of-Experts framework that replaces a monolithic VLA backbone with a graph-based router over compact vision, language, and action experts for long-horizon manipulation.
img: assets/img/projects/vlag.webp
importance: 1
year: 2025
category: research
period: "2024–2025"
permalink: /projects/vlag/
show_in_grid: false
---

**Ardalan Aryashad**, Yan Jin &mdash; _USC IMPACT Laboratory &middot; ASME IDETC/CIE 2025_

<div class="pub-links-row" style="margin: 0.75rem 0 1.5rem;">
  <a href="https://doi.org/10.1115/DETC2025-169527" target="_blank" class="pub-tag">Paper</a>
  <span class="pub-tag" style="opacity:0.55; cursor:default;">Code (coming soon)</span>
</div>

---

## Abstract

VLAG is a modular framework for long-horizon robotic manipulation that combines a graph-based router with specialized vision, language, and action experts. Rather than relying on a monolithic Vision-Language-Action (VLA) backbone, VLAG performs lightweight state-transition selection from visual observations and language instructions, then activates the corresponding action expert for execution. The vision module predicts task-relevant environment states, the language module improves instruction-to-task alignment through domain-specific fine-tuning, and the action experts build on the Action Chunking with Transformers (ACT) architecture to generate control trajectories. This separation between routing and execution preserves an interpretable planning structure and supports matched baseline comparisons, diagnostics, ablations, and efficiency measurements on the CALVIN benchmark. At roughly 100M parameters, VLAG provides a compact and extensible alternative to billion-parameter end-to-end VLA models for seen-environment long-horizon manipulation.

---

## Motivation

Monolithic VLA models—RT-1/RT-2, OpenVLA, Octo, π-0—transfer web-scale knowledge to robotic control with strong generalization, but they pay for it at deployment: billion-parameter inference at every control step introduces latency and compute requirements that are problematic when high-frequency action prediction is critical. Conventional independent action policies are efficient and precise but are trained on single, short-horizon tasks and lack the planning structure needed to chain sub-tasks together. Hierarchical methods add planning structure, yet they typically depend on generative subgoal modules (predicted images or latent waypoints) that are expensive to train and opaque at inference time.

These three paradigms share a common trade-off:

- **Large VLAs** — strong generalization, high computational cost.
- **Hierarchical planners** — added planning structure, but reliant on opaque generative subgoal modules.
- **End-to-end policies** — efficient and precise, but limited to single-stage tasks.

VLAG targets this trade-off directly by decomposing the monolithic VLA into distinct, efficient expert components coordinated by an explicit, graph-structured planner. The router decomposes the available dataset into a network of tasks connecting discrete environmental states, enabling long-horizon planning without billion-parameter foundation-model inference at every step. Unlike prior hierarchical methods, VLAG performs _explicit state-transition routing_ over a pre-built graph, yielding a transparent and modifiable planning structure rather than a generated subgoal.

The primary contributions are threefold:

1. **Architectural** — a modular Mixture-of-Experts (MoE) framework in which a graph-based router replaces the monolithic VLA backbone, enabling lightweight task selection without large foundation-model inference at every step.
2. **Algorithmic** — a graph-construction and inference-time routing procedure that maps visual state representations and language instructions to specialized action experts, decomposing long-horizon tasks into a structured sequence of sub-task transitions.
3. **Empirical** — a compact (~100M-parameter) system that reaches a competitive average sequence length of 2.09/5 on CALVIN D→D while remaining deployable on mid-range GPU hardware, supported by matched-baseline evaluations, diagnostics, timed efficiency measurements, multi-seed statistics, and component ablations.

---

## System Overview

VLAG is a modular Mixture-of-Experts framework in which a graph-based router interprets visual observations and language instructions, maps the current environmental state to graph nodes, and selects the appropriate action expert for each sub-task along a long-horizon sequence. At each time step $$t$$, the directed graph identifies a node—representing the environmental state—and activates the corresponding edge, which represents a specialized action expert. That expert then takes control, predicting the robotic actions required to fulfill the sub-task.

{% include figure.liquid path="projects/vlag/images/VLAG component and pipline.webp" alt="VLAG components and inference pipeline" caption="The VLAG pipeline: a frozen vision encoder predicts key environmental states, a fine-tuned language module aligns instructions to task labels, and a graph router activates the matching ACT-based action expert." class="img-fluid rounded" %}

---

## The Graph Router

Long-horizon manipulation tasks require extended action sequences and explicit planning. VLAG addresses this by mapping sub-tasks to transitions in a directed graph $$G=(V,E)$$, where nodes $$V$$ correspond to distinct environmental states and directed edges $$E$$ represent the action experts that transition between them. Crucially, the router performs **selection, not full sequential planning**: given the current state and a language instruction, it identifies the single best-matching edge to activate at that moment. Long-horizon execution emerges from _repeated, single-step routing_—after each expert completes its sub-task, the vision module re-evaluates the updated state and the router selects the next edge, continuing until the instruction is satisfied or no matching edge is found.

The graph is constructed from a dataset $$D=\{(s_t,a_t,o_t)_{t=0}^{T},(l_i)_{i=0}^{N}\}$$ of robot states, actions, observations, and language instructions. For each task trajectory, the start ($$t=0$$) and end ($$t=T$$) states are encoded by the vision module into feature vectors, and nodes are instantiated for each. A cosine-similarity check against existing nodes, with an empirically chosen merge threshold of **0.98**, keeps the graph compact: states below the threshold spawn a new node, while matches append a timestamp to an existing one. Directed edges are then drawn between start and end nodes, labeled with the task's language instruction. When multiple outgoing edges are candidate matches, the language module resolves the tie by selecting the edge whose task label has the highest cosine similarity to the user's instruction.

The 0.98 operating point yields **18 nodes, 145 directed edges, and 20 unique task labels** in the sampled graph—preserving task coverage while avoiding the excessive state merging seen at lower thresholds and the fragmentation seen at higher ones. Routing cost is modest relative to policy execution: node matching is $$O(\lvert V \rvert p)$$ in feature dimension $$p$$, followed by $$O(\bar{d}_{\mathrm{out}} q)$$ language-based ranking over outgoing edges, where the small average out-degree makes node matching the dominant cost.

{% include figure.liquid path="projects/vlag/images/Graph structure example.webp" alt="Example graph structure" caption="An example of the constructed routing graph. Nodes encode environmental states (key-element feature vectors); directed edges carry language instructions and map to dedicated action experts." class="img-fluid rounded graph-fit" %}

---

## Vision, Language, and Action Modules

**Vision module.** A frozen CLIP encoder (ViT-B/32) processes RGB observations from the static CALVIN camera, and two MLP heads predict the states of six key elements—four continuous variables (sliding door, drawer, button, switch) and two Boolean variables (lightbulb, green light). Both heads share the same backbone architecture; the continuous head is trained with MSE loss and the Boolean head with BCE-with-logits for numerical stability. These predictions form the node feature vectors used by the router for state localization.

{% include figure.liquid path="projects/vlag/images/Vision Module Structure.webp" alt="Vision module structure" caption="Vision module: a frozen CLIP encoder feeds two MLP heads that predict continuous and Boolean key-element states for graph routing." class="img-fluid rounded" %}

**Language module.** Sentence-BERT (SBERT) embeds both free-form instructions and canonical task names into a shared latent space, and cosine similarity selects the closest task name. Because out-of-the-box embeddings underperform on CALVIN's domain-specific terminology, SBERT (`paraphrase-MiniLM-L6-v2`) is fine-tuned on instruction-task pairs with a cosine-similarity loss, sharpening routing precision.

**Action module.** Each action expert builds on ACT, which pairs a Conditional Variational Autoencoder (CVAE) with a DETR-based transformer to predict chunked action sequences. The CVAE encoder consumes observations, the task embedding, and ground-truth actions to infer a latent $$z$$; at inference, $$z$$ is set to its mean for stable execution. Each expert is trained on a task-specific subset of data grouped by language instruction, so every expert specializes in one category of manipulation. Overlapping chunks are blended with an exponential weighting scheme $$w_i = \exp(-m i)$$ that prioritizes the most recent predictions.

{% include figure.liquid path="projects/vlag/images/ACT Structure .webp" alt="ACT action expert architecture" caption="Each action expert adapts the ACT architecture—a CVAE coupled with a DETR-style transformer—conditioned on vision and language inputs to generate chunked control trajectories." class="img-fluid rounded" %}

The full pipeline is strictly modular: the language model is fine-tuned, the vision MLP heads are trained to predict key-element states, the graph is constructed from dataset trajectories, and semantically clustered task groups become the refined datasets used to train each action expert. Any component—vision, language, or an individual expert—can be independently optimized or replaced without retraining the others.

---

## Experiments on CALVIN D→D

We evaluate on the **CALVIN** benchmark—34 manipulation tasks collected over 24 hours of teleoperation across four environments, with RGB-D images from a static scene camera and a gripper-mounted camera. Experiments use the **D→D** ("seen") split, in which training and validation occur in identical environmental configurations, with over 512k training and 99k validation points carrying structured task annotations.

{% include figure.liquid path="projects/vlag/images/calvin_task_example.png" alt="turn off lightbulb task in CALVIN D-D" caption="The 'turn off the lightbulb' sub-task in the CALVIN D→D challenge—one transition the graph router must recognize and route to the correct expert." class="img-fluid rounded" %}

### Vision module

Trained for 2k epochs over environment D, the vision module predicts all six key elements with high accuracy from visual cues alone. Within a 1% tolerance band, every key element exceeds 96% accuracy.

{% include figure.liquid path="projects/vlag/images/vision_accuracy_chart.png" alt="Vision module prediction accuracy per key element" caption="Per-element prediction accuracy of the vision module within a 1% threshold on CALVIN D→D validation. All six key elements exceed 96%." class="img-fluid rounded" %}

### Language module

We built ~10k instruction-task pairs across the 34 tasks and evaluated three CLIP text encoders and eight SBERT variants, including an ablation that removes underscore (`_`) delimiters from task names. CLIP encoders aligned instructions to tasks poorly relative to SBERT. Fine-tuning `paraphrase-MiniLM-L6-v2` with cosine-similarity loss over 4 epochs raised pairing accuracy from a **63.5% baseline to 98.4%** and removed sensitivity to underscore formatting.

<figure class="report-table">
  <table>
    <caption>Instruction–task pairing accuracy by text encoder</caption>
    <thead>
      <tr><th class="l">Language model encoder</th><th>Accuracy with "_"</th><th>Accuracy w/o "_"</th></tr>
    </thead>
    <tbody>
      <tr><th class="l">CLIP ViT-B/32</th><td>41.90%</td><td>32.65%</td></tr>
      <tr><th class="l">CLIP ViT-B/16</th><td>47.04%</td><td>36.82%</td></tr>
      <tr><th class="l">CLIP ViT-L/14</th><td>38.82%</td><td>34.70%</td></tr>
      <tr><th class="l">all-MiniLM-L6-v2</th><td>58.87%</td><td>61.70%</td></tr>
      <tr><th class="l">all-MiniLM-L12-v2</th><td>57.33%</td><td>60.41%</td></tr>
      <tr><th class="l">all-mpnet-base-v2</th><td>57.07%</td><td>51.16%</td></tr>
      <tr><th class="l">paraphrase-MiniLM-L3-v2</th><td>59.90%</td><td>68.64%</td></tr>
      <tr><th class="l">multi-qa-MiniLM-L6-cos-v1</th><td>62.47%</td><td>66.58%</td></tr>
      <tr><th class="l">paraphrase-albert-small-v2</th><td>59.50%</td><td>61.70%</td></tr>
      <tr><th class="l"><strong>Fine-tuned all-MiniLM-L6-v2</strong></th><td><strong>98.46%</strong></td><td><strong>98.46%</strong></td></tr>
    </tbody>
  </table>
</figure>

### Long-horizon benchmark

On the CALVIN D→D long-horizon benchmark, VLAG reaches an average sequence length of **2.09/5** at roughly **100M parameters**. Recent billion-parameter VLA methods score higher, but at one to two orders of magnitude more parameters—the design point VLAG deliberately trades against.

<figure class="report-table">
  <table>
    <caption>CALVIN D→D long-horizon benchmark</caption>
    <thead>
      <tr><th class="l">Model</th><th>Avg. sequence length</th><th>Approx. parameters</th></tr>
    </thead>
    <tbody>
      <tr><th class="l"><strong>VLAG (ours)</strong></th><td><strong>2.09 / 5</strong></td><td><strong>~100M</strong></td></tr>
      <tr><th class="l">FLOWER</th><td>4.35 / 5</td><td>~1B</td></tr>
      <tr><th class="l">RoboUniView</th><td>3.85 / 5</td><td>~3–4B</td></tr>
      <tr><th class="l">π-0 (via StarVLA)</th><td>2.95 / 5</td><td>~4B</td></tr>
      <tr><th class="l">π-0.5 (via StarVLA)</th><td>3.89 / 5</td><td>~4B</td></tr>
    </tbody>
  </table>
</figure>

### Matched baseline: MoE vs. single policy

To isolate the benefit of task-specialized experts, we run a controlled comparison on CALVIN D→D using 100 randomly sampled language-conditioned task chains per run. The task-specialized MoE is contrasted with a single ACT policy trained jointly on all tasks under a fixed 45,000-step budget, repeated over three seeds (11, 22, 33). The MoE configuration improves long-horizon competence dramatically—the joint single policy collapses beyond the first instruction.

<figure class="report-table">
  <table>
    <caption>Matched comparison: MoE vs. single joint policy</caption>
    <thead>
      <tr><th class="l">Model</th><th>Avg. seq. len</th><th>SR@1</th><th>SR@2</th><th>SR@3</th><th>SR@4</th><th>SR@5</th></tr>
    </thead>
    <tbody>
      <tr><th class="l"><strong>MoE</strong> (task-specialized experts)</th><td><strong>1.93 ± 0.08</strong></td><td>0.70 ± 0.01</td><td>0.51 ± 0.02</td><td>0.35 ± 0.01</td><td>0.24 ± 0.04</td><td>0.13 ± 0.03</td></tr>
      <tr><th class="l">Single (joint policy, 45k steps)</th><td>0.16 ± 0.02</td><td>0.15 ± 0.01</td><td>0.01 ± 0.01</td><td>0.00</td><td>0.00</td><td>0.00</td></tr>
    </tbody>
  </table>
</figure>

<p style="text-align:center; font-size:0.85rem; color:var(--global-text-color-light); margin-top:-0.5rem;">Mean ± population standard deviation over three seeded runs (n = 3). SR@k is the fraction of episodes completing the first k instructions. Across seeds the MoE average sequence length ranges 1.82–1.99; the single policy ranges 0.14–0.18.</p>

### Diagnostics

We instrument the evaluation to separate **routing failures** (no executable sub-task can be resolved) from **execution failures** (routing succeeds but the policy does not complete the sub-task). Routing failures are **zero** for both models; execution failures dominate. Performance in the seen D→D setting is therefore constrained primarily by low-level policy robustness, not by graph or language gating.

<figure class="report-table">
  <table>
    <caption>Routing vs. execution failure breakdown</caption>
    <thead>
      <tr><th class="l">Model</th><th>Routing failures</th><th>Execution failures</th><th>Total subtasks</th></tr>
    </thead>
    <tbody>
      <tr><th class="l">MoE</th><td>0</td><td>89</td><td>266</td></tr>
      <tr><th class="l">Single</th><td>0</td><td>100</td><td>117</td></tr>
    </tbody>
  </table>
</figure>

### Wall-clock runtime and GPU memory

Timing and memory were recorded on one NVIDIA A100 PCIe (40 GB) with dual AMD EPYC 7513 hosts. The MoE achieves higher subtask throughput and lower per-subtask latency than the single policy, but carries higher end-to-end runtime and peak memory. These measurements distinguish _architectural compactness_ (~100M parameters) from _runtime overhead_: the modular design improves long-horizon competence but still incurs coordination and memory costs to be reduced in future work.

<figure class="report-table">
  <table>
    <caption>Wall-clock runtime and GPU memory</caption>
    <thead>
      <tr><th class="l">Model</th><th>Runtime (s)</th><th>Subtask throughput (1/s)</th><th>Latency / subtask (ms)</th><th>Mean GPU mem. (MiB)</th><th>Peak GPU mem. (MiB)</th></tr>
    </thead>
    <tbody>
      <tr><th class="l">MoE</th><td>528.3</td><td>0.503</td><td>1986</td><td>9188</td><td>11356</td></tr>
      <tr><th class="l">Single</th><td>463.8</td><td>0.252</td><td>3964</td><td>7005</td><td>9658</td></tr>
    </tbody>
  </table>
</figure>

### Qualitative rollouts

{% include figure.liquid path="projects/vlag/images/success_failure_rollouts.png" alt="Successful and failed task rollouts in CALVIN" caption="Representative VLAG rollouts on CALVIN D→D. Successful sequences (top) chain correctly routed experts to completion; failures (bottom) arise predominantly from action-execution errors on fine-grained manipulation rather than from incorrect routing." class="img-fluid rounded" %}

---

## Ablation Studies

We isolate each component—language retrieval, visual state estimation, graph construction, and graph-constrained routing—holding the rest of the pipeline fixed.

**Language retrieval.** On 34 held instruction-task pairs, fine-tuned SBERT reaches **0.9706** accuracy with or without underscore formatting, versus 0.8235 (with) and 0.7941 (without) for base SBERT. Domain-specific fine-tuning matters even for a small task vocabulary, because minor linguistic variation is enough to degrade off-the-shelf embeddings.

**Vision-state prediction (oracle vs. learned).** Against an oracle reference of 1.0, predicted Boolean states are reliable (lightbulb 0.9570, green light 0.9424), but continuous variables within a strict ±1% band are uneven—sliding door 0.3540, drawer 0.5189, switch 0.8512. The vision bottleneck is concentrated in _fine-grained continuous-state estimation_, not binary attribute recognition.

**Graph construction (node-merge sensitivity).** Raising the cosine merge threshold from 0.90 to 0.99 grows node count from 8 to 19 while edge count (145) and unique-task count (20) stay fixed—the threshold controls node _granularity_, not coverage—supporting 0.98 as the operating point.

<figure class="report-table">
  <table>
    <caption>Node-merge threshold sensitivity</caption>
    <thead>
      <tr><th>Threshold</th><th>Nodes</th><th>Edges</th><th>Unique tasks</th></tr>
    </thead>
    <tbody>
      <tr><td>0.90</td><td>8</td><td>145</td><td>20</td></tr>
      <tr><td>0.95</td><td>10</td><td>145</td><td>20</td></tr>
      <tr><td><strong>0.98</strong></td><td><strong>18</strong></td><td><strong>145</strong></td><td><strong>20</strong></td></tr>
      <tr><td>0.99</td><td>19</td><td>145</td><td>20</td></tr>
    </tbody>
  </table>
</figure>

**Graph-constrained vs. unconstrained routing.** Restricting language retrieval to graph-feasible candidates raises edge-selection accuracy from 0.9379 to 0.9586 for base SBERT and from 0.9931 to **1.0000** for fine-tuned SBERT on 145 labeled transitions. The graph helps the weaker encoder most, but even the fine-tuned model benefits by eliminating residual ambiguity among semantically similar task labels.

---

## Discussion and Limitations

The ablations and diagnostics converge on a consistent picture. Boolean state recognition and graph/language routing are robust—routing failures are zero across the matched evaluation—so gross task identification is rarely the problem. The two failure modes that remain are (i) **state misclassification**, when small continuous-state errors map an observation to the wrong node, which the strong vision results make comparatively rare in the seen setting; and (ii) **action-execution error**, the dominant mode, where a correctly routed expert fails to complete a fine-grained sub-task within its trajectory window. Because routing advances only on successful sub-task completion, a single execution failure terminates the long-horizon chain.

VLAG's headline advantage is architectural compactness—an ~$$10^8$$-parameter system competing in a benchmark dominated by ~$$10^9$$-parameter models—and component-wise updatability, since new skills can be added without retraining a dense backbone. The honest counterpoint is that this modularity does not yet translate into uniformly lower wall-clock cost: the MoE's coordination and memory overhead exceed a single-policy ACT baseline on the same harness, even as it achieves far higher long-horizon success.

---

## Conclusion and Future Work

VLAG decomposes a monolithic VLA into a graph router plus specialized vision, language, and action experts, abstracting continuous environmental states into a structured transition map and routing each sub-task to a dedicated expert. The result is robust state recognition, transparent task routing, and competitive long-horizon performance at roughly 100M parameters on CALVIN D→D.

Current efforts target generalization to the **unseen** CALVIN long-horizon split through hyperparameter optimization and a unified expert architecture. Further directions include integrating generative foundation models as expert modules, combining reinforcement learning with graph-based routing for robustness to unseen environments and perturbations, and extending the framework to diverse sensory modalities and robotic embodiments—toward a scalable, efficient, and adaptable foundation for general-purpose robotic assistants.

---

## Demo

<video controls muted loop preload="metadata" style="width:100%; border-radius:8px;">
  <source src="/projects/vlag/images/VLAG.mp4" type="video/mp4">
</video>
<p style="text-align:center; font-size:0.85rem; color:var(--global-text-color-light); margin-top:0.5rem;">VLAG executing a long-horizon manipulation sequence on CALVIN: the graph router chains specialized experts across successive sub-tasks.</p>
