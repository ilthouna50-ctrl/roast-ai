"use client";

import { MessageSquare, Pencil, Plus, Search, Trash2, Pin } from "lucide-react";
import { useMemo, useRef, useState } from "react";

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

type SidebarProps = {
    chats: Chat[];
    activeChat: string;
    onNewChat: () => void;
    onSelectChat: (id: string) => void;
    onRenameChat: (id: string, title: string) => void;
    onDeleteChat: (id: string) => void;
    onPinChat: (id: string) => void;
};

export default function Sidebar({ chats, activeChat, onNewChat, onSelectChat, onRenameChat, onDeleteChat, onPinChat }: SidebarProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [editingChatId, setEditingChatId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState("");
    const [contextMenuChatId, setContextMenuChatId] = useState<string | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const longPressTimer = useRef<number | null>(null);
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const visibleChats = useMemo(() => {
        if (!normalizedSearch) {
            return chats.map((chat) => ({ chat, preview: "" }));
        }

        return chats
            .map((chat) => {
                const titleText = chat.title.toLowerCase();
                if (titleText.includes(normalizedSearch)) {
                    return { chat, preview: `Title match: ${chat.title}` };
                }

                const messageMatch = chat.messages.find((message) => message.content.toLowerCase().includes(normalizedSearch));
                if (!messageMatch) {
                    return null;
                }

                const matchIndex = messageMatch.content.toLowerCase().indexOf(normalizedSearch);
                const start = Math.max(0, matchIndex - 24);
                const end = Math.min(messageMatch.content.length, matchIndex + normalizedSearch.length + 24);
                const snippet = `${start > 0 ? "..." : ""}${messageMatch.content.slice(start, end).trim()}${end < messageMatch.content.length ? "..." : ""}`;
                return { chat, preview: `Match in chat: ${snippet}` };
            })
            .filter((item): item is { chat: Chat; preview: string } => item !== null);
    }, [chats, normalizedSearch]);

    const renderChatItem = ({ chat, preview }: { chat: Chat; preview: string }) => {
        const isActive = chat.id === activeChat;
        return (
            <div
                key={chat.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                    setContextMenuChatId(null);
                    onSelectChat(chat.id);
                }}
                onTouchStart={() => {
                    if (longPressTimer.current) {
                        window.clearTimeout(longPressTimer.current);
                    }
                    longPressTimer.current = window.setTimeout(() => {
                        setContextMenuChatId(chat.id);
                        longPressTimer.current = null;
                    }, 500);
                }}
                onTouchMove={() => {
                    if (longPressTimer.current) {
                        window.clearTimeout(longPressTimer.current);
                        longPressTimer.current = null;
                    }
                }}
                onTouchEnd={() => {
                    if (longPressTimer.current) {
                        window.clearTimeout(longPressTimer.current);
                        longPressTimer.current = null;
                    }
                }}
                onTouchCancel={() => {
                    if (longPressTimer.current) {
                        window.clearTimeout(longPressTimer.current);
                        longPressTimer.current = null;
                    }
                }}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setContextMenuChatId(null);
                        onSelectChat(chat.id);
                    }
                }}
                className={`group flex w-full items-start justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${isActive
                    ? 'bg-red-500/15 shadow-[0_0_20px_rgba(239,68,68,0.12)]'
                    : 'hover:bg-white/5'
                    }`}
            >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/5 text-red-300">
                        <MessageSquare className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                        {editingChatId === chat.id ? (
                            <input
                                autoFocus
                                value={editingTitle}
                                onChange={(event) => setEditingTitle(event.target.value)}
                                onKeyDown={(event) => {
                                    event.stopPropagation();
                                    if (event.key === "Enter") {
                                        event.preventDefault();
                                        onRenameChat(chat.id, editingTitle.trim() || chat.title);
                                        setEditingChatId(null);
                                        setEditingTitle("");
                                    }
                                    if (event.key === "Escape") {
                                        setEditingChatId(null);
                                        setEditingTitle("");
                                    }
                                }}
                                onBlur={() => {
                                    onRenameChat(chat.id, editingTitle.trim() || chat.title);
                                    setEditingChatId(null);
                                    setEditingTitle("");
                                }}
                                className="w-full rounded-2xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500"
                            />
                        ) : (
                            <>
                                <div className="truncate text-slate-200 flex items-center gap-2">
                                    <span className="truncate">{chat.title || "Untitled roast"}</span>
                                    {chat.pinned && <Pin className="h-3 w-3 text-red-400" />}
                                </div>
                                {preview ? (
                                    <div className="mt-1 truncate text-xs text-slate-400">{preview}</div>
                                ) : null}
                            </>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            setEditingChatId(chat.id);
                            setEditingTitle(chat.title);
                        }}
                        className={`opacity-0 transition duration-150 ease-out group-hover:opacity-100`}
                    >
                        <Pencil className="h-4 w-4 text-slate-400 hover:text-red-400" />
                    </button>
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onDeleteChat(chat.id);
                        }}
                        className={`opacity-0 transition duration-150 ease-out group-hover:opacity-100`}
                    >
                        <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-400" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <aside className={`relative flex h-screen flex-col overflow-hidden bg-[#0d0d0d] text-slate-100 shadow-[2px_0_30px_rgba(239,68,68,0.08)] transition-all duration-200 ${isCollapsed ? 'w-[56px] min-w-[56px] border-r-0' : 'w-[280px] border-r border-red-500/10'}`}>
            <div className="flex h-full flex-col items-center justify-start">
                <button
                    type="button"
                    onClick={() => setIsCollapsed((current) => !current)}
                    className="mt-4 hidden h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#111111]/95 text-sm text-white shadow-lg transition hover:bg-[#111111] md:inline-flex"
                >
                    {isCollapsed ? '>' : '<'}
                </button>

                {!isCollapsed ? (
                    <div className="w-full">
                        <div className="flex flex-col gap-4 p-5">
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchTerm("");
                                    onNewChat();
                                }}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-700 via-red-600 to-red-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(239,68,68,0.18)] transition duration-200 ease-out hover:-translate-y-0.5"
                            >
                                <Plus className="h-4 w-4" />
                                New Chat
                            </button>

                            <div className="relative">
                                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="search"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Search chats..."
                                    className="w-full rounded-2xl border border-white/10 bg-[#111111] px-12 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-red-500/40 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                />
                            </div>
                        </div>


                        <div className="flex-1 overflow-y-auto px-3 py-4">
                            <div className="space-y-2">
                                {(() => {
                                    const pinnedVisible = visibleChats.filter((v) => v.chat.pinned);
                                    const recentVisible = visibleChats.filter((v) => !v.chat.pinned);

                                    if (visibleChats.length === 0) {
                                        return (
                                            <div className="rounded-2xl border border-white/10 bg-[#111111] px-4 py-6 text-sm text-slate-400">
                                                No chats match that search. Try another keyword.
                                            </div>
                                        );
                                    }

                                    return (
                                        <>
                                            {pinnedVisible.length > 0 && (
                                                <div className="mb-2 px-3">
                                                    <div className="px-3 text-xs uppercase tracking-[0.35em] text-slate-500">Pinned</div>
                                                    <div className="space-y-2 mt-2">
                                                        {pinnedVisible.map(({ chat, preview }) => renderChatItem({ chat, preview }))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="px-5 text-xs uppercase tracking-[0.35em] text-slate-500">Recent</div>
                                            <div className="space-y-2 mt-2">
                                                {recentVisible.map(({ chat, preview }) => renderChatItem({ chat, preview }))}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                            {contextMenuChatId && (
                                <div className="md:hidden">
                                    <div className="fixed inset-0 z-40 flex items-end justify-center">
                                        <div className="absolute inset-0 bg-black/40" onClick={() => setContextMenuChatId(null)} />

                                        <div className="relative z-50 w-full max-w-md p-4">
                                            <div className="mx-auto w-full rounded-2xl bg-white text-gray-900 shadow-lg divide-y">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const id = contextMenuChatId!;
                                                        setContextMenuChatId(null);
                                                        (typeof onPinChat === 'function') && onPinChat(id);
                                                    }}
                                                    className="flex w-full items-center gap-3 px-4 py-3 text-left"
                                                >
                                                    <Pin className="h-5 w-5 text-gray-700" />
                                                    <span>Pin</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const id = contextMenuChatId!;
                                                        setContextMenuChatId(null);
                                                        setEditingChatId(id);
                                                        const found = chats.find((c) => c.id === id);
                                                        setEditingTitle(found?.title || "");
                                                    }}
                                                    className="flex w-full items-center gap-3 px-4 py-3 text-left"
                                                >
                                                    <Pencil className="h-5 w-5 text-gray-700" />
                                                    <span>Rename</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const id = contextMenuChatId!;
                                                        setContextMenuChatId(null);
                                                        onDeleteChat(id);
                                                    }}
                                                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-red-600"
                                                >
                                                    <Trash2 className="h-5 w-5 text-red-600" />
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}
            </div>
        </aside>
    );
}
