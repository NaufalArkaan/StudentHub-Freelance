/**
 * Utility helper to get distinct and premium illustrations from Unsplash
 * for categories and service covers based on search keywords.
 */
export function getCategoryImage(categoryName: string, categorySlug: string = ''): string {
  const name = (categoryName || '').toLowerCase();
  const slug = (categorySlug || '').toLowerCase();

  // 1. Programming & IT
  if (
    name.includes('program') ||
    name.includes('code') ||
    name.includes('web') ||
    name.includes('dev') ||
    name.split(/\s+/).includes('it') ||
    name.split(/\s+/).includes('it/') ||
    name.split(/\s+/).includes('/it') ||
    name.includes('information technology') ||
    name.includes('teknologi informasi') ||
    slug === 'it' ||
    slug.split('-').includes('it') ||
    name.includes('teknologi') ||
    name.includes('aplikasi') ||
    name.includes('cyber') ||
    name.includes('ctf') ||
    name.includes('ethical') ||
    slug.includes('program') ||
    slug.includes('web') ||
    slug.includes('dev') ||
    slug.includes('cyber')
  ) {
    return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop';
  }

  // 2. Writing & Academic Support
  if (
    name.includes('tulis') ||
    name.includes('write') ||
    name.includes('akademik') ||
    name.includes('skripsi') ||
    name.includes('buku') ||
    name.includes('jurnal') ||
    name.includes('paper') ||
    name.includes('esai') ||
    name.includes('artikel') ||
    name.includes('laporan') ||
    slug.includes('write') ||
    slug.includes('akademik') ||
    slug.includes('tulis')
  ) {
    return 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop';
  }

  // 3. Graphic Design & UI/UX
  if (
    name.includes('desain') ||
    name.includes('design') ||
    name.includes('grafis') ||
    name.includes('logo') ||
    name.includes('dkv') ||
    name.includes('gambar') ||
    name.includes('ilustrasi') ||
    name.includes('banner') ||
    name.includes('pamflet') ||
    name.includes('poster') ||
    name.includes('brand') ||
    name.includes('ui') ||
    name.includes('ux') ||
    slug.includes('design') ||
    slug.includes('desain') ||
    slug.includes('ui-ux')
  ) {
    return 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800&auto=format&fit=crop';
  }

  // 4. Data Analysis & Science
  if (
    name.includes('data') ||
    name.includes('analis') ||
    name.includes('stat') ||
    name.includes('riset') ||
    name.includes('excel') ||
    name.includes('visualisasi') ||
    name.includes('grafik') ||
    slug.includes('data') ||
    slug.includes('analis')
  ) {
    return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop';
  }

  // 5. Translation & Languages
  if (
    name.includes('terjemah') ||
    name.includes('translat') ||
    name.includes('bahasa') ||
    name.includes('asing') ||
    name.includes('inggris') ||
    name.includes('kamus') ||
    slug.includes('translat') ||
    slug.includes('bahasa') ||
    slug.includes('translate')
  ) {
    return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop';
  }

  // 6. Photo, Video, Audio Editing
  if (
    name.includes('video') ||
    name.includes('foto') ||
    name.includes('photo') ||
    name.includes('edit') ||
    name.includes('multimedia') ||
    name.includes('audio') ||
    name.includes('rekam') ||
    name.includes('kamera') ||
    name.includes('suara') ||
    slug.includes('video') ||
    slug.includes('photo') ||
    slug.includes('edit')
  ) {
    return 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=800&auto=format&fit=crop';
  }

  // 7. Tutoring & Course lessons
  if (
    name.includes('tutor') ||
    name.includes('les') ||
    name.includes('ajar') ||
    name.includes('didik') ||
    name.includes('course') ||
    name.includes('matematika') ||
    name.includes('fisika') ||
    slug.includes('tutor') ||
    slug.includes('les') ||
    slug.includes('course')
  ) {
    return 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop';
  }

  // 8. Office, Business & Admin Services
  if (
    name.includes('bisnis') ||
    name.includes('business') ||
    name.includes('pasar') ||
    name.includes('market') ||
    name.includes('keuangan') ||
    name.includes('manajemen') ||
    name.includes('dokumen') ||
    slug.includes('business') ||
    slug.includes('market')
  ) {
    return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop';
  }

  // 9. Arts, Crafts & Creative work
  if (
    name.includes('seni') ||
    name.includes('art') ||
    name.includes('kreatif') ||
    name.includes('musik') ||
    name.includes('nyanyi') ||
    name.includes('instrumen') ||
    slug.includes('art')
  ) {
    return 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop';
  }

  // Default fallback based on string length to give different pictures to different categories
  const pool = [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
  ];
  const index = Math.abs(name.length + slug.length) % pool.length;
  return pool[index];
}

function getHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

/**
 * Utility helper to get distinct and premium illustrations from Unsplash
 * for service covers based on search keywords in the service title and category context.
 * This guarantees different images for different services under the same category.
 */
export function getServiceImage(
  serviceTitle: string,
  categoryName: string,
  categorySlug: string = '',
  serviceId: string | number = ''
): string {
  const title = (serviceTitle || '').toLowerCase();
  const catName = (categoryName || '').toLowerCase();
  const catSlug = (categorySlug || '').toLowerCase();
  const seed = `${title}-${serviceId}`;
  const hash = getHash(seed);

  // 1. Programming & IT
  const isProgramming =
    title.includes('program') ||
    title.includes('code') ||
    title.includes('web') ||
    title.includes('dev') ||
    title.split(/\s+/).includes('it') ||
    title.includes('teknologi') ||
    title.includes('aplikasi') ||
    title.includes('cyber') ||
    title.includes('ctf') ||
    title.includes('database') ||
    title.includes('server') ||
    catName.includes('program') ||
    catName.includes('code') ||
    catName.includes('web') ||
    catName.includes('dev') ||
    catName.split(/\s+/).includes('it') ||
    catName.includes('teknologi') ||
    catName.includes('aplikasi') ||
    catName.includes('cyber') ||
    catName.includes('ctf') ||
    catSlug.includes('program') ||
    catSlug.includes('web') ||
    catSlug.includes('dev') ||
    catSlug.includes('cyber');

  if (isProgramming) {
    const pool = [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=800&auto=format&fit=crop',
    ];
    return pool[hash % pool.length];
  }

  // 2. Writing & Academic Support
  const isWriting =
    title.includes('tulis') ||
    title.includes('write') ||
    title.includes('akademik') ||
    title.includes('skripsi') ||
    title.includes('buku') ||
    title.includes('jurnal') ||
    title.includes('paper') ||
    title.includes('esai') ||
    title.includes('artikel') ||
    title.includes('laporan') ||
    title.includes('tugas') ||
    catName.includes('tulis') ||
    catName.includes('write') ||
    catName.includes('akademik') ||
    catName.includes('skripsi') ||
    catName.includes('buku') ||
    catName.includes('jurnal') ||
    catName.includes('paper') ||
    catName.includes('esai') ||
    catName.includes('artikel') ||
    catName.includes('laporan') ||
    catSlug.includes('write') ||
    catSlug.includes('akademik') ||
    catSlug.includes('tulis');

  if (isWriting) {
    const pool = [
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=800&auto=format&fit=crop',
    ];
    return pool[hash % pool.length];
  }

  // 3. Graphic Design & UI/UX
  const isDesign =
    title.includes('desain') ||
    title.includes('design') ||
    title.includes('grafis') ||
    title.includes('logo') ||
    title.includes('dkv') ||
    title.includes('gambar') ||
    title.includes('ilustrasi') ||
    title.includes('banner') ||
    title.includes('pamflet') ||
    title.includes('poster') ||
    title.includes('brand') ||
    title.includes('ui') ||
    title.includes('ux') ||
    title.includes('figma') ||
    catName.includes('desain') ||
    catName.includes('design') ||
    catName.includes('grafis') ||
    catName.includes('logo') ||
    catName.includes('dkv') ||
    catName.includes('gambar') ||
    catName.includes('ilustrasi') ||
    catName.includes('banner') ||
    catName.includes('pamflet') ||
    catName.includes('poster') ||
    catName.includes('brand') ||
    catName.includes('ui') ||
    catName.includes('ux') ||
    catSlug.includes('design') ||
    catSlug.includes('desain') ||
    catSlug.includes('ui-ux');

  if (isDesign) {
    const pool = [
      'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1561070791-26c113006238?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541462608143-67571c6738dd?q=80&w=800&auto=format&fit=crop',
    ];
    return pool[hash % pool.length];
  }

  // 4. Data Analysis & Science
  const isData =
    title.includes('data') ||
    title.includes('analis') ||
    title.includes('stat') ||
    title.includes('riset') ||
    title.includes('excel') ||
    title.includes('visualisasi') ||
    title.includes('grafik') ||
    catName.includes('data') ||
    catName.includes('analis') ||
    catName.includes('stat') ||
    catName.includes('riset') ||
    catName.includes('excel') ||
    catName.includes('visualisasi') ||
    catName.includes('grafik') ||
    catSlug.includes('data') ||
    catSlug.includes('analis');

  if (isData) {
    const pool = [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1580757468214-c73f7062a5cb?q=80&w=800&auto=format&fit=crop',
    ];
    return pool[hash % pool.length];
  }

  // 5. Translation & Languages
  const isTranslation =
    title.includes('terjemah') ||
    title.includes('translat') ||
    title.includes('bahasa') ||
    title.includes('asing') ||
    title.includes('inggris') ||
    title.includes('kamus') ||
    catName.includes('terjemah') ||
    catName.includes('translat') ||
    catName.includes('bahasa') ||
    catName.includes('asing') ||
    catName.includes('inggris') ||
    catName.includes('kamus') ||
    catSlug.includes('translat') ||
    catSlug.includes('bahasa') ||
    catSlug.includes('translate');

  if (isTranslation) {
    const pool = [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop',
    ];
    return pool[hash % pool.length];
  }

  // 6. Photo, Video, Audio Editing
  const isEditing =
    title.includes('video') ||
    title.includes('vidio') ||
    title.includes('foto') ||
    title.includes('photo') ||
    title.includes('edit') ||
    title.includes('multimedia') ||
    title.includes('audio') ||
    title.includes('rekam') ||
    title.includes('kamera') ||
    title.includes('suara') ||
    title.includes('capcut') ||
    title.includes('jedag') ||
    catName.includes('video') ||
    catName.includes('vidio') ||
    catName.includes('foto') ||
    catName.includes('photo') ||
    catName.includes('edit') ||
    catName.includes('multimedia') ||
    catName.includes('audio') ||
    catName.includes('rekam') ||
    catName.includes('kamera') ||
    catName.includes('suara') ||
    catSlug.includes('video') ||
    catSlug.includes('photo') ||
    catSlug.includes('edit');

  if (isEditing) {
    const pool = [
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1622737133809-d95047b9e673?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=800&auto=format&fit=crop',
    ];
    return pool[hash % pool.length];
  }

  // 7. Tutoring & Course lessons
  const isTutoring =
    title.includes('tutor') ||
    title.includes('les') ||
    title.includes('ajar') ||
    title.includes('didik') ||
    title.includes('course') ||
    title.includes('matematika') ||
    title.includes('fisika') ||
    catName.includes('tutor') ||
    catName.includes('les') ||
    catName.includes('ajar') ||
    catName.includes('didik') ||
    catName.includes('course') ||
    catName.includes('matematika') ||
    catName.includes('fisika') ||
    catSlug.includes('tutor') ||
    catSlug.includes('les') ||
    catSlug.includes('course');

  if (isTutoring) {
    const pool = [
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop',
    ];
    return pool[hash % pool.length];
  }

  // 8. Office, Business & Admin Services
  const isBusiness =
    title.includes('bisnis') ||
    title.includes('business') ||
    title.includes('pasar') ||
    title.includes('market') ||
    title.includes('keuangan') ||
    title.includes('manajemen') ||
    title.includes('dokumen') ||
    title.includes('admin') ||
    catName.includes('bisnis') ||
    catName.includes('business') ||
    catName.includes('pasar') ||
    catName.includes('market') ||
    catName.includes('keuangan') ||
    catName.includes('manajemen') ||
    catName.includes('dokumen') ||
    catSlug.includes('business') ||
    catSlug.includes('market');

  if (isBusiness) {
    const pool = [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521791136368-1a85190079f5?q=80&w=800&auto=format&fit=crop',
    ];
    return pool[hash % pool.length];
  }

  // 9. Arts, Crafts & Creative work
  const isArts =
    title.includes('seni') ||
    title.includes('art') ||
    title.includes('kreatif') ||
    title.includes('musik') ||
    title.includes('nyanyi') ||
    title.includes('instrumen') ||
    catName.includes('seni') ||
    catName.includes('art') ||
    catName.includes('kreatif') ||
    catName.includes('musik') ||
    catName.includes('nyanyi') ||
    catName.includes('instrumen') ||
    catSlug.includes('art');

  if (isArts) {
    const pool = [
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513829096900-fe04707a3d85?q=80&w=800&auto=format&fit=crop',
    ];
    return pool[hash % pool.length];
  }

  // Default fallback pool of high-quality premium images
  const fallbackPool = [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1531501410720-c8d4376360f6?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop'
  ];

  return fallbackPool[hash % fallbackPool.length];
}
