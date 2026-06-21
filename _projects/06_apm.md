---
layout: page
title: Automotive Predictive Maintenance
description: ML application for engine fault prediction from automotive sensor data
img: assets/img/projects/apm.webp
importance: 6
year: 2023
category: engineering
period: Fall 2023
permalink: /projects/apm/
---

**Ardalan Aryashad**, Sean Richard, Jian Ni, Junyi Wang<br>
**AME 505**: Engineering Information Modeling &middot; Fall 2023 &middot; USC

<div class="pub-links-row">
  <a href="https://github.com/Ardal-ON/Application" target="_blank" class="pub-tag">Code</a>
  <a href="https://www.kaggle.com/datasets/parvmodi/automotive-vehicles-engine-health-dataset/data" target="_blank" class="pub-tag">Dataset</a>
</div>

---

## Abstract

What if your car could warn you before something goes wrong? In this project, we used real car sensor data and machine learning to predict engine problems early. We cleaned messy data, tested different models, and built a simple mobile app that gives drivers clear and helpful alerts about their car's health.

---

## Designing the Object Model

Every robust system starts with thoughtful design. In our project, that design took the form of an object-oriented model that mirrors how data flows in real vehicles. Before diving into machine learning, we focused on building a structured pipeline that could handle inputs, make predictions, and respond to user feedback.

We designed our object model around several core classes: **Engine**, **Car**, **Sensor**, and **Predictor**. The `Sensor` class was responsible for reading key engine parameters such as RPM, coolant temperature and pressure, oil temperature and pressure, and fuel pressure. These readings served as the input for our prediction system.

The `Predictor` class held the trained machine learning model. It accepted input from the sensors (in the form of `VehicleData` instances from the `Dataset`), handled internal pre-processing, and returned a health prediction. This modular approach ensured that updating the pre-processing method or swapping the model would not break the rest of the system.

We also modeled interactions with the car owner. A maintenance scheduler monitored prediction results and sent notifications to the user. It allowed users to accept or reject suggested maintenance times and updated the app interface based on their choices.

{% include figure.liquid path="projects/apm/images/ObjectModel.webp" caption="Figure 1: Object-oriented model of the predictive maintenance system." class="img-fluid rounded" %}

---

## Dirty Data: Preprocessing for Prediction

Real-world data is rarely clean, and our automotive dataset was no exception. With over 19,000 engine samples, we encountered the usual suspects: outliers, skewed distributions, and uneven scales.

We began with outlier analysis using the **Interquartile Range (IQR)** method. For each feature (RPM, coolant temperature, etc.) we computed the 25th (Q1) and 75th (Q3) percentiles. Values falling below Q1 − 1.5×IQR or above Q3 + 1.5×IQR were flagged as outliers and removed.

