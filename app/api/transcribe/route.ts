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

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'No audio file provided in request (expected multipart form field "file").' },
        { status: 400 }
      );
    }

    // Prepare multipart payload for Sarvam STT REST API (Saaras v4)
    const sarvamFormData = new FormData();
    // Default to recording.webm if no filename exists
    const filename = (file as any).name || 'recording.webm';
    sarvamFormData.append('file', file, filename);
    sarvamFormData.append('model', 'saaras:v4');
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
    return NextResponse.json({
      transcript: result.transcript || '',
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
