@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================================================
echo   ĐĂNG NHẬP GITHUB (1 LẦN DUY NHẤT) ĐỂ KÍCH HOẠT ĐỒNG BỘ TỰ ĐỘNG
echo ============================================================================
echo.
echo Đang mở trình duyệt để xác thực tài khoản GitHub của bạn...
call gh auth login -h github.com -p https -w
echo.
if errorlevel 0 (
    echo [THÀNH CÔNG] Bạn đã đăng nhập GitHub thành công!
    echo Từ bây giờ file "Cap-Nhat-Len-GitHub.cmd" sẽ chạy tự động 100%.
) else (
    echo [LỖI] Đăng nhập chưa thành công.
)
echo.
pause
