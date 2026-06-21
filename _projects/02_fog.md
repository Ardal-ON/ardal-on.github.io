---
layout: page
title: "From Filters to VLMs: Benchmarking Defogging Methods through Object Detection and Segmentation Performance"
description: Evaluating defogging methods by downstream object detection and segmentation performance
img: assets/img/projects/fog.webp
importance: 2
year: 2026
category: research
permalink: /projects/fog/
show_in_grid: false
---

**Ardalan Aryashad**, Parsa Razmara, Amin Mahjoub, Seyedarmin Azizi, Mahdi Salmani, Arad Firouzkouhi<br>
_5th Workshop on Image, Video, and Audio Quality Assessment &middot; WACV 2026 &middot; Oral_

<div class="pub-links-row">
  <a href="https://aradfir.github.io/filters-to-vlms-defogging-page/" target="_blank" class="pub-tag">Project Page</a>
  <a href="https://arxiv.org/abs/2510.03906" target="_blank" class="pub-tag">arXiv</a>
</div>

---

## Overview

This benchmark evaluates defogging methods by how much they improve downstream vision tasks such as object detection and segmentation. The study compares performance across synthetic and real-world datasets to reveal gaps in generalization when models trained on synthetic data are applied to real scenes.

## Key Findings

The benchmark tests roughly 30 defogging pipelines on Cityscapes (synthetic) and ACDC (real) datasets. Results show that improvements on synthetic data often fail to transfer to real-world conditions, emphasizing the need for evaluation based on downstream task performance rather than visual quality alone.

{% include figure.liquid path="projects/fog-removal-benchmark/images/Fog Icon.webp" caption="Fog Removal Benchmark" class="img-fluid rounded" style="max-width: 300px; margin: auto; display: block;" %}
