"use client";

import Image from "next/image";

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.22),transparent_40%)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/85 to-black" />

            <div className="relative flex flex-col items-center gap-6 px-6 text-center">
                <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-red-500/20 blur-2xl opacity-80 animate-[glowPulse_2.8s_ease-in-out_infinite]" />
                    <Image
                        src="/logo.jpg"
                        alt="Logo"
                        width={120}
                        height={120}
                        className="relative h-[120px] w-[120px] rounded-full object-cover animate-[lift_2.8s_ease-in-out_infinite]"
                    />
                </div>

                <div className="w-[240px] overflow-hidden rounded-full border border-white/10 bg-white/10">
                    <div className="h-2 w-full rounded-full bg-gradient-to-r from-red-500 via-orange-400 to-yellow-300 animate-[loadingProgress_2.4s_ease-in-out_1]" />
                </div>

                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                    Summoning the demons...
                </p>
            </div>

            <style>{`
                @keyframes lift {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes glowPulse {
                    0%, 100% { opacity: 0.6; filter: blur(12px); }
                    50% { opacity: 1; filter: blur(24px); }
                }
                @keyframes loadingProgress {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}
