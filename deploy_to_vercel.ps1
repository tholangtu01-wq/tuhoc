# PowerShell Deploy script for Hanzii Pro
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "   TRIỂN KHAI VERCEL CLOUD 24/7: HANZII PRO (HỌC TIẾNG TRUNG)" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/2] Kiểm tra kết nối tài khoản Vercel..." -ForegroundColor Yellow
$whoami = npx -y vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Chưa đăng nhập Vercel. Đang mở trình duyệt để xác thực..." -ForegroundColor Magenta
    npx -y vercel login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[LỖI] Đăng nhập Vercel chưa thành công. Vui lòng thử lại." -ForegroundColor Red
        Exit 1
    }
}

Write-Host ""
Write-Host "[2/2] Đang triển khai trực tiếp lên Vercel Production..." -ForegroundColor Yellow
npx -y vercel deploy . --prod --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "============================================================================" -ForegroundColor Green
    Write-Host "   ĐÃ TRIỂN KHAI THÀNH CÔNG LÊN VERCEL!" -ForegroundColor Green
    Write-Host "   Ứng dụng web đã hoạt động online 24/7 trên toàn thế giới!" -ForegroundColor Green
    Write-Host "============================================================================" -ForegroundColor Green
} else {
    Write-Host "[LỖI] Triển khai lên Vercel thất bại." -ForegroundColor Red
}
