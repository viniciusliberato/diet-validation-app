import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get user from JWT token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { mealType, expectedFoods, imageDescription } = await req.json();

    console.log('Processing meal validation:', { mealType, expectedFoods, userId: user.id });

    // Call OpenAI to analyze the meal
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em nutrição que valida refeições. Analise a descrição da imagem da refeição e compare com os alimentos esperados. Responda em JSON com:
            {
              "isValid": boolean,
              "confidence": number (0-100),
              "detectedFoods": string[],
              "missingFoods": string[],
              "feedback": string,
              "nutritionalMatch": number (0-100),
              "estimatedCalories": number
            }`
          },
          {
            role: 'user',
            content: `Refeição: ${mealType}
            Alimentos esperados: ${expectedFoods.join(', ')}
            Descrição da imagem: ${imageDescription || 'Imagem de uma refeição'}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, await response.text());
      throw new Error('Erro na API do OpenAI');
    }

    const data = await response.json();
    const aiResponse = JSON.parse(data.choices[0].message.content);

    console.log('AI validation result:', aiResponse);

    // Save meal validation to database
    const { error: insertError } = await supabaseClient
      .from('meals')
      .insert({
        user_id: user.id,
        meal_type: mealType,
        expected_foods: expectedFoods,
        detected_foods: aiResponse.detectedFoods,
        missing_foods: aiResponse.missingFoods,
        validation_status: aiResponse.isValid ? 'approved' : 'rejected',
        confidence_score: aiResponse.confidence / 100,
        ai_feedback: aiResponse.feedback,
        nutritional_match: aiResponse.nutritionalMatch / 100,
        calories_estimated: aiResponse.estimatedCalories
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error('Erro ao salvar no banco de dados');
    }

    return new Response(JSON.stringify(aiResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in validate-meal function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno do servidor' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});