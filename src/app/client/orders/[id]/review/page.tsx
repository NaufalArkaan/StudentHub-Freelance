"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, Flag, CheckCircle2 } from "lucide-react";

export default function ReviewPage() {
    const router = useRouter();
    const { id } = useParams();

    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [anonymous, setAnonymous] = useState(false);

    const handleSubmit = () => {
        const existingReviews = JSON.parse(
            localStorage.getItem("reviews") || "[]"
        );

        const newReview = {
            id: Date.now(),
            userName: "Current User",
            userAvatar:
                "https://api.dicebear.com/7.x/avataaars/svg?seed=User",
            rating,
            date: "Baru saja",
            comment: feedback,
        };

        localStorage.setItem(
            "reviews",
            JSON.stringify([...existingReviews, newReview])
        );

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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Review Freelancer
                    </h1>

                    <p className="mt-2 text-gray-600 dark:text-zinc-400">
                        Share your experience and help other students make informed decisions.
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8">
                    {/* Freelancer Info */}
                    <div className="flex items-center gap-4 mb-8">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
                            alt="Freelancer"
                            className="w-16 h-16 rounded-full border"
                        />

                        <div>
                            <h2 className="font-semibold text-lg text-gray-900 dark:text-white">
                                Alex R.
                            </h2>

                            <p className="text-gray-500 dark:text-zinc-400">
                                UI/UX Designer
                            </p>
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="mb-8">
                        <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-zinc-300">
                            YOUR RATING
                        </label>

                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                >
                                    <Star
                                        size={34}
                                        className={`transition-colors ${star <= (hover || rating)
                                            ? "fill-cyan-500 text-cyan-500"
                                            : "text-gray-300 dark:text-zinc-700"
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Feedback */}
                    <div className="mb-8">
                        <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-zinc-300">
                            DETAILED FEEDBACK
                        </label>

                        <textarea
                            rows={6}
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Describe your experience working with this freelancer..."
                            className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>

                    {/* Anonymous */}
                    <div className="flex items-center justify-between mb-10">
                        <span className="text-sm text-gray-700 dark:text-zinc-300">
                            Post review anonymously
                        </span>

                        <button
                            type="button"
                            onClick={() => setAnonymous(!anonymous)}
                            className={`w-12 h-6 rounded-full transition ${anonymous
                                ? "bg-cyan-500"
                                : "bg-gray-300 dark:bg-zinc-700"
                                }`}
                        >
                            <div
                                className={`h-5 w-5 bg-white rounded-full transition-transform ${anonymous ? "translate-x-6" : "translate-x-0.5"
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <button
                            onClick={() =>
                                router.push(`/client/orders/${id}/report`)
                            }
                            className="flex items-center gap-2 text-red-500 hover:text-red-600"
                        >
                            <Flag size={18} />
                            Report Issue
                        </button>

                        <button
                            onClick={handleSubmit}
                            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                        >
                            Submit Review
                        </button>
                    </div>
                </div>
            </div>

            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-2xl">

                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10">
                            <CheckCircle2
                                size={36}
                                className="text-cyan-500"
                            />
                        </div>

                        <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
                            Review Submitted
                        </h2>

                        <p className="mt-3 text-center text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                            Thank you for sharing your experience.
                        </p>

                        <div className="mt-6 flex justify-center">
                            <div className="h-1 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                                <div className="h-full animate-pulse bg-cyan-500" />
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