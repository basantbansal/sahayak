import { NextRequest, NextResponse } from 'next/server';
import schemesData from '@/data/schemes.json';

interface NavElementInput {
  id: string;
  label: string;
  section?: string;
  keywords?: string[];
  tag?: string;
  description?: string;
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
        const navSystemPrompt = `You are Margdarshak, an intelligent UI navigation engine for Indian government portals.
Given the user's spoken transcript (which may be in Hindi, Hinglish, English, or regional Indic languages) and a list of DOM elements, select the single best target element ID.

Available UI Elements on this page:
${JSON.stringify(availableElements, null, 2)}

Rules:
- Understand synonyms and translations:
  * "DOB", "जन्म तिथि", "birth date", "उम्र", "birthday", "date of birth" -> field-dob
  * "नाम", "name", "naam", "candidate name", "applicant name" -> field-name
  * "पिता का नाम", "father name", "guardian", "father", "pitaji" -> field-father
  * "जाति", "category", "caste", "SC/ST/OBC", "general", "shreni" -> field-category
  * "लिंग", "gender", "male", "female", "purush", "mahila" -> field-gender
  * "आधार", "aadhaar", "aadhar number", "uidai", "aadhaar card" -> field-aadhaar
  * "आय", "income", "salary", "aamdani", "kamai", "annual income", "paisa" -> field-income
  * "राज्य", "state", "domicile", "niwas", "pradesh" -> field-state
  * "जिला", "district", "zila", "city", "shahar" -> field-district
  * "पिन कोड", "pincode", "postal code", "pin" -> field-pincode
  * "कॉलेज", "college", "institute", "school", "university", "sansthan" -> field-college
  * "कोर्स", "course", "degree", "diploma", "kaksha", "class" -> field-course
  * "बैंक खाता", "bank account", "account number", "khata", "dbt account" -> field-account
  * "आईएफएससी", "ifsc", "ifsc code", "branch code" -> field-ifsc
  * "दस्तावेज़", "document", "upload", "marksheet", "income cert", "file" -> field-doc
  * "स्टेटस", "status", "track", "application check", "sthiti" -> nav-status
  * "लॉगिन", "sign in", "login", "portal entry", "pravesh" -> nav-login
  * "रजिस्ट्रेशन", "registration", "new user", "sign up", "panjikaran" -> nav-register
  * "सबमिट", "jama karein", "submit", "apply", "final submit" -> btn-submit
- Formulate a single concise, polite guidance sentence in the user's language (default to Hindi).
- Output strictly valid JSON matching this exact structure:
{"targetId": "<matching_element_id>", "instruction": "<guidance>"}

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
            const guide = parsed.instruction || parsed.hindiInstruction;
            if (guide && typeof guide === 'string') {
              hindiInstruction = guide.trim();
            }
          }
        }
      } catch (fetchErr) {
        console.warn('Sarvam-105B navigation API fetch warning:', fetchErr);
      }

      // High-precision deterministic fallback scoring if AI response is unavailable or returned invalid targetId
      if (!targetId || !elementIds.includes(targetId)) {
        const queryLower = message.toLowerCase().trim();
        const tokens = queryLower.split(/\s+/).filter(Boolean);

        let bestMatchId = '';
        let highestScore = 0;

        for (const el of availableElements) {
          let score = 0;
          const labelLower = (el.label || '').toLowerCase();
          const idLower = el.id.toLowerCase();
          const sectionLower = (el.section || '').toLowerCase();
          const keywords = (el.keywords || []).map((k) => k.toLowerCase());

          // Direct inclusion of ID
          if (queryLower.includes(idLower.replace('field-', '').replace('nav-', '').replace('btn-', ''))) {
            score += 10;
          }

          // Keyword matches
          for (const kw of keywords) {
            if (queryLower.includes(kw)) {
              score += 8;
            }
          }

          // Label token overlap
          for (const tok of tokens) {
            if (tok.length > 2 && labelLower.includes(tok)) {
              score += 4;
            }
            if (tok.length > 2 && sectionLower.includes(tok)) {
              score += 2;
            }
          }

          if (score > highestScore) {
            highestScore = score;
            bestMatchId = el.id;
          }
        }

        if (highestScore > 0 && bestMatchId) {
          targetId = bestMatchId;
          const matchedEl = availableElements.find((e) => e.id === targetId);
          hindiInstruction = `${matchedEl?.label || 'इस फ़ील्ड'} पर ध्यान दें।`;
        }
      }

      if (!targetId && elementIds.length > 0) {
        targetId = elementIds[0];
        hindiInstruction = 'यहाँ विकल्प उपलब्ध है, कृपया जाँच करें।';
      }

      if (!hindiInstruction) {
        hindiInstruction = 'इस विकल्प पर ध्यान दें और आवश्यक जानकारी भरें।';
      }

      return NextResponse.json({
        targetId,
        hindiInstruction,
        instruction: hindiInstruction,
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
