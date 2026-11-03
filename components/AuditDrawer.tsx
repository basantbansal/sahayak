'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  FileText,
  Search,
  Loader2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  sampleAadhaar,
  sampleIncomeCert,
  verifyDocuments,
  VerificationReport,
} from '@/lib/document-verifier';

interface AuditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuditDrawer({ isOpen, onClose }: AuditDrawerProps) {
  const [docReport, setDocReport] = useState<VerificationReport>(() => verifyDocuments());
  const [schemeQuery, setSchemeQuery] = useState('');
  const [isQueryingScheme, setIsQueryingScheme] = useState(false);
  const [schemeAnswer, setSchemeAnswer] = useState<string | null>(null);
  const [schemeError, setSchemeError] = useState<string | null>(null);

  const handleReverify = () => {
    setDocReport(verifyDocuments());
  };

  const handleSchemeAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schemeQuery.trim()) return;

    setIsQueryingScheme(true);
    setSchemeAnswer(null);
    setSchemeError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: schemeQuery }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to query scheme guidance.');
      }
      setSchemeAnswer(data.answer);
    } catch (err: any) {
      setSchemeError(err.message || 'Scheme query failed.');
    } finally {
      setIsQueryingScheme(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="audit-drawer-title" role="dialog" aria-modal="true">
      {/* Dimmed backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col h-full border-l border-slate-200">
          {/* Drawer Header */}
          <div className="p-5 bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-700 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-white shadow-inner">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h2 id="audit-drawer-title" className="text-base font-bold tracking-tight">
                  दस्तावेज़ पूर्व-जांच एवं ऑडिट पैनल
                </h2>
                <p className="text-xs text-orange-100">
                  Document Pre-Check & Welfare Verification Engine
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="rounded-lg p-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title="Close panel"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Top Action & Re-verify bar */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <span className="text-xs text-slate-600 font-medium">
                अस्वीकृति जोखिम विश्लेषण (Deterministic Pre-Check)
              </span>
              <button
                onClick={handleReverify}
                type="button"
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-orange-700 hover:text-orange-900 bg-orange-100/80 hover:bg-orange-200/80 px-3 py-1.5 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>पुनः जांचें (Re-run)</span>
              </button>
            </div>

            {/* Overall Risk Banner */}
            <div
              className={`rounded-xl p-4 border flex items-start space-x-3 ${
                docReport.overallRisk === 'HIGH'
                  ? 'bg-red-50 border-red-200 text-red-950'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-950'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  docReport.overallRisk === 'HIGH' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                {docReport.overallRisk === 'HIGH' ? (
                  <XCircle className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    पोर्टल अस्वीकृति जोखिम:
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-extrabold uppercase ${
                      docReport.overallRisk === 'HIGH'
                        ? 'bg-red-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {docReport.overallRisk} RISK
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-700">
                  {docReport.rejectionLikelihood}
                </p>
              </div>
            </div>

            {/* Hardcoded Sample Documents JSON View */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                परीक्षण हेतु नमूना दस्तावेज़ (Sample Applicant Documents):
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Aadhaar Card Card */}
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-xs space-y-1.5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-blue-600" /> आधार कार्ड (Aadhaar)
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {sampleAadhaar.docNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">नाम (Name):</span>
                    <span className="font-semibold text-slate-900 bg-amber-100/70 px-1 rounded">
                      {sampleAadhaar.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">जन्म तिथि (DOB):</span>
                    <span className="font-semibold text-slate-900 bg-amber-100/70 px-1 rounded">
                      {sampleAadhaar.dob}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">राज्य (State):</span>
                    <span className="text-slate-700">{sampleAadhaar.addressState}</span>
                  </div>
                </div>

                {/* Income Certificate Card */}
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-xs space-y-1.5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" /> आय प्रमाण पत्र (Income Cert)
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      UP/2024/...
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">नाम (Name):</span>
                    <span className="font-semibold text-red-700 bg-red-100 px-1 rounded">
                      {sampleIncomeCert.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">जन्म तिथि (DOB):</span>
                    <span className="font-semibold text-red-700 bg-red-100 px-1 rounded">
                      {sampleIncomeCert.dob}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">वार्षिक आय (Income):</span>
                    <span className="text-slate-700 font-semibold">
                      ₹{sampleIncomeCert.annualIncome.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Deterministic Rejection Risk & Exact Fix List */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                जांच परिणाम एवं समाधान (Rejection Risk & Exact Fixes):
              </label>

              <div className="space-y-2.5">
                {docReport.checks.map((check) => {
                  const isFail = check.status === 'failed';
                  const isWarning = check.status === 'warning';
                  return (
                    <div
                      key={check.id}
                      className={`rounded-xl border p-3.5 text-xs space-y-2 transition-all ${
                        isFail
                          ? 'border-red-200 bg-red-50/50'
                          : isWarning
                          ? 'border-amber-200 bg-amber-50/50'
                          : 'border-emerald-200 bg-emerald-50/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          {isFail ? (
                            <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                          ) : isWarning ? (
                            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          )}
                          <span className="font-bold text-slate-900">{check.field}</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            isFail
                              ? 'bg-red-200 text-red-900'
                              : isWarning
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-emerald-200 text-emerald-900'
                          }`}
                        >
                          {isFail ? 'High Risk' : isWarning ? 'Warning' : 'Passed'}
                        </span>
                      </div>

                      <p className="text-slate-700 leading-relaxed font-medium">
                        {check.issue}
                      </p>

                      <div
                        className={`rounded-lg p-2.5 ${
                          isFail
                            ? 'bg-white border border-red-200'
                            : 'bg-white border border-slate-200'
                        }`}
                      >
                        <span className="font-bold text-slate-800 block text-[11px] mb-0.5">
                          💡 सटीक समाधान (Exact Fix):
                        </span>
                        <p className="text-slate-700 leading-snug">{check.exactFix}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Embedded Scheme Q&A helper for convenience */}
            <div className="border-t border-slate-200 pt-5 space-y-3">
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>योजना पात्रता परामर्श (Sarvam-105B Scheme QA)</span>
              </div>

              <form onSubmit={handleSchemeAsk} className="flex gap-2">
                <input
                  type="text"
                  value={schemeQuery}
                  onChange={(e) => setSchemeQuery(e.target.value)}
                  placeholder="योजना के नियम या पात्रता पूछें..."
                  className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="submit"
                  disabled={isQueryingScheme || !schemeQuery.trim()}
                  className="bg-orange-600 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-orange-700 disabled:opacity-50 flex items-center space-x-1"
                >
                  {isQueryingScheme ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Search className="w-3.5 h-3.5" />
                  )}
                  <span>पूछें</span>
                </button>
              </form>

              {schemeAnswer && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-slate-800 leading-relaxed">
                  <div className="font-bold text-emerald-800 mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>सहायक उत्तर (Sarvam-105B):</span>
                  </div>
                  {schemeAnswer}
                </div>
              )}

              {schemeError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800">
                  {schemeError}
                </div>
              )}
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>सत्यापन नियम: NSP & DBT Pre-Check v1.0</span>
            <a
              href="https://scholarships.gov.in"
              target="_blank"
              rel="noreferrer"
              className="text-orange-700 hover:underline flex items-center space-x-1 font-medium"
            >
              <span>NSP Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
