'use client';

import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

type PaymentModalProps = {
    open: boolean;
    paymentMethod: string;
    total: number;
    onClose: () => void;
    onSuccess: () => void;
};

export default function PaymentModal({
    open,
    paymentMethod,
    total,
    onClose,
    onSuccess,
}: PaymentModalProps) {
    const router = useRouter();

    const [isVerifying, setIsVerifying] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    useEffect(() => {
        if (!open) return;

        const paymentTimer = setTimeout(() => {
            setIsVerifying(true);

            setTimeout(() => {
                onSuccess();
                setIsVerifying(false);
                setPaymentSuccess(true);
            }, 30000);

        }, 30000);

        return () => clearTimeout(paymentTimer);
    }, [open]);

    if (!open) return null;

    if (isVerifying) {
        return (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white border border-cyan-200 rounded-3xl p-8 w-full max-w-md text-center shadow-2xl">

                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin" />
                    </div>

                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                        Verifying Payment...
                    </h2>

                    <p className="text-slate-500">
                        Please wait while we verify your payment.
                    </p>

                </div>
            </div>
        );
    }

    if (paymentSuccess) {
        return (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#0F1117] border border-cyan-500 rounded-3xl p-8 w-full max-w-md text-center shadow-[0_0_30px_rgba(34,211,238,0.15)]">

                    <div className="flex justify-center mb-8">
                        <div className="relative">

                            <div className="absolute inset-0 rounded-full border border-cyan-400 animate-ping opacity-30" />

                            <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-xl scale-150" />

                            <div className="relative w-28 h-28 rounded-full border border-cyan-500/40 flex items-center justify-center">

                                <div className="w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-500 flex items-center justify-center">

                                    <CheckCircle className="w-10 h-10 text-cyan-400" />

                                </div>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-4xl font-bold text-white mb-4">
                        Payment Successful!
                    </h2>

                    <p className="text-slate-400 text-lg leading-relaxed mb-8">
                        Your order has been sent to the freelancer.
                        They will contact you shortly to begin the session.
                    </p>

                    <button
                        onClick={() => router.push('/client/orders')}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-4 rounded-xl mb-4 transition-all duration-300"
                    >
                        VIEW ORDER
                    </button>

                    <button
                        onClick={() => router.push('/client/dashboard')}
                        className="text-slate-400 hover:text-white text-sm font-medium transition"
                    >
                        RETURN TO DASHBOARD
                    </button>

                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 w-full max-w-md shadow-2xl">

                <h2 className="text-3xl font-bold text-slate-900 mb-6">
                    Complete Payment
                </h2>

                <div className="space-y-4">

                    <p>
                        Method:
                        <span className="font-bold ml-2">
                            {paymentMethod}
                        </span>
                    </p>

                    {paymentMethod === 'QRIS' ? (
                        <div className="flex justify-center">
                            <img
                                src="/qris-demo.png"
                                alt="QRIS"
                                className="w-56 h-56 rounded-xl border border-slate-200"
                            />
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                            <p className="font-semibold">
                                Account Number
                            </p>

                            <p className="text-xl font-bold">
                                1234567890
                            </p>

                            <p>a.n StudentHub</p>
                        </div>
                    )}

                    <div>
                        <p className="font-semibold">
                            Total Payment
                        </p>

                        <p className="text-2xl font-bold text-cyan-500">
                            Rp {total.toLocaleString('id-ID')}
                        </p>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all duration-200"
                        >
                            Cancel Payment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}