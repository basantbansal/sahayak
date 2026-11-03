'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Upload,
  UserCheck,
  Building2,
  Calendar,
  HelpCircle,
  Bell,
  Eye,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import MargdarshakWidget from '@/components/MargdarshakWidget';
import MargdarshakSpotlight, { ActiveBeacon } from '@/components/MargdarshakSpotlight';
import AuditDrawer from '@/components/AuditDrawer';

export default function SahayakMargdarshakPage() {
  // State for Visual Beacon Spotlight
  const [activeBeacon, setActiveBeacon] = useState<ActiveBeacon | null>(null);
  const beaconTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State for Document Audit Drawer
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);

  // Audio Playback State (for sync with spotlight icon)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    applicantName: 'अमित कुमार (Amit Kumar)',
    fatherName: 'रमेश कुमार',
    dob: '2004-08-15',
    gender: 'Male',
    category: 'SC',
    aadhaarNumber: 'XXXX-XXXX-9012',
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    pincode: '226001',
    income: '180000',
    familyId: 'UP-FAM-882910',
    institute: 'Government Polytechnic Lucknow',
    course: 'Diploma in Computer Science (2nd Year)',
    bankAccount: '91823746192837',
    ifsc: 'SBIN0001234',
    docFileName: 'Income_Certificate_2026.pdf',
    declarationAccepted: true,
  });

  const [portalNotice, setPortalNotice] = useState<string | null>(null);

  // Trigger Beacon with 6-second auto fade-out
  const handleTriggerBeacon = (beacon: ActiveBeacon) => {
    if (beaconTimeoutRef.current) {
      clearTimeout(beaconTimeoutRef.current);
    }

    setActiveBeacon(beacon);

    // Automatically fade out after 6 seconds as specified
    beaconTimeoutRef.current = setTimeout(() => {
      setActiveBeacon(null);
    }, 6000);
  };

  const handleDismissBeacon = () => {
    if (beaconTimeoutRef.current) {
      clearTimeout(beaconTimeoutRef.current);
    }
    setActiveBeacon(null);
  };

  const showTemporaryNotice = (msg: string) => {
    setPortalNotice(msg);
    setTimeout(() => setPortalNotice(null), 4000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showTemporaryNotice('✅ आवेदन सफलतापूर्वक पोर्टल पर दर्ज किया गया! पावती संख्या: NSP-2026-UP-91824');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans relative selection:bg-amber-200">
      {/* =========================================================================
          1. TOP SARKARI GOVERNMENT ACCESSIBILITY & MINISTRY BAR
          ========================================================================= */}
      <div className="bg-slate-900 text-slate-200 text-[11px] border-b border-slate-800 px-4 py-1.5 font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-amber-400">भारत सरकार</span>
            <span className="text-slate-500">|</span>
            <span>Government of India</span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:inline">इलेक्ट्रॉनिक्स और सूचना प्रौद्योगिकी मंत्रालय (MeitY)</span>
          </div>

          <div className="flex items-center space-x-3 text-slate-300">
            <span className="hidden sm:inline">हेल्पलाइन: <strong>1800-111-222</strong> / <strong>011-24361234</strong></span>
            <span className="text-slate-600">|</span>
            <div className="flex items-center space-x-1">
              <span className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 cursor-pointer hover:bg-slate-700">A-</span>
              <span className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 cursor-pointer hover:bg-slate-700">A</span>
              <span className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 cursor-pointer hover:bg-slate-700">A+</span>
            </div>
            <span className="text-slate-600">|</span>
            <button
              type="button"
              onClick={() => setIsAuditDrawerOpen(true)}
              className="text-amber-300 hover:text-amber-100 font-bold underline flex items-center gap-1"
            >
              <FileText className="w-3 h-3" />
              <span>ऑडिट पैनल (Audit)</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. DENSE HEADER WITH LOGO, NOTIFICATIONS & SEMANTIC NAV BUTTONS
          ========================================================================= */}
      <header className="bg-white border-b-2 border-orange-500 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Official Emblem & Portal Title */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-emerald-600 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[10px] flex flex-col items-center justify-center p-1">
                <span className="text-orange-600 font-black text-xs leading-none">NSP</span>
                <span className="text-blue-900 font-bold text-[9px] leading-tight">DBT</span>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">
                  राष्ट्रीय छात्रवृत्ति एवं प्रत्यक्ष लाभ अंतरण पोर्टल
                </h1>
                <span className="hidden lg:inline text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-orange-100 text-orange-900 rounded-full border border-orange-300">
                  सत्र 2026-27
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                National Scholarship & DBT Direct Welfare Portal • Government of India
              </p>
            </div>
          </div>

          {/* Dense Sarkari Header Action Links with semantic IDs */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            {/* Semantic id="nav-login" */}
            <button
              id="nav-login"
              type="button"
              onClick={() => showTemporaryNotice('लॉगिन विंडो: कृपया अपने आधार या पंजीकरण संख्या से लॉगिन करें।')}
              className="px-4 py-2 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white font-bold rounded-lg shadow-sm border border-blue-950 transition-all transform active:scale-95 flex items-center space-x-1.5 ring-2 ring-transparent focus:ring-amber-500"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-200" />
              <span>लॉगिन (Login)</span>
            </button>

            {/* Semantic id="nav-register" */}
            <button
              id="nav-register"
              type="button"
              onClick={() => showTemporaryNotice('नया पंजीकरण: नया छात्र पंजीकरण फॉर्म सक्रिय हो रहा है।')}
              className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded-lg shadow-sm border border-orange-700 transition-all transform active:scale-95 flex items-center space-x-1.5 ring-2 ring-transparent focus:ring-amber-500"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>नया पंजीकरण (New Registration)</span>
            </button>

            {/* Track Status */}
            <button
              id="nav-status"
              data-mg-id="nav-status"
              type="button"
              onClick={() => showTemporaryNotice('आवेदन स्थिति: कृपया आवेदन संख्या या आधार दर्ज कर स्थिति जांचें।')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg border border-slate-300 transition-colors flex items-center space-x-1"
            >
              <Eye className="w-3.5 h-3.5 text-slate-600" />
              <span>आवेदन स्थिति (Track Status)</span>
            </button>

            {/* Document Audit Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsAuditDrawerOpen(true)}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold rounded-lg border border-emerald-300 transition-colors flex items-center space-x-1 shadow-sm"
              title="Open Document Verification & Rejection Pre-Check Engine"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-700" />
              <span>दस्तावेज़ पूर्व-जांच</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          3. OFFICIAL ANNOUNCEMENT MARQUEE / TICKER & NOTIFICATION BADGES
          ========================================================================= */}
      <section className="bg-amber-50 border-b border-amber-200 py-1.5 px-4 overflow-hidden relative shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center">
          <div className="flex-shrink-0 bg-red-600 text-white text-[11px] font-black uppercase px-2.5 py-0.5 rounded shadow-sm flex items-center space-x-1 mr-3 z-10">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>नवीनतम सूचना</span>
          </div>

          <div className="overflow-hidden whitespace-nowrap w-full">
            <div className="animate-ticker text-xs font-semibold text-slate-800 space-x-12">
              <span>
                📢 <strong>शैक्षणिक सत्र 2026-27:</strong> सभी प्री-मैट्रिक एवं पोस्ट-मैट्रिक छात्रवृत्ति पोर्टल सक्रिय हैं। ऑनलाइन आवेदन की अंतिम तिथि <strong>30 नवंबर 2026</strong> है।
              </span>
              <span>
                ⚡ <strong>डीबीटी (DBT) अनिवार्य निर्देश:</strong> छात्रवृत्ति राशि सीधे आधार से जुड़े सक्रिय बैंक खाते में ही हस्तांतरित की जाएगी।
              </span>
              <span>
                🚨 <strong>दस्तावेज़ चेतावनी:</strong> आय प्रमाण पत्र एवं आधार में नाम या जन्मतिथि की त्रुटि होने पर आवेदन सीधे निरस्त हो जाएगा। पूर्व-जांच का उपयोग करें।
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Portal Feedback / Toast notification */}
      {portalNotice && (
        <div className="fixed top-20 right-6 z-50 animate-bounce">
          <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border-2 border-amber-400 text-xs font-bold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{portalNotice}</span>
          </div>
        </div>
      )}

      {/* Portal Stats & Notification Badges Bar */}
      <section className="max-w-7xl mx-auto px-4 pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-800 flex items-center justify-center font-bold">
              1.2 Cr
            </div>
            <div>
              <p className="text-[11px] text-slate-500">पंजीकृत छात्र</p>
              <p className="font-bold text-slate-900">Total Beneficiaries</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              ₹4.8K Cr
            </div>
            <div>
              <p className="text-[11px] text-slate-500">डीबीटी संवितरण</p>
              <p className="font-bold text-slate-900">Disbursed DBT</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              98.4%
            </div>
            <div>
              <p className="text-[11px] text-slate-500">सत्यापन दर</p>
              <p className="font-bold text-slate-900">Verification Rate</p>
            </div>
          </div>

          <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-300 shadow-sm flex items-center space-x-2.5">
            <Bell className="w-5 h-5 text-amber-700 flex-shrink-0 animate-bounce" />
            <div>
              <p className="text-[11px] text-amber-800 font-bold">सहायता गाइड (Voice Nav)</p>
              <p className="text-[11px] text-slate-600">नीचे दाईं ओर माइक दबाकर बोलें</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. MULTI-SECTION DENSE SARKARI WELFARE APPLICATION FORM
          ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Form Header Card */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold">
                  प्रपत्र संख्या: NSP-2026/SCHEME-04
                </span>
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  केंद्रीय क्षेत्र छात्रवृत्ति एवं प्रत्यक्ष लाभ अंतरण ऑनलाइन आवेदन प्रपत्र 2026-27
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  सभी (*) चिह्नित विवरण अनिवार्य हैं। कृपया आधार कार्ड एवं आय प्रमाण पत्र के अनुसार ही विवरण भरें।
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg border border-white/20 text-xs text-amber-200 font-mono">
                पोर्टल स्थिति: खुला (Active)
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-6">
              {/* SECTION 1: व्यक्तिगत विवरण (Applicant Personal Details) */}
              <div className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-slate-50/60 space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                  <div className="w-6 h-6 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center">
                    1
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    आवेदक का व्यक्तिगत विवरण (Applicant Personal Details)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  {/* Semantic id="field-name" */}
                  <div className="space-y-1.5">
                    <label htmlFor="field-name" className="font-bold text-slate-800 flex items-center justify-between">
                      <span>आवेदक का पूरा नाम (Full Name as in Aadhaar) *</span>
                      <span className="text-[10px] text-orange-700 bg-orange-100 px-1.5 py-0.2 rounded font-mono">#field-name</span>
                    </label>
                    <input
                      id="field-name"
                      type="text"
                      value={formData.applicantName}
                      onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                      placeholder="उदा. अमित कुमार"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                      required
                    />
                    <p className="text-[11px] text-slate-500">आधार कार्ड में दर्ज वर्तनी के अनुसार लिखें</p>
                  </div>

                  {/* Father's Name */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800">पिता / अभिभावक का नाम (Father's Name) *</label>
                    <input
                      type="text"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                    />
                  </div>

                  {/* DOB */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800">जन्म तिथि (Date of Birth) *</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800">लिंग (Gender) *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                    >
                      <option value="Male">पुरुष (Male)</option>
                      <option value="Female">महिला (Female)</option>
                      <option value="Other">अन्य (Other)</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800">सामाजिक श्रेणी (Category) *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                    >
                      <option value="SC">अनुसूचित जाति (SC)</option>
                      <option value="ST">अनुसूचित जनजाति (ST)</option>
                      <option value="OBC">अन्य पिछड़ा वर्ग (OBC)</option>
                      <option value="EWS">आर्थिक रूप से कमजोर (EWS)</option>
                      <option value="GEN">सामान्य (General)</option>
                    </select>
                  </div>

                  {/* Aadhaar Number */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800">आधार संख्या (Aadhaar Number) *</label>
                    <input
                      type="text"
                      value={formData.aadhaarNumber}
                      onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: निवास एवं पारिवारिक आय विवरण (Domicile & Family Details) */}
              <div className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-slate-50/60 space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center">
                    2
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    निवास एवं पारिवारिक आय विवरण (Domicile & Family Income)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  {/* Semantic id="field-state" */}
                  <div className="space-y-1.5">
                    <label htmlFor="field-state" className="font-bold text-slate-800 flex items-center justify-between">
                      <span>मूल निवास राज्य (Domicile State) *</span>
                      <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-mono">#field-state</span>
                    </label>
                    <select
                      id="field-state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                      required
                    >
                      <option value="Uttar Pradesh">उत्तर प्रदेश (Uttar Pradesh)</option>
                      <option value="Maharashtra">महाराष्ट्र (Maharashtra)</option>
                      <option value="Bihar">बिहार (Bihar)</option>
                      <option value="Rajasthan">राजस्थान (Rajasthan)</option>
                      <option value="Madhya Pradesh">मध्य प्रदेश (Madhya Pradesh)</option>
                      <option value="Tamil Nadu">तमिलनाडु (Tamil Nadu)</option>
                      <option value="Karnataka">कर्नाटक (Karnataka)</option>
                      <option value="Delhi">दिल्ली (NCT of Delhi)</option>
                      <option value="West Bengal">पश्चिम बंगाल (West Bengal)</option>
                    </select>
                    <p className="text-[11px] text-slate-500">निवास प्रमाण पत्र के अनुसार राज्य चुनें</p>
                  </div>

                  {/* District */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800">गृह जिला (District) *</label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                  </div>

                  {/* PIN Code */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800">पिन कोड (PIN Code) *</label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>

                  {/* Semantic id="field-income" */}
                  <div className="space-y-1.5">
                    <label htmlFor="field-income" className="font-bold text-slate-800 flex items-center justify-between">
                      <span>कुल वार्षिक पारिवारिक आय (Annual Income in ₹) *</span>
                      <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-mono">#field-income</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold">₹</span>
                      <input
                        id="field-income"
                        type="number"
                        value={formData.income}
                        onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                        placeholder="180000"
                        className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">आय प्रमाण पत्र के अनुसार दर्ज करें (उदा. 1,80,000)</p>
                  </div>

                  {/* Family ID / Ration Card */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800">राशन कार्ड / परिवार आईडी (Family ID)</label>
                    <input
                      type="text"
                      value={formData.familyId}
                      onChange={(e) => setFormData({ ...formData, familyId: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: शैक्षणिक एवं बैंक विवरण (Academic & Bank Details) */}
              <div className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-slate-50/60 space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                  <div className="w-6 h-6 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center">
                    3
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    शैक्षणिक संस्थान एवं बैंक खाता विवरण (Academic & Bank Details)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800">संस्थान / कॉलेज का नाम (Institute Name) *</label>
                    <input
                      type="text"
                      value={formData.institute}
                      onChange={(e) => setFormData({ ...formData, institute: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800">वर्तमान कोर्स / कक्षा (Course) *</label>
                    <input
                      type="text"
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800">आधार लिंक बैंक खाता संख्या (Bank Account) *</label>
                    <input
                      type="text"
                      value={formData.bankAccount}
                      onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800">बैंक IFSC कोड (IFSC Code) *</label>
                    <input
                      type="text"
                      value={formData.ifsc}
                      onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: अनिवार्य दस्तावेज़ अपलोड (Required Document Upload) */}
              <div className="border-2 border-dashed border-orange-300 rounded-xl p-4 sm:p-5 bg-orange-50/40 space-y-4">
                <div className="flex items-center justify-between border-b border-orange-200 pb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center">
                      4
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      अनिवार्य दस्तावेज़ अपलोड (Required Document Upload)
                    </h3>
                  </div>

                  <span className="text-[10px] text-orange-800 bg-orange-100 font-mono px-2 py-0.5 rounded border border-orange-200">
                    #field-doc
                  </span>
                </div>

                {/* Semantic id="field-doc" */}
                <div id="field-doc" className="bg-white border-2 border-slate-300 hover:border-orange-500 rounded-xl p-5 text-center space-y-3 transition-colors shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 mx-auto flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">
                      आय प्रमाण पत्र अथवा 12वीं की अंकसूची यहाँ अपलोड करें
                    </p>
                    <p className="text-xs text-slate-500">
                      Upload Income Certificate / 12th Marksheet (PDF, JPG, PNG - Max 2MB)
                    </p>
                  </div>

                  <div className="inline-flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 font-mono">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>चयनित फ़ाइल: <strong>{formData.docFileName}</strong></span>
                  </div>

                  <div>
                    <label
                      htmlFor="file-upload-input"
                      className="cursor-pointer inline-flex items-center space-x-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                    >
                      <span>ब्राउज़ फ़ाइल (Browse File)</span>
                    </label>
                    <input
                      id="file-upload-input"
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormData({ ...formData, docFileName: file.name });
                          showTemporaryNotice(`फ़ाइल संलग्न की गई: ${file.name}`);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: घोषणा एवं अंतिम सबमिशन (Declaration & Submit Button) */}
              <div className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-slate-50 space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    id="chk-declare"
                    type="checkbox"
                    checked={formData.declarationAccepted}
                    onChange={(e) => setFormData({ ...formData, declarationAccepted: e.target.checked })}
                    className="mt-1 w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
                  />
                  <label htmlFor="chk-declare" className="text-xs text-slate-700 leading-relaxed cursor-pointer font-medium">
                    मैं सत्यनिष्ठा से घोषणा करता/करती हूँ कि इस आवेदन में मेरे द्वारा दिए गए सभी विवरण एवं संलग्न दस्तावेज़ पूर्णतः सत्य एवं प्रामाणिक हैं। किसी भी प्रकार की विसंगति या असत्य जानकारी पाए जाने पर मेरी छात्रवृत्ति स्वतः निरस्त मानी जाएगी।
                  </label>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        applicantName: '',
                        fatherName: '',
                        dob: '',
                        gender: 'Male',
                        category: 'SC',
                        aadhaarNumber: '',
                        state: 'Uttar Pradesh',
                        district: '',
                        pincode: '',
                        income: '',
                        familyId: '',
                        institute: '',
                        course: '',
                        bankAccount: '',
                        ifsc: '',
                        docFileName: 'No file chosen',
                        declarationAccepted: false,
                      });
                      showTemporaryNotice('फॉर्म साफ़ कर दिया गया है।');
                    }}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    रीसेट करें (Reset Form)
                  </button>

                  {/* Semantic id="btn-submit" */}
                  <button
                    id="btn-submit"
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-600 hover:from-emerald-600 hover:to-green-500 text-white font-extrabold text-sm rounded-xl shadow-lg border-2 border-emerald-800 transition-all transform active:scale-95 flex items-center space-x-2 ring-2 ring-emerald-200"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                    <span>आवेदन जमा करें (Submit Application)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* =========================================================================
          5. MANDATORY SARKARI DISCLAIMER FOOTER
          ========================================================================= */}
      <footer className="max-w-7xl mx-auto px-4 pb-20 pt-6">
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-center text-xs text-amber-950 font-medium shadow-sm space-y-1">
          <p className="font-bold flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>⚠️ अस्वीकरण / Legal Disclaimer: Pre-check & Navigation Assistance Only</span>
          </p>
          <p className="text-[11px] text-amber-900 max-w-3xl mx-auto">
            यह पोर्टल केवल छात्रवृत्ति आवेदन एवं दस्तावेज़ पूर्व-सत्यापन के मार्गदर्शन हेतु एक इंटरैक्टिव सिमुलेशन है। वास्तविक छात्रवृत्ति स्वीकृति एवं डीबीटी वितरण संबंधित राज्य अथवा केंद्र सरकार के विभाग द्वारा ही किया जाता है।
          </p>
          <div className="pt-2 text-[10px] text-slate-500">
            पोर्टल अभिकल्प: राष्ट्रीय सूचना विज्ञान केंद्र (NIC) एवं MeitY • Powered by Sarvam AI Models
          </div>
        </div>
      </footer>

      {/* =========================================================================
          6. FLOATING DRAGGABLE "MARGDARSHAK" VOICE WIDGET
          ========================================================================= */}
      <MargdarshakWidget
        onTriggerBeacon={handleTriggerBeacon}
        onOpenAuditDrawer={() => setIsAuditDrawerOpen(true)}
        isPlayingAudio={isPlayingAudio}
        setIsPlayingAudio={setIsPlayingAudio}
      />

      {/* =========================================================================
          7. SPATIAL NAVIGATION & VISUAL BEACON SPOTLIGHT OVERLAY
          ========================================================================= */}
      <MargdarshakSpotlight
        beacon={activeBeacon}
        onDismiss={handleDismissBeacon}
        isPlayingAudio={isPlayingAudio}
      />

      {/* =========================================================================
          8. DOCUMENT AUDIT & REJECTION RISK SIDE DRAWER (ON DOUBLE CLICK)
          ========================================================================= */}
      <AuditDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
      />
    </div>
  );
}
