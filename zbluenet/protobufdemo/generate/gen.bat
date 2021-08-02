@echo off
set SOURCE_FOLDER=.

set CC_COMPILE_PATH=..\protobuf\protoc.exe
set CC_TARGET_PATH=..\protocol

::刪除之前創建的文件
del %CC_TARGET_PATH%\*.* /f /s /q

::遍歷
for /f "delims=" %%i in ('dir /b "%SOURCE_FOLDER%\*.proto"') do (
	echo %CC_COMPILE_PATH% -i:%%i -o:%CC_TARGET_PATH%\%%~ni.cc
	%CC_COMPILE_PATH% -I=%SOURCE_FOLDER% --cpp_out=%CC_TARGET_PATH% %SOURCE_FOLDER%\%%i
	
)

pause
echo "finish"

