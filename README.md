# Sahayak Margdarshak (सहायक मार्गदर्शक)
### Voice-First Spatial UI Navigation & Multilingual Guidance for Indian Welfare Portals

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Sarvam AI](https://img.shields.io/badge/Sarvam%20AI-Saaras%20v4%20%7C%20Sarvam--105B%20%7C%20Bulbul%20v4--flash-orange?style=flat-square)](https://sarvam.ai/)

> Built for the **Sarvam AI Hackathon**. **Margdarshak (मार्गदर्शक)** is an intelligent, voice-first spatial guidance agent that empowers Bharat citizens to effortlessly navigate dense, complex Indian government welfare portals in Hindi, Hinglish, English, and regional Indic languages.

---

## 📌 The Problem

Every year, millions of eligible Indian students and citizens visit government welfare and Direct Benefit Transfer (DBT) portals—such as the National Scholarship Portal (NSP). However, they face significant usability hurdles:
1. **Dense, Overwhelming Sarkari Interfaces**: Portals feature dozens of nested forms, ambiguous labels, multi-step validation checks, and dense terminology that confuse first-generation learners and rural applicants.
2. **Linguistic & Technological Divide**: Users who are uncomfortable typing or reading complex bureaucratic terms struggle to locate basic affordances (e.g., finding where to enter Date of Birth, where to upload income certificates, or where to track application status).
3. **Static, Fragile Hardcoding**: Traditional search tools or brittle page scripts break when DOM hierarchies shift or when users phrase queries in colloquial Hinglish (e.g., *"mera form jama karne wala button kahan hai"* or *"dob daalna hai"*).

---

## 💡 The Solution: Margdarshak (मार्गदर्शक)

**Margdarshak** bridges the digital divide with an end-to-end multi-modal voice navigation pipeline:
- 🎙️ **Voice-First Input**: Users tap once and speak naturally in Hindi, Hinglish, English, or their native Indic tongue.
- ⚡ **Dynamic DOM Affordance Scanner**: Margdarshak dynamically scans all visible, interactive form inputs, selects, labels, section cards, and buttons on the live page at query time—extracting rich contextual affordances and semantic keywords without relying on brittle hardcoded coordinates.
- 🧠 **Sarvam-105B Spatial Intent Matching**: Spoken intent is evaluated against live DOM affordances using **Sarvam-105B**, accurately mapping user requests to the precise target element ID even through diverse colloquialisms and mixed-language transcripts.
- 🎯 **Visual Spotlight & Radar Beacon**: The target element is smoothly scrolled into the viewport center, framed by an animated glowing amber beacon radar and directional pointers. The beacon remains click-through (`pointer-events-none`) so users can interact with form controls directly without interference.
- 🔊 **Voice Feedback with Bulbul v4-flash**: The model's concise guidance instruction is converted into natural speech via **Bulbul v4-flash** text-to-speech, providing audible step-by-step confirmation.

---

## 🏛️ System Architecture

```text
[ Citizen Speaks ] 🎙️ (Tap-to-Talk / VAD)
       │
       ▼ (Audio: WebM 16kHz Mono)
[ /api/transcribe ]
       │  └─► Sarvam Saaras v4 STT (Auto-Language Identification / Hinglish / Indic)
       ▼ (Transcript & Detected Language)
[ Dynamic DOM Affordance Scanner ]
       │  └─ Extracts visible inputs, buttons, section titles & semantic keywords
       ▼
[ /api/chat ]
       │  └─► Sarvam-105B Spatial Intent Engine + Deterministic Keyword Matcher Fallback
       ▼ (Resolved Target ID & Hindi Guidance)
┌───────────────────────────────────────────────┐
│              Browser UI Response              │
├───────────────────────────────────────────────┤
│  1. Smooth scroll target element into view    │
│  2. Activate visual beacon spotlight overlay  │
│  3. /api/tts ──► Sarvam Bulbul v4-flash Voice │
└───────────────────────────────────────────────┘
```

---

## 🚀 Key Features & Highlights

### 1. Robust Audio Capture & Voice Activity Detection (VAD)
- **Standardized Audio Constraints**: Initialized with `{ channelCount: 1, sampleRate: 16000, echoCancellation: true, noiseSuppression: true, autoGainControl: true }` for cross-platform compatibility across headsets, laptops, and mobile devices.
- **Continuous 100ms Chunking**: Buffers audio via `MediaRecorder.start(100)` to guarantee uncorrupted WebM payloads.
- **Grace-Period VAD**: Evaluates RMS energy in real time with an initial 2.0-second silence grace window, preventing premature cutoffs before speech concludes.
- **Real-Time Visual Volume Ring**: Widget reflects live voice intensity through an animated dynamic soundwave ring and volume meter.
- **State Decoupling & Reliable Re-Clicking**: Recording state is synchronized through dedicated React refs (`isRecordingRef`), ensuring consecutive clicks never deadlock or produce empty 400-byte buffers.

### 2. Truly Multilingual Transcriptions (`saaras:v4`)
- Integrated with Sarvam's **Saaras v4** speech-to-text API.
- Offers an interactive in-widget Language Selector (`Auto`, `हिन्दी`, `Eng`) to let users either force Hindi or leverage Saaras's native auto-identification for code-mixed Hinglish and regional languages.

### 3. Spatial Affordance Mapping & Intent Engine (`sarvam-105b`)
- Full coverage of portal elements:
  - Full Name (`#field-name`)
  - Father's / Guardian's Name (`#field-father`)
  - Date of Birth (`#field-dob`)
  - Gender (`#field-gender`)
  - Social Category (`#field-category`)
  - Aadhaar Number (`#field-aadhaar`)
  - Domicile State (`#field-state`)
  - District (`#field-district`)
  - PIN Code (`#field-pincode`)
  - Annual Family Income (`#field-income`)
  - College / Institute (`#field-college`)
  - Current Course (`#field-course`)
  - Bank Account Number (`#field-account`)
  - Bank IFSC Code (`#field-ifsc`)
  - Document Upload (`#field-doc`)
  - Track Status (`#nav-status`)
  - Login & Registration (`#nav-login`, `#nav-register`)
  - Submit Application (`#btn-submit`)
- **Weighted Semantic Fallback**: Backed by a deterministic scoring matcher across label tokens and keyword dictionaries if network latency or connectivity affects the completion call.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router, Server Components, API Routes) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS (Accessible Government & Bharat Color Palette) |
| **Icons** | Lucide React |
| **Speech-to-Text (STT)** | Sarvam AI `saaras:v4` |
| **Language Reasoning** | Sarvam AI `sarvam-105b` |
| **Text-to-Speech (TTS)** | Sarvam AI `bulbul:v4-flash` (`hi-IN`) |

---

## 📂 Project Structure

```text
├── app/
│   ├── api/
│   │   ├── chat/          # Sarvam-105B spatial navigation & intent matching
│   │   ├── transcribe/    # Sarvam Saaras v4 STT audio processing
│   │   └── tts/           # Sarvam Bulbul v4-flash voice synthesis
│   ├── page.tsx           # National Scholarship & DBT Portal Simulation Page
│   ├── layout.tsx         # Root layout with fonts & metadata
│   └── globals.css        # Tailwind styles & radar pulse animations
├── components/
│   ├── MargdarshakWidget.tsx     # Floating draggable voice assistant widget
│   └── MargdarshakSpotlight.tsx  # Non-blocking radar spotlight & guidance card
├── lib/
│   └── navigation-elements.ts    # Element schemas & semantic keyword dictionaries
├── data/
│   └── schemes.json              # Verified government schemes reference database
└── public/                       # Static public assets
```

---

## ⚡ Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/basantbansal/sahayak.git
cd sahayak
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
SARVAM_API_KEY=your_sarvam_api_key_here
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm run start
```

---

## 📜 License

Distributed under the MIT License. Built with ❤️ for Bharat by Basant Bansal.
