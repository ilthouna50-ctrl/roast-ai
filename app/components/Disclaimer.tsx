"use client";

import Image from "next/image";

type DisclaimerProps = {
    onAccept: () => void;
};

export default function Disclaimer({ onAccept }: DisclaimerProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.18),transparent_35%)]" />
            <div className="relative mx-4 w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#070707]/95 p-8 text-center shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-red-500/25 bg-white/5">
                    <Image src="/logo.jpg" alt="Logo" width={80} height={80} className="object-cover" />
                </div>

                <h2 className="mb-4 text-3xl font-semibold leading-tight text-white">Before You Continue</h2>

                <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                    edalbab.ai is built purely for entertainment. Everything the AI says is satirical, exaggerated, and not meant to be taken seriously. If you're feeling genuinely down, please talk to a real person.
                </p>

                <button
                    type="button"
                    onClick={onAccept}
                    className="mt-8 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-red-500 px-8 py-3 text-base font-semibold text-white shadow-[0_18px_40px_rgba(239,68,68,0.32)] transition duration-200 ease-out hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-red-400/60 focus:ring-offset-2 focus:ring-offset-black"
                >
                    I Understand 🔥
                </button>
            </div>
        </div>
    );
}
