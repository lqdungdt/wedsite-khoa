import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const baiVietSchema = z.object({
  tieuDe: z.string(),
  ngayTao: z.coerce.date(),
  tomTat: z.string(),
  noiBat: z.boolean().default(false),
});

const tinTuc = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tin-tuc' }),
  schema: baiVietSchema,
});

const thongBao = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/thong-bao' }),
  schema: baiVietSchema,
});

const tuyenSinh = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tuyen-sinh' }),
  schema: baiVietSchema,
});

// Ported từ src/lib/hang-so.ts (website-khoa cũ)
const HOC_VI = [
  'Cử nhân',
  'Cử nhân Điều dưỡng',
  'Kỹ thuật viên',
  'CKI',
  'CKII',
  'Thạc sĩ',
  'BSCKI',
  'BSCKII',
  'Tiến sĩ',
] as const;

const giangVien = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/giang-vien' }),
  schema: z.object({
    hoTen: z.string(),
    hocVi: z.enum(HOC_VI),
    chucVu: z.string(),
    chuyenMon: z.string().optional(),
    email: z.string().email(),
    gioiThieu: z.string().optional(),
    anh: z.string().optional(),
    nhom: z.enum(['lanh-dao', 'van-phong', 'giang-vien']),
    thuTu: z.number().int().default(0),
  }),
});

const bieuMau = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/bieu-mau' }),
  schema: z.object({
    tieuDe: z.string(),
    moTa: z.string(),
    doiTuong: z.enum(['giang-vien', 'sinh-vien']),
    file: z.string(),
  }),
});

const cauHinh = defineCollection({
  loader: file('src/content/cau-hinh.yaml'),
  schema: z.object({
    ten_khoa: z.string(),
    ten_truong: z.string(),
    dia_chi: z.string(),
    dien_thoai: z.string(),
    email: z.string(),
    gioi_thieu_ngan: z.string(),
    gio_lam_viec: z.string(),
  }),
});

const gioiThieu = defineCollection({
  loader: glob({ pattern: 'index.md', base: './src/content/gioi-thieu' }),
  schema: z.object({ tieuDe: z.string() }),
});

const chuongTrinhDaoTao = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/chuong-trinh-dao-tao' }),
  schema: z.object({
    tieuDe: z.string(),
    nhom: z.string(),
    file: z.string(),
    thuTu: z.number().int().default(0),
  }),
});

const nghienCuu = defineCollection({
  loader: glob({ pattern: 'index.md', base: './src/content/nghien-cuu' }),
  schema: z.object({ tieuDe: z.string() }),
});

const anhHoatDong = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/anh-hoat-dong' }),
  schema: z.object({
    anh: z.string(),
    moTa: z.string().optional(),
    thuTu: z.number().int().default(0),
  }),
});

export const collections = {
  tinTuc,
  thongBao,
  tuyenSinh,
  giangVien,
  bieuMau,
  cauHinh,
  gioiThieu,
  chuongTrinhDaoTao,
  nghienCuu,
  anhHoatDong,
};
