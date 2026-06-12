"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-transparent text-center text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.22),transparent_35%)]" />

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-8 px-6">
        <div className="animate-[pulseGlow_3.6s_ease-in-out_infinite] rounded-full">
          <Image
            src="/logo.jpg"
            alt="Logo"
            width={140}
            height={140}
            className="h-[140px] w-[140px] rounded-full object-cover"
          />
        </div>

        <h1 className="max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl">
          Welcome back. I'll make your problems so much worse.
        </h1>

        <p className="max-w-2xl text-sm text-slate-400 sm:text-base">
          edalbab.ai — Speak your mind. Regret it instantly.
        </p>
      </div>

      <style>{`\n        @keyframes pulseGlow {\n          0%, 100% { opacity: 0.92; filter: drop-shadow(0 0 24px rgba(239,68,68,0.28)); }\n          50% { opacity: 1; filter: drop-shadow(0 0 48px rgba(239,68,68,0.45)); }\n        }\n      `}</style>
    </div>
  );
}
