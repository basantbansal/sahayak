'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Send,
  Loader2,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Info
} from 'lucide-react';
import {
  sampleAadhaar,
  sampleIncomeCert,
  verifyDocuments,
  VerificationReport
} from '@/lib/document-verifier';

export default function SahayakPage() {
  // Voice & Chat States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Data States
  const [inputQuery, setInputQuery] = useState('');
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('hi-IN');
  const [assistantReply, setAssistantReply] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Document Verification State
  const [docReport, setDocReport] = useState<VerificationReport>(() => verifyDocuments());

  // Audio References
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Pre-loaded quick queries
  const sampleQueries = [
    {
      label: '12वीं स्कॉलरशिप पात्रता',
      query: 'मेरी बेटी 12वीं में है, कॉलेज स्कॉलरशिप के लिए क्या चाहिए?',
    },
    {
      label: 'SC स्कॉलरशिप आय सीमा',
      query: 'पोस्ट-मैट्रिक एससी स्कॉलरशिप की पात्रता और आय सीमा क्या है?',
    },
    {
      label: 'College Merit Scholarship',
      query: 'What is the eligibility and amount for PM-USP College Scholarship?',
    },
    {
      label: 'अज्ञात योजना (Out-of-scope check)',
      query: 'पीएम आवास योजना की पात्रता क्या है?',
    },
  ];

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
    };
  }, []);

  // Voice recording handlers using MediaRecorder API
  const startRecording = async () => {
    setErrorMessage(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support microphone audio capture.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        await handleAudioTranscribe(audioBlob);
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setErrorMessage(`Microphone access error: ${err.message || 'Permission denied'}`);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Submit audio to /api/transcribe (Sarvam Saaras v4)
  const handleAudioTranscribe = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setErrorMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to transcribe audio.');
      }

      const transcript = data.transcript || '';
      setCurrentTranscript(transcript);
      if (data.language_code) {
        setDetectedLanguage(data.language_code);
      }

      if (!transcript.trim()) {
        setErrorMessage('No audible speech detected. Please speak clearly into the microphone.');
        return;
      }

      // Automatically query chat after speech transcription
      await executeChatQuery(transcript, data.language_code || 'hi-IN');
    } catch (err: any) {
      setErrorMessage(`Speech-to-Text Error: ${err.message}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  // Submit text to /api/chat (Sarvam 105b)
  const executeChatQuery = async (queryText: string, langCode: string = detectedLanguage) => {
    if (!queryText.trim()) return;

    setIsAnswering(true);
    setErrorMessage(null);
    setAssistantReply(null);

    // Stop existing audio if playing
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: queryText }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch scheme guidance.');
      }

      setAssistantReply(data.answer);
      // Automatically generate voice for convenience
      await generateVoicePlayback(data.answer, langCode);
    } catch (err: any) {
      setErrorMessage(`Scheme Navigator Error: ${err.message}`);
    } finally {
      setIsAnswering(false);
    }
  };

  // Play audio via /api/tts (Sarvam Bulbul)
  const generateVoicePlayback = async (textToSpeak: string, langCode: string = detectedLanguage) => {
    if (!textToSpeak.trim()) return;

    setIsGeneratingAudio(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          language_code: langCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to synthesize speech.');
      }

      if (!data.audioBase64) {
        throw new Error('No audio returned by text-to-speech service.');
      }

      const audioSrc = `data:audio/wav;base64,${data.audioBase64}`;
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }

      const audio = new Audio(audioSrc);
      audioElementRef.current = audio;

      audio.onplay = () => setIsPlayingAudio(true);
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => {
        setIsPlayingAudio(false);
        setErrorMessage('Browser audio player failed to play synthesized speech.');
      };

      await audio.play();
    } catch (err: any) {
      setErrorMessage(`Bulbul TTS Error: ${err.message}`);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    setCurrentTranscript(inputQuery);
    executeChatQuery(inputQuery);
  };

  const toggleAudioPlayback = () => {
    if (!audioElementRef.current) {
      if (assistantReply) {
        generateVoicePlayback(assistantReply);
      }
      return;
    }

    if (isPlayingAudio) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioElementRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const runReverification = () => {
    setDocReport(verifyDocuments());
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50/40 via-white to-emerald-50/30 text-slate-900 pb-16">
      {/* Top Header */}
      <header className="border-b border-orange-200/80 bg-white/95 backdrop-blur sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-md">
              स
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Sahayak <span className="text-orange-600 font-extrabold">(सहायक)</span>
                </h1>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                  Sarvam AI Powered
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Voice-First Multilingual Welfare Scheme & Document Pre-Checker
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Real Sarvam Models: <strong>saaras:v4</strong> • <strong>sarvam-105b</strong> • <strong>bulbul:v4-flash</strong></span>
          </div>
        </div>
      </header>

      {/* Honest Error Banner if an API fails */}
      {errorMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
          <div className="rounded-xl bg-red-50 border-2 border-red-300 p-4 shadow-sm flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-red-900">API Execution Issue Encountered</h3>
              <p className="text-xs text-red-800 mt-0.5 whitespace-pre-wrap font-mono">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-semibold text-red-700 hover:text-red-900 underline ml-2"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Dual-Panel Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Voice Assistant & Scheme Guidance (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Voice Input & Query Box */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-orange-600" />
                <h2 className="text-base font-bold text-slate-900">
                  बोलकर या लिखकर पूछें (Voice / Text Query)
                </h2>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                Lang: {detectedLanguage}
              </span>
            </div>

            {/* Big Mic Button & Audio Recorder */}
            <div className="flex flex-col items-center justify-center py-6 px-4 bg-gradient-to-b from-orange-50/50 to-amber-50/20 rounded-2xl border border-orange-100">
              <div className="relative">
                {isRecording && (
                  <span className="absolute -inset-3 rounded-full bg-orange-400 opacity-30 animate-ping"></span>
                )}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isTranscribing || isAnswering}
                  type="button"
                  aria-label={isRecording ? 'Stop recording' : 'Start speaking'}
                  className={`relative w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all transform active:scale-95 shadow-lg ${
                    isRecording
                      ? 'bg-red-600 text-white ring-4 ring-red-300'
                      : 'bg-gradient-to-tr from-orange-600 to-amber-500 text-white hover:brightness-110 ring-4 ring-orange-100'
                  } disabled:opacity-50`}
                >
                  {isRecording ? (
                    <Square className="w-8 h-8 fill-current" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </button>
              </div>

              <div className="mt-4 text-center">
                {isRecording ? (
                  <div className="space-y-1">
                    <div className="inline-flex items-center space-x-2 text-red-600 font-bold text-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                      <span>रिकॉर्डिंग जारी है ({recordingSeconds}s)...</span>
                    </div>
                    <p className="text-xs text-slate-500">रोकने के लिए लाल बटन दबाएं</p>
                  </div>
                ) : isTranscribing ? (
                  <div className="inline-flex items-center space-x-2 text-orange-700 text-sm font-semibold">
                    <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                    <span>Sarvam Saaras v4 आवाज़ पहचान रहा है...</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-800">
                      माइक बटन दबाएं और अपनी भाषा में बोलें
                    </p>
                    <p className="text-xs text-slate-500">
                      हिन्दी, मराठी, தமிழ், English या अपनी स्थानीय भाषा में
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Test Chips */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Quick Sample Questions (1-Click Test):
              </label>
              <div className="flex flex-wrap gap-2">
                {sampleQueries.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputQuery(item.query);
                      setCurrentTranscript(item.query);
                      executeChatQuery(item.query);
                    }}
                    className="text-xs text-left bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-900 border border-slate-200 hover:border-orange-300 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    💬 {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual text input fallback */}
            <form onSubmit={handleManualSubmit} className="flex gap-2 pt-1">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="योजना के बारे में प्रश्न टाइप करें (उदा. 12वीं के बाद कौन सी स्कॉलरशिप है?)..."
                className="flex-1 text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50/50"
              />
              <button
                type="submit"
                disabled={isAnswering || !inputQuery.trim()}
                className="bg-slate-900 text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-slate-800 disabled:opacity-50 flex items-center space-x-1.5 transition-colors"
              >
                {isAnswering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span className="hidden sm:inline">पूछें</span>
              </button>
            </form>
          </section>

          {/* Transcript & Response Area */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-3">
              <span>बातचीत और योजना परामर्श (Response)</span>
              {assistantReply && (
                <button
                  onClick={toggleAudioPlayback}
                  disabled={isGeneratingAudio}
                  type="button"
                  className={`inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all shadow-sm ${
                    isPlayingAudio
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  } disabled:opacity-50`}
                >
                  {isGeneratingAudio ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>आवाज़ तैयार हो रही है...</span>
                    </>
                  ) : isPlayingAudio ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>रोकें (Pause)</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Suno / सुनो (Bulbul TTS)</span>
                    </>
                  )}
                </button>
              )}
            </h2>

            {/* Transcript Display */}
            {currentTranscript ? (
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs">
                <span className="font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  आपका प्रश्न (Transcript from Mic / Input):
                </span>
                <p className="text-slate-800 text-sm font-medium">"{currentTranscript}"</p>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic py-1">
                माइक से बोलें या ऊपर दिए गए प्रश्नों में से किसी एक पर क्लिक करें।
              </div>
            )}

            {/* Answer Display */}
            {isAnswering ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-2 text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
                <p className="text-xs font-medium">Sarvam-105b योजनाओं के आधिकारिक नियमों की जांच कर रहा है...</p>
              </div>
            ) : assistantReply ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>सहायक परामर्श (Sahayak Output - Sarvam 105B)</span>
                  </span>
                  <span className="text-[11px] text-slate-500">अधिकतम 4 पंक्तियों का उत्तर</span>
                </div>
                <div className="text-slate-900 text-sm leading-relaxed whitespace-pre-line font-medium border-l-2 border-emerald-500 pl-3">
                  {assistantReply}
                </div>
              </div>
            ) : null}

            {/* Seeded Schemes Quick Reference Info */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                डेटाबेस में शामिल योजनाएं: Post-Matric SC & PM-USP CSSS
              </span>
              <a
                href="https://scholarships.gov.in"
                target="_blank"
                rel="noreferrer"
                className="text-orange-700 hover:underline flex items-center space-x-1 font-medium"
              >
                <span>National Scholarship Portal (NSP)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </section>
        </div>

        {/* Right Column: Document Check Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-bold text-slate-900">
                  दस्तावेज़ पूर्व-जांच (Sample Documents)
                </h2>
              </div>
              <button
                onClick={runReverification}
                type="button"
                className="inline-flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                title="Re-run deterministic verification"
              >
                <RefreshCw className="w-3 h-3" />
                <span>पुनः जांचें</span>
              </button>
            </div>

            {/* Overall Risk Badge */}
            <div
              className={`rounded-xl p-4 border flex items-start space-x-3 ${
                docReport.overallRisk === 'HIGH'
                  ? 'bg-red-50/80 border-red-200 text-red-950'
                  : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
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
                    पोर्टल अस्वीकृति जोखिम (Rejection Risk):
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
                परीक्षण हेतु नमूना दस्तावेज़ (Sample JSON Documents):
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
            <div className="space-y-3 pt-1">
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

                      {/* Issue details */}
                      <p className="text-slate-700 leading-relaxed font-medium">
                        {check.issue}
                      </p>

                      {/* Exact fix */}
                      <div className={`rounded-lg p-2.5 ${isFail ? 'bg-white border border-red-200' : 'bg-white border border-slate-200'}`}>
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
          </section>
        </div>
      </div>

      {/* Mandatory Disclaimer footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 mt-12">
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center text-xs text-amber-950 font-medium shadow-sm">
          <p className="font-bold">
            ⚠️ अस्वीकरण / Disclaimer: Pre-check only. Final decision rests with the office.
          </p>
          <p className="text-amber-800 text-[11px] mt-0.5">
            यह पोर्टल केवल दस्तावेज़ों व पात्रता की प्रारंभिक जांच के लिए है। छात्रवृत्ति अथवा कल्याणकारी योजनाओं का अंतिम सत्यापन और स्वीकृति संबंधित सरकारी विभाग द्वारा ही की जाती है।
          </p>
        </div>
      </footer>
    </main>
  );
}
