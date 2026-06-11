"use client";

import React, { useEffect, useRef, useState } from "react";

type Role = "user" | "assistant";

type Message = {
    id: string;
    role: Role;
    text: string;
    isTyping?: boolean;
};

export default function ChatClient() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "m0",
            role: "assistant",
            text: "Welcome. Tell me your problems. I'll make them so much worse. 🔥",
        },
    ]);

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        // Auto-scroll to bottom when messages change
        const el = containerRef.current;
        if (el) {
            el.scrollTop = el.scrollHeight;
        }
    }, [messages, loading]);

    useEffect(() => {
        // Resize textarea on mount/update
        resizeTextarea();
    }, [input]);

    function resizeTextarea() {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.style.height = "auto";
        const maxHeight = 24 * 5 + 24; // approx for 5 lines
        ta.style.height = Math.min(ta.scrollHeight, maxHeight) + "px";
    }

    function buildProblemFromHistory(userText: string) {
        // Combine the full conversation into a single prompt string
        const lines: string[] = [];
        for (const m of messages) {
            const who = m.role === "user" ? "User" : "AI";
            lines.push(`${who}: ${m.text}`);
        }
        lines.push(`User: ${userText}`);
        lines.push("AI:");
        return lines.join("\n");
    }

    async function handleSend() {
        const text = input.trim();
        if (!text) return;

        const userMsg: Message = { id: String(Date.now()), role: "user", text };
        setMessages((m) => [...m, userMsg]);
        setInput("");
        setLoading(true);

        // Add typing indicator
        const typingId = "typing";
        setMessages((m) => [...m, { id: typingId, role: "assistant", text: "", isTyping: true }]);

        try {
            const problem = buildProblemFromHistory(text);
            const res = await fetch("/api/roast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ problem }),
            });
            const data = await res.json();
            const roastText = data?.roast || data?.message || data?.error || "The roast refused to appear.";

            // Replace typing indicator with actual assistant message
            setMessages((m) => {
                return m.map((it) => (it.id === typingId ? { id: String(Date.now()), role: "assistant", text: roastText } : it));
            });
        } catch (err) {
            setMessages((m) => m.map((it) => (it.id === "typing" ? { id: String(Date.now()), role: "assistant", text: "Something went wrong summoning the roast." } : it)));
        } finally {
            setLoading(false);
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!loading) handleSend();
        }
    }

    function startNewChat() {
        setMessages([
            {
                id: "m0",
                role: "assistant",
                text: "Welcome. Tell me your problems. I'll make them so much worse. 🔥",
            },
        ]);
        setInput("");
    }

    return (
        <div className="flex h-screen flex-col bg-[#080808] text-white">
            {/* Top navbar */}
            <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="logo" className="h-10 w-auto" />
                    <span className="text-lg font-semibold">edalbab.ai</span>
                </div>
                <div>
                    <button
                        onClick={startNewChat}
                        className="rounded-md bg-zinc-900/60 px-3 py-2 text-sm font-semibold text-white shadow-[0_6px_20px_rgba(0,0,0,0.6)] hover:bg-zinc-900/80"
                    >
                        New Chat
                    </button>
                </div>
            </header>

            {/* Chat area */}
            <div ref={containerRef} className="custom-scrollbar flex-1 overflow-y-auto px-4 py-6">
                <div className="mx-auto max-w-3xl space-y-4">
                    {messages.map((m) => (
                        <div key={m.id} className={`flex items-end ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                            {m.role === "assistant" ? (
                                <div className="flex items-end gap-3">
                                    <img src="/logo.png" alt="edal" className="h-8 w-8 rounded-full" />
                                    <div className="max-w-[75%] rounded-2xl bg-zinc-900/70 px-4 py-3 text-sm text-zinc-200 shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
                                        {m.isTyping ? (
                                            <div className="flex items-center gap-1">
                                                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
                                                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500 [animation-delay:0.12s]" />
                                                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500 [animation-delay:0.24s]" />
                                            </div>
                                        ) : (
                                            <span className="whitespace-pre-wrap">{m.text}</span>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-end gap-3">
                                    <div className="max-w-[75%] rounded-2xl bg-gradient-to-br from-[#330b0b] to-[#220808] px-4 py-3 text-sm font-medium text-white shadow-[0_10px_30px_rgba(185,28,28,0.12)]">
                                        <span className="whitespace-pre-wrap">{m.text}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Input bar */}
            <div className="border-t border-zinc-800 px-4 py-3">
                <div className="mx-auto max-w-3xl">
                    <div className="flex items-end gap-3">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Tell me your problem..."
                            className="min-h-[44px] max-h-[160px] w-full resize-none rounded-xl bg-[#0b0b0b] px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-red-600/30"
                        />
                        <button
                            onClick={() => { if (!loading) handleSend(); }}
                            disabled={loading || !input.trim()}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#b91c1c] to-[#7f1d1d] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(185,28,28,0.28)] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? "Thinking..." : "Send"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
