-- Jalankan di Supabase: SQL Editor -> New query -> paste -> Run

-- 1. Tabel penyimpanan data bersama (produk & nama penerima)
create table if not exists public.app_data (
  key        text primary key,          -- 'products' atau 'names'
  value      jsonb not null,            -- isi daftar dalam format JSON
  updated_at timestamptz not null default now()
);

-- 2. Aktifkan Row Level Security: tanpa policy, tidak ada yang bisa akses
alter table public.app_data enable row level security;

-- 3. Hanya pengguna yang sudah login (petugas) yang boleh baca & ubah
create policy "petugas boleh baca"
  on public.app_data for select to authenticated using (true);

create policy "petugas boleh tambah"
  on public.app_data for insert to authenticated with check (true);

create policy "petugas boleh ubah"
  on public.app_data for update to authenticated using (true) with check (true);

-- Sengaja tidak ada policy delete: data tidak bisa dihapus dari aplikasi.
