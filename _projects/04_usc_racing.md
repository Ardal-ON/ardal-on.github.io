---
layout: page
title: USC Racing — Suspension & Data Acquisition
description: From cutting bushings on a lathe to welding car setup data into the log files — two years on USC's Formula SAE team.
img: assets/img/projects/usc-racing.webp
importance: 4
year: 2026
ongoing: true
category: engineering
period: Fall 2024 – Present
permalink: /projects/usc-racing/
---

<div class="pub-links-row" style="margin-bottom: 1.5rem; display:flex; flex-wrap:wrap; gap:0.5rem;">
  <span class="pub-tag">🏆 1st in Autocross — FSAE Michigan 2026</span>
  <span class="pub-tag">🏁 7th Overall (Top 10 of ~120 teams)</span>
  <span class="pub-tag">🎤 Design Finals — 3rd appearance, 2nd in a row</span>
  <span class="pub-tag">🥉 First-ever team podium — 3rd in Autocross, 2025</span>
</div>

**Ardalan Aryashad** &mdash; USC Racing (Formula SAE) &middot; Suspension & Data Acquisition

<!-- TODO: Confirm exact competition names/years. Inferred FSAE Michigan 2025 (first podium, 6th in Design Final) and FSAE Michigan 2026 (1st autocross, 7th overall) from the timeline. Adjust venue/year if different. -->

---

I joined USC Racing in Fall 2024, and the last two years on this team were the best and most rewarding years I've had. This page is the story of the parts I machined, the optimization study I ran, the design decision I defended in front of judges, and the data infrastructure I built so that 60 people could actually _use_ the data the car was generating.

## The best year in team history

Let me put the results first.

At the most recent competition, USC Racing **won the autocross event outright** — first place — and finished **7th overall out of roughly 120 teams**. We reached the **Design Finals** for the third time in team history and the second year in a row: the top 10 teams, pulled aside so every judge can come at you personally with deep, specific questions about why you made each design choice. It was, by every measure, the best competition the team has ever had.

The year before, we'd already broken new ground: our **first-ever podium**, finishing **3rd in autocross**, and our second-ever trip to the Design Finals, where we placed **6th**. Getting onto that podium the first time is what convinced everyone the program had turned a corner.

The piece I'm proudest of is quieter. The data acquisition system we built drew a comment from the judges that we hadn't dared hope for — that it was **on the level of an F1 team**, and that they didn't expect to see anything close to it at a student competition. For a system I started as a single Raspberry Pi in a backpack, that meant a lot.

---

## Cutting metal: suspension and manufacturing

My first year was almost entirely hands-on. I learned to manufacture by manufacturing.

I machined the **suspension bushings** on the lathe, cut parts on the **water jet**, and assembled full **suspension corners** — the uprights, control arms, and all the hardware that ties a wheel to the chassis — as well as working on the **chassis** itself. Over the year I was on track for **all of the team's test days**, from shaking down the previous car (SCR24) and running it at the SoCal Shootout, through to building and testing the new car (SCR25).

There's a particular kind of learning that only happens when the part you manufactured is the part bolted to a car doing 60 mph on a track. Test days are where the design assumptions meet reality, and being there for all of them is what later told me exactly what the team was missing — but more on that below.

---

## How light is light enough? — unsprung mass optimization

The first engineering question I got to chase was deceptively simple: _how light should the wheel package actually be?_

Unsprung mass — the wheel, upright, and everything that moves with them over a bump — is something everyone "knows" you want to minimize. But minimizing it costs money, stiffness, and time, so I wanted a real answer for _our_ car, not a rule of thumb. I built a **quarter-car model** and ran a **genetic-algorithm optimization** to find the mass distribution that maximized tire grip over a bump input.

