import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'SARVAM_API_KEY is not configured in server environment.' },
        { status: 500 }
      );
    }

    const incomingFormData = await req.formData();
    const file = incomingFormData.get('file');
    // Support optional language override; default to hi-IN for accurate Hindi recognition
    const languageCode = (incomingFormData.get('language_code') as string | null) || 'hi-IN';

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'No audio file provided in request (expected multipart form field "file").' },
        { status: 400 }
      );
    }

    // Prepare multipart payload for Sarvam STT REST API (Saaras v4)
    // Force MIME type to 'audio/webm' to avoid Sarvam 400 Bad Request errors
    const cleanBlob = new Blob([await file.arrayBuffer()], { type: 'audio/webm' });
    const sarvamFormData = new FormData();
    sarvamFormData.append('file', cleanBlob, 'recording.webm');
    sarvamFormData.append('model', 'saaras:v4');
    sarvamFormData.append('language_code', languageCode);
    sarvamFormData.append('mode', 'transcribe');

    const response = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
      },
      body: sarvamFormData,
    });

    if (!response.ok) {
      const errText = await response.text();
      let parsedError = errText;
      try {
        const jsonErr = JSON.parse(errText);
        parsedError = jsonErr.error?.message || jsonErr.message || errText;
      } catch {}
      return NextResponse.json(
        { error: `Sarvam STT API error (${response.status}): ${parsedError}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('Sarvam STT response:', JSON.stringify(result));

    const transcript = result.transcript ?? '';
    if (!transcript || !transcript.trim()) {
      // Sarvam returned 200 but no speech detected — return gracefully
      return NextResponse.json({
        transcript: '',
        error: 'No speech detected',
        language_code: result.language_code || 'hi-IN',
        request_id: result.request_id,
      });
    }

    return NextResponse.json({
      transcript,
      language_code: result.language_code || 'hi-IN',
      request_id: result.request_id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Server error during audio transcription: ${err.message || String(err)}` },
      { status: 500 }
    );
  }
}
