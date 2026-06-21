---
layout: page
title: "SEMAA: Agentic AI for Model-Based Systems Engineering"
description: A growing ecosystem of AI tools that put a conversational agent directly inside MBSE workflows — from a Visual Paradigm plugin to a self-hosted multi-agent platform with GraphRAG and private LLMs
img: assets/img/projects/semaa.webp
importance: 4
year: 2026
ongoing: true
category: research
period: "2025–Ongoing"
permalink: /projects/semaa/
show_in_grid: true
---

**Ardalan Aryashad**, Rufus Marcussen, Yan Jin &mdash; _USC IMPACT Laboratory &middot; ASME IDETC-CIE 2026_

<div class="pub-links-row" style="margin-bottom: 1.5rem;">
  <a href="https://semaa.site" target="_blank" class="pub-tag">semaa.site</a>
  <span class="pub-tag" style="opacity:0.5;cursor:default;">Paper (IDETC-CIE 2026)</span>
</div>

---

## The problem nobody had solved yet

Model-Based Systems Engineering tools are powerful and notoriously painful. SysML has nine diagram types with their own syntax and semantics. Visual Paradigm and Cameo require you to know what you're doing before you can even get started. The cognitive overhead of maintaining consistency across a large model is exactly the kind of thing you'd want an AI to help with — and yet, as of late 2025, no one had built a production-ready AI assistant for these tools. There were demos, YouTube videos, early experiments. But nothing that actually lived inside the tool, understood the current diagram state, and could modify it through natural language.

That gap is what SEMAA is about. Not a chatbot that describes what a diagram should look like — an agent that actually creates one and puts it directly into Visual Paradigm.

## The plugin: getting inside the tool

The first version was a Java plugin for Visual Paradigm. This was the natural choice: VP has a full Java API that lets you programmatically manipulate the diagram model, and building a plugin means the agent lives _inside_ the engineering environment rather than next to it. The alternative — asking the AI to generate some code and then manually importing it — would have been usable but not the point.

{% include figure.liquid path="projects/semaa/images/Semaa System design.webp" alt="SEMAA system architecture showing plugin, agent, context manager, splitter and interpreter" caption="The core architecture: the agent lives in the plugin, which translates between PlantUML text and the VP diagram model. The context manager serializes the current diagram state before every request, so the agent always knows what it's working with." class="img-fluid rounded" %}

The key design decision was to use **PlantUML as an intermediate representation**. The agent doesn't need to know anything about VP's internal API — it reasons in PlantUML text, and the interpreter handles the translation into actual VP model elements. This decoupling is what makes it work reliably. If I had asked the agent to generate VP-specific API calls directly, the output would have been unpredictable and fragile. PlantUML is well-documented, heavily represented in LLM training data, and text-based, which means the agent can reason about it directly.

The **bidirectional interpreter** is worth calling out specifically. Before every response, the plugin serializes the active diagram into PlantUML and sends it to the agent as context. This means when you ask "add a component to this diagram," the agent isn't guessing what's already there — it knows. And when you modify something manually in VP, the agent sees the updated state next time it reads. The human and the AI are always working on the same model.

<video controls muted loop preload="metadata" style="width:100%; border-radius:8px;">
  <source src="/projects/semaa/images/Demo.mp4" type="video/mp4">
</video>
<p style="text-align:center; font-size:0.85rem; color:var(--global-text-color-light); margin-top:0.5rem;">The LibreChat interface at semaa.site — a hosted, self-managed platform where all SEMAA agents live. Engineers can access it from any browser without installing anything.</p>

Beyond standard PlantUML, I had to write a **custom syntax for Requirement Diagrams**, because PlantUML doesn't support them natively. This turned out to be a useful exercise — once you've built a custom parser for one diagram type, you understand exactly what the interpreter needs from the agent, and you can enforce strict syntax rules in the system prompt. SysML's Requirement Diagram has specific semantics around containment, derivation, and verification relationships that don't map to any existing text format.

## Growing beyond Visual Paradigm

After the first demo to our sponsors in September 2025, one concern came up immediately: not everyone uses Visual Paradigm. The sponsors were interested in maritime engineering workflows where different tools were in play. And there were capabilities I wanted to add — GraphRAG for document search, fine-tuned models for domain-specific terminology, MCP integration — that would be much cleaner to build as a web service than as VP plugin features.

