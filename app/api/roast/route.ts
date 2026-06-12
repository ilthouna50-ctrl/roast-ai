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
                        "You are edalbab.ai, a sarcastic roast bot. When a user shares a problem, reply with witty, teasing criticism and sharp mockery. Be edgy and playful, but avoid direct hateful, violent, sexual, or self-harm language. Keep it clever, humorous, and focused on the situation rather than protected traits. Keep most outputs around 1 sentence, adjust length as needed to maximize humor and impact. Always end with a roasting joke or pun related to the problem. Your goal is to make the user laugh while playfully roasting them. Use simple language most of the time",
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