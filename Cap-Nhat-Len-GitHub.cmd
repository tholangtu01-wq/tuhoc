@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================================================
echo   TỰ ĐỘNG CẬP NHẬT WEB APP LÊN GITHUB (tholangtu01-wq/tuhoc)
echo ============================================================================
echo.
echo [1/3] Đang kiểm tra các file đã chỉnh sửa...
git add .
echo.
echo [2/3] Đang ghi nhận thay đổi...
set /p commit_msg="Nhap ghi chu cap nhat (hoac an Enter de dung mac dinh): "
if "%commit_msg%"=="" set commit_msg=Cap nhat ung dung hoc tieng Trung
git commit -m "%commit_msg%"
echo.
echo [3/3] Đang đồng bộ tự động lên GitHub Pages...
git push -u origin main --force
if errorlevel 1 (
    echo.
    echo [LƯU Ý] Nếu Git yêu cầu đăng nhập, hãy chọn "Sign in with your browser".
    pause
    exit /b 1
)
echo.
echo ============================================================================
echo   ĐÃ CẬP NHẬT THÀNH CÔNG LÊN GITHUB!
echo   Website https://tholangtu01-wq.github.io/tuhoc/ sẽ tự động nhận bản mới
echo   sau khoảng 30 - 60 giây.
echo ============================================================================
pause
exit /b 0
