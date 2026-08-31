# 04 — AI_CLIMATE_RESILIENCE.ipynb Prompts
**Problem 2: Turning AI Innovation into Real-World Climate Solutions**
**Target: UbuntuNet Alliance Call for AI Innovations in Climate Resilience — US$10,000 / 12 months**
**Requirement: Existing working prototype → demonstrable decision-support application**

---

## Why This Wins the UbuntuNet Call
- **Real National Dataset**: KHS 2023/24 (21,347 households across 47 counties) → working prototype built on real data.
- **Measurable AI Advantage**: Machine Learning (HistGradientBoosting / RandomForest + SHAP) outperforms baseline non-AI models with proven ROC-AUC & PR-AUC gains.
- **Compound Infrastructure Shocks**: Directly addresses co-occurring climate shocks (flooding, water disruptions, impassable roads, electricity outages).
- **Data-Constrained Feasibility**: Operates in data-sparse settings without relying on costly real-time satellite imagery or IoT sensor grids.
- **Population-Scale Impact**: Escalates 2019 KNBS Census statistics to 2026 projections to compute actual citizens exposed to climate risk.
- **Institutional Alignment**: Kenya is a core UbuntuNet Alliance member state; developed at Strathmore University. ✅

---

## Notebook Architecture
```
AI_CLIMATE_RESILIENCE.ipynb
├── S0: Setup, Codebook Decoding & 2026 County Population Escalation
├── S1: MNAR Fills, Text Decoding & 4-Chart Climate Shock EDA
├── S2: Household Climate Vulnerability Index (CVI) & Population at Risk
├── S3: Anti-Leakage Feature Audit & Stratified 70/15/15 Train/Val/Test Split
├── S4: ML Pipeline — Baseline vs Imbalance-Tuned Tree Ensembles & Threshold Tuning
├── S5: Explainable AI (XAI) & SHAP Feature Attribution
├── S6: County Climate Adaptation Capacity Index (CACI) via Data Envelopment Analysis (DEA-BCC)
├── S7: Integrated Population-Weighted Decision-Support Engine & Policy Quadrant Matrix
└── S8: Innovation Brief & UbuntuNet Grant Proposal Pitch
```

---

## PROMPT S0 — Setup & 2026 Population Escalation

```python
"""
Create notebook setup cell:
1. Imports: pandas, numpy, matplotlib, seaborn, sklearn (LogisticRegression, RandomForestClassifier, HistGradientBoostingClassifier, StandardScaler, OrdinalEncoder, ColumnTransformer, precision_recall_curve, roc_auc_score, average_precision_score), imblearn (SMOTE), PuLP (for DEA-BCC LP), SHAP, pathlib, warnings.
2. Global Styling: sns.set_theme(style='whitegrid'); plt.rcParams['figure.dpi'] = 120
3. Load Dataset: df = pd.read_parquet('../Master/master_dirty.parquet') -> (21,347 HHs, 528 cols)
4. Load 2026 County Population Escalation Lookup (KPHC 2019 projected at 2.3% CAGR to 2026)
5. Print data load verification and total 2026 national population baseline.
"""
```

---

## PROMPT S1 — MNAR Fills & 4-Chart Climate Shock EDA

```python
"""
1. Engineer Target (BEFORE Split):
   df['compound_climate_disruption'] = (
       (df['disruption_water_supply'] == 1) |
       (df['disruption_road_access'] == 1) |
       (df['disruption_electricity'] == 1) |
       (df['neighbourhood_problem_flooding'].fillna(0) == 1)
   ).astype(int)

2. MNAR Imputations & Categorical Decoding:
   - Fill missing road ratings with county median
   - Impute missing wall/roof/floor quality scores
   - Decode categorical text descriptions for main cooking fuel, wall materials, etc.

3. Render 2x2 Visualization Grid:
   a) Stacked Bar: Disruption Profile by Type (Water, Road, Electricity, Flooding) across Top 20 Exposed Counties
   b) Dot Plot: Urban vs Rural Compound Climate Vulnerability Disparity
   c) Box Plot: Household Income Distribution by Compound Shock Exposure (0 vs 1)
   d) Heatmap: Co-occurrence Matrix of Climate Shocks (Flooding, Water, Road, Electricity, Hazard Dwelling)

4. Print executive summary finding paragraph.
"""
```

---

## PROMPT S2 — Household Climate Vulnerability Index (CVI)

```python
"""
Construct Household CVI (No ML leakage — Index Construction):

1. Standardize 4 Vulnerability Components:
   - Hazard Exposure: dwelling_in_hazard_prone_area + neighbourhood_problem_flooding + hh_problem_flooding
   - Structural Fragility: 10 - (dwelling_wall_quality_score + dwelling_roof_quality_score + dwelling_floor_quality_score)
   - Isolation & Accessibility Deficit: distance_to_nearest_road_km + road_impassable_months_per_year
   - Economic Strain: Low income + high dependency ratio

2. Compute CVI Score & Classify into Tiers:
   CVI = Mean(z-scores of 4 components)
   CVI_tier = pd.cut(CVI, bins=[-inf, -0.3, 0.3, 1.0, inf], labels=['Low', 'Moderate', 'High', 'Critical'])

3. Aggregate County-Level Vulnerability:
   - Calculate mean CVI and % Households at Critical CVI
   - Project 2026 Population at Critical Vulnerability per County:
     citizens_critical_cvi_2026 = county_pop_2026 * pct_critical_cvi

4. Render 2-Chart Grid:
   a) Horizontal Bar: Top 15 Counties by Mean Household CVI
   b) Scatter Plot: County Mean CVI vs EIA Approval Rate
"""
```

