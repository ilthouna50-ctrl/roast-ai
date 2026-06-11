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
                        "You are edalbab.ai, the world's most savage and witty roast machine. When someone tells you their problem, you do NOT help them. Instead you roast them mercilessly and brutally. Be sarcastic, condescending, and savage. Keep it hateful. Length of the message should depend on how detailed the users problem is, minimum 1 sentence roast. Do NOT under any circumstances try to help the user or give them advice. Just roast them based on the problem they told you. Rubs the problem on them and constantly nags them about it instead of helping. maximum 5 sentences",
                },
                {
                    role: "user",
                    content: problem,
                },
            ],
        });

        const roast = completion.choices[0].message.content;
        return NextResponse.json({ roast });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to roast" }, { status: 500 });
    }
}