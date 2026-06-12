"use client";

import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import Disclaimer from "./components/Disclaimer";
import Hero from "./components/Hero";
import LoadingScreen from "./components/LoadingScreen";
import Sidebar from "./components/Sidebar";

type ChatMessage = {
    role: "user" | "ai";
    content: string;
};

type Chat = {
    id: string;
    title: string;
    messages: ChatMessage[];
};

function createChat() {
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return { id, title: "New chat", messages: [] } as Chat;
}

function generateChatTitle(problem: string) {
    const clean = problem
        .trim()
        .replace(/^(hi|hello|hey)[,!\s]*/i, "")
        .replace(/^i('?m| am)\s+/i, "")
        .replace(/\s+/g, " ")
        .replace(/[.!?]+$/, "");

    const subject = clean.length > 60 ? `${clean.slice(0, 60).trim()}...` : clean || "an impossible situation";
    const templates = [
        `Drama alert: ${subject}`,
        `Red flag saga: ${subject}`,
        `Scorched earth take on ${subject}`,
        `Instant regret about ${subject}`,
        `Total meltdown: ${subject}`,
        `This one’s about ${subject}`,
        `Unfiltered chaos around ${subject}`,
    ];

    if (/worried|anxious|scared|nervous|panic/i.test(problem)) {
        return `Anxiety meltdown: ${subject}`;
    }
    if (/work|job|boss|office/i.test(problem)) {
        return `Workplace disaster: ${subject}`;
    }
    if (/love|dating|relationship|breakup/i.test(problem)) {
        return `Romance trainwreck: ${subject}`;
    }
    if (/money|broke|debt|bank/i.test(problem)) {
        return `Financial horror story: ${subject}`;
    }

    return templates[Math.floor(Math.random() * templates.length)];
}

export default function Page() {
    const [stage, setStage] = useState<"disclaimer" | "loading" | "ready">("disclaimer");
    const [chats, setChats] = useState<Chat[]>(() => [createChat()]);
    const [activeChatId, setActiveChatId] = useState<string>(chats[0].id);
    const [prompt, setPrompt] = useState("");
    const [isWaiting, setIsWaiting] = useState(false);
    const [waitingChatId, setWaitingChatId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (stage === "loading") {
            const timer = window.setTimeout(() => setStage("ready"), 2400);
            return () => window.clearTimeout(timer);
        }
    }, [stage]);

    const activeChat = useMemo(
        () => chats.find((chat) => chat.id === activeChatId) ?? chats[0],
        [activeChatId, chats]
    );

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [activeChat.messages.length, waitingChatId]);

    const handleAccept = () => setStage("loading");

    const handleNewChat = () => {
        const nextChat = createChat();
        setChats((current) => [nextChat, ...current]);
        setActiveChatId(nextChat.id);
        setPrompt("");
        setError(null);
    };

    const handleSelectChat = (id: string) => {
        setActiveChatId(id);
        setError(null);
    };

    const handleDeleteChat = (id: string) => {
        setChats((current) => {
            const next = current.filter((chat) => chat.id !== id);
            if (next.length === 0) {
                const fresh = createChat();
                setActiveChatId(fresh.id);
                return [fresh];
            }
            if (id === activeChatId) {
                setActiveChatId(next[0].id);
            }
            return next;
        });
    };

    const sendMessage = async () => {
        const problem = prompt.trim();
        if (!problem || isWaiting || !activeChat) return;

        setPrompt("");
        setError(null);
        setChats((current) =>
            current.map((chat) => {
                if (chat.id !== activeChat.id) return chat;
                const title = chat.messages.length === 0 ? generateChatTitle(problem) : chat.title;
                return {
                    ...chat,
                    title,
                    messages: [...chat.messages, { role: "user", content: problem }],
                };
            })
        );

        setIsWaiting(true);
        setWaitingChatId(activeChat.id);

        try {
            const response = await fetch("/api/roast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ problem }),
            });

            if (!response.ok) {
                throw new Error("Server error");
            }

            const data = await response.json();
            const answer = typeof data.roast === "string"
                ? data.roast
                : typeof data.response === "string"
                    ? data.response
                    : "The AI could not roast that.";

            setChats((current) =>
                current.map((chat) => {
                    if (chat.id !== activeChat.id) return chat;
                    return {
                        ...chat,
                        messages: [...chat.messages, { role: "ai", content: answer }],
                    };
                })
            );
        } catch (err) {
            setError("Something went wrong. Try again.");
        } finally {
            setIsWaiting(false);
            setWaitingChatId(null);
        }
    };

    const handlePromptKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    if (stage === "disclaimer") {
        return <Disclaimer onAccept={handleAccept} />;
    }

    if (stage === "loading") {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.18),transparent_24%),radial-gradient(circle_at_bottom,rgba(239,68,68,0.16),transparent_30%),linear-gradient(180deg,#080808,#0b0202)] text-white">
            <div className="mx-auto flex h-screen max-w-full overflow-hidden bg-transparent text-slate-100">
                <Sidebar
                    chats={chats}
                    activeChat={activeChat.id}
                    onNewChat={handleNewChat}
                    onSelectChat={handleSelectChat}
                    onDeleteChat={handleDeleteChat}
                    onRenameChat={(id, title) => {
                        setChats((current) =>
                            current.map((chat) => (chat.id === id ? { ...chat, title } : chat))
                        );
                    }}
                />

                <main className="flex-1 flex flex-col overflow-hidden bg-transparent">
                    <div className="flex h-full flex-col min-h-0">
                        <div className="border-b border-white/10 px-6 py-4">
                            <h1 className="text-xl font-semibold text-white">Edalbab.ai</h1>
                        </div>
                        <div className="flex-1 min-h-0 overflow-hidden">
                            {activeChat.messages.length === 0 ? (
                                <div className="flex h-full items-center justify-center px-6 py-10">
                                    <Hero />
                                </div>
                            ) : (
                                <div className="flex h-full flex-col overflow-hidden px-6 py-6">
                                    <div className="flex-1 min-h-0 overflow-y-auto pr-2">
                                        <div className="space-y-4">
                                            {activeChat.messages.map((message, index) => (
                                                <div
                                                    key={`${message.role}-${index}`}
                                                    className={`flex items-end gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                                >
                                                    {message.role === "ai" && (
                                                        <div className="mt-1 h-10 w-10 overflow-hidden rounded-full bg-[#121212]">
                                                            <img src="/logo.jpg" alt="AI avatar" className="h-full w-full object-cover" />
                                                        </div>
                                                    )}

                                                    <div
                                                        className={`${message.role === "user"
                                                            ? "max-w-[80%] rounded-3xl rounded-br-sm bg-gradient-to-r from-red-700 to-red-600 px-4 py-3 text-right text-white shadow-[0_20px_60px_rgba(239,68,68,0.18)]"
                                                            : "max-w-[80%] rounded-3xl rounded-bl-sm bg-[#141414] px-4 py-3 text-left text-slate-200 shadow-inner"
                                                            }`}
                                                    >
                                                        <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                                                    </div>
                                                </div>
                                            ))}

                                            {waitingChatId === activeChat.id && isWaiting && (
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-1 h-10 w-10 overflow-hidden rounded-full bg-[#121212]">
                                                        <img src="/logo.jpg" alt="AI avatar" className="h-full w-full object-cover" />
                                                    </div>
                                                    <div className="rounded-3xl rounded-bl-sm bg-[#141414] px-4 py-3 text-slate-400 shadow-inner">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-red-400"></span>
                                                            <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-red-400 animation-delay-150"></span>
                                                            <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-red-400 animation-delay-300"></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div ref={messagesEndRef} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="sticky bottom-0 z-10 border-t border-white/10 bg-[#090909]/95 px-6 py-4 backdrop-blur-xl">
                            {error && <div className="mb-3 text-sm text-red-300">{error}</div>}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                <textarea
                                    value={prompt}
                                    onChange={(event) => setPrompt(event.target.value)}
                                    onKeyDown={handlePromptKeyDown}
                                    rows={2}
                                    placeholder="Type your problem..."
                                    className="min-h-[88px] flex-1 resize-none rounded-3xl border border-white/10 bg-[#111111] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                />
                                <button
                                    type="button"
                                    onClick={sendMessage}
                                    disabled={!prompt.trim() || isWaiting}
                                    className="inline-flex h-14 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-r from-red-700 via-red-600 to-red-500 px-6 text-sm font-semibold text-white transition duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50 hover:-translate-y-0.5"
                                >
                                    {isWaiting ? "Roasting..." : "Send"}
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
