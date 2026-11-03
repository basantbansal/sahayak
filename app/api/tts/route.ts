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

    const { text, language_code } = await req.json();
    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: 'Invalid or missing "text" parameter.' },
        { status: 400 }
      );
    }

    // Limit text length to 2000 chars as per Bulbul REST limits (max 2500)
    const cleanedText = text.trim().slice(0, 2000);
    const targetLang = language_code || 'hi-IN';

    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: [cleanedText],
        target_language_code: targetLang,
        model: 'bulbul:v4-flash',
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let parsedError = errText;
      try {
        const jsonErr = JSON.parse(errText);
        parsedError = jsonErr.error?.message || jsonErr.message || errText;
      } catch {}
      return NextResponse.json(
        { error: `Sarvam Bulbul TTS API error (${response.status}): ${parsedError}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const audioBase64 = data.audios?.[0];

    if (!audioBase64) {
      return NextResponse.json(
        { error: 'Sarvam TTS API returned no audio output.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      audioBase64,
      language_code: targetLang,
      request_id: data.request_id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Server error during text-to-speech conversion: ${err.message || String(err)}` },
      { status: 500 }
    );
  }
}
