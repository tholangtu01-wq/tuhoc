@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================================================
echo   TRIỂN KHAI VERCEL CLOUD 24/7 CHO: HANZII PRO (HỌC TIẾNG TRUNG)
echo ============================================================================
echo.
echo [Bước 1/2] Kiểm tra đăng nhập tài khoản Vercel...
echo (Nếu trình duyệt mở ra hoặc có link xác thực, hãy bấm "Continue with Google" hoặc "GitHub")
call npx -y vercel whoami >nul 2>&1
if errorlevel 1 (
    call npx -y vercel login
    if errorlevel 1 (
        echo.
        echo [LỖI] Bạn chưa hoàn tất đăng nhập Vercel. Hãy thử lại và bấm Confirm trên trình duyệt.
        pause
        exit /b 1
    )
)
echo.
echo [Bước 2/2] Đang đẩy toàn bộ ứng dụng web Hanzii Pro lên máy chủ Vercel Production 24/7...
call npx -y vercel deploy . --prod --yes
if errorlevel 1 (
    echo [LỖI] Đẩy lên Vercel thất bại.
    pause
    exit /b 1
)
echo.
echo ============================================================================
echo   HOÀN TẤT TRIỂN KHAI LÊN VERCEL 24/7 THÀNH CÔNG!
echo   Bây giờ bạn có thể truy cập web app học tiếng Trung từ mọi trình duyệt
echo   trên Điện thoại (iOS / Android), Máy tính bảng hoặc PC bất kỳ đâu!
echo ============================================================================
pause
exit /b 0
