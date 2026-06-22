'use client';

import { useEffect, useState, useRef } from 'react';
import { CheckCircle, Upload, X, FileText, Check, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

type PaymentModalProps = {
    open: boolean;
    paymentMethod: string;
    total: number;
    onClose: () => void;
    onSuccess: (receiptUrl: string, senderName: string, paymentMethod: string) => void;
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
    const [verificationStep, setVerificationStep] = useState(0);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // Uploader states
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
    const [senderName, setSenderName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset state on open/close
    useEffect(() => {
        if (open) {
            Promise.resolve().then(() => {
                setIsVerifying(false);
                setVerificationStep(0);
                setPaymentSuccess(false);
                setReceiptFile(null);
                setReceiptPreview(null);
                setSenderName('');
            });
        }
    }, [open]);

    if (!open) return null;

    const handleUseDemoReceipt = () => {
        setReceiptPreview('/demo-receipt.png');
        const dummyFile = new File(["demo"], "demo-receipt.png", { type: "image/png" });
        setReceiptFile(dummyFile);
        if (!senderName) {
            setSenderName('Naufal Arkaan');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setReceiptFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceiptPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveFile = () => {
        setReceiptFile(null);
        setReceiptPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleConfirmPayment = () => {
        if (!receiptFile) return;

        setIsVerifying(true);
        setVerificationStep(1);

        // Step 1: Connecting to bank server... (1.2s)
        setTimeout(() => {
            setVerificationStep(2);
            // Step 2: Scanning transfer proof (OCR)... (1.5s)
            setTimeout(() => {
                setVerificationStep(3);
                // Step 3: Matching transaction amount... (1.5s)
                setTimeout(() => {
                    setVerificationStep(4);
                    // Step 4: Verification successful! (1s)
                    setTimeout(() => {
                        onSuccess(receiptPreview || '', senderName, paymentMethod);
                        setIsVerifying(false);
                        setPaymentSuccess(true);
                    }, 1000);
                }, 1500);
            }, 1500);
        }, 1200);
    };

    const verificationStepsText = [
        "",
        "🔄 Menghubungkan ke server verifikasi bank...",
        "🔍 Memindai gambar bukti transfer (OCR scanning)...",
        "💸 Mencocokkan data nominal transaksi...",
        "✅ Pembayaran berhasil terverifikasi!"
    ];

    if (isVerifying) {
        return (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#0f121d] border border-cyan-500/20 rounded-3xl p-8 w-full max-w-md text-center shadow-2xl relative overflow-hidden">
                    {/* Glowing scanline animation */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
                    
                    <div className="flex justify-center mb-8 relative">
                        <div className="w-20 h-20 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin absolute" />
                        <div className="w-16 h-16 border-4 border-violet-500/10 border-b-violet-500 rounded-full animate-spin [animation-direction:reverse] m-2" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-6">
                        Memproses Pembayaran
                    </h2>

                    {/* Progress steps list */}
                    <div className="space-y-3.5 text-left bg-slate-950/60 rounded-2xl p-5 border border-slate-800/80 mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                verificationStep > 1 
                                    ? 'bg-cyan-500 text-black' 
                                    : verificationStep === 1 
                                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 animate-pulse' 
                                        : 'bg-slate-800 text-slate-500'
                            }`}>
                                {verificationStep > 1 ? <Check className="w-3.5 h-3.5 stroke-[3px]" /> : "1"}
                            </div>
                            <span className={`text-xs font-semibold ${verificationStep >= 1 ? 'text-slate-200' : 'text-slate-500'}`}>
                                Menghubungkan ke Server Bank
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                verificationStep > 2 
                                    ? 'bg-cyan-500 text-black' 
                                    : verificationStep === 2 
                                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 animate-pulse' 
                                        : 'bg-slate-800 text-slate-500'
                            }`}>
                                {verificationStep > 2 ? <Check className="w-3.5 h-3.5 stroke-[3px]" /> : "2"}
                            </div>
                            <span className={`text-xs font-semibold ${verificationStep >= 2 ? 'text-slate-200' : 'text-slate-500'}`}>
                                Memindai Struk Transfer (OCR)
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                verificationStep > 3 
                                    ? 'bg-cyan-500 text-black' 
                                    : verificationStep === 3 
                                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 animate-pulse' 
                                        : 'bg-slate-800 text-slate-500'
                            }`}>
                                {verificationStep > 3 ? <Check className="w-3.5 h-3.5 stroke-[3px]" /> : "3"}
                            </div>
                            <span className={`text-xs font-semibold ${verificationStep >= 3 ? 'text-slate-200' : 'text-slate-500'}`}>
                                Validasi Nominal Rp {total.toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>

                    <p className="text-slate-400 text-xs font-semibold italic min-h-[20px] transition-all">
                        {verificationStepsText[verificationStep]}
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

                    <p className="text-slate-400 text-base leading-relaxed mb-8">
                        Bukti transfer Anda telah dikirim dan diverifikasi. Pesanan Anda kini masuk ke antrean freelancer.
                    </p>

                    <button
                        onClick={() => router.push('/client/orders')}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-4 rounded-xl mb-4 transition-all duration-300 shadow-md shadow-cyan-500/25"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#0f111a] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        Complete Payment
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-5">
                    {/* Payment Info */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl">
                        <div>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Metode Pembayaran</p>
                            <p className="text-base font-extrabold mt-0.5">{paymentMethod}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Tagihan</p>
                            <p className="text-lg font-black text-cyan-600 dark:text-cyan-400 mt-0.5">Rp {total.toLocaleString('id-ID')}</p>
                        </div>
                    </div>

                    {/* Target Transfer Account */}
                    {paymentMethod === 'QRIS' ? (
                        <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/50 rounded-2xl p-4">
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-3">SILAKAN PINDAI QRIS BERIKUT</p>
                            <div className="relative p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                <img
                                    src="/qris-demo.png"
                                    alt="QRIS"
                                    className="w-48 h-48 rounded-xl object-contain"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 space-y-3">
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Rekening Tujuan Transfer</p>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Nomor Rekening</p>
                                    <p className="text-xl font-black tracking-wider text-slate-800 dark:text-slate-200">1234567890</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Nama Penerima</p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">StudentHub Inc.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Receipt Upload Section */}
                    <div className="space-y-3.5">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Konfirmasi Transfer & Bukti Pembayaran
                        </label>

                        {/* Nama Pengirim Input */}
                        <div>
                            <input
                                type="text"
                                placeholder="Nama Pemilik Rekening / Pengirim"
                                value={senderName}
                                onChange={(e) => setSenderName(e.target.value)}
                                className="w-full h-11 bg-slate-50 dark:bg-[#11131c] border border-slate-200 dark:border-slate-800 rounded-xl px-4 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
                            />
                        </div>

                        {/* File Upload / Preview area */}
                        {receiptPreview ? (
                            <div className="relative border border-cyan-500/20 dark:border-cyan-500/30 bg-cyan-500/[0.02] rounded-2xl p-4 flex items-center justify-between gap-4 animate-in fade-in duration-200">
                                <div className="flex items-center gap-3.5 overflow-hidden">
                                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 flex-shrink-0">
                                        <img src={receiptPreview} alt="Receipt Preview" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                                            {receiptFile?.name || "bukti-pembayaran.png"}
                                        </p>
                                        <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold flex items-center gap-1 mt-1">
                                            <Check className="w-3.5 h-3.5" /> Bukti pembayaran siap dikirim
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleRemoveFile}
                                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex-shrink-0"
                                    title="Hapus gambar"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 dark:hover:border-cyan-500/50 bg-slate-50/50 dark:bg-slate-900/10 hover:bg-slate-100/30 dark:hover:bg-slate-900/30 rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 group"
                                >
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileChange} 
                                        accept="image/*" 
                                        className="hidden" 
                                    />
                                    <Upload className="mx-auto h-7 w-7 text-slate-400 group-hover:text-cyan-500 group-hover:scale-110 transition-all mb-2.5" />
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih berkas struk pembayaran</p>
                                    <p className="text-[10px] text-slate-400 mt-1">Format PNG, JPG atau JPEG hingga 5MB</p>
                                </div>

                                <div className="flex items-center gap-2.5">
                                    <div className="h-[1px] bg-slate-200 dark:bg-slate-800 flex-grow" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">atau</span>
                                    <div className="h-[1px] bg-slate-200 dark:bg-slate-800 flex-grow" />
                                </div>

                                <button
                                    type="button"
                                    onClick={handleUseDemoReceipt}
                                    className="w-full py-2.5 rounded-xl border border-dashed border-cyan-500/30 hover:border-cyan-500 bg-cyan-500/[0.02] hover:bg-cyan-500/5 text-cyan-600 dark:text-cyan-400 text-xs font-extrabold tracking-wide transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                                >
                                    <FileText className="w-4 h-4" /> Gunakan Bukti Transfer Demo (Cepat)
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="pt-4 space-y-3">
                        <button
                            onClick={handleConfirmPayment}
                            disabled={!receiptFile}
                            className="w-full bg-cyan-500 disabled:bg-slate-100 dark:disabled:bg-slate-900 text-white disabled:text-slate-400 dark:disabled:text-slate-600 hover:bg-cyan-400 font-bold py-4 rounded-2xl transition-all shadow-md disabled:shadow-none hover:shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            Konfirmasi Pembayaran
                        </button>
                        
                        {!receiptFile && (
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center flex items-center justify-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Silakan unggah bukti transfer atau gunakan bukti transfer demo untuk melanjutkan.
                            </p>
                        )}
                        
                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-200 text-sm font-semibold"
                        >
                            Cancel Payment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}