"use client";

import { ArrowUp, Menu } from "lucide-react";
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
    pinned: boolean;
};

function createChat() {
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return { id, title: "New chat", messages: [], pinned: false } as Chat;
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
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const resizeTextarea = (textarea: HTMLTextAreaElement | null) => {
        if (!textarea) return;
        textarea.style.height = "auto";
        textarea.style.height = `${Math.max(24, textarea.scrollHeight)}px`;
    };

    useEffect(() => {
        if (stage === "loading") {
            const timer = window.setTimeout(() => setStage("ready"), 2400);
            return () => window.clearTimeout(timer);
        }
    }, [stage]);

    // keyboard handling removed in favor of scrollIntoView on textarea focus

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
        setMobileSidebarOpen(false);
    };

    const handlePinChat = (id: string) => {
        setChats((current) => current.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)));
    };

    const sortedChats = useMemo(() => {
        return [...chats].sort((a, b) => Number(b.pinned) - Number(a.pinned));
    }, [chats]);

    const handleSelectChat = (id: string) => {
        setActiveChatId(id);
        setError(null);
        setMobileSidebarOpen(false);
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
        if (textareaRef.current) textareaRef.current.style.height = "auto";
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
        <div className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.18),transparent_24%),radial-gradient(circle_at_bottom,rgba(239,68,68,0.16),transparent_30%),linear-gradient(180deg,#080808,#0b0202)] text-white">
            <div className="mx-auto flex h-full max-w-full overflow-hidden bg-transparent text-slate-100">
                <div className="hidden md:block">
                    <Sidebar
                        chats={sortedChats}
                        activeChat={activeChat.id}
                        onNewChat={handleNewChat}
                        onSelectChat={handleSelectChat}
                        onDeleteChat={handleDeleteChat}
                        onPinChat={handlePinChat}
                        onRenameChat={(id, title) => {
                            setChats((current) =>
                                current.map((chat) => (chat.id === id ? { ...chat, title } : chat))
                            );
                        }}
                    />
                </div>

                {mobileSidebarOpen && (
                    <div className="fixed inset-0 z-50 flex md:hidden">
                        <div
                            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
                            onClick={() => setMobileSidebarOpen(false)}
                        />
                        <div className="relative z-10 h-full w-full max-w-[280px]">
                            <Sidebar
                                chats={sortedChats}
                                activeChat={activeChat.id}
                                onNewChat={handleNewChat}
                                onSelectChat={handleSelectChat}
                                onDeleteChat={handleDeleteChat}
                                onPinChat={handlePinChat}
                                onRenameChat={(id, title) => {
                                    setChats((current) =>
                                        current.map((chat) => (chat.id === id ? { ...chat, title } : chat))
                                    );
                                }}
                            />
                        </div>
                    </div>
                )}

                <main className="flex-1 flex flex-col overflow-hidden bg-transparent">
                    <div className="flex h-full flex-col min-h-0">
                        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-6">
                            <button
                                type="button"
                                onClick={() => setMobileSidebarOpen(true)}
                                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-[#111111]/95 px-3 py-2 text-sm text-white transition duration-200 hover:bg-[#111111] md:hidden"
                            >
                                <Menu className="h-4 w-4" />
                            </button>
                            <h1 className="text-xl font-semibold text-white">Edalbab.ai</h1>
                        </div>
                        <div className="flex-1 min-h-0 overflow-hidden">
                            {activeChat.messages.length === 0 ? (
                                <div className="flex h-full items-center justify-center px-6 py-10">
                                    <Hero />
                                </div>
                            ) : (
                                <div className="flex h-full flex-col overflow-hidden px-6 py-6">
                                    <div className="flex-1 min-h-0 overflow-y-auto pr-2 pb-32">
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
                                                            ? "max-w-[90%] sm:max-w-[80%] rounded-3xl rounded-br-sm bg-gradient-to-r from-red-700 to-red-600 px-3 py-2 sm:px-4 sm:py-3 text-right text-white shadow-[0_20px_60px_rgba(239,68,68,0.18)]"
                                                            : "max-w-[90%] sm:max-w-[80%] rounded-3xl rounded-bl-sm bg-[#141414] px-3 py-2 sm:px-4 sm:py-3 text-left text-slate-200 shadow-inner"
                                                            }`}
                                                    >
                                                        <p className="whitespace-pre-wrap text-xs sm:text-sm leading-6">{message.content}</p>
                                                    </div>
                                                </div>
                                            ))}

                                            {waitingChatId === activeChat.id && isWaiting && (
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-1 h-10 w-10 overflow-hidden rounded-full bg-[#121212]">
                                                        <img src="/logo.jpg" alt="AI avatar" className="h-full w-full object-cover" />
                                                    </div>
                                                    <div className="rounded-3xl rounded-bl-sm bg-[#141414] px-3 py-2 sm:px-4 sm:py-3 text-slate-400 shadow-inner">
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

                        <div className="sticky bottom-0 left-0 right-0 z-10">
                            {error && <div className="mb-3 text-sm text-red-300 px-6">{error}</div>}
                            <div className="mx-auto mb-6 w-full max-w-3xl px-4 sm:px-6">
                                <div className="flex items-center gap-3 rounded-full border border-white/10 bg-[#141414] px-3 py-2 sm:px-4 sm:py-2">
                                    <textarea
                                        ref={textareaRef}
                                        value={prompt}
                                        onChange={(event) => {
                                            setPrompt(event.target.value);
                                            resizeTextarea(event.target);
                                        }}
                                        onFocus={() => {
                                            setTimeout(() => textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
                                        }}
                                        onKeyDown={handlePromptKeyDown}
                                        rows={1}
                                        placeholder="Talk to edalbab.ai"
                                        className="min-h-[24px] flex-1 resize-none rounded-full border-0 bg-transparent px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={sendMessage}
                                        disabled={!prompt.trim() || isWaiting}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-red-700 via-red-600 to-red-500 text-white transition duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <ArrowUp className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="mt-2 text-center text-xs text-slate-500">
                                    edalbab.ai is satire. Don't take the roasts personally — or seriously.
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