<div style="margin: 2rem 0;">
  <svg viewBox="0 0 760 440" xmlns="http://www.w3.org/2000/svg" style="width:100%; max-width:560px; height:auto; display:block; margin:0 auto; font-family:inherit;">
    <defs>
      <pattern id="hatch" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="8" stroke="var(--global-text-color-light)" stroke-width="1"/>
      </pattern>
    </defs>
    <!-- sprung mass -->
    <rect x="230" y="30" width="300" height="70" rx="4" fill="none" stroke="var(--global-theme-color)" stroke-width="2"/>
    <text x="380" y="62" text-anchor="middle" fill="var(--global-text-color)" font-size="16" font-weight="600">Sprung mass m₁</text>
    <text x="380" y="84" text-anchor="middle" fill="var(--global-text-color-light)" font-size="12">car body (≈ 207 → 192 kg total)</text>
    <!-- suspension spring + damper -->
    <text x="300" y="135" text-anchor="middle" fill="var(--global-text-color-light)" font-size="12">k₁</text>
    <path d="M300 100 l-12 12 l24 12 l-24 12 l24 12 l-12 12" fill="none" stroke="var(--global-text-color)" stroke-width="1.6"/>
    <line x1="300" y1="172" x2="300" y2="190" stroke="var(--global-text-color)" stroke-width="1.6"/>
    <text x="465" y="135" text-anchor="middle" fill="var(--global-text-color-light)" font-size="12">c₁ (ζ≈0.7)</text>
    <rect x="452" y="108" width="26" height="44" fill="none" stroke="var(--global-text-color)" stroke-width="1.6"/>
    <line x1="465" y1="100" x2="465" y2="108" stroke="var(--global-text-color)" stroke-width="1.6"/>
    <line x1="465" y1="130" x2="465" y2="190" stroke="var(--global-text-color)" stroke-width="1.6"/>
    <!-- unsprung mass -->
    <rect x="260" y="190" width="240" height="60" rx="4" fill="none" stroke="var(--global-theme-color)" stroke-width="2"/>
    <text x="380" y="216" text-anchor="middle" fill="var(--global-text-color)" font-size="16" font-weight="600">Unsprung mass m₂</text>
    <text x="380" y="236" text-anchor="middle" fill="var(--global-text-color-light)" font-size="12">wheel + upright (≈ 25–27 kg/corner)</text>
    <!-- tire spring -->
    <text x="380" y="285" text-anchor="middle" fill="var(--global-text-color-light)" font-size="12">k₂ — tire (94 kN/m)</text>
    <path d="M380 250 l-12 12 l24 12 l-24 12 l24 12 l-12 12" fill="none" stroke="var(--global-text-color)" stroke-width="1.6"/>
    <line x1="380" y1="322" x2="380" y2="340" stroke="var(--global-text-color)" stroke-width="1.6"/>
    <!-- grip force callout -->
    <text x="540" y="300" fill="var(--global-theme-color)" font-size="12" font-weight="600">grip force = k₂ · (tire deflection)</text>
    <!-- road -->
    <rect x="180" y="340" width="400" height="16" fill="url(#hatch)" stroke="var(--global-text-color)" stroke-width="1.5"/>
    <text x="380" y="385" text-anchor="middle" fill="var(--global-text-color)" font-size="13">road input u — bump</text>
    <path d="M300 410 q40 -30 80 0 q40 30 80 0" fill="none" stroke="var(--global-text-color-light)" stroke-width="1.6"/>
  </svg>
  <p style="text-align:center; font-size:0.85rem; color:var(--global-text-color-light); margin-top:0.5rem;">The quarter-car model: a body mass on the suspension spring/damper (k₁, c₁), a wheel mass on the tire spring (k₂), excited by a road bump. Grip is the force the tire pushes into the road — and the goal is to keep that force as steady as possible over a bump.</p>
</div>