The solution was to deploy a web-based interface and make the plugin connect to it, rather than expanding the plugin indefinitely.

I evaluated four options: Open WebUI, H2O GPT, LobeChat, and LibreChat. LibreChat won because it hits the right combination for this project: self-hostable, supports multiple AI providers simultaneously (OpenAI, Anthropic, local models), has first-class MCP support, built-in RAG, custom agent definitions, and a clean interface that doesn't require users to manage anything. I deployed it on DigitalOcean and it's now live at [semaa.site](https://semaa.site/login).

## The three-tier architecture

Connecting the VP plugin to a remote server introduced a non-obvious engineering problem. LibreChat's MCP support requires a **static IP** — but users run VP on their laptops with dynamic IPs. You can't register a per-user dynamic endpoint in a way that's stable enough for MCP.

The solution was a relay server running on the same VPS as LibreChat. When the user clicks "Connect to SEMAA.site" in the VP plugin, the plugin registers a session token with the relay and opens a persistent WebSocket connection. LibreChat talks to the relay at a fixed address; the relay routes commands to the correct user's VP instance. The user just clicks one button.

<div style="margin: 2rem 0;">
<svg viewBox="0 0 820 320" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto; font-family:inherit; font-size:13px;">
  <!-- Background -->
  <rect width="820" height="320" fill="var(--global-bg-color, #fff)" rx="8"/>

  <!-- VP Plugin box -->
  <rect x="20" y="80" width="180" height="160" rx="8" fill="none" stroke="var(--global-theme-color, #5b6bcd)" stroke-width="1.5"/>
  <text x="110" y="72" text-anchor="middle" fill="var(--global-text-color, #333)" font-weight="600">User's PC</text>
  <rect x="40" y="100" width="140" height="50" rx="6" fill="var(--global-theme-color, #5b6bcd)" fill-opacity="0.12" stroke="var(--global-theme-color, #5b6bcd)" stroke-width="1"/>
  <text x="110" y="121" text-anchor="middle" fill="var(--global-text-color, #333)" font-weight="600">Visual Paradigm</text>
  <text x="110" y="138" text-anchor="middle" fill="var(--global-text-color-light, #666)" font-size="11">SysML modeler</text>
  <rect x="40" y="165" width="140" height="55" rx="6" fill="var(--global-theme-color, #5b6bcd)" fill-opacity="0.25" stroke="var(--global-theme-color, #5b6bcd)" stroke-width="1"/>
  <text x="110" y="186" text-anchor="middle" fill="var(--global-text-color, #333)" font-weight="600">SEMAA Plugin</text>
  <text x="110" y="202" text-anchor="middle" fill="var(--global-text-color-light, #666)" font-size="11">Splitter + Interpreter</text>
  <text x="110" y="215" text-anchor="middle" fill="var(--global-text-color-light, #666)" font-size="11">WebSocket client</text>

  <!-- Arrow: VP → Relay -->
  <line x1="200" y1="195" x2="300" y2="195" stroke="var(--global-text-color, #333)" stroke-width="1.5" marker-end="url(#arr)" stroke-dasharray="5,3"/>
  <text x="250" y="183" text-anchor="middle" fill="var(--global-text-color-light, #666)" font-size="11">WebSocket</text>
  <text x="250" y="211" text-anchor="middle" fill="var(--global-text-color-light, #666)" font-size="11">(per-user token)</text>

  <!-- Relay Server box -->
  <rect x="300" y="100" width="180" height="100" rx="8" fill="none" stroke="#e67e22" stroke-width="1.5"/>
  <text x="390" y="93" text-anchor="middle" fill="var(--global-text-color, #333)" font-weight="600">VPS (DigitalOcean)</text>
  <rect x="320" y="115" width="140" height="70" rx="6" fill="#e67e22" fill-opacity="0.12" stroke="#e67e22" stroke-width="1"/>
  <text x="390" y="138" text-anchor="middle" fill="var(--global-text-color, #333)" font-weight="600">Relay Server</text>
  <text x="390" y="155" text-anchor="middle" fill="var(--global-text-color-light, #666)" font-size="11">Static IP endpoint</text>
  <text x="390" y="170" text-anchor="middle" fill="var(--global-text-color-light, #666)" font-size="11">Routes MCP ↔ VP</text>

  <!-- Arrow: Relay → LibreChat -->
  <line x1="480" y1="160" x2="570" y2="160" stroke="var(--global-text-color, #333)" stroke-width="1.5" marker-end="url(#arr)"/>
  <text x="525" y="150" text-anchor="middle" fill="var(--global-text-color-light, #666)" font-size="11">MCP calls</text>

  <!-- LibreChat box -->
  <rect x="570" y="60" width="230" height="220" rx="8" fill="none" stroke="#27ae60" stroke-width="1.5"/>
  <text x="685" y="53" text-anchor="middle" fill="var(--global-text-color, #333)" font-weight="600">semaa.site</text>
  <rect x="590" y="75" width="190" height="50" rx="6" fill="#27ae60" fill-opacity="0.12" stroke="#27ae60" stroke-width="1"/>
  <text x="685" y="96" text-anchor="middle" fill="var(--global-text-color, #333)" font-weight="600">LibreChat</text>
  <text x="685" y="112" text-anchor="middle" fill="var(--global-text-color-light, #666)" font-size="11">Agent runtime + UI</text>
  <rect x="590" y="135" width="85" height="45" rx="5" fill="#27ae60" fill-opacity="0.08" stroke="#27ae60" stroke-width="1"/>
  <text x="632" y="154" text-anchor="middle" fill="var(--global-text-color, #333)" font-size="11" font-weight="600">GraphRAG</text>
  <text x="632" y="170" text-anchor="middle" fill="var(--global-text-color-light, #666)" font-size="10">Doc search</text>
  <rect x="685" y="135" width="95" height="45" rx="5" fill="#27ae60" fill-opacity="0.08" stroke="#27ae60" stroke-width="1"/>
  <text x="732" y="154" text-anchor="middle" fill="var(--global-text-color, #333)" font-size="11" font-weight="600">Private LLMs</text>
  <text x="732" y="170" text-anchor="middle" fill="var(--global-text-color-light, #666)" font-size="10">Modal + vLLM</text>
  <rect x="590" y="192" width="190" height="40" rx="5" fill="#27ae60" fill-opacity="0.08" stroke="#27ae60" stroke-width="1"/>
  <text x="685" y="207" text-anchor="middle" fill="var(--global-text-color, #333)" font-size="11" font-weight="600">SEMAA Agents</text>
  <text x="685" y="222" text-anchor="middle" fill="var(--global-text-color-light, #666)" font-size="10">Orchestrator · Requirements · PlantUML · Evaluator</text>

  <!-- User arrow into LibreChat -->
  <line x1="685" y1="280" x2="685" y2="260" stroke="var(--global-text-color, #333)" stroke-width="1.5" marker-end="url(#arr)"/>
  <text x="685" y="300" text-anchor="middle" fill="var(--global-text-color-light, #666)" font-size="11">Engineer (browser)</text>

  <defs>
    <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--global-text-color, #333)"/>
    </marker>
  </defs>
</svg>
<p style="text-align:center; font-size:0.85rem; color:var(--global-text-color-light); margin-top:0.5rem;">The three-tier architecture: the VP plugin on the user's machine talks to a relay server (which solves the static-IP problem for MCP), which routes commands to LibreChat where the agents run. Engineers can use LibreChat directly from any browser without the plugin — the plugin just adds live diagram read/write capabilities.</p>
</div>

## Diagram generation: what the agent actually produces

When the agent generates a diagram, it produces PlantUML, the interpreter parses it, and VP renders it as an editable model entity. Not a static image — actual model elements you can click on, connect, and modify. The demo above shows this end-to-end: a natural language request becomes a fully editable SysML diagram inside Visual Paradigm in seconds.

<video controls muted loop preload="metadata" style="width:100%; border-radius:8px;">
  <source src="/projects/semaa/images/Demo-MCP.mp4" type="video/mp4">
</video>
<p style="text-align:center; font-size:0.85rem; color:var(--global-text-color-light); margin-top:0.5rem;">The VP plugin in action: natural language request → PlantUML generation → diagram rendered directly in Visual Paradigm. The agent is context-aware — it reads the current diagram before every response.</p>

## Multi-agent orchestration: why one agent isn't enough

The early version was a single agent. It worked, but there was a recurring failure mode: on complex requests involving long requirements documents, the agent would "lose" earlier constraints. The technical term is context rot — when the relevant information is in the middle of a long prompt, retrieval accuracy degrades significantly. For systems engineering, where you might be working with 50-page technical standards, this is a serious problem.

The fix was to decompose the work across four specialized agents:

- **Orchestrator** — decomposes the request, decides which agents run in what order, keeps the overall goal in focus
- **Requirements Agent** — reads domain documents, extracts and structures the engineering constraints, prepares a modeling-ready summary
- **PlantUML/SysML Generation Agent** — receives only the structured requirements and focuses entirely on generating correct syntax
- **Evaluation Agent** — reviews the output for syntactic validity, structural consistency, and alignment with the original request before it goes to VP

Each agent sees only the context it needs. The PlantUML generator doesn't have to wade through 20 pages of ClassNK maritime regulations — it receives a clean structured summary from the requirements agent. This scoped context strategy is what makes the orchestrated system faster, not just more accurate.

## Benchmarking it: the SEMAA dataset

To actually validate this, I needed a benchmark. There wasn't one — no standardized dataset exists for AI-assisted MBSE diagram generation. So I built one.

The **SEMAA Benchmark** covers 12 diagram generation tasks in the cargo shipbuilding domain, using Nippon Kaiji Kyokai (ClassNK) technical standards as the grounding documents. The tasks span three diagram types (sequence, class, use case) across four mechanical subsystems (Autonomous Docking, Cargo Crane, Electrical Power Management, Automated Propulsion). Each task comes with the source technical documents the model is expected to use.

I tested 14 configurations: orchestrated vs. single-agent, across GPT-5.2, GPT-4.1, GPT-5 mini, Codex 5.2, GPT-5 nano, o4-mini, Gemini 3 Fast, and Gemini 3 Thinking. Two ME graduate students scored each output independently on relevancy, complexity, and correctness using a 1–4 rubric.

The results were unambiguous in one direction and surprising in another.

**Orchestration wins on quality across every model.** The orchestrated GPT-5.2 configuration topped every metric. More interestingly, orchestration improved smaller models proportionally more than large ones — the Evaluation Agent's syntax check catches errors that smaller models make more frequently.

**Orchestration also wins on latency.** This was not obvious going in. You'd expect that routing through four agents would be slower than one. But the single-agent GPT-5.2 frequently peaked above 20 seconds, while the orchestrated version averaged 9–10 seconds. The hypothesis is that single-agent context bloat — having to process requirements documents _and_ generate PlantUML simultaneously — causes the model to spend more time on internal reasoning. The orchestrated version breaks the problem into smaller, focused prompts, and the final generation agent can produce code faster because it's not also synthesizing raw documentation.

The one outlier: orchestrated GPT-5 mini hit 50-second peaks despite decent quality scores. Smaller models seem to struggle with the coordination overhead even when they can handle the individual tasks.

This case study is documented in a paper submitted to ASME IDETC-CIE 2026.

## GraphRAG: document intelligence on the platform

LibreChat supports RAG out of the box, but I integrated **GraphRAG** specifically for the engineering document use case. The difference matters: standard RAG retrieves text chunks at query time. GraphRAG builds a knowledge graph from the documents on ingest — entities, relationships, and cross-references are computed once and stored, so queries can follow multi-hop reasoning paths that chunk retrieval can't support.

The workflow: an engineer uploads a PDF (a requirements document, a technical standard, a design report), the system ingests it into the graph, and the SEMAA agent can then search and query it to ground its diagram generation in the actual document content. The Evaluation Agent's job is easier when the Requirements Agent has structured knowledge rather than raw text to work with.

In June 2026, I added a second SEMAA agent at semaa.site — identical in every way except GraphRAG is disabled. The sponsors wanted to see the comparison directly: the same prompt, answered by SEMAA-with-GraphRAG and SEMAA-without, side by side. It makes the value of the grounding concrete rather than abstract.

## Private model hosting

One of the sponsor priorities was keeping proprietary engineering documents off external APIs. This pushed me to add support for self-hosted LLMs. The stack I landed on:

- **HuggingFace Hub** — model storage and versioning for fine-tuned weights
- **Modal** — on-demand GPU infrastructure, billed per second of compute (no idle cost)
- **vLLM** — inference engine with efficient batching and KV cache reuse
- **LibreChat** — API integration layer, so private models appear as a selectable provider in the same UI

The cold start on first request is about 30 seconds depending on model size. After that, responses are fast. The cost model works because the use case is sporadic: engineers aren't sending continuous queries, so paying only for actual inference time is significantly cheaper than a reserved GPU instance.

## OCR pipeline

Engineering documents are often scanned PDFs — image-based, not text-based. Standard PDF text extraction fails completely on these. I built an async OCR pipeline using **Docling** running on Modal cloud compute. When a user uploads a PDF or image to the chat, the OCR runs in the background. The document shows a "Waiting..." status while processing runs (30–90 seconds for dense technical manuals), and once it's done, the structured markdown goes directly into GraphRAG. The user can keep chatting while it processes.

The key technical choice was Docling over commercial OCR APIs. Docling is layout-aware — it preserves headings, tables, figure references, and document structure, which is exactly what GraphRAG needs to build an accurate knowledge graph. A commercial API gives back flat text and loses all that structure.

## SEMAAPI: project management as a side branch

Running parallel to all of this is an early-stage project called **SEMAAPI** — the SEMAA Agent for Project Management. The idea: use the OpenAI Agents SDK to build an agent that generates project reports, schedules, and management summaries from engineering documents, then deploy it as a provider in LibreChat alongside the diagramming agents.

The use case is that a project manager uploads a set of meeting notes, design documents, or work packages, and the agent synthesizes them into structured reports: progress summaries, schedule analyses, action item tracking. LibreChat's multi-provider architecture means this agent sits in the same UI as the MBSE diagramming agent — the engineer doesn't need another tool.

This is early. The core agent works for basic report generation, but the scheduling and cross-document synthesis capabilities are still being developed.

## What didn't work and what I'd do differently

The relay architecture is functional but has failure modes. A lost WebSocket connection between the plugin and relay breaks the MCP link silently — the agent calls the VP tool, the relay routes the command, but nothing happens. The one-click reconnect flow handles this now, but it took several iterations to make it robust enough that users weren't spending time debugging connection state instead of working on diagrams.

The SEMAADB benchmark is small. 12 tasks, three diagram types, one domain. It's enough to show the orchestration effect clearly, but it doesn't tell you much about performance on block definition diagrams, parametric diagrams, or deployment diagrams. Expanding it is the next research priority.

The latency on smaller orchestrated models (GPT-5 nano hitting 50 seconds) suggests the coordination overhead is non-trivial. For real-time engineering workflows, 50 seconds between a natural language request and a rendered diagram is too slow. The practical recommendation from the evaluation: use large models for complex multi-diagram design sessions and reserve smaller models for incremental edits to existing diagrams.

## What's next

The sandbox agent work from May 2026 is worth expanding. The idea is to run diagram validation inside an isolated Docker container (using the official PlantUML image) before returning results to the user. This catches syntax errors at generation time rather than at import time, and the feedback loop — generate, validate, repair, re-validate — is something the Evaluation Agent can drive automatically. It's a cleaner version of what the Evaluation Agent does today.

Wiki-LLM is a longer-term direction. Rather than re-deriving knowledge from documents at every query, the idea is to maintain a persistent, LLM-curated knowledge base — entity pages, concept summaries, cross-linked relationships — that accumulates and improves over time. For the maritime engineering domain specifically, where you're working with the same ClassNK standards repeatedly, this would be significantly more efficient than repeated RAG retrieval.

SysML v2 support is eventually necessary. The current implementation targets SysML v1.6 via Visual Paradigm. SysON, the open-source SysML v2 tool, has web-based architecture and open APIs that would integrate well with the LibreChat-centric platform model. Getting there requires extending the PlantUML interpreter to handle the v2 syntax or replacing it with a different intermediate representation entirely.
