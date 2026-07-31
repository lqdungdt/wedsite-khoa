# Hướng dẫn triển khai website-khoa-astro

Site đã được xây xong và kiểm thử cục bộ (build sạch, CMS đọc/ghi đúng). Các bước dưới đây là những việc **cần bạn tự thực hiện** vì liên quan tài khoản cá nhân (GitHub, Cloudflare) — trợ lý AI không tự tạo tài khoản hoặc đăng nhập thay bạn được.

Toàn bộ đều **miễn phí**.

---

## 1. Tạo GitHub repo và đẩy code lên

1. Vào [github.com/new](https://github.com/new), tạo một repository mới, **để trống** (không chọn thêm README/gitignore/license), đặt tên tuỳ ý, ví dụ `website-khoa-astro`.
2. Copy URL repo vừa tạo (dạng `https://github.com/ten-tai-khoan/website-khoa-astro.git`).
3. Báo lại cho trợ lý AI URL này — trợ lý sẽ hỏi xác nhận trước khi chạy `git init`, `git add`, `git commit`, `git remote add`, `git push` (đẩy code lên là thao tác cần bạn xác nhận).

## 2. Site đã chạy thật tại Cloudflare Workers

Site đang chạy tại **https://wedsite-khoa.lqdung3.workers.dev** (deploy bằng `wrangler deploy`, cấu hình trong `wrangler.jsonc`). Lưu ý: luồng "Connect to Git" tự động của Cloudflare (Workers Builds) từng bị lỗi 522 ở bước validate nội bộ — nên lần đầu đã deploy thủ công bằng CLI. Xem mục 2.1 bên dưới để tự động hoá việc build+deploy qua GitHub Actions thay vì phải chạy tay mỗi lần.

### 2.1. Deploy tự động khi push code (GitHub Actions)

Đã có sẵn file `.github/workflows/deploy.yml` — mỗi khi push lên nhánh `main`, GitHub sẽ tự `npm run build` rồi `wrangler deploy`. Để bật, cần thêm 2 secret cho repo GitHub:

1. Vào **dash.cloudflare.com** → **My Profile** (icon góc phải) → **API Tokens** → **Create Token** → chọn template **"Edit Cloudflare Workers"** → **Continue to summary** → **Create Token**. Copy token hiện ra (chỉ hiện 1 lần).
2. Lấy **Account ID**: ở trang chính Workers & Pages, Account ID hiển thị ở cột phải, hoặc trong URL dashboard dạng `dash.cloudflare.com/<Account-ID>/...`.
3. Vào repo GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**, tạo lần lượt:
   - `CLOUDFLARE_API_TOKEN` = token vừa tạo ở bước 1
   - `CLOUDFLARE_ACCOUNT_ID` = Account ID ở bước 2
4. Từ giờ mỗi lần push code lên `main`, vào tab **Actions** trên GitHub để xem tiến trình build/deploy tự động.

## 3. Bật đăng nhập cho Decap CMS (chỉnh nội dung qua `/admin`)

Vì hosting là Cloudflare (không phải Netlify), Decap CMS cần một dịch vụ xác thực GitHub OAuth riêng. Dùng mã nguồn mở **sveltia-cms-auth** (một Cloudflare Worker nhỏ, miễn phí):

### 3.1. Tạo GitHub OAuth App
1. Vào **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Điền:
   - **Homepage URL**: `https://wedsite-khoa.lqdung3.workers.dev`
   - **Authorization callback URL**: `https://cms-auth.<ten-subdomain-cua-ban>.workers.dev/callback` (điền tạm, sẽ khớp chính xác sau khi deploy Worker ở bước 3.2)
3. Lưu lại **Client ID** và **Client Secret**.

### 3.2. Deploy Cloudflare Worker xác thực
Trong terminal của bạn (không phải qua trợ lý AI, vì bước này cần bạn đăng nhập tài khoản Cloudflare riêng):

```bash
git clone https://github.com/sveltia/sveltia-cms-auth.git
cd sveltia-cms-auth
npx wrangler login
npx wrangler deploy
```

Lệnh cuối sẽ in ra URL dạng `https://cms-auth.<subdomain>.workers.dev` — đây chính là `base_url` cần dùng.

Sau đó thiết lập 2 secret cho Worker:

```bash
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
```

(dán Client ID / Client Secret đã lưu ở bước 3.1 khi được hỏi)

### 3.3. Cập nhật `public/admin/config.yml`
Sửa 2 dòng đầu file `public/admin/config.yml` trong dự án:

```yaml
backend:
  name: github
  repo: ten-tai-khoan-github/website-khoa-astro   # repo thật ở bước 1
  branch: main
  base_url: https://cms-auth.<subdomain>.workers.dev   # URL Worker ở bước 3.2
  auth_endpoint: auth
```

Commit và push thay đổi này lên GitHub — Cloudflare Pages sẽ tự build lại.

Từ giờ, vào `https://wedsite-khoa.lqdung3.workers.dev/admin/index.html` để đăng nhập bằng tài khoản GitHub và chỉnh sửa: Tin tức, Thông báo, Đội ngũ giảng viên, Biểu mẫu, Cấu hình chung, Giới thiệu.

## 4. Google Form cho trang Liên hệ

1. Tạo form tại [forms.google.com](https://forms.google.com) với các trường bạn muốn (họ tên, email, nội dung...).
2. Trong Google Form: **Gửi** → chọn tab **Nhúng `<>`** → copy URL trong thuộc tính `src` của đoạn `<iframe>`.
3. Mở file `src/pages/lien-he.astro`, tìm dòng:
   ```ts
   const GOOGLE_FORM_URL = '';
   ```
   Dán URL vào giữa hai dấu nháy đơn.
4. Commit, push — trang Liên hệ sẽ tự động hiện form nhúng.

## 5. Domain riêng của trường (tuỳ chọn)

Nếu muốn dùng địa chỉ như `khoadieuduong.cdytdt.edu.vn` thay vì `*.workers.dev`:

1. Domain `cdytdt.edu.vn` cần được quản lý DNS qua Cloudflare (hoặc ít nhất ủy quyền một subdomain CNAME sang Cloudflare) — cần phối hợp với người quản trị DNS của trường.
2. Trong Cloudflare dashboard → **Workers & Pages** → chọn Worker `wedsite-khoa` → tab **Settings** → **Domains & Routes** → **Add** → **Custom domain**, làm theo hướng dẫn.

---

## Việc bạn cần làm ngay bây giờ

- [x] Tạo GitHub repo, đẩy code lên (`github.com/lqdungdt/wedsite-khoa`)
- [x] Deploy lần đầu lên Cloudflare Workers (`wedsite-khoa.lqdung3.workers.dev`)
- [ ] Thêm 2 secret `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` vào GitHub repo để bật deploy tự động (bước 2.1)
- [ ] Nếu muốn dùng CMS để tự đăng tin: làm bước 3
- [ ] Nếu muốn form liên hệ: tạo Google Form (bước 4)

## Lệnh chạy thử cục bộ (đã kiểm thử, hoạt động tốt)

```bash
npm run dev              # chạy site tại http://localhost:4321
npx decap-server         # (mở terminal khác) bật CMS cục bộ, không cần GitHub
# rồi mở http://localhost:4321/admin/index.html, bấm "Login" (dùng local backend)
```
