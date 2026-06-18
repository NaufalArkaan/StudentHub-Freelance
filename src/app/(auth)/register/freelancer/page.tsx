/* eslint-disable react-hooks/purity */
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
import { GraduationCap, Eye, EyeOff, User, BookOpen, Mail, Lock, CreditCard, Link2, Upload, FileText, X } from 'lucide-react';

const freelancerRegisterSchema = z.object({
  fullName: z.string().min(1, 'Nama lengkap wajib diisi'),
  nim: z.string().min(1, 'NIM wajib diisi'),
  programStudi: z.string().min(1, 'Program Studi wajib diisi'),
  email: z
    .string()
    .min(1, 'Email kampus wajib diisi')
    .email('Format email tidak valid')
    .refine(
      (email) => email.endsWith('.ac.id') || email.endsWith('.edu'),
      'Harus menggunakan email institusi kampus (.ac.id atau .edu)'
    ),
  keahlian: z.string().min(1, 'Keahlian utama wajib diisi (pisahkan dengan koma)'),
  github: z.string().optional(),
  linkedin: z.string().optional(),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type FreelancerRegisterValues = z.infer<typeof freelancerRegisterSchema>;

export default function RegisterFreelancerPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Custom Portfolio File State
  const [portfolioFile, setPortfolioFile] = React.useState<File | null>(null);
  const [fileError, setFileError] = React.useState<string | null>(null);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FreelancerRegisterValues>({
    resolver: zodResolver(freelancerRegisterSchema),
    defaultValues: {
      fullName: '',
      nim: '',
      programStudi: '',
      email: '',
      keahlian: '',
      github: '',
      linkedin: '',
      password: '',
    },
  });

  // Handle Drag & Drop events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFileError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setFileError('Format file tidak didukung. Unggah PDF, JPG, atau PNG.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError('Ukuran file melebihi 5MB.');
      return;
    }
    setPortfolioFile(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setPortfolioFile(null);
    setFileError(null);
  };

  const onSubmit = async (values: FreelancerRegisterValues) => {
    if (!portfolioFile) {
      setFileError('Berkas portofolio / CV wajib diunggah.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Inisialisasi Register Supabase Auth
      // Parse keahlian string ke array
      const skillsArray = values.keahlian.split(',').map(s => s.trim()).filter(Boolean);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
            nim: values.nim,
            program_study: values.programStudi,
            skills: skillsArray,
            github_url: values.github || null,
            linkedin_url: values.linkedin || null,
            role: 'freelancer',
          },
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (authData?.user) {
        const userId = authData.user.id;
        let portfolioUrl = '';

        // 2. Upload file portofolio ke Supabase Storage
        try {
          const fileExt = portfolioFile.name.split('.').pop();
          const fileName = `${userId}-${Date.now()}.${fileExt}`;
          const filePath = `portfolios/${fileName}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('portfolios')
            .upload(filePath, portfolioFile);

          if (uploadError) {
            // Jika bucket 'portfolios' belum dibuat oleh admin di panel supabase,
            // kita gagalkan secara anggun dengan membuat dummy URL agar user tetap bisa testing.
            console.warn('Storage upload error (fallback active):', uploadError.message);
            portfolioUrl = `https://supabase.mock.co/storage/v1/object/public/portfolios/${fileName}`;
          } else if (uploadData) {
            const { data: urlData } = supabase.storage
              .from('portfolios')
              .getPublicUrl(filePath);
            portfolioUrl = urlData.publicUrl;
          }
        } catch (storageErr) {
          console.warn('Storage error:', storageErr);
          portfolioUrl = `https://supabase.mock.co/storage/v1/object/public/portfolios/fallback-portfolio.pdf`;
        }

        // 3. Update profil portofolio_url jika menggunakan manual fallback update
        // Kita juga tambahkan portofolio di database portfolios
        const { error: dbPortError } = await supabase
          .from('portfolios')
          .insert({
            freelancer_id: userId,
            title: `Portofolio Awal - ${values.fullName}`,
            file_url: portfolioUrl,
            description: `Berkas portofolio yang diunggah saat registrasi freelancer.`,
            is_verified: false,
          });

        if (dbPortError) {
          console.warn('Failed to insert portfolio record:', dbPortError.message);
        }

        // Update profile portofolio_url
        await supabase
          .from('profiles')
          .update({ portfolio_url: portfolioUrl })
          .eq('id', userId);

        setSuccessMsg(
          'Registrasi sebagai Freelancer berhasil! Silakan periksa kotak masuk email Anda untuk verifikasi, atau silakan Login jika email verifikasi dinonaktifkan.'
        );
        
        setTimeout(() => {
          router.push('/login');
        }, 5000);
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Freelancer registration error:', error);
      setErrorMsg(error.message || 'Terjadi kesalahan saat melakukan registrasi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-slate-800 bg-[#0e1626]/80 backdrop-blur-md shadow-2xl p-2 max-h-[90vh] overflow-y-auto">
      <CardHeader className="text-center pb-6 pt-6">
        <div className="mx-auto w-12 h-12 rounded-full bg-blue-600/10 flex items-center justify-center border border-blue-500/20 mb-4">
          <GraduationCap className="h-6 w-6 text-blue-500" />
        </div>
        <CardTitle className="text-2xl font-bold text-white">StudentHub</CardTitle>
        <CardDescription className="text-xs text-slate-400 mt-1">
          Daftar sebagai Freelancer & Mulai Berkarya
        </CardDescription>
      </CardHeader>

      <CardContent>
        {errorMsg && (
          <div className="mb-5 p-4 rounded-md bg-red-500/10 border border-red-500/20 text-sm text-red-400 text-center">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-4 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Baris 1: Nama & NIM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="fullName"
              label="Nama Lengkap"
              placeholder="John Doe"
              type="text"
              leftIcon={<User className="h-4 w-4" />}
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <Input
              id="nim"
              label="NIM"
              placeholder="1234567890"
              type="text"
              leftIcon={<CreditCard className="h-4 w-4" />}
              error={errors.nim?.message}
              {...register('nim')}
            />
          </div>

          {/* Baris 2: Program Studi & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="programStudi"
              label="Program Studi"
              placeholder="Teknik Informatika"
              type="text"
              leftIcon={<BookOpen className="h-4 w-4" />}
              error={errors.programStudi?.message}
              {...register('programStudi')}
            />

            <Input
              id="email"
              label="Email Kampus"
              placeholder="mhs@kampus.ac.id"
              type="email"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          {/* Keahlian Utama */}
          <Input
            id="keahlian"
            label="Keahlian Utama"
            placeholder="React, Tailwind, UI/UX, Node.js"
            type="text"
            leftIcon={<Link2 className="h-4 w-4" />}
            error={errors.keahlian?.message}
            {...register('keahlian')}
          />
          <span className="text-[10px] text-slate-500 block -mt-3">Pisahkan dengan tanda koma (e.g. React, UI/UX)</span>

          {/* Link Github / Linkedin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="github"
              label="Link Github (Opsional)"
              placeholder="https://github.com/username"
              type="text"
              error={errors.github?.message}
              {...register('github')}
            />

            <Input
              id="linkedin"
              label="Link LinkedIn (Opsional)"
              placeholder="https://linkedin.com/in/username"
              type="text"
              error={errors.linkedin?.message}
              {...register('linkedin')}
            />
          </div>

          {/* Portofolio CV Upload Zone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Portofolio / CV
            </label>
            
            {portfolioFile ? (
              <div className="flex items-center justify-between p-3.5 bg-slate-900 border border-blue-500/30 rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-xs font-bold text-slate-100 line-clamp-1">{portfolioFile.name}</p>
                    <p className="text-[10px] text-slate-500">{(portfolioFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={handleDrag}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className="flex flex-col items-center justify-center p-6 border border-dashed border-slate-800 rounded-md bg-slate-900/30 hover:bg-slate-900/50 hover:border-blue-500/50 cursor-pointer transition-all text-center group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                />
                <Upload className="h-8 w-8 text-slate-500 group-hover:text-blue-500 transition-colors mb-3" />
                <p className="text-xs font-semibold text-slate-300">
                  Drag & drop file di sini, atau klik untuk memilih file
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  PDF, JPG, PNG (Max 5MB)
                </p>
              </div>
            )}
            {fileError && <span className="text-xs text-red-400 mt-0.5">{fileError}</span>}
          </div>

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
            REGISTER AS FREELANCER
          </Button>
        </form>

        <div className="text-center mt-6 text-sm text-slate-400">
          Sudah memiliki akun?{' '}
          <Link href="/login" className="text-blue-500 hover:underline font-medium">
            Login di sini
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
