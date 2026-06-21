---
layout: page
title: projects
permalink: /projects/
description: Research and engineering projects in robotics, AI, and mechanical systems.
nav: true
nav_order: 3
horizontal: false
---

<!-- pages/projects.md -->
<div class="projects">
{% assign ongoing_projects = site.projects | where: "ongoing", true | sort: "year" | reverse %}
{% assign finished_projects = site.projects | where_exp: "p", "p.ongoing != true" | sort: "year" | reverse %}
{% assign sorted_projects = ongoing_projects | concat: finished_projects %}
<div class="projects-grid-container">
  <div class="projects-grid">
    {% for project in sorted_projects %}
      {% if project.show_in_grid == false %}{% continue %}{% endif %}
      {% include projects.liquid %}
    {% endfor %}
  </div>
</div>
</div>
