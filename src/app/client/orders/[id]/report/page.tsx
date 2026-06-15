"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, Upload, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ReportPage() {
    const router = useRouter();
    const { id } = useParams();

    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = () => {
        console.log({
            orderId: id,
            reason,
            description,
            file,
        });

        setShowSuccess(true);

        setTimeout(() => {
            router.push("/client/orders");
        }, 2000);
    };

    return (
        <>
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-white mb-4"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </button>

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Report Issue
                    </h1>

                    <p className="mt-2 text-gray-600 dark:text-zinc-400">
                        Submit a dispute or report a problem with this completed order.
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8">
                    {/* Notice */}
                    <div className="flex gap-3 p-4 rounded-xl mb-8 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                        <AlertTriangle className="text-red-500 mt-1" size={20} />

                        <div>
                            <h3 className="font-semibold text-red-600 dark:text-red-400">
                                Report an Issue / Dispute
                            </h3>

                            <p className="text-sm text-red-500 dark:text-red-300 mt-1">
                                Our moderation team will review your report within 24–48 hours.
                            </p>
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-zinc-300">
                            REASON FOR REPORT
                        </label>

                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-3 text-gray-900 dark:text-white"
                        >
                            <option value="">Select a reason...</option>
                            <option value="not_delivered">
                                Service was not delivered
                            </option>
                            <option value="poor_quality">
                                Poor quality work
                            </option>
                            <option value="late_delivery">
                                Late delivery
                            </option>
                            <option value="unresponsive">
                                Freelancer not responding
                            </option>
                            <option value="fraud">
                                Suspected fraud
                            </option>
                            <option value="other">
                                Other
                            </option>
                        </select>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-zinc-300">
                            ISSUE DESCRIPTION
                        </label>

                        <textarea
                            rows={6}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Provide details about the issue..."
                            className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    {/* Upload Evidence */}
                    <div className="mb-8">
                        <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-zinc-300">
                            SUPPORTING EVIDENCE
                        </label>

                        <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-xl p-8 cursor-pointer hover:border-red-400 transition-colors">
                            <Upload
                                size={28}
                                className="text-gray-400 dark:text-zinc-500"
                            />

                            <span className="text-sm text-gray-500 dark:text-zinc-400">
                                Click to upload screenshots, chat logs, or documents
                            </span>

                            <span className="text-xs text-gray-400">
                                Maximum file size: 10MB
                            </span>

                            <input
                                type="file"
                                className="hidden"
                                onChange={(e) =>
                                    setFile(e.target.files?.[0] || null)
                                }
                            />
                        </label>

                        {file && (
                            <p className="mt-3 text-sm text-green-600 dark:text-green-400">
                                Selected file: {file.name}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse md:flex-row justify-end gap-3">
                        <button
                            onClick={() => router.back()}
                            className="px-6 py-3 rounded-xl border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSubmit}
                            className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold"
                        >
                            Submit Report
                        </button>
                    </div>
                </div>
            </div>

            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-2xl">

                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                            <CheckCircle2
                                size={36}
                                className="text-emerald-500"
                            />
                        </div>

                        <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
                            Report Submitted
                        </h2>

                        <p className="mt-3 text-center text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                            Your report has been received.
                            Our moderation team will review it
                            within 24–48 hours.
                        </p>

                        <div className="mt-6 flex justify-center">
                            <div className="h-1 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                                <div className="h-full animate-pulse bg-emerald-500" />
                            </div>
                        </div>

                        <p className="mt-3 text-center text-xs text-zinc-400">
                            Redirecting...
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}