"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Mail, User, GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
    const [profile, setProfile] = useState({
        name: "",
        nim: "",
        email: "",
        major: "",
        avatar: "",
    });

    const supabase = createClient();
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isEmailPending, setIsEmailPending] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) return;

            const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (!data) return;

            setProfile({
                name: data.full_name || "",
                nim: data.nim || "",
                email: user.email || "",
                major: data.program_study || "",
                avatar: data.avatar_url || "",
            });

            const profileData = {
                name: data.full_name || "",
                nim: data.nim || "",
                email: user.email || "",
                major: data.program_study || "",
                avatar: data.avatar_url || "",
            };

            setProfile(profileData);

            localStorage.setItem(
                "profile",
                JSON.stringify(profileData)
            );
        };

        loadProfile();
    }, [supabase]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value,
        });
    };

    const handleSave = async () => {
        setErrorMsg(null);
        setIsEmailPending(false);

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setErrorMsg("User tidak ditemukan.");
            return;
        }

        // Validasi Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!profile.email) {
            setErrorMsg("Email wajib diisi.");
            return;
        }
        if (!emailRegex.test(profile.email)) {
            setErrorMsg("Format email tidak valid.");
            return;
        }
        if (!profile.email.endsWith(".ac.id") && !profile.email.endsWith(".edu")) {
            setErrorMsg("Harus menggunakan email institusi kampus (.ac.id atau .edu).");
            return;
        }

        try {
            // 1. Update tabel profiles
            const { error: profileError } = await supabase
                .from("profiles")
                .update({
                    full_name: profile.name,
                    program_study: profile.major,
                })
                .eq("id", user.id);

            if (profileError) throw profileError;

            // 2. Update email auth jika ada perubahan
            if (profile.email !== user.email) {
                const { data: updateData, error: emailError } = await supabase.auth.updateUser({
                    email: profile.email,
                });
                if (emailError) throw emailError;

                if (updateData?.user?.new_email) {
                    setIsEmailPending(true);
                }
            }

            window.dispatchEvent(new Event("profileUpdated"));
            setShowSuccess(true);

            setTimeout(() => {
                setShowSuccess(false);
            }, 3000);
        } catch (error: any) {
            console.error("Error updating profile:", error);
            setErrorMsg(error.message || "Terjadi kesalahan saat memperbarui profil.");
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
                <div className="max-w-5xl mx-auto px-4 py-10">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                            Profile Settings
                        </h1>

                        <p className="mt-3 text-gray-600 dark:text-zinc-400">
                            Manage your campus identity and academic credentials.
                        </p>
                    </div>

                    {/* Profile Card */}
                    <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm">
                        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                            {/* Avatar */}
                            <div className="flex flex-col items-center">
                                <img
                                    src={
                                        profile.nim
                                            ? `https://krs.umm.ac.id/Poto/${profile.nim.slice(
                                                0,
                                                4
                                            )}/${profile.nim}.JPG`
                                            : "https://api.dicebear.com/7.x/avataaars/svg?seed=StudentHub"
                                    }
                                    alt="Profile"
                                    className="w-36 h-36 rounded-full border-4 border-cyan-500 object-cover shadow-lg"
                                />

                                <p className="mt-4 text-xs text-gray-500 dark:text-zinc-500 text-center">
                                    Foto otomatis dari sistem UMM
                                </p>
                            </div>

                            {/* User Info */}
                            <div className="flex-1 w-full">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {profile.name || "Nama Mahasiswa"}
                                </h2>

                                <p className="mt-2 text-gray-600 dark:text-zinc-400">
                                    {profile.major || "Program Studi"} •{" "}
                                    {profile.nim || "NIM"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="mt-8 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                            Personal Information
                        </h3>

                        {errorMsg && (
                            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500 dark:text-red-400 text-center font-medium">
                                {errorMsg}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Email */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-zinc-400">
                                    Email Institusi
                                </label>

                                <div className="mt-2 relative">
                                    <Mail
                                        size={18}
                                        className="absolute left-4 top-4 text-gray-400"
                                    />

                                    <input
                                        type="email"
                                        name="email"
                                        value={profile.email}
                                        onChange={handleChange}
                                        placeholder="nama@student.umm.ac.id"
                                        className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 py-3 pl-11 pr-4 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Nama */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-zinc-400">
                                    Nama Lengkap
                                </label>

                                <div className="mt-2 relative">
                                    <User
                                        size={18}
                                        className="absolute left-4 top-4 text-gray-400"
                                    />

                                    <input
                                        type="text"
                                        name="name"
                                        value={profile.name}
                                        onChange={handleChange}
                                        placeholder="Masukkan nama lengkap"
                                        className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 py-3 pl-11 pr-4 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Prodi */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-zinc-400">
                                    Program Studi
                                </label>

                                <div className="mt-2 relative">
                                    <GraduationCap
                                        size={18}
                                        className="absolute left-4 top-4 text-gray-400"
                                    />

                                    <select
                                        name="major"
                                        value={profile.major}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 py-3 pl-11 pr-4 text-gray-900 dark:text-white"
                                    >
                                        <option value="">
                                            Pilih Program Studi
                                        </option>
                                        <option>Informatika</option>
                                        <option>Sistem Informasi</option>
                                        <option>Teknik Industri</option>
                                        <option>Teknik Mesin</option>
                                        <option>Teknik Sipil</option>
                                        <option>Psikologi</option>
                                        <option>Manajemen</option>
                                        <option>Akuntansi</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Action */}
                        <div className="mt-10 flex justify-end">
                            <button
                                onClick={handleSave}
                                className="px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-[0_0_25px_rgba(6,182,212,0.35)] transition"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="relative w-full max-w-md rounded-3xl border border-cyan-500/20 bg-white dark:bg-zinc-900 p-10 shadow-2xl">
                        <div className="flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 animate-ping rounded-full bg-cyan-500/20" />

                                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10">
                                    <CheckCircle2
                                        size={52}
                                        className="text-cyan-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <h2 className="mt-8 text-center text-3xl font-bold text-gray-900 dark:text-white">
                            {isEmailPending ? "Verifikasi Diperlukan" : "Perubahan Disimpan"}
                        </h2>

                        <p className="mt-4 text-center text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                            {isEmailPending
                                ? "Profil diperbarui! Silakan periksa email baru Anda untuk memverifikasi perubahan sebelum masuk kembali menggunakan email baru tersebut."
                                : "Pengaturan profil Anda berhasil diperbarui."}
                        </p>

                        <div className="mt-8 flex justify-center">
                            <div className="h-1 w-32 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                                <div className="h-full animate-pulse bg-cyan-500" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}