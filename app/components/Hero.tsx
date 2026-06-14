"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center text-center text-white">
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-4 sm:gap-8 px-4 sm:px-6">

        <div className="animate-[pulseGlow_3.2s_ease-in-out_infinite]">
          <Image
            src="/logo.jpg"
            alt="Logo"
            width={280}
            height={280}
            className="h-36 w-36 rounded-full object-cover sm:h-64 sm:w-64"
          />
        </div>

        <h1 className="max-w-3xl text-2xl font-bold leading-tight text-white sm:text-3xl md:text-5xl">
          Welcome Back.
        </h1>

        <p className="max-w-2xl text-xs text-slate-400 sm:text-sm md:text-lg mb-6">
          edalbab.ai — Speak your mind. Regret it instantly.
        </p>
      </div>

      <style>{`
        @keyframes pulseGlow {
          0%, 100% { 
            opacity: 0.8; 
            filter: drop-shadow(0 0 6px rgba(239,68,68,0.3)) drop-shadow(0 0 14px rgba(239,68,68,0.2));
          }
          50% { 
            opacity: 1; 
            filter: drop-shadow(0 0 14px rgba(239,68,68,0.7)) drop-shadow(0 0 35px rgba(239,68,68,0.4)) drop-shadow(0 0 60px rgba(239,68,68,0.15));
          }
        }
      `}</style>
    </div>
  );
}