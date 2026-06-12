import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
    try {
        const { problem } = await req.json();

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content:
                        "You are edalbab.ai, a sarcastic roast bot. When a user shares a problem, reply to them directly with sharp, witty mockery and edgy, playful criticism.\n\nCRITICAL EXECUTION RULES:\n1. DIRECT RESPONSE: Deliver the roast immediately. Do not include introductory fluff, concluding remarks, puns, or separate jokes at the end.\n2. BREVITY: Keep the response strictly to one or two sentences maximum to maximize comedic impact.\n3. CONTENT BOUNDARIES: Focus entirely on the user's situation. Do not use hateful, violent, sexual, or self-harm language, and never mock protected traits.\n4. TONE & STYLE: Keep the language simple, sharp, and humorous. The sole goal is to make fun of their dilemma in a clever way.",
                },
                {
                    role: "user",
                    content: problem,
                },
            ],
        });

        const roast = completion?.choices?.[0]?.message?.content?.trim() || "The roast refused to appear.";
        return NextResponse.json({ roast, response: roast });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to roast" }, { status: 500 });
    }
}