'use client';

import { useRouter } from 'next/navigation';

type PaymentSuccessModalProps = {
    open: boolean;
    freelancerId?: string;
};

export default function PaymentSuccessModal({
    open,
    freelancerId
}: PaymentSuccessModalProps) {
    const router = useRouter();

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-cyan-200 rounded-3xl p-8 w-full max-w-md text-center shadow-2xl">

                {/* Success Icon */}
                <div className="flex justify-center mb-8">
                    <div className="relative">

                        {/* Wave Effect */}
                        <div className="absolute inset-0 rounded-full border border-cyan-400 animate-ping opacity-30" />

                        {/* Glow */}
                        <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-xl scale-150" />

                        {/* Outer Ring */}
                        <div className="relative w-28 h-28 rounded-full border border-cyan-200 flex items-center justify-center">

                            {/* Inner Circle */}
                            <div className="w-20 h-20 rounded-full bg-cyan-50 border border-cyan-400 flex items-center justify-center">

                                <svg
                                    className="w-10 h-10 text-cyan-500"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>

                            </div>
                        </div>
                    </div>
                </div>

                <h2 className="text-4xl font-bold text-slate-900 mb-4">
                    Payment Successful!
                </h2>

                <p className="text-slate-500 text-lg leading-relaxed mb-8">
                    Your order has been sent to the freelancer.
                    You can now chat with them to begin the session.
                </p>

                {/* TOMBOL INI SEKARANG MENGARAH KE INBOX */}
                <button
                    onClick={() => {
                        if (freelancerId) {
                            router.push(`/client/inbox?freelancerId=${freelancerId}`);
                        } else {
                            router.push('/client/inbox');
                        }
                    }}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-4 rounded-xl mb-4 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                    CHAT FREELANCER SEKARANG
                </button>

                <button
                    onClick={() => router.push('/client/dashboard')}
                    className="text-slate-500 hover:text-slate-800 text-sm font-bold transition-colors"
                >
                    RETURN TO DASHBOARD
                </button>

            </div>
        </div>
    );
}