"use client";

import Image from "next/image";

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.22),transparent_40%)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/85 to-black" />

            <div className="relative flex flex-col items-center gap-6 px-6 text-center animate-[fadeInUp_0.4s_ease-out_forwards]">
                <div className="relative flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-500/10 blur-3xl opacity-60 animate-[glowPulse_2.8s_ease-in-out_infinite]" />
                        <Image
                            src="/logo.jpg"
                            alt="Logo"
                            width={160}
                            height={160}
                            priority
                            className="relative h-[160px] w-[160px] object-contain animate-[lift_2.8s_ease-in-out_infinite]"
                        />
                    </div>

                    <p className="text-lg font-bold tracking-widest text-white">
                        edalbab.ai
                    </p>

                    <div className="w-[240px] overflow-hidden rounded-full border border-white/10 bg-white/10">
                        <div className="h-2 rounded-full bg-gradient-to-r from-red-500 via-orange-400 to-yellow-300 animate-[loadingProgress_2.4s_ease-in-out_1_forwards]" />
                    </div>

                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                        Summoning the demons...
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes fadeInUp {
                    0% { opacity: 0; transform: translateY(16px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes lift {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes glowPulse {
                    0%, 100% { opacity: 0.5; filter: blur(20px); }
                    50% { opacity: 0.9; filter: blur(40px); }
                }
                @keyframes loadingProgress {
                    0% { width: 0%; }
                    60% { width: 65%; }
                    75% { width: 65%; }
                    85% { width: 68%; }
                    100% { width: 100%; }
                }
            `}</style>
        </div>
    );
}