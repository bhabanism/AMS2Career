@echo off
ECHO Building ams2results.exe...

:: Create directories if they don't exist
IF NOT EXIST "output" mkdir output
IF NOT EXIST "log" mkdir log
IF NOT EXIST "sent" mkdir sent
IF NOT EXIST "raceinfo" mkdir raceinfo

:: Compile resource file
ECHO Compiling resources/resource.rc...
windres resources/resource.rc -o resource.o
IF %ERRORLEVEL% NEQ 0 (
    ECHO Error: Failed to compile resources/resource.rc
    EXIT /B %ERRORLEVEL%
)

:: Compile and link C++ program
ECHO Compiling src/race_logger.cpp...
g++ -o ams2results.exe src/race_logger.cpp resource.o -lwinmm -lcurl -mconsole
IF %ERRORLEVEL% NEQ 0 (
    ECHO Error: Failed to compile src/race_logger.cpp or link ams2results.exe
    EXIT /B %ERRORLEVEL%
)

ECHO Build successful! ams2results.exe created.
EXIT /B 0