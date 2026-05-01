export const runtime = 'nodejs';

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HUGGINGFACE_MODEL =
  process.env.HUGGINGFACE_MODEL || 'microsoft/git-base-vqav2';
const BACKEND_API_KEY = process.env.BACKEND_API_KEY;
const BACKEND_MODEL = process.env.BACKEND_MODEL;
const BACKEND_INFERENCE_URL = process.env.BACKEND_INFERENCE_URL;
const HUGGINGFACE_INFERENCE_URL = process.env.HUGGINGFACE_INFERENCE_URL;

interface HuggingFaceChatRequest {
  question: string;
  image?: string;
}

function normalizeHuggingFaceResponse(data: unknown): string {
  if (typeof data === 'string') return data;

  if (Array.isArray(data)) {
    const first = data[0];
    if (typeof first === 'string') return first;

    if (first && typeof first === 'object') {
      if ('generated_text' in first && typeof first.generated_text === 'string') {
        return first.generated_text;
      }
      if ('answer' in first && typeof first.answer === 'string') {
        return first.answer;
      }
      if ('content' in first && typeof first.content === 'string') {
        return first.content;
      }
    }
  }

  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.candidates)) {
      const first = record.candidates[0] as Record<string, unknown> | undefined;
      if (first && typeof first === 'object') {
        // Gemini response: candidates[0].content.parts[0].text
        const content = first.content as Record<string, unknown> | undefined;
        if (content && Array.isArray(content.parts)) {
          const part = content.parts[0] as Record<string, unknown> | undefined;
          if (part && typeof part.text === 'string') return part.text;
        }
        if (typeof first.content === 'string') return first.content;
      }
    }
    if (Array.isArray(record.output)) {
      const first = record.output[0];
      if (first && typeof first === 'object' && typeof first.content === 'string') {
        return first.content;
      }
    }
    if (typeof record.generated_text === 'string') return record.generated_text;
    if (typeof record.answer === 'string') return record.answer;
    if (typeof record.content === 'string') return record.content;
    if (typeof record.error === 'string') return `Error: ${record.error}`;
  }

  return JSON.stringify(data ?? '');
}

function useAlternateBackend(): boolean {
  return Boolean(BACKEND_MODEL && BACKEND_INFERENCE_URL && BACKEND_API_KEY);
}

export async function POST(req: Request) {
  try {
    const body: HuggingFaceChatRequest = await req.json();
    const question = body.question?.trim() ?? '';
    let image = body.image?.trim();

    if (!question && !image) {
      return new Response(
        'Please provide a question or an uploaded document image.',
        { status: 400 }
      );
    }

    const useAlternate = useAlternateBackend();
    const hasHuggingFaceKey = Boolean(HUGGINGFACE_API_KEY);

    if (!hasHuggingFaceKey && !useAlternate) {
      return new Response(
        'Missing model API credentials. Set HUGGINGFACE_API_KEY or alternate backend env vars.',
        { status: 500 }
      );
    }

    if (image) {
      image = image.replace(/^data:image\/\w+;base64,/, '');
    }

    const displayModelPath = HUGGINGFACE_MODEL.split('/')
      .map(encodeURIComponent)
      .join('/');
    const backendModelPath = BACKEND_MODEL
      ? BACKEND_MODEL.split('/').map(encodeURIComponent).join('/')
      : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    let endpoint: string;
    let payload: unknown;

    if (useAlternate && backendModelPath) {
      endpoint = `${BACKEND_INFERENCE_URL}/models/${backendModelPath}:generateContent`;
      if (BACKEND_API_KEY.startsWith('AIza')) {
        endpoint += `?key=${encodeURIComponent(BACKEND_API_KEY)}`;
      } else {
        headers.Authorization = `Bearer ${BACKEND_API_KEY}`;
      }

      const parts: { text?: string; inline_data?: { mime_type: string; data: string } }[] = [];
      if (image) {
        parts.push({ inline_data: { mime_type: 'image/jpeg', data: image } });
      }
      parts.push({ text: question || 'Describe this document.' });

      payload = {
        contents: [{ parts }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 512 },
      };
    } else {
      endpoint = `${HUGGINGFACE_INFERENCE_URL || 'https://api-inference.huggingface.co'}/models/${displayModelPath}`;
      headers.Authorization = `Bearer ${HUGGINGFACE_API_KEY}`;

      payload = image
        ? {
            inputs: {
              image,
              question: question || 'Describe this image.',
            },
            options: { wait_for_model: true },
          }
        : {
            inputs: question,
            options: { wait_for_model: true },
          };
    }

    console.log('HF Request:', {
      model: HUGGINGFACE_MODEL,
      hasImage: !!image,
      question,
    });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();

    if (!response.ok) {
      console.error('HF API error:', response.status, text);

      let message = text;
      if (contentType.includes('application/json')) {
        try {
          const parsed = JSON.parse(text);
          message = normalizeHuggingFaceResponse(parsed);
        } catch {
          // ignore JSON parse errors
        }
      }

      return new Response(message || `Model API error: ${response.status}`, {
        status: 502,
      });
    }

    let data: unknown = text;
    if (contentType.includes('application/json')) {
      try {
        data = JSON.parse(text);
      } catch {
        // fallback to raw text
      }
    }

    const answer = normalizeHuggingFaceResponse(data).trim();

    return new Response(answer || 'No response from model.', {
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response('Error processing request', { status: 500 });
  }
}
