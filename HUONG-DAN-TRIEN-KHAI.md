# Hướng dẫn triển khai website-khoa-astro

Site đã được xây xong và kiểm thử cục bộ (build sạch, CMS đọc/ghi đúng). Các bước dưới đây là những việc **cần bạn tự thực hiện** vì liên quan tài khoản cá nhân (GitHub, Cloudflare) — trợ lý AI không tự tạo tài khoản hoặc đăng nhập thay bạn được.

Toàn bộ đều **miễn phí**.

---

## 1. Tạo GitHub repo và đẩy code lên

1. Vào [github.com/new](https://github.com/new), tạo một repository mới, **để trống** (không chọn thêm README/gitignore/license), đặt tên tuỳ ý, ví dụ `website-khoa-astro`.
2. Copy URL repo vừa tạo (dạng `https://github.com/ten-tai-khoan/website-khoa-astro.git`).
3. Báo lại cho trợ lý AI URL này — trợ lý sẽ hỏi xác nhận trước khi chạy `git init`, `git add`, `git commit`, `git remote add`, `git push` (đẩy code lên là thao tác cần bạn xác nhận).

## 2. Kết nối Cloudflare Pages

1. Đăng nhập / tạo tài khoản tại [dash.cloudflare.com](https://dash.cloudflare.com).
2. Vào **Workers & Pages** → **Create** → **Pages** → **Connect to Git**, chọn repo GitHub vừa tạo.
3. Cấu hình build:
   - **Framework preset**: Astro (Cloudflare tự điền phần lớn giá trị dưới đây)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - Trong **Environment variables**, thêm `NODE_VERSION` = `22` (hoặc `24`)
4. Bấm **Save and Deploy**. Sau vài phút sẽ có URL dạng `https://ten-du-an.pages.dev` — đây là link chạy thật, miễn phí, băng thông không giới hạn, không "ngủ".

## 3. Bật đăng nhập cho Decap CMS (chỉnh nội dung qua `/admin`)

Vì hosting là Cloudflare (không phải Netlify), Decap CMS cần một dịch vụ xác thực GitHub OAuth riêng. Dùng mã nguồn mở **sveltia-cms-auth** (một Cloudflare Worker nhỏ, miễn phí):

### 3.1. Tạo GitHub OAuth App
1. Vào **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Điền:
   - **Homepage URL**: `https://ten-du-an.pages.dev` (URL Cloudflare Pages ở bước 2)
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

Từ giờ, vào `https://ten-du-an.pages.dev/admin/` để đăng nhập bằng tài khoản GitHub và chỉnh sửa: Tin tức, Thông báo, Đội ngũ giảng viên, Biểu mẫu, Cấu hình chung, Giới thiệu.

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

Nếu muốn dùng địa chỉ như `khoadieuduong.cdytdt.edu.vn` thay vì `*.pages.dev`:

1. Domain `cdytdt.edu.vn` cần được quản lý DNS qua Cloudflare (hoặc ít nhất ủy quyền một subdomain CNAME sang Cloudflare) — cần phối hợp với người quản trị DNS của trường.
2. Trong Cloudflare Pages project → **Custom domains** → **Set up a custom domain**, làm theo hướng dẫn (Cloudflare tự tạo bản ghi CNAME cần thiết nếu domain đã ở trong tài khoản Cloudflare đó).

---

## Việc bạn cần làm ngay bây giờ

- [ ] Tạo GitHub repo trống (bước 1) và cho trợ lý AI biết URL để đẩy code lên
- [ ] Tạo/đăng nhập tài khoản Cloudflare và kết nối Pages (bước 2)
- [ ] Nếu muốn dùng CMS để tự đăng tin: làm bước 3
- [ ] Nếu muốn form liên hệ: tạo Google Form (bước 4)

## Lệnh chạy thử cục bộ (đã kiểm thử, hoạt động tốt)

```bash
npm run dev              # chạy site tại http://localhost:4321
npx decap-server         # (mở terminal khác) bật CMS cục bộ, không cần GitHub
# rồi mở http://localhost:4321/admin/index.html, bấm "Login" (dùng local backend)
```
