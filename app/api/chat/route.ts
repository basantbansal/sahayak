import { NextRequest, NextResponse } from 'next/server';
import schemesData from '@/data/schemes.json';

interface NavElementInput {
  id: string;
  label: string;
  description: string;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'SARVAM_API_KEY is not configured in server environment.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { message, mode, elements } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { error: 'Invalid or missing "message" parameter.' },
        { status: 400 }
      );
    }

    // Spatial Navigation Mode
    if (mode === 'navigate' || (elements && Array.isArray(elements) && elements.length > 0)) {
      const availableElements: NavElementInput[] = elements || [];
      const elementIds = availableElements.map((el) => el.id);

      let targetId = '';
      let hindiInstruction = '';
      let rawReply = '';

      try {
        const navSystemPrompt = `You are "Margdarshak" (मार्गदर्शक), an Indian government welfare portal visual voice navigation assistant.
The user speaks in Hindi, Hinglish, English, or other Indic languages (Marathi, Bengali, Tamil, Telugu, etc.) to locate or interact with a UI element on the portal page.
Transcripts may contain Hinglish (mixed Hindi-English), regional Indic words, or slight ASR errors — understand intent and match the best UI element accordingly.

Available UI Elements on this page:
${JSON.stringify(availableElements, null, 2)}

Instructions:
1. Identify which single "targetId" best matches the user's spoken request (handle Hinglish/Indic intent, not just exact keywords).
2. Formulate a polite, clear, natural instruction sentence in Hindi (1 single sentence) guiding the user where to click or fill.
3. Output strictly valid JSON matching this exact structure:
{"targetId": "<matching_element_id>", "hindiInstruction": "<hindi instruction sentence>"}

IMPORTANT: Return ONLY the JSON object. Do not include markdown code fences, notes, or extra commentary.`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 9000);

        const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'api-subscription-key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'sarvam-105b',
            messages: [
              { role: 'system', content: navSystemPrompt },
              { role: 'user', content: message.trim() },
            ],
            max_tokens: 800,
            temperature: 0.1,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          rawReply = data.choices?.[0]?.message?.content || '';

          const jsonMatch = rawReply.match(/\{[\s\S]*?\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.targetId && (elementIds.length === 0 || elementIds.includes(parsed.targetId))) {
              targetId = parsed.targetId;
            }
            if (parsed.hindiInstruction && typeof parsed.hindiInstruction === 'string') {
              hindiInstruction = parsed.hindiInstruction.trim();
            }
          }
        }
      } catch (fetchErr) {
        console.warn('Sarvam-105B navigation API fetch warning:', fetchErr);
      }

      // Robust fallback matching if AI response is unavailable or missing targetId
      if (!targetId) {
        const lower = message.toLowerCase();
        if (
          lower.includes('लॉगिन') ||
          lower.includes('login') ||
          lower.includes('साइन इन') ||
          lower.includes('sign in')
        ) {
          targetId = 'nav-login';
          hindiInstruction = 'लॉगिन करने के लिए यहाँ ऊपर दिए गए लॉगिन बटन पर क्लिक करें।';
        } else if (
          lower.includes('रजिस्टर') ||
          lower.includes('पंजीकरण') ||
          lower.includes('register') ||
          lower.includes('sign up')
        ) {
          targetId = 'nav-register';
          hindiInstruction = 'नया खाता या पंजीकरण करने के लिए यहाँ ऊपर क्लिक करें।';
        } else if (
          lower.includes('दस्तावेज़') ||
          lower.includes('डॉक्यूमेंट') ||
          lower.includes('upload') ||
          lower.includes('अपलोड') ||
          lower.includes('कागज़') ||
          lower.includes('marksheet') ||
          lower.includes('अंकसूची')
        ) {
          targetId = 'field-doc';
          hindiInstruction = 'अपना आय प्रमाण पत्र या अंकसूची यहाँ अपलोड करें।';
        } else if (
          lower.includes('आय') ||
          lower.includes('income') ||
          lower.includes('सैलरी') ||
          lower.includes('पैसे') ||
          lower.includes('कमाई')
        ) {
          targetId = 'field-income';
          hindiInstruction = 'अपने परिवार की कुल वार्षिक आय यहाँ दर्ज करें।';
        } else if (
          lower.includes('नाम') ||
          lower.includes('name') ||
          lower.includes('आवेदक')
        ) {
          targetId = 'field-name';
          hindiInstruction = 'यहाँ आधार कार्ड के अनुसार अपना पूरा नाम दर्ज करें।';
        } else if (
          lower.includes('राज्य') ||
          lower.includes('state') ||
          lower.includes('निवास')
        ) {
          targetId = 'field-state';
          hindiInstruction = 'अपने मूल निवास राज्य का चयन करने के लिए यहाँ क्लिक करें।';
        } else if (
          lower.includes('सबमिट') ||
          lower.includes('submit') ||
          lower.includes('जमा') ||
          lower.includes('आवेदन')
        ) {
          targetId = 'btn-submit';
          hindiInstruction = 'आवेदन पूरा करने के बाद यहाँ क्लिक करके फॉर्म जमा करें।';
        } else {
          targetId = elementIds[0] || 'nav-login';
          hindiInstruction = 'यहाँ संबंधित विकल्प उपलब्ध है, कृपया जाँच करें।';
        }
      }

      if (!hindiInstruction) {
        hindiInstruction = 'इस विकल्प पर ध्यान दें और आवश्यक जानकारी भरें।';
      }

      return NextResponse.json({
        targetId,
        hindiInstruction,
        rawReply,
        model: 'sarvam-105b',
      });
    }

    // Default: Welfare Scheme Q&A Mode
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
        max_tokens: 1200,
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
