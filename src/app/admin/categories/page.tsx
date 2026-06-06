'use client';

import * as React from 'react';
import Card from '@/components/ui/Card';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Palette, 
  Terminal, 
  GraduationCap, 
  Camera, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = React.useState([
    { 
      id: '1', 
      name: 'Desain & Multimedia', 
      description: 'Layanan desain kreatif, branding, ilustrasi, dan aset visual untuk kebutuhan promosi atau produk.', 
      servicesCount: 156, 
      status: 'active',
      icon: <Palette className="h-5 w-5 text-blue-400" />,
      iconBg: 'bg-blue-500/10 border-blue-500/20'
    },
    { 
      id: '2', 
      name: 'Pemrograman & Teknologi', 
      description: 'Pengembangan software, website, aplikasi mobile, scripting, database, dan konsultasi IT.', 
      servicesCount: 210, 
      status: 'active',
      icon: <Terminal className="h-5 w-5 text-teal-400" />,
      iconBg: 'bg-teal-500/10 border-teal-500/20'
    },
    { 
      id: '3', 
      name: 'Pendidikan & Les Privat', 
      description: 'Bimbingan belajar mata kuliah, persiapan ujian, kursus bahasa asing, dan asistensi penulisan ilmiah.', 
      servicesCount: 89, 
      status: 'active',
      icon: <GraduationCap className="h-5 w-5 text-indigo-400" />,
      iconBg: 'bg-indigo-500/10 border-indigo-500/20'
    },
    { 
      id: '4', 
      name: 'Fotografi & Videografi', 
      description: 'Jasa pemotretan produk, dokumentasi acara, videografi promosi, dan editing video profesional.', 
      servicesCount: 124, 
      status: 'active',
      icon: <Camera className="h-5 w-5 text-cyan-400" />,
      iconBg: 'bg-cyan-500/10 border-cyan-500/20'
    }
  ]);

  const handleAddCategory = () => {
    alert('Tambah kategori baru (fitur simulasi).');
  };

  const handleEdit = (id: string) => {
    alert(`Ubah kategori dengan ID ${id} (fitur simulasi).`);
  };

  const handleDelete = (id: string) => {
    alert(`Hapus kategori dengan ID ${id} (fitur simulasi).`);
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Category Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Kelola daftar kategori utama untuk layanan dan jasa di dalam platform StudentHub untuk optimasi navigasi pengguna.
          </p>
        </div>
        
        <button
          onClick={handleAddCategory}
          className="h-9.5 rounded-lg bg-[#00d8ff] hover:bg-cyan-400 text-slate-950 px-4 text-xs font-bold flex items-center gap-1.5 active:scale-[0.99] transition-all cursor-pointer select-none"
        >
          <Plus className="h-4 w-4" />
          Add New Category
        </button>
      </div>

      {/* Categories Table Card */}
      <Card className="border-slate-900 bg-[#0c1222]/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-4.5 px-6 font-semibold w-1/4">CATEGORY NAME</th>
                <th className="py-4.5 px-6 font-semibold w-2/5">DESCRIPTION</th>
                <th className="py-4.5 px-6 font-semibold">TOTAL SERVICES</th>
                <th className="py-4.5 px-6 font-semibold">STATUS</th>
                <th className="py-4.5 px-6 font-semibold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/50">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-900/10 transition-colors group">
                  {/* Category Name & Icon */}
                  <td className="py-4.5 px-6">
                    <div className="flex items-center gap-3.5">
                      <div className={`p-2.5 rounded-lg border flex items-center justify-center ${cat.iconBg}`}>
                        {cat.icon}
                      </div>
                      <p className="font-bold text-slate-100 group-hover:text-white transition-colors">
                        {cat.name}
                      </p>
                    </div>
                  </td>

                  {/* Description */}
                  <td className="py-4.5 px-6 text-slate-450 leading-relaxed max-w-sm">
                    {cat.description}
                  </td>

                  {/* Total Services */}
                  <td className="py-4.5 px-6 font-semibold text-slate-300">
                    {cat.servicesCount} Active Services
                  </td>

                  {/* Status */}
                  <td className="py-4.5 px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
                      Active
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleEdit(cat.id)}
                        className="p-1.5 rounded text-slate-450 hover:text-white hover:bg-slate-950 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
                        title="Edit Category"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-550/20 transition-all cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="flex items-center justify-between border-t border-slate-900 bg-[#090d16]/30 px-6 py-4.5">
          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-400">1-4</span> of{' '}
            <span className="font-semibold text-slate-400">12</span> Categories
          </p>
          <div className="flex items-center gap-1.5">
            <button className="p-1.5 rounded-md border border-slate-800 text-slate-500 hover:text-slate-350 hover:bg-slate-900 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer" disabled>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="w-8 h-8 rounded-md bg-[#00d8ff] text-slate-950 text-xs font-bold flex items-center justify-center shadow-[0_1px_6px_rgba(0,216,255,0.4)]">
              1
            </button>
            <button className="w-8 h-8 rounded-md border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-bold hover:bg-slate-900 cursor-pointer">
              2
            </button>
            <button className="w-8 h-8 rounded-md border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-bold hover:bg-slate-900 cursor-pointer">
              3
            </button>
            <button className="p-1.5 rounded-md border border-slate-805 text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
