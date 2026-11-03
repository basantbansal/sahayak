# Sahayak (सहायक) — Voice-First Multilingual Welfare Scheme & Document Pre-Checker

> Built for the **Sarvam AI Hackathon**. A voice-first Indian welfare scheme and document pre-verification navigator designed for Bharat citizens in their local languages.

---

## 📌 Problem Statement

Every year, millions of eligible Indian students and citizens miss out on government welfare and scholarship programs (like the Post-Matric Scholarship or Central Sector Scheme) due to two major bottlenecks:
1. **Linguistic & Literacy Barriers**: Complex portal guidelines in English or administrative jargon prevent first-generation learners and rural applicants from understanding eligibility.
2. **Silent Document Rejections**: Submissions to Direct Benefit Transfer (DBT) and National Scholarship Portals (NSP) frequently fail at the automated KYC stage due to subtle clerical inconsistencies between Aadhaar and Income Certificates (such as minor name spelling mismatches or transposed birth dates).

---

## 🚀 What Sahayak Does

- **Voice-First Indic Querying**: Users speak naturally into the browser mic in Hindi, Marathi, Tamil, English, etc.
- **Accurate Speech-to-Text (STT)**: Uses Sarvam AI's **Saaras v4** model to transcribe spoken audio and detect language.
- **Strict, Grounded Scheme Navigation**: Uses Sarvam AI's **Sarvam-105B** foundation model with a zero-hallucination policy to answer eligibility, income ceilings, and document requirements strictly from verified scheme data (`schemes.json`).
- **Natural Voice Playback (TTS)**: Synthesizes responses back to audio via Sarvam AI's **Bulbul v4-flash** text-to-speech with a single-click "Suno / सुनो" audio button.
- **Deterministic Document Pre-Verification**: An offline, rule-based verification engine that compares sample citizen documents (Aadhaar vs. Income Certificate) for spelling parity (Levenshtein fuzzy matching) and DOB alignment, producing a high-contrast Red/Green "Rejection Risk" report with actionable remediation guidance before submission.
- **Honest Feedback**: Real-time transparent error notifications for any API anomaly, with zero fake mock data.

---

## 🏛️ Architecture & Data Flow

```text
[ Citizen Speaks ] 🎙️
       │
       ▼ (Audio Blob: WebM/WAV)
[ /api/transcribe ] ───► [ Sarvam Saaras v4 STT API ]
       │
       ▼ (Transcript & Detected Language Code)
[ /api/chat ] ─────────► [ Sarvam-105B Completions API ]
       │                  └─ Evaluates against data/schemes.json
       ▼ (4-Line Grounded Answer)
[ /api/tts ] ──────────► [ Sarvam Bulbul v4-Flash TTS API ]
       │
       ▼ (Base64 WAV Audio)
[ Browser Audio Player ] 🔊 ("Suno / सुनो")

─────────────────────────────────────────────────────────────
[ Document Pre-Check Engine (Deterministic TS) ]
   ├── Sample Aadhaar (JSON)
   └── Sample Income Certificate (JSON)
       │
       ├── Levenshtein Fuzzy String Match (Name)
       ├── Date Component Match (DOB)
       └── Income Threshold Evaluator
       │
       ▼
[ Rejection Risk Report + Exact Remediation Steps ]
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router, Server Components + API Routes)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Bharat-first palette)
- **Icons**: Lucide React
- **AI Infrastructure (Sarvam AI)**:
  - Speech-to-Text: `saaras:v4` (REST API)
  - LLM Reasoning: `sarvam-105b` (Zero-hallucination chat completions)
  - Speech Synthesis: `bulbul:v4-flash` (Indic TTS)

---

## 📋 Included Verified Schemes (`data/schemes.json`)

1. **Post-Matric Scholarship for SC Students**
   - *Ministry*: Ministry of Social Justice and Empowerment
   - *Income Ceiling*: ₹2,50,000 / year
   - *Official Portal*: [https://scholarships.gov.in](https://scholarships.gov.in)
2. **Central Sector Scheme of Scholarship for College and University Students (PM-USP CSSS)**
   - *Ministry*: Department of Higher Education, Ministry of Education
   - *Criteria*: >80th percentile in Class 12, regular college degree
   - *Income Ceiling*: ₹4,50,000 / year
   - *Official Portal*: [https://scholarships.gov.in](https://scholarships.gov.in)

---

## 🧪 Local Setup & Verification

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd sarvam-sahayak
   ```

2. **Configure Environment Variables**:
   Create a `.env.local` file:
   ```env
   SARVAM_API_KEY=your_sarvam_api_key_here
   ```

3. **Install Dependencies & Build**:
   ```bash
   npm install
   npm run build
   ```

4. **Run Server**:
   ```bash
   npm run start
   # or for development:
   npm run dev
   ```

5. **Live Deployment**:
   - Vercel: Deploy directly by importing the GitHub repository and adding `SARVAM_API_KEY` under Environment Variables.
   - Live URL: `[Placeholder for Vercel Deployment Link]`

---

## ⚠️ Disclaimer

*Pre-check only. Final decision rests with the office.*
*यह केवल पूर्व-जांच है। अंतिम निर्णय संबंधित सरकारी कार्यालय का होगा।*
