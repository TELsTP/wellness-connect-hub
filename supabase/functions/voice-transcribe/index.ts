import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY missing' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const inForm = await req.formData();
    const file = inForm.get('file');
    const language = (inForm.get('language') as string) || '';
    if (!(file instanceof File) || file.size < 512) {
      return new Response(JSON.stringify({ error: 'empty or missing audio file' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Map MIME -> safe extension. OpenAI infers format from filename.
    const mime = (file.type || '').split(';')[0];
    const ext = ({
      'audio/webm': 'webm', 'audio/mp4': 'mp4', 'audio/mpeg': 'mp3',
      'audio/wav': 'wav', 'audio/ogg': 'ogg', 'audio/m4a': 'm4a',
    } as Record<string, string>)[mime] || 'webm';

    const upstream = new FormData();
    upstream.append('model', 'openai/gpt-4o-mini-transcribe');
    upstream.append('file', file, `recording.${ext}`);
    // Auto-detect when unspecified; pass bare ISO-639-1 only.
    if (language && /^[a-z]{2}$/i.test(language)) upstream.append('language', language.toLowerCase());

    const r = await fetch('https://ai.gateway.lovable.dev/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: upstream,
    });

    if (!r.ok) {
      const errTxt = await r.text().catch(() => '');
      return new Response(JSON.stringify({ error: errTxt || `STT failed: ${r.status}` }), {
        status: r.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const data = await r.json();
    return new Response(JSON.stringify({ text: data.text ?? '' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});