---

## PROMPT S3 — Anti-Leakage Feature Audit & Stratified Split

```python
"""
1. Anti-Leakage Assertion:
   Ensure compound_climate_disruption components ('disruption_water_supply', 'disruption_road_access',
   'disruption_electricity', 'neighbourhood_problem_flooding') are strictly EXCLUDED from X.

2. Stratified 70/15/15 Split:
   stratify_key = county_code.astype(str) + '_' + is_urban_household.astype(str)
   Split into Train (70%), Validation (15%), and Test (15%) sets.

3. Feature Preprocessing Pipeline (Fit on TRAIN only):
   - Categorical Features: OrdinalEncoder / OneHotEncoder
   - Continuous Features: StandardScaler
   - Binary Flags: Passthrough
"""
```

---

## PROMPT S4 — Machine Learning Pipeline & Threshold Tuning

```python
"""
1. Train Models on Training Set:
   a) Baseline Logistic Regression (class_weight='balanced')
   b) Imbalance-Tuned Random Forest Classifier (class_weight='balanced_subsample')
   c) HistGradientBoostingClassifier (with class weighting / SMOTE)

2. Evaluate Models on Test Set:
   - Compute ROC-AUC, PR-AUC, F1-Score, Precision, and Recall
   - Print Model Performance Comparison Table

3. Decision Threshold Tuning (Validation Set):
   - Plot Precision-Recall curve on Validation Set
   - Select optimal threshold maximizing F1-Score on Validation Set
   - Apply optimal threshold to Test Set predictions

4. Render Evaluation Visualization:
   - 3-Panel Figure: ROC Curves, PR Curves, Threshold vs F1 Optimization
"""
```

---

## PROMPT S5 — Explainable AI (XAI) & SHAP Attribution

```python
"""
1. Compute SHAP Values on Test Set for Best Tree Ensemble Model.
2. Render SHAP Beeswarm Summary Plot (Top 15 Features).
3. Render Feature Importance Bar Plot.
4. Output Markdown Bullet List of Top 5 Physical & Socio-Economic Drivers of Compound Climate Shocks in Kenya.
"""
```

---

## PROMPT S6 — County Climate Adaptation Capacity Index (CACI via DEA-BCC)

```python
"""
Deterministic DEA Linear Programming Model using PuLP:

1. Formulate Input-Oriented Variable Returns to Scale (BCC) DEA Model:
   - Inputs (Adaptation Resources):
     * county_eia_approval_rate
     * county_water_system_efficiency
     * county_planning_staff_count
     * county_water_storage_capacity_m3 (log1p)
   - Outputs (Resilience Outcomes):
     * % Households Free of Compound Climate Disruption (1 - mean_disruption)
     * % Households Free of Flooding
     * % Households with High Structural Quality Walling

2. Solve DEA LP for all 47 Counties:
   min theta_k
   subject to:
     sum(lambda_j * input_j) <= theta_k * input_k
     sum(lambda_j * output_j) >= output_k
     sum(lambda_j) = 1 (BCC Convexity)
     lambda_j >= 0

3. Store theta_k as CACI_score and Classify:
   CACI_tier = pd.cut(CACI_score, [0, 0.4, 0.7, 1.0], labels=['Low Capacity', 'Moderate', 'High/Frontier'])

4. Render CACI Distribution Bar Chart across 47 Counties.
"""
```

---

## PROMPT S7 — Integrated Population-Weighted Decision-Support Engine

```python
"""
1. Merge County Data:
   Combine 2026 County Population Projections, Mean ML Predicted Risk, Mean CVI, and DEA CACI Scores.

2. Compute Integrated Urgency Index:
   Urgency = 0.40 * norm(mean_ML_pred_risk) + 0.35 * norm(mean_CVI) + 0.25 * (1 - CACI_score)
   Classify Urgency into Low, Moderate, High, Critical.

3. Project 2026 Citizens at Risk:
   citizens_at_risk_2026 = (county_pop_2026 * mean_ML_pred_risk).round()

4. Policy Quadrant Matrix (CACI vs ML Risk):
   - Q1 (High Risk + Low CACI): CRITICAL — Emergency Climate Adaptation & Infrastructure Fund
   - Q2 (High Risk + High CACI): PRIORITY — Capacity Mobilization & Early Warning Systems
   - Q3 (Low Risk + Low CACI): PREVENTATIVE — Structural Capacity Building
   - Q4 (Low Risk + High CACI): BEST PRACTICE — Model Resilience Knowledge Sharing

5. Render 2D Policy Quadrant Scatter Plot & Top 20 Urgency Bar Chart.
6. Export: county_climate_recommendations.csv
"""
```

---

## PROMPT S8 — Innovation Brief & UbuntuNet Pitch Summary

```python
"""
Generate comprehensive Markdown summary cell for UbuntuNet Alliance Grant ($10,000 / 12 Months):
- Project Title & Abstract
- Core Problem & Key Findings (with exact 2026 population figures)
- AI Model Superiority (ROC-AUC gain over baseline)
- 12-Month Deployment Roadmap (Streamlit decision-support dashboard for county planning offices)
- Budget Breakdown ($10,000 USD allocation)
- Institutional & Governance Alignment
"""
```