The model came straight from our own car's numbers (taken from the SCR24 design data): a total mass of **207.3 kg**, unsprung masses of **24.64 kg front / 26.98 kg rear**, a 48/52 front-rear weight split, suspension rates of 43.2 kN/m front and 27.8 kN/m rear, and a tire stiffness of 94.2 kN/m, with the damper sized for a damping ratio of 0.7. I derived the transfer function from sprung/unsprung dynamics, then turned it loose on a genetic algorithm.

The objective function is where the real problem is defined. "Maximize grip" isn't a single number, so I built a **weighted, normalized score** combining three things measured against the baseline car: **settling time**, **peak tire force**, and **RMS tire force** — for both front and rear. The ideal is a tire that recovers a constant contact force as fast as possible after a bump, with the least sustained oscillation. I constrained the search to keep it physically sane: unsprung-mass changes capped at ±5%, total mass within ±20 kg, and spring rates kept above a sensible floor.

{% include figure.liquid path="projects/usc-racing/images/Suspension Grip optimzation.webp" caption="Tire-force response to a bump, baseline vs. GA-optimized car. The optimized setup (lower sustained ripple, faster settling) trades a slightly larger first overshoot for a tire load that returns to steady grip much sooner — which is what actually matters mid-corner." class="img-fluid rounded" %}

The honest result: the GA wanted to **shed about 15 kg of total mass** (207.3 → 192.1 kg) and trim the front unsprung mass slightly (×0.96), leaving the rear nearly untouched. That bought a **faster settling time and noticeably less sustained tire-load oscillation** at the cost of a marginally higher initial overshoot — a tire that finds steady grip again sooner after every bump. It confirmed the intuition that unsprung mass matters, but it also told us _where_ the payoff was (front more than rear) and _how much_ total mass reduction was worth chasing before the returns flatten out. The next step, which I documented for future work, is complex and realistic road profiles and validating against real damper data from the car.

---

## Choosing tires, and defending it in the Design Finals

For competition I was chosen to present the **tire selection** for the suspension group — running the simulations behind which tire compound and construction the car would race on, and then presenting and defending that decision as part of the suspension design package.

The specifics of that analysis are team knowledge, so I'll keep it general: the work was about matching tire behavior to our car's mass, load transfer, and the demands of the autocross and endurance events, and being able to justify the trade-offs quantitatively rather than by feel.

What I _can_ talk about is what it's like to defend that work in a **Design Final**. The qualifying design judging is almost like a presentation; the final is something else entirely. You make the top 10, and then the judges come to _you_ — and they don't ask surface questions. They want to know why this number, why not that one, what happens if an assumption is wrong, how you validated it. Standing in front of that and being able to answer for your decisions, in detail, under pressure, is one of the things I'm most proud of from the whole two years. We finished **6th in the Design Final** the first year and made it back again the next.

---

## The data that almost nobody looked at

Here's the thing I noticed across all of SCR25's test days: **the most valuable thing the car produced was its data logs, and almost no one could get to them.**

Every run, the car's MoTeC ECU writes a log file packed with everything — oil, coolant, and fuel temperatures and pressures, engine-health channels, the suspension travel at each corner (exactly what you need to tune dampers), GPS, speed, and throttle/brake position for driver coaching. But only **one laptop** on the team could physically connect to the ECU and pull the log. And on track we have **no internet — not even mobile data.** So the one log that mattered got passed around on a **USB stick**, slowly, one person at a time. People who needed the data simply didn't get it, and the analysis that should have happened between runs mostly didn't.

That observation turned into the second half of my time on the team, and eventually into joining the Data Acquisition subteam. Three problems, solved in order: _get the data to everyone, give everyone the same tools to read it, and capture the one thing the logs were missing._

---

## A NAS you can carry to the track

The first problem — sharing — I solved with a server we could bring with us.

The idea: a box that **hosts its own local WiFi**, so on a track with zero connectivity everyone can still join one network, mount a shared folder as a normal network drive (SMB, so it works the same on Windows, Mac, and Linux), and read or write logs at full speed instead of sneaker-netting a USB stick around the paddock.

