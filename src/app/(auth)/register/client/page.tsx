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
import { GraduationCap, Eye, EyeOff, User, BookOpen, Mail, Lock } from 'lucide-react';

const clientRegisterSchema = z.object({
  fullName: z.string().min(1, 'Nama lengkap wajib diisi'),
  jurusan: z.string().min(1, 'Instansi / Jurusan wajib diisi'),
  email: z
    .string()
    .min(1, 'Email kampus wajib diisi')
    .email('Format email tidak valid')
    .refine(
      (email) => email.endsWith('.ac.id') || email.endsWith('.edu'),
      'Harus menggunakan email institusi kampus (.ac.id atau .edu)'
    ),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type ClientRegisterValues = z.infer<typeof clientRegisterSchema>;

export default function RegisterClientPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientRegisterValues>({
    resolver: zodResolver(clientRegisterSchema),
    defaultValues: {
      fullName: '',
      jurusan: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: ClientRegisterValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Sign up via Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
            program_study: values.jurusan,
            role: 'client',
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        setSuccessMsg(
          'Registrasi berhasil! Silakan periksa kotak masuk email Anda untuk verifikasi, atau silakan Login jika email verifikasi dinonaktifkan.'
        );
        setTimeout(() => {
          router.push('/login');
        }, 5000);
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Registration error:', error);
      setErrorMsg(error.message || 'Terjadi kesalahan saat melakukan registrasi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-slate-800 bg-[#0e1626]/80 backdrop-blur-md shadow-2xl p-2">
      <CardHeader className="text-center pb-8 pt-8">
        <div className="mx-auto w-12 h-12 rounded-full bg-blue-600/10 flex items-center justify-center border border-blue-500/20 mb-4">
          <GraduationCap className="h-6 w-6 text-blue-500" />
        </div>
        <CardTitle className="text-2xl font-bold text-white">StudentHub</CardTitle>
        <CardDescription className="text-xs text-slate-400 mt-1">
          Daftar sebagai Client (Pencari Jasa)
        </CardDescription>
      </CardHeader>

      <CardContent>
        {errorMsg && (
          <div className="mb-6 p-4 rounded-md bg-red-500/10 border border-red-500/20 text-sm text-red-400 text-center">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Nama Lengkap */}
          <Input
            id="fullName"
            label="Nama Lengkap"
            placeholder="Contoh: Budi Santoso"
            type="text"
            leftIcon={<User className="h-4 w-4" />}
            error={errors.fullName?.message}
            {...register('fullName')}
          />

          {/* Instansi / Jurusan */}
          <Input
            id="jurusan"
            label="Instansi / Jurusan"
            placeholder="Contoh: Manajemen Bisnis"
            type="text"
            leftIcon={<BookOpen className="h-4 w-4" />}
            error={errors.jurusan?.message}
            {...register('jurusan')}
          />

          {/* Email Kampus */}
          <Input
            id="email"
            label="Email Kampus"
            placeholder="budi@student.ac.id"
            type="email"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Password
            </label>
            <Input
              id="password"
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
          </div>

          {/* Submit Button */}
          <Button variant="gradient" className="w-full mt-2 font-bold" type="submit" isLoading={isLoading}>
            REGISTER AS CLIENT
          </Button>
        </form>

        <div className="text-center mt-8 text-sm text-slate-400">
          Sudah memiliki akun?{' '}
          <Link href="/login" className="text-blue-500 hover:underline font-medium">
            Login di sini
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
