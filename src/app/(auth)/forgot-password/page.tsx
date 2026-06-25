'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { GraduationCap, Eye, EyeOff, Lock, Mail, CreditCard, User, ArrowLeft, CheckCircle2 } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid')
    .refine(
      (email) => email.endsWith('.ac.id') || email.endsWith('.edu'),
      'Harus menggunakan email institusi kampus (.ac.id atau .edu)'
    ),
  role: z.enum(['freelancer', 'client']),
  nim: z.string().optional(),
  fullName: z.string().optional(),
  password: z.string().min(6, 'Password baru minimal 6 karakter'),
  confirmPassword: z.string().min(6, 'Konfirmasi password baru wajib diisi'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.role === 'freelancer' && (!data.nim || data.nim.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: "NIM wajib diisi untuk Freelancer",
  path: ["nim"],
}).refine((data) => {
  if (data.role === 'client' && (!data.fullName || data.fullName.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: "Nama lengkap wajib diisi untuk Client / Admin",
  path: ["fullName"],
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [selectedRole, setSelectedRole] = React.useState<'freelancer' | 'client'>('freelancer');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
      role: 'freelancer',
      nim: '',
      fullName: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Panggil RPC database untuk reset password tanpa email
      const { data: success, error: rpcError } = await supabase.rpc('reset_user_password_without_email', {
        p_email: values.email,
        p_nim: values.role === 'freelancer' ? values.nim?.trim() : '',
        p_full_name: values.role === 'client' ? values.fullName?.trim() : '',
        p_new_password: values.password,
      });

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      if (success) {
        setSuccessMsg('Password Anda berhasil direset! Mengalihkan ke halaman Login...');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setErrorMsg('Verifikasi gagal. Pastikan Email, NIM, atau Nama Lengkap yang dimasukkan sudah sesuai dengan data terdaftar.');
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Reset password error:', error);
      setErrorMsg(error.message || 'Terjadi kesalahan sistem saat mencoba mereset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-slate-800 bg-[#0e1626]/80 backdrop-blur-md shadow-2xl p-2 relative">
      {/* Tombol Kembali ke Login */}
      <div className="absolute top-4 left-4 text-xs font-semibold text-slate-350">
        <Link href="/login" className="flex items-center gap-1 hover:text-white transition-colors">
          <ArrowLeft className="h-3 w-3" />
          <span>Kembali</span>
        </Link>
      </div>

      <CardHeader className="text-center pb-6 pt-10">
        <div className="mx-auto w-12 h-12 rounded-full bg-blue-600/10 flex items-center justify-center border border-blue-500/20 mb-4">
          <GraduationCap className="h-6 w-6 text-blue-500" />
        </div>
        <CardTitle className="text-2xl font-bold text-white">Reset Password</CardTitle>
        <CardDescription className="text-xs text-slate-400 mt-1">
          Perbarui password Anda dengan memverifikasi identitas akun
        </CardDescription>
      </CardHeader>

      <CardContent>
        {errorMsg && (
          <div className="mb-6 p-4 rounded-md bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-center leading-relaxed">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 text-center flex flex-col items-center justify-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 animate-bounce" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Kampus */}
          <Input
            id="email"
            label="Email Institusi Kampus"
            placeholder="student@university.edu"
            type="email"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          {/* Account Role Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Tipe Akun
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                  selectedRole === 'freelancer'
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm shadow-blue-500/10'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900/60 hover:text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  value="freelancer"
                  className="sr-only"
                  checked={selectedRole === 'freelancer'}
                  onChange={() => {
                    setSelectedRole('freelancer');
                    setValue('role', 'freelancer');
                  }}
                />
                Freelancer (Mahasiswa)
              </label>

              <label
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                  selectedRole === 'client'
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm shadow-blue-500/10'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900/60 hover:text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  value="client"
                  className="sr-only"
                  checked={selectedRole === 'client'}
                  onChange={() => {
                    setSelectedRole('client');
                    setValue('role', 'client');
                  }}
                />
                Client / Admin
              </label>
            </div>
          </div>

          {/* Dynamic Verification Field: NIM or Full Name */}
          {selectedRole === 'freelancer' ? (
            <Input
              id="nim"
              label="NIM (Nomor Induk Mahasiswa)"
              placeholder="Masukkan NIM terdaftar Anda"
              type="text"
              leftIcon={<CreditCard className="h-4 w-4" />}
              error={errors.nim?.message}
              {...register('nim')}
            />
          ) : (
            <Input
              id="fullName"
              label="Nama Lengkap Terdaftar"
              placeholder="Masukkan nama lengkap Anda"
              type="text"
              leftIcon={<User className="h-4 w-4" />}
              error={errors.fullName?.message}
              {...register('fullName')}
            />
          )}

          {/* New Password */}
          <Input
            id="password"
            label="Password Baru"
            placeholder="********"
            type={showPassword ? 'text' : 'password'}
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={errors.password?.message}
            {...register('password')}
          />

          {/* Confirm New Password */}
          <Input
            id="confirmPassword"
            label="Konfirmasi Password Baru"
            placeholder="********"
            type={showConfirmPassword ? 'text' : 'password'}
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          {/* Reset Button */}
          <Button variant="gradient" className="w-full mt-4 font-bold" type="submit" isLoading={isLoading}>
            RESET PASSWORD
          </Button>
        </form>

        <div className="text-center mt-6 text-sm text-slate-450 border-t border-slate-800/60 pt-4">
          <Link href="/login" className="text-blue-500 hover:underline font-medium">
            Kembali ke Halaman Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
