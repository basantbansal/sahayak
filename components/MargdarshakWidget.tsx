'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  Square,
  X,
  Loader2,
  Volume2,
  FileText,
  Compass,
  AlertCircle,
  GripHorizontal,
} from 'lucide-react';
import { findFallbackTarget } from '@/lib/navigation-elements';
import { ActiveBeacon } from './MargdarshakSpotlight';

interface MargdarshakWidgetProps {
  onTriggerBeacon: (beacon: ActiveBeacon) => void;
  isPlayingAudio: boolean;
  setIsPlayingAudio: (playing: boolean) => void;
}

export default function MargdarshakWidget({
  onTriggerBeacon,
  isPlayingAudio,
  setIsPlayingAudio,
}: MargdarshakWidgetProps) {
  // Position State (Default to bottom-right corner)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // VAD: true when voice activity detected
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Abort controller ref for in-flight chat/nav requests
  const navAbortControllerRef = useRef<AbortController | null>(null);

  // References
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null); // Keep stream ref for explicit teardown
  const audioChunksRef = useRef<Blob[]>([]);
  const isCancelledRef = useRef<boolean>(false);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const silenceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hardCutoffTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Dragging tracking refs
  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    posX: number;
    posY: number;
    hasMoved: boolean;
  }>({
    pointerX: 0,
    pointerY: 0,
    posX: 0,
    posY: 0,
    hasMoved: false,
  });

  // Initialize widget position on screen mount
  useEffect(() => {
    const initX = Math.max(16, window.innerWidth - 320);
    const initY = Math.max(80, window.innerHeight - 280);
    setPosition({ x: initX, y: initY });

    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return null;
        return {
          x: Math.min(prev.x, window.innerWidth - 300),
          y: Math.min(prev.y, window.innerHeight - 200),
        };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (silenceIntervalRef.current) clearInterval(silenceIntervalRef.current);
      if (hardCutoffTimerRef.current) clearTimeout(hardCutoffTimerRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
    };
  }, []);

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    // Ignore drag start if clicking interactive buttons or pills
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }

    if (!position) return;
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      posX: position.x,
      posY: position.y,
      hasMoved: false,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - dragStartRef.current.pointerX;
      const deltaY = moveEvent.clientY - dragStartRef.current.pointerY;

      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        dragStartRef.current.hasMoved = true;
        setIsDragging(true);

        const newX = Math.min(
          Math.max(12, dragStartRef.current.posX + deltaX),
          window.innerWidth - 290
        );
        const newY = Math.min(
          Math.max(12, dragStartRef.current.posY + deltaY),
          window.innerHeight - 180
        );

        setPosition({ x: newX, y: newY });
      }
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      setTimeout(() => setIsDragging(false), 50);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Full cleanup of all recording state — call after any recording terminal event
  const cleanupRecordingState = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (silenceIntervalRef.current) {
      clearInterval(silenceIntervalRef.current);
      silenceIntervalRef.current = null;
    }
    if (hardCutoffTimerRef.current) {
      clearTimeout(hardCutoffTimerRef.current);
      hardCutoffTimerRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    // Explicitly release microphone stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    audioChunksRef.current = [];
    setIsSpeaking(false);
    setIsRecording(false);
  }, []);

  // Safe stop recording
  const stopRecordingInternal = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (silenceIntervalRef.current) {
      clearInterval(silenceIntervalRef.current);
      silenceIntervalRef.current = null;
    }
    if (hardCutoffTimerRef.current) {
      clearTimeout(hardCutoffTimerRef.current);
      hardCutoffTimerRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsSpeaking(false);
    setIsRecording(false);
  }, []);

  // Cancel recording explicitly (Red X button)
  const cancelRecording = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    isCancelledRef.current = true;
    stopRecordingInternal();
    cleanupRecordingState();
    setStatusMessage('रिकॉर्डिंग रद्द की गई (Cancelled)');
    setTimeout(() => setStatusMessage(null), 2000);
  };

  // Synthesize and play Hindi guidance voice using Bulbul v4-flash
  const playHindiGuidanceVoice = async (textToSpeak: string) => {
    try {
      setIsPlayingAudio(true);
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          language_code: 'hi-IN',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.audioBase64) {
        throw new Error(data.error || 'TTS audio synthesis failed.');
      }

      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }

      const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
      audioElementRef.current = audio;

      audio.onplay = () => setIsPlayingAudio(true);
      audio.onended = () => {
        setIsPlayingAudio(false);
        audioElementRef.current = null;
      };
      audio.onerror = () => {
        setIsPlayingAudio(false);
        audioElementRef.current = null;
      };

      await audio.play();
    } catch (err: any) {
      console.warn('Bulbul voice playback error:', err.message);
      setIsPlayingAudio(false);
      audioElementRef.current = null;
    }
  };

  // Dynamic DOM scanner — finds all visible, interactive elements at query time
  const scanPageElements = useCallback(() => {
    const interactive = Array.from(
      document.querySelectorAll<HTMLElement>(
        'button, a, input, select, textarea, [data-mg-id], [id]'
      )
    );
    return interactive
      .filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && el.offsetParent !== null;
      })
      .map((el) => {
        // Collect associated label text from label[for], parent label, aria-label, placeholder or preceding label
        let labelText = '';
        if (el.id) {
          const associatedLabel = document.querySelector(`label[for="${el.id}"]`) as HTMLElement | null;
          if (associatedLabel) {
            labelText = associatedLabel.innerText || '';
          }
        }
        if (!labelText) {
          const parentLabel = el.closest('label');
          if (parentLabel) {
            labelText = parentLabel.innerText || '';
          }
        }
        if (!labelText) {
          labelText =
            el.innerText ||
            el.getAttribute('aria-label') ||
            el.getAttribute('placeholder') ||
            el.id ||
            '';
        }

        return {
          id: el.id || el.getAttribute('data-mg-id') || el.className.split(' ')[0],
          label: labelText.trim().replace(/\s+/g, ' ').slice(0, 100),
          tag: el.tagName.toLowerCase(),
        };
      })
      .filter((item) => item.id && item.label);
  }, []);

  // Execute UI navigation from query string (used by transcription & demo pills)
  const executeNavigationQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    setIsProcessing(true);
    setStatusMessage(`मार्गदर्शन खोज रहे हैं... ("${queryText.slice(0, 24)}")`);
    setErrorMessage(null);

    // Cancel any in-flight nav request before starting a new one
    if (navAbortControllerRef.current) {
      navAbortControllerRef.current.abort();
    }
    navAbortControllerRef.current = new AbortController();

    try {
      // Scan live DOM for all visible interactive elements at query time
      const dynamicElements = scanPageElements();

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText,
          mode: 'navigate',
          elements: dynamicElements,
        }),
        signal: navAbortControllerRef.current.signal,
      });

      const data = await res.json();
      let targetId = data.targetId;
      let hindiInstruction = data.hindiInstruction;

      // Fallback: if AI returned nothing or element doesn't exist in DOM, use keyword fallback
      if (!targetId || !document.getElementById(targetId)) {
        const fallback = findFallbackTarget(queryText);
        if (fallback) {
          targetId = fallback.targetId;
          hindiInstruction = fallback.hindiInstruction;
        } else {
          targetId = null;
          hindiInstruction = null;
        }
      }

      if (!targetId || !document.getElementById(targetId)) {
        setStatusMessage('कोई संबंधित फ़ील्ड या बटन नहीं मिला। कृपया दोबारा कहें।');
        setTimeout(() => setStatusMessage(null), 3500);
        return;
      }

      const matchingEl = dynamicElements.find((el) => el.id === targetId);

      // Smoothly scroll target element into viewport center
      const targetDomEl = document.getElementById(targetId);
      if (targetDomEl) {
        targetDomEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Activate visual beacon spotlight
      onTriggerBeacon({
        targetId,
        hindiInstruction: hindiInstruction || 'यहाँ आवश्यक विकल्प देखें।',
        label: matchingEl?.label || targetId,
        timestamp: Date.now(),
      });

      setStatusMessage(null);

      // Speak guidance in Hindi
      if (hindiInstruction) {
        await playHindiGuidanceVoice(hindiInstruction);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return; // Silently ignore aborted requests
      setErrorMessage(`मार्गदर्शन त्रुटि: ${err.message || 'त्रुटि हुई'}`);
      setStatusMessage(null);
    } finally {
      // Always unlock the mic button, no matter what happened
      setIsProcessing(false);
      setIsRecording(false);
      setIsSpeaking(false);
      audioChunksRef.current = [];
      // Release mic stream if still held
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setStatusMessage(null);
    }
  };

  // Start Voice Recording with Web Audio Silence Detection & Limits
  const startRecording = async () => {
    setErrorMessage(null);
    setStatusMessage(null);
    isCancelledRef.current = false;

    // Barge-in: stop any currently playing audio before starting new recording
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
      setIsPlayingAudio(false);
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('ब्राउज़र माइक्रोफ़ोन सपोर्ट नहीं करता है।');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream; // Store for explicit teardown in finally
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        // Stop all media stream tracks to release the mic indicator
        stream.getTracks().forEach((track) => track.stop());

        // If cancelled by Red X, cleanup and bail out
        if (isCancelledRef.current) {
          cleanupRecordingState();
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Reset chunks immediately after capturing the blob
        audioChunksRef.current = [];

        console.log('Final recorded audio size:', audioBlob.size, 'bytes');
        if (audioBlob.size < 200) {
          console.warn('Audio blob too small or empty');
          setStatusMessage('आवाज़ रिकॉर्ड नहीं हुई, कृपया दोबारा बोलें');
          cleanupRecordingState();
          return;
        }

        // Submit audio to /api/transcribe (Saaras v4)
        setStatusMessage('Saaras v4 आवाज़ पहचान रहा है...');
        try {
          const formData = new FormData();
          formData.append('file', audioBlob, 'recording.webm');

          const res = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'आवाज़ पहचानी नहीं जा सकी।');
          }

          const transcript = data.transcript || '';
          if (!transcript.trim()) {
            setStatusMessage('आवाज़ नहीं सुनाई दी। कृपया दोबारा बोलें या नीचे दिए गए क्विक बटन आज़माएं।');
            setTimeout(() => setStatusMessage(null), 4000);
            return;
          }

          // Pass transcript to navigation engine
          await executeNavigationQuery(transcript);
        } catch (transcribeErr: any) {
          console.error('Transcription error:', transcribeErr);
          setErrorMessage(`STT Error: ${transcribeErr.message}`);
          setStatusMessage(null);
        }
      };

      // Set up AudioContext Analyser — RMS-based VAD, auto-stop after 2.5s silence post-speech
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          if (audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
          }
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 512;
          analyser.smoothingTimeConstant = 0.3;
          source.connect(analyser);

          const dataArray = new Float32Array(analyser.fftSize);
          const SILENCE_THRESHOLD = 0.008; // Sensitive threshold so ordinary voice triggers VAD
          const SILENCE_DURATION_MS = 2500; // Auto-stop after 2.5s continuous silence post-speech
          let silenceStartTime: number | null = null;
          let hasSpoken = false;
          const recordingStartedAt = Date.now();

          silenceIntervalRef.current = setInterval(() => {
            if (!analyser) return;
            analyser.getFloatTimeDomainData(dataArray);

            // Compute RMS volume
            let sumSq = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sumSq += dataArray[i] * dataArray[i];
            }
            const rms = Math.sqrt(sumSq / dataArray.length);

            if (rms > SILENCE_THRESHOLD) {
              hasSpoken = true;
              silenceStartTime = null;
              setIsSpeaking(true);
            } else {
              setIsSpeaking(false);
              // Only auto-stop after user has spoken and at least 2.5s of total recording elapsed
              if (hasSpoken && Date.now() - recordingStartedAt > 2500) {
                if (!silenceStartTime) {
                  silenceStartTime = Date.now();
                } else if (Date.now() - silenceStartTime >= SILENCE_DURATION_MS) {
                  stopRecordingInternal();
                }
              }
            }
          }, 100);
        }
      } catch (audioCtxErr) {
        console.warn('AudioContext VAD init error:', audioCtxErr);
      }

      // Hard cutoff limit: 15 seconds auto-stop
      hardCutoffTimerRef.current = setTimeout(() => {
        stopRecordingInternal();
      }, 15000);

      // Start recording
      recorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access or recording error:', err);
      cleanupRecordingState();
      setErrorMessage('कृपया ब्राउज़र में माइक्रोफोन अनुमति (Microphone Permission) ऑन करें।');
    }
  };

  // Start or stop recording toggle
  const toggleRecording = () => {
    // If audio is currently playing, pause it immediately
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
      setIsPlayingAudio(false);
    }

    if (isRecording) {
      stopRecordingInternal();
    } else {
      // If processing a previous query, abort it first and immediately start recording
      if (isProcessing) {
        if (navAbortControllerRef.current) {
          navAbortControllerRef.current.abort();
        }
        setIsProcessing(false);
        setStatusMessage(null);
      }
      startRecording();
    }
  };

  if (!position) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: `${position.y}px`,
        left: `${position.x}px`,
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      className={`z-40 transition-shadow select-none ${
        isDragging ? 'cursor-grabbing shadow-2xl scale-[1.02]' : 'cursor-grab'
      }`}
    >
      <div className="bg-gradient-to-br from-amber-500 via-orange-600 to-amber-600 text-white p-3.5 rounded-3xl shadow-2xl border-2 border-white/60 w-72 backdrop-blur-md relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-white/20 rounded-full blur-xl pointer-events-none" />

        {/* Drag Handle Top Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-white/20 mb-2.5">
          <div className="flex items-center space-x-1.5 text-xs font-black tracking-wide">
            <Compass className="w-4 h-4 text-amber-200" />
            <span className="uppercase text-amber-100">मार्गदर्शक (Margdarshak)</span>
          </div>

          <div className="flex items-center space-x-1">
            <GripHorizontal className="w-4 h-4 text-white/60 hover:text-white cursor-grab" />
          </div>
        </div>

        {/* Center Microphone & Recording Section */}
        <div className="flex flex-col items-center justify-center py-2 relative">
          <div className="relative">
            {isRecording && (
              <>
                <span className="absolute -inset-3 rounded-full bg-red-400 opacity-40 animate-ping pointer-events-none" />
                <span className="absolute -inset-1.5 rounded-full bg-white opacity-30 animate-pulse pointer-events-none" />
              </>
            )}

            <button
              type="button"
              onClick={toggleRecording}
              className={`relative w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all transform active:scale-95 shadow-xl ${
                isRecording
                  ? 'bg-red-600 text-white ring-4 ring-red-300'
                  : isProcessing
                  ? 'bg-amber-300 text-orange-800 ring-4 ring-amber-200 cursor-pointer'
                  : 'bg-white text-orange-700 hover:bg-orange-50 ring-4 ring-white/40'
              }`}
              title={
                isProcessing
                  ? 'क्लिक करें: नई रिकॉर्डिंग शुरू करें (रद्द करेगा पिछली)'
                  : isRecording
                  ? 'रोकने के लिए क्लिक करें'
                  : 'बोलने के लिए क्लिक करें'
              }
            >
              {isRecording ? (
                <Square className="w-6 h-6 fill-current text-white" />
              ) : isProcessing ? (
                <Loader2 className="w-6 h-6 animate-spin text-orange-700" />
              ) : (
                <Mic className="w-7 h-7 text-orange-600" />
              )}
            </button>

            {/* Cancel Red X Button (Prominently visible when recording) */}
            {isRecording && (
              <button
                type="button"
                onClick={cancelRecording}
                className="absolute -top-1 -right-2 bg-slate-900 text-white hover:bg-black rounded-full p-1.5 shadow-lg border-2 border-red-400 transition-transform active:scale-90"
                title="रद्द करें / Cancel recording immediately"
              >
                <X className="w-4 h-4 text-red-400" />
              </button>
            )}
          </div>

          {/* Bilingual Text & Status Indicator */}
          <div className="mt-2.5 text-center w-full">
            {isRecording ? (
              <div className="space-y-1">
                <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-red-100">
                  <div className="flex items-center space-x-1 h-4">
                    <span className={`w-1 rounded-full wave-bar-1 inline-block ${isSpeaking ? 'bg-emerald-300' : 'bg-white/50'}`} />
                    <span className={`w-1 rounded-full wave-bar-2 inline-block ${isSpeaking ? 'bg-emerald-300' : 'bg-white/50'}`} />
                    <span className={`w-1 rounded-full wave-bar-3 inline-block ${isSpeaking ? 'bg-emerald-300' : 'bg-white/50'}`} />
                  </div>
                  <span>{isSpeaking ? '🎙️ बोल रहे हैं...' : `🔇 रुकिए... (${recordingSeconds}s)`}</span>
                </div>
                <p className="text-[11px] text-white/80">रोकने हेतु टैप करें | 1.5s silence = auto-stop</p>
              </div>
            ) : statusMessage ? (
              <div className="flex items-center justify-center space-x-1 text-xs font-semibold text-amber-100 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="truncate max-w-[210px]">{statusMessage}</span>
              </div>
            ) : isProcessing ? (
              <div className="flex items-center justify-center space-x-1 text-xs font-semibold text-amber-100 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>मार्गदर्शन तैयार हो रहा है... (टैप करें रद्द करने के लिए)</span>
              </div>
            ) : (
              <div>
                <p className="text-xs font-extrabold text-white">बोलकर मदद लें</p>
                <p className="text-[10px] text-amber-100 font-medium">Speak for Help (Voice Nav)</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick One-Click Demo Pills */}
        <div className="mt-2 pt-2 border-t border-white/20 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-amber-200">
            <span>तुरंत डेमो (Quick 1-Click Demo):</span>
            {isPlayingAudio && <Volume2 className="w-3 h-3 text-white animate-pulse" />}
          </div>

          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => executeNavigationQuery('लॉगिन कहाँ है? (Find Login)')}
              className="text-left text-xs bg-white/20 hover:bg-white/30 active:scale-98 text-white px-2.5 py-1.5 rounded-xl backdrop-blur transition-all border border-white/20 font-medium flex items-center justify-between"
            >
              <span>🔑 लॉगिन कहाँ है? (Find Login)</span>
              <span className="text-[10px] text-amber-200 font-mono">→ top</span>
            </button>

            <button
              type="button"
              onClick={() =>
                executeNavigationQuery('दस्तावेज़ कहाँ अपलोड करें? (Where to upload doc?)')
              }
              className="text-left text-xs bg-white/20 hover:bg-white/30 active:scale-98 text-white px-2.5 py-1.5 rounded-xl backdrop-blur transition-all border border-white/20 font-medium flex items-center justify-between"
            >
              <span>📁 दस्तावेज़ कहाँ अपलोड करें?</span>
              <span className="text-[10px] text-amber-200 font-mono">→ doc</span>
            </button>

            <button
              type="button"
              onClick={() =>
                executeNavigationQuery('फॉर्म सबमिट बटन दिखाएं (Show Submit)')
              }
              className="text-left text-xs bg-white/20 hover:bg-white/30 active:scale-98 text-white px-2.5 py-1.5 rounded-xl backdrop-blur transition-all border border-white/20 font-medium flex items-center justify-between"
            >
              <span>✅ फॉर्म सबमिट बटन दिखाएं</span>
              <span className="text-[10px] text-amber-200 font-mono">→ submit</span>
            </button>
          </div>
        </div>

        {/* Error notification if any */}
        {errorMessage && (
          <div className="mt-2 p-1.5 bg-red-900/80 border border-red-300/40 rounded-lg text-[10px] text-red-100 flex items-start space-x-1">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span className="flex-1">{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="font-bold underline text-white"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