**Version 1** was deliberately minimal: a single **Raspberry Pi** broadcasting WiFi off its own antenna, with a USB drive as the shared storage. I documented the whole build — the trick is to install OpenMediaVault _first_ and only then layer the access point on top with **hostapd** (the AP), **dnsmasq** (a small DHCP/DNS server handing out leases on the WiFi subnet), and **iptables** for NAT — otherwise the network config and the NAS software fight each other. It worked, and the chief engineer immediately wanted it as real team infrastructure.

So **version 2** got serious. When I joined DAQ, the brief was: make it faster, bigger, and more reliable. We repurposed a **second-hand PC** the team wasn't using, installed **OpenMediaVault** on it, and paired it with a dedicated **WiFi router on a static IP**. My favorite detail: we **powered the router straight off the PC's power supply**, so the entire system is one switch — flip the PC on, the router comes up with it, the SSID starts broadcasting, and anyone in the paddock can connect and start moving files. No laptops, no cables, no waiting.

{% include figure.liquid path="projects/usc-racing/images/Nas System Design.webp" caption="The portable NAS architecture: a single powered-on box broadcasts a local WiFi SSID, and every team laptop mounts the same SMB share as a network drive — full-speed log sharing on a track with no internet." class="img-fluid rounded" %}

---

## One workspace to rule them all

With the data finally flowing, the next bottleneck was the tool everyone used to read it: **MoTeC i2**.

i2 is powerful, but every person on the team had configured it differently — different channels, different math, different layouts. So two engineers couldn't even reliably look at _the same thing_; half of any data session was spent arguing about whether two plots were showing identical data or not. And plenty of people just didn't open i2 at all, because setting it up from scratch wasn't worth the time.

I built a **single shared i2 workspace** that consolidates the genuinely useful stuff — the important plots, **math channels**, warnings, and alarms — into one ready-to-go foundation, organized per subteam. The point wasn't to force everyone into one view; people are free to add and modify whatever they want. The point was to make the _default_ good enough that getting into data analysis takes seconds instead of an afternoon, so people actually do it and go hunting for performance in their own corner of the car.

<div style="display:flex; flex-wrap:wrap; gap:1rem; justify-content:center; margin:1.5rem 0;">
  <div style="flex:1 1 30%; min-width:240px;">
    {% include figure.liquid path="projects/usc-racing/images/Motec I2 Telemetry Suspension.webp" caption="Suspension worksheet — damper velocities, ride height, roll." class="img-fluid rounded" %}
  </div>
  <div style="flex:1 1 30%; min-width:240px;">
    {% include figure.liquid path="projects/usc-racing/images/Motec I2 Telemetry Powertrain.webp" caption="Powertrain worksheet — engine health and performance channels." class="img-fluid rounded" %}
  </div>
  <div style="flex:1 1 30%; min-width:240px;">
    {% include figure.liquid path="projects/usc-racing/images/Motec I2 Telemetry Aero CP.webp" caption="Aero worksheet — center of pressure and downforce channels." class="img-fluid rounded" %}
  </div>
</div>

---

## The missing piece: welding the setup sheet into the logs

This is the project I'm most proud of in the DAQ subteam.

