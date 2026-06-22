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
import { GraduationCap, Eye, EyeOff, Lock, Mail, CreditCard } from 'lucide-react';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid')
    .refine(
      (email) => email.endsWith('.ac.id') || email.endsWith('.edu'),
      'Harus menggunakan email institusi kampus (.ac.id atau .edu)'
    ),
  nim: z.string().optional(),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const supabase = createClient();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('error') === 'suspended') {
        Promise.resolve().then(() => {
          setErrorMsg('Akun Anda telah dinonaktifkan (suspended) oleh Admin. Silakan hubungi admin untuk informasi lebih lanjut.');
        });
      }
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      nim: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      // 1. Sign in via Supabase Auth using email and password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (authData?.user) {
        // 2. Fetch role, status and profiles(nim) from database
        const { data: dbUser, error: dbError } = await supabase
          .from('users')
          .select('role, status, profiles ( nim )')
          .eq('id', authData.user.id)
          .single();

        if (dbError || !dbUser) {
          // Fallback: If profile/user database has not synced yet, check metadata
          const metadataRole = authData.user.user_metadata?.role || 'client';
          
          if (metadataRole === 'freelancer') {
            const metadataNim = authData.user.user_metadata?.nim;
            if (!values.nim || values.nim.trim() !== metadataNim) {
              await supabase.auth.signOut();
              throw new Error('NIM wajib diisi dan harus sesuai dengan akun Freelancer Anda.');
            }
          }
          redirectBasedOnRole(metadataRole);
        } else {
          // Check if account is suspended
          if (dbUser.status === 'suspended') {
            await supabase.auth.signOut();
            throw new Error('Akun Anda telah dinonaktifkan (suspended) oleh Admin. Silakan hubungi admin untuk informasi lebih lanjut.');
          }

          // If the role is freelancer (mahasiswa), validate the NIM against the database profile
          if (dbUser.role === 'freelancer') {
            const profileNim = (dbUser.profiles as { nim?: string })?.nim;
            if (!values.nim || values.nim.trim() !== profileNim) {
              await supabase.auth.signOut();
              throw new Error('NIM wajib diisi dan harus sesuai dengan akun Freelancer Anda.');
            }
          }
          redirectBasedOnRole(dbUser.role);
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Login error:', error);
      // Custom friendly error messages
      if (error.message === 'Invalid login credentials') {
        setErrorMsg('Email atau Password yang Anda masukkan salah.');
      } else {
        setErrorMsg(error.message || 'Terjadi kesalahan sistem saat mencoba masuk.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const redirectBasedOnRole = (role: string) => {
    router.refresh();
    if (role === 'admin') {
      router.push('/admin/dashboard');
    } else if (role === 'freelancer') {
      router.push('/freelancer/dashboard');
    } else {
      router.push('/client/dashboard');
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
          Academic Excellence & Networking
        </CardDescription>
      </CardHeader>

      <CardContent>
        {errorMsg && (
          <div className="mb-6 p-4 rounded-md bg-red-500/10 border border-red-500/20 text-sm text-red-400 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

          {/* NIM */}
          <Input
            id="nim"
            label="NIM (Khusus Freelancer / Mahasiswa)"
            placeholder="Kosongkan jika Admin / Client"
            type="text"
            leftIcon={<CreditCard className="h-4 w-4" />}
            error={errors.nim?.message}
            {...register('nim')}
          />

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <Link href="/login" className="text-xs text-blue-500 hover:underline">
                Forgot password?
              </Link>
            </div>
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

          {/* Remember Me */}
          <div className="flex items-center gap-2 py-1">
            <input
              id="rememberMe"
              type="checkbox"
              className="rounded bg-slate-900 border-slate-800 text-blue-500 focus:ring-blue-500 h-4 w-4 cursor-pointer"
              {...register('rememberMe')}
            />
            <label htmlFor="rememberMe" className="text-sm text-slate-400 select-none cursor-pointer hover:text-slate-300">
              Remember Me
            </label>
          </div>

          {/* Login Button */}
          <Button variant="gradient" className="w-full mt-2 font-bold" type="submit" isLoading={isLoading}>
            LOGIN
          </Button>
        </form>

        <div className="text-center mt-8 text-sm text-slate-400">
          Belum memiliki akun?{' '}
          <Link href="/register" className="text-blue-500 hover:underline font-medium">
            Registrasi di sini
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
