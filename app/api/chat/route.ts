import { NextRequest, NextResponse } from 'next/server';
import schemesData from '@/data/schemes.json';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'SARVAM_API_KEY is not configured in server environment.' },
        { status: 500 }
      );
    }

    const { message } = await req.json();
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { error: 'Invalid or missing "message" parameter.' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are Sahayak (सहायक), an Indian government welfare-scheme helper.
Answer ONLY using the provided schemes database below.
Rules:
1. Reply in the user's language (e.g. Hindi if asked in Hindi, Marathi if in Marathi, English if in English).
2. Keep your reply concise: at most 4 short lines.
3. If the answer is not in the provided schemes data, state clearly: "यह जानकारी उपलब्ध योजनाओं के डेटा में नहीं है।" (or equivalent in user's language).
4. NEVER invent or assume any eligibility rules, income limits, or benefits.

Schemes Database:
${JSON.stringify(schemesData.schemes, null, 2)}`;

    const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sarvam-105b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message.trim() },
        ],
        max_tokens: 600,
        temperature: 0.2,
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
        { error: `Sarvam Chat API error (${response.status}): ${parsedError}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const replyContent = data.choices?.[0]?.message?.content;

    if (!replyContent || !replyContent.trim()) {
      return NextResponse.json(
        { error: 'Sarvam 105b returned an empty response.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      answer: replyContent.trim(),
      model: data.model || 'sarvam-105b',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Server error during chat completion: ${err.message || String(err)}` },
      { status: 500 }
    );
  }
}
