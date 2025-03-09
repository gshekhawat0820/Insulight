import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase-server";
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});

// Add cache control to prevent repeated requests
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { csvData, targetRange } = body;
    
    if (!csvData) {
      return NextResponse.json(
        { error: "CSV data is required" },
        { status: 400 }
      );
    }

    if (!targetRange || typeof targetRange !== 'object') {
      return NextResponse.json(
        { error: "Target range is required" },
        { status: 400 }
      );
    }

    // Create a system prompt that instructs the model how to analyze the data
    const systemPrompt = `
You are an expert diabetes management assistant analyzing glucose data. 
The CSV data provided contains the following columns: timestamp, glucose_level (in mg/dL), and insulin_value.
The user's target range is ${targetRange.min || 70} mg/dL to ${targetRange.max || 180} mg/dL.

Analyze the data and provide:
1. A summary of glucose control (time in range, patterns of highs and lows)
2. Identified patterns (e.g., overnight trends, post-meal spikes)
3. Potential correlations between insulin doses and glucose levels
4. Actionable recommendations to improve glucose management
5. Any other insights that might be helpful

Format your response in clear sections with headers, and focus on being helpful and actionable.
`;

    // Call OpenAI API with the CSV data
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Here is my glucose data:\n\n${csvData}` }
      ],
      temperature: 0.5,
      max_tokens: 1500,
    });

    // Extract the AI response
    const insights = response.choices[0]?.message?.content || "No insights were generated. Please try again.";

    return NextResponse.json({ insights }, {
      headers: {
        'Cache-Control': 'private, max-age=3600'
      }
    });
  } catch (error: any) {
    console.error("Error generating insights:", error);
    
    // More descriptive error messages based on error type
    const errorMessage = error.code === 'insufficient_quota' 
      ? "API quota exceeded. Please try again later."
      : error.message || "Failed to generate insights";
      
    return NextResponse.json(
      { error: errorMessage },
      { status: error.status || 500 }
    );
  }
}