import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing journal entry");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: `You are an AI journal analyzer for mental wellness. Analyze the journal entry and provide:
1. Overall emotional tone (positive, neutral, negative, mixed)
2. Detected emotions (joy, sadness, stress, anxiety, calm, etc.)
3. Sentiment score from -1 (very negative) to 1 (very positive)
4. Brief supportive insights (2-3 sentences)
5. Suggested wellness actions

Respond in JSON format: { "tone": string, "emotions": string[], "sentiment_score": number, "insights": string, "suggestions": string[] }`
          },
          { role: "user", content: content },
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status, await response.text());
      throw new Error("Failed to analyze journal entry");
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;
    
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(analysis);
    } catch {
      parsedAnalysis = {
        tone: "neutral",
        emotions: ["reflective"],
        sentiment_score: 0,
        insights: analysis,
        suggestions: ["Continue journaling regularly"]
      };
    }

    return new Response(
      JSON.stringify(parsedAnalysis),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-journal function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});