Every run we now had a log, shareable and readable. But the logs were missing the single most important piece of context for actually _learning_ anything: **what the car was set to.** The damper settings (each corner's damper has four adjusters — low- and high-speed compression and rebound), the fuel load, tire ages and serial numbers, spark-plug condition, ride heights, pressures — none of it was recorded. After a test day, the documentation of the car's state ranged from sparse to nonexistent.

Without that, optimization is impossible. You cannot learn how a subsystem responds to a change if you don't know what the change _was_. And you lose the institutional memory: next year's team should be able to look back and see exactly how the car was configured, when it changed, and why.

So I went deep into the MoTeC file format. The ECU writes the binary log as a `.ld` file — but I discovered it also produces a companion **`.ldx` file**, which is plain XML, and that **i2 reads the `.ldx` and surfaces whatever values it finds inside the log view.** There's no documentation for any of this. So I spent about a week **reverse-engineering the `.ldx` schema** — figuring out which XML fields map to which displayed values in i2 — until I could write data into a log that would simply show up when anyone opened it.

Around that, I built a web application:

- **Per-subteam setup forms.** An admin creates users and assigns them to subteams; when you log in you see only _your_ subteam's form. The forms are defined in YAML, one per subteam (suspension, powertrain, aero, drivetrain, chassis, electronics, ergo, driver, DAQ, chief), with typed fields, units, and tabs — the suspension form alone covers dampers, corner alignment, parameters, temperatures, and tires.
- **Smart defaults.** Each field shows the most recently logged value, so you're editing a delta from the last run, not refilling a blank sheet. Every change is audited and visible in an admin dashboard.
- **The automatic injection.** This is the part that made it click. The backend watches the NAS for a new log to appear (the electronics team uploads it right after a run). When one shows up, the server pulls the latest value of every form field, **injects them into the `.ldx`** — text fields as XML detail strings, numeric fields as MoTeC math constants with units — and saves it back. A verification loop re-checks the files and re-injects if i2 ever rewrites them.

<div style="margin: 2rem 0;">
  <svg viewBox="0 0 860 430" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto; font-family:inherit;">
    <defs>
      <marker id="arr" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L8,3 L0,6 Z" fill="var(--global-theme-color)"/>
      </marker>
    </defs>
    <!-- column 1: people -->
    <rect x="20" y="40" width="190" height="90" rx="6" fill="none" stroke="var(--global-text-color)" stroke-width="1.6"/>
    <text x="115" y="70" text-anchor="middle" fill="var(--global-text-color)" font-size="14" font-weight="600">Subteam engineer</text>
    <text x="115" y="92" text-anchor="middle" fill="var(--global-text-color-light)" font-size="11">logs in → sees own form</text>
    <text x="115" y="110" text-anchor="middle" fill="var(--global-text-color-light)" font-size="11">submits setup values</text>

    <rect x="20" y="250" width="190" height="90" rx="6" fill="none" stroke="var(--global-text-color)" stroke-width="1.6"/>
    <text x="115" y="280" text-anchor="middle" fill="var(--global-text-color)" font-size="14" font-weight="600">Electronics</text>
    <text x="115" y="302" text-anchor="middle" fill="var(--global-text-color-light)" font-size="11">uploads .ld log</text>
    <text x="115" y="320" text-anchor="middle" fill="var(--global-text-color-light)" font-size="11">after each run</text>

    <!-- column 2: app/db + NAS -->
    <rect x="310" y="40" width="200" height="120" rx="6" fill="none" stroke="var(--global-theme-color)" stroke-width="2"/>
    <text x="410" y="70" text-anchor="middle" fill="var(--global-text-color)" font-size="14" font-weight="600">Web app</text>
    <text x="410" y="92" text-anchor="middle" fill="var(--global-text-color-light)" font-size="11">FastAPI · Next.js</text>
    <text x="410" y="110" text-anchor="middle" fill="var(--global-text-color-light)" font-size="11">JWT roles · YAML forms</text>
    <text x="410" y="132" text-anchor="middle" fill="var(--global-text-color-light)" font-size="11">SQLite (audited history)</text>

    <rect x="310" y="240" width="200" height="110" rx="6" fill="none" stroke="var(--global-text-color)" stroke-width="1.6"/>
    <text x="410" y="270" text-anchor="middle" fill="var(--global-text-color)" font-size="14" font-weight="600">NAS share</text>
    <text x="410" y="292" text-anchor="middle" fill="var(--global-text-color-light)" font-size="11">.ld  +  .ldx (XML)</text>
    <text x="410" y="318" text-anchor="middle" fill="var(--global-text-color-light)" font-size="11">watched every 5 s</text>

    <!-- column 3: watcher/injection -->
    <rect x="600" y="140" width="230" height="120" rx="6" fill="none" stroke="var(--global-theme-color)" stroke-width="2"/>
    <text x="715" y="172" text-anchor="middle" fill="var(--global-text-color)" font-size="14" font-weight="600">Injector</text>
    <text x="715" y="194" text-anchor="middle" fill="var(--global-text-color-light)" font-size="11">new log → pull latest values</text>
    <text x="715" y="212" text-anchor="middle" fill="var(--global-text-color-light)" font-size="11">write into .ldx XML</text>
    <text x="715" y="230" text-anchor="middle" fill="var(--global-text-color-light)" font-size="11">strings + math constants</text>
    <text x="715" y="248" text-anchor="middle" fill="var(--global-text-color-light)" font-size="11">+ verify / re-inject loop</text>

    <!-- result -->
    <rect x="600" y="300" width="230" height="80" rx="6" fill="none" stroke="var(--global-text-color)" stroke-width="1.6"/>
    <text x="715" y="333" text-anchor="middle" fill="var(--global-text-color)" font-size="13" font-weight="600">i2 opens the log</text>
    <text x="715" y="355" text-anchor="middle" fill="var(--global-text-color-light)" font-size="11">setup sheet shown alongside data —</text>
    <text x="715" y="371" text-anchor="middle" fill="var(--global-text-color-light)" font-size="11">part of the log forever</text>

    <!-- arrows -->
    <line x1="210" y1="85" x2="306" y2="90" stroke="var(--global-theme-color)" stroke-width="1.8" marker-end="url(#arr)"/>
    <line x1="210" y1="295" x2="306" y2="295" stroke="var(--global-theme-color)" stroke-width="1.8" marker-end="url(#arr)"/>
    <line x1="410" y1="160" x2="410" y2="236" stroke="var(--global-theme-color)" stroke-width="1.8" marker-end="url(#arr)"/>
    <line x1="510" y1="290" x2="596" y2="210" stroke="var(--global-theme-color)" stroke-width="1.8" marker-end="url(#arr)"/>
    <line x1="715" y1="260" x2="715" y2="296" stroke="var(--global-theme-color)" stroke-width="1.8" marker-end="url(#arr)"/>
    <text x="250" y="78" fill="var(--global-text-color-light)" font-size="10">setup</text>
    <text x="250" y="288" fill="var(--global-text-color-light)" font-size="10">.ld</text>

  </svg>
  <p style="text-align:center; font-size:0.85rem; color:var(--global-text-color-light); margin-top:0.5rem;">The injection pipeline. Engineers submit setup values through the web app; when electronics uploads a new log to the NAS, a watcher injects the latest setup into the log's companion <code>.ldx</code> file — so the car's exact configuration travels with the data permanently and appears automatically in MoTeC i2.</p>
</div>

The outcome is the thing I find genuinely satisfying: **the setup sheet is now part of the log file, forever.** Open any run in i2 and the car's exact configuration is right there next to the data. No more orphaned spreadsheets, no more "what were the dampers on this run?" And next year's team inherits a complete, searchable history of how the car evolved.

The whole thing is built as a small stack — **FastAPI + SQLite** on the backend, a **Next.js/React** frontend — **dockerized**, and deployed onto **the same NAS**. So it runs on the box we already carry to the track. No cloud, no internet required. This is the system the judges compared to F1.

---

## What's next

I have a few more projects in the pipeline — among them tooling to derive extra channels from track-side audio and a video-telemetry overlay renderer for driver coaching — that I'll add here as they come together.

For now: best competition in team history, a first-ever podium, and a data system that finally does justice to what the car has been telling us all along.

Fight on. ✌️