After cleaning, we faced **feature scale imbalance** — RPM spans thousands of units while coolant temperature stays in a much smaller range. To give each feature equal weight, we applied MinMax scaling (scikit-learn's `MinMaxScaler`), transforming all features to a 0–1 range.

<div style="display: flex; flex-wrap: wrap; gap: 1.5rem; justify-content: center; margin: 1.5rem 0;">
  <div style="flex: 1 1 260px; max-width: 48%;">
    {% include figure.liquid path="projects/apm/images/data.webp" caption="Figure 2: Raw data before preprocessing." class="img-fluid rounded" %}
  </div>
  <div style="flex: 1 1 260px; max-width: 48%;">
    {% include figure.liquid path="projects/apm/images/preprocessed.webp" caption="Figure 3: Data after outlier removal and MinMax scaling." class="img-fluid rounded" %}
  </div>
</div>

---

## Machine Learning Methods: Finding the Right Fit

With clean data in hand, we tested six different classifiers, each with distinct strengths and weaknesses:

- **Logistic Regression** — fast, interpretable baseline; 66.74% train / 65.91% test.
- **Decision Tree** — learned nonlinear patterns; 68.95% train / 64.59% test (mild overfitting).
- **Random Forest** — ensemble of trees; highest training accuracy (79.33%) but modest test gain (65.64%).
- **k-Nearest Neighbors** — intuitive but overfit heavily; 75.28% train / 62.21% test.
- **Gaussian Naive Bayes** — best generalizer despite independence assumption; 67.09% train / **66.11% test**.
- **Support Vector Machine** — struggled with hyperparameter sensitivity; 64.88% train / 60.77% test.

<div style="overflow-x: auto; margin: 1.5rem 0;">
<table style="border-collapse: collapse; width: 100%; font-size: 0.9rem;">
  <thead>
    <tr style="border-bottom: 2px solid var(--global-divider-color);">
      <th style="padding: 0.5rem 0.75rem; text-align: left;">Model</th>
      <th style="padding: 0.5rem 0.75rem; text-align: center;">Training Accuracy</th>
      <th style="padding: 0.5rem 0.75rem; text-align: center;">Testing Accuracy</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom: 1px solid var(--global-divider-color);">
      <td style="padding: 0.5rem 0.75rem;">Logistic Regression</td>
      <td style="padding: 0.5rem 0.75rem; text-align: center;">66.74%</td>
      <td style="padding: 0.5rem 0.75rem; text-align: center;">65.91%</td>
    </tr>
    <tr style="border-bottom: 1px solid var(--global-divider-color);">
      <td style="padding: 0.5rem 0.75rem;">Decision Tree Classifier</td>
      <td style="padding: 0.5rem 0.75rem; text-align: center;">68.95%</td>
      <td style="padding: 0.5rem 0.75rem; text-align: center;">64.59%</td>
    </tr>
    <tr style="border-bottom: 1px solid var(--global-divider-color);">
      <td style="padding: 0.5rem 0.75rem;">Random Forest Classifier</td>
      <td style="padding: 0.5rem 0.75rem; text-align: center;"><strong>79.33%</strong></td>
      <td style="padding: 0.5rem 0.75rem; text-align: center;">65.64%</td>
    </tr>
    <tr style="border-bottom: 1px solid var(--global-divider-color);">
      <td style="padding: 0.5rem 0.75rem;">K-Neighbors Classifier</td>
      <td style="padding: 0.5rem 0.75rem; text-align: center;">75.28%</td>
      <td style="padding: 0.5rem 0.75rem; text-align: center;">62.21%</td>
    </tr>
    <tr style="border-bottom: 1px solid var(--global-divider-color);">
      <td style="padding: 0.5rem 0.75rem;"><strong>Gaussian Naive Bayes</strong></td>
      <td style="padding: 0.5rem 0.75rem; text-align: center;">67.09%</td>
      <td style="padding: 0.5rem 0.75rem; text-align: center;"><strong>66.11%</strong></td>
    </tr>
    <tr>
      <td style="padding: 0.5rem 0.75rem;">Support Vector Machine</td>
      <td style="padding: 0.5rem 0.75rem; text-align: center;">64.88%</td>
      <td style="padding: 0.5rem 0.75rem; text-align: center;">60.77%</td>
    </tr>
  </tbody>
</table>
<p style="font-size: 0.85rem; color: var(--global-text-color-light); margin-top: 0.5rem; text-align: center;">Table 1: Training and testing accuracy of each machine learning model.</p>
</div>

Our top performer (Gaussian Naive Bayes, 66.11% test accuracy) showed that the dataset itself was a limiting factor — many "healthy" and "faulty" samples had overlapping sensor profiles. Sequential models like LSTMs might improve performance in future work by modeling temporal trends rather than snapshots.

---

## A Mobile-Friendly Dashboard

After building the prediction model, we created a user interface using **Flet** — a Python framework that produces cross-platform apps for Android, iOS, and desktop from a single codebase. Car owners need quick, clear answers, not raw sensor logs. Our app delivers that with three screens:

**Home Page** — enter six engine values (RPM, coolant temp/pressure, oil temp/pressure, fuel pressure), or hit "Randomize" to test different inputs.

{% include figure.liquid path="projects/apm/images/home.webp" caption="Figure 4: Home page for entering engine sensor values." class="img-fluid rounded" zoomable=true %}

**Dashboard Page** — shows the prediction: <span style="color:green;font-weight:600;">Good</span>, <span style="color:orange;font-weight:600;">Poor</span>, or <span style="color:red;font-weight:600;">Bad</span> with clear color labels.

{% include figure.liquid path="projects/apm/images/dashboard.webp" caption="Figure 5: Dashboard page showing the car's predicted condition." class="img-fluid rounded" zoomable=true %}

**Maintenance Page** — a calendar that suggests inspection dates. Users accept or reject suggestions; accepted dates turn green for easy tracking.

{% include figure.liquid path="projects/apm/images/maintenance.webp" caption="Figure 6: Maintenance scheduling calendar." class="img-fluid rounded" zoomable=true %}

---

## Demo

<div style="text-align: center; margin: 1.5rem 0;">
  <video controls muted loop preload="metadata" poster="/projects/apm/images/demo.webp" style="width: 340px; max-width: 100%; border-radius: 8px;">
    <source src="/projects/apm/images/demo.mp4" type="video/mp4">
  </video>
  <p style="font-size: 0.85rem; color: var(--global-text-color-light); margin-top: 0.5rem;">Figure 7: Full app demo.</p>
</div>
