import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { config, climate } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const prompt = `You are an agricultural expert. Based on the following polyhouse configuration and climate data, suggest 5 suitable crops with brief explanations.

Polyhouse: ${config.length}m x ${config.width}m, ${config.polyhouseType} type
Cover: ${config.coverMaterial}
Location: ${config.district}, ${config.state}
Climate Zone: ${climate.climateZone}
Avg Temperature: ${climate.avgTemperature}°C
Humidity: ${climate.humidity}%
Annual Rainfall: ${climate.rainfall}mm

Provide crop recommendations with expected yield and growing tips. Be concise and practical.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: 'You are an expert agricultural advisor specializing in protected cultivation.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('AI error:', errText);
      throw new Error('AI service error');
    }

    const data = await response.json();
    const suggestions = data.choices?.[0]?.message?.content || 'Unable to generate suggestions';

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
