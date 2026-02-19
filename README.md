# 🧬 PharmaGuard — AI-Powered Pharmacogenomic Risk Intelligence Platform

**Precision Medicine • Explainable AI • Clinical Decision Support**

🌐 **Live Application:** [https://pharmaguard-eslt.onrender.com](https://pharmaguard-eslt.onrender.com)

🎥 **Demo Video:** 
[Click to Watch](https://drive.google.com/file/d/1NAB_OSuL_1cgS4Zwk2kczQjk_WV1f1tK/view?usp=drivesdk) 

Built for the **RIFT 2026 Hackathon — Pharmacogenomics / Explainable AI Track**

---

## 🚀 The Vision

Modern medicine still prescribes drugs using population averages — while genetics determines how each individual responds to medication.

**PharmaGuard** transforms raw genomic data into **clinically actionable intelligence**, enabling safer, personalized drug prescribing through pharmacogenomics and explainable artificial intelligence.

Our system analyzes patient VCF genomic files and predicts drug response risks while generating understandable clinical reasoning for healthcare professionals.

---

## 🧠 Problem Statement

Adverse Drug Reactions (ADRs) cause thousands of preventable deaths every year. Many occur because genetic differences affect drug metabolism.

Healthcare professionals face three major barriers:

* Complex genomic data interpretation
* Lack of explainable AI in medical tools
* Limited clinical workflow integration

PharmaGuard solves this by delivering **real-time pharmacogenomic decision support** through an intuitive web platform.

---

## ✨ Platform Features (Implemented in Website)

### 📂 1. Genomic VCF Upload & Validation

* Upload authentic **VCF (Variant Call Format v4.2)** files
* File validation before processing
* Structured genomic parsing
* Supports real pharmacogenomic annotations:

  * Gene symbols
  * Star alleles
  * RSIDs

---

### 💊 2. Multi-Drug Analysis Engine

Users can analyze one or multiple drugs simultaneously.

Supported drugs include:

* Codeine
* Warfarin
* Clopidogrel
* Simvastatin
* Azathioprine
* Fluorouracil

✔ Comma-separated or multi-input drug selection
✔ Automatic validation

---

### 🧬 3. Pharmacogenomic Gene Detection

The system evaluates clinically critical genes:

* CYP2D6
* CYP2C19
* CYP2C9
* SLCO1B1
* TPMT
* DPYD

Outputs include:

* Diplotype prediction (*X/*Y)
* Metabolizer phenotype (PM, IM, NM, RM, URM)
* Variant-level detection

---

### ⚠️ 4. AI Drug Risk Prediction

Each drug receives a personalized classification:

| Risk Level      | Meaning                     |
| --------------- | --------------------------- |
| ✅ Safe          | Standard usage recommended  |
| ⚠ Adjust Dosage | Modified dosing required    |
| ❌ Toxic         | High adverse reaction risk  |
| 🚫 Ineffective  | Reduced therapeutic benefit |
| ❓ Unknown       | Insufficient evidence       |

Includes:

* Confidence scoring
* Severity grading
* Gene-based justification

---

### 🧾 5. Explainable AI Clinical Reports

Unlike black-box AI systems, PharmaGuard explains *why* risks occur.

Powered by **Groq** LLM infrastructure:

* Variant-specific explanations
* Biological metabolism pathways
* Clinical reasoning summaries
* Physician-friendly language

---

### 📋 6. CPIC-Aligned Recommendations

Clinical recommendations follow guidance inspired by the
**Clinical Pharmacogenetics Implementation Consortium**.

Outputs include:

* Dose adjustments
* Drug alternatives
* Monitoring advice

---

### 📊 7. Interactive Clinical Dashboard

Your deployed platform includes a complete workflow UI:

✅ Dashboard overview
✅ Risk visualization badges
✅ Expandable clinical insights
✅ Patient-friendly structured results

Color-coded interpretation:

* Green → Safe
* Yellow → Adjust
* Red → Toxic / Ineffective

---

### 📈 8. ROI Calculator (Healthcare Impact Feature)

Unique innovation included in your app:

* Estimates economic impact of pharmacogenomic testing
* Demonstrates cost savings from prevented ADRs
* Useful for hospitals and policy decision-makers

---

### 🕓 9. Analysis History Tracking

* Stores previous analyses
* Enables comparison of patient results
* Improves clinical workflow continuity

---

### 🔐 10. Authentication & User Workspace

Platform includes:

* Login interface
* User-specific workflow
* Personalized analysis environment

---

### ⚙️ 11. Settings & Configuration Panel

Users can manage:

* Preferences
* Analysis behavior
* Workflow customization

---

### 📦 12. Hackathon-Compliant JSON Output

Generates structured outputs matching required schema:

```json
{
  "patient_id": "PATIENT_XXX",
  "drug": "DRUG_NAME",
  "timestamp": "ISO8601",
  "risk_assessment": {
    "risk_label": "Safe | Adjust Dosage | Toxic",
    "confidence_score": 0.0,
    "severity": "low | moderate | high | critical"
  },
  "pharmacogenomic_profile": {
    "primary_gene": "GENE",
    "diplotype": "*X/*Y",
    "phenotype": "PM|IM|NM|RM|URM"
  }
}
```

✔ Downloadable
✔ Copy-to-clipboard
✔ Evaluation-ready

---

## 🏗️ System Architecture

```
User Interface (React Dashboard)
          ↓
VCF Upload & Validation Layer
          ↓
Gene Filtering Engine
          ↓
Diplotype & Phenotype Prediction
          ↓
Drug Risk Classification
          ↓
CPIC Recommendation Engine
          ↓
LLM Explainability Generator
          ↓
Results Dashboard + JSON Export
```

---

## ⚙️ Tech Stack

### Frontend

* React + TypeScript
* Vite
* Modular clinical UI components

### Backend

* Node.js + Express
* REST API architecture
* File upload middleware

### AI Layer

* LLM explanation service
* Explainable reasoning pipeline

### Deployment

Hosted publicly using **Render**

---

## 🔄 Application Workflow

1. User logs into platform
2. Uploads genomic VCF file
3. Selects drug(s)
4. System parses genetic variants
5. Risk predictions generated
6. AI explanation produced
7. Results displayed and saved to history
8. JSON report available for download

---

## 📡 API Endpoint

### `POST /api/analyze`

**Input**

* Multipart VCF file
* Drug names

**Output**

* Risk assessment
* Pharmacogenomic profile
* Clinical recommendations
* AI explanation

---

## 🧪 Quality & Evaluation Alignment

✔ VCF parsing validation
✔ Required JSON schema compliance
✔ Explainable reasoning
✔ Clinical recommendation alignment
✔ Live deployed application

---

## 🛠️ Local Setup

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

```
http://localhost:3000
```

---

## 📁 Repository Structure

```
frontend/
  views/
  components/
  services/

backend/
  src/
    controllers/
    services/
    routes/
  sample-data/
.env.example
README.md
```

---

## 🌍 Real-World Impact

PharmaGuard enables:

* Safer prescriptions
* Reduced adverse drug reactions
* Faster genomic interpretation
* Personalized healthcare decisions

**Our mission:**
Move healthcare from reactive treatment → predictive precision medicine.

---

## 👥 Team & Roles

Jidnyasa Patil-AI/ML Engineer, 

Asmi Tatawar-Frontend Developer, 

Swarada Deshpande-Backend Developer

---

## 📜 License

MIT License — open for research and educational innovation.
