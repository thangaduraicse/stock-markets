@echo off
setlocal enabledelayedexpansion

:: Define source and destination directories
set "source_folder=C:\Users\durai\Downloads\Stocks\EXTRACT"
set "destination_folder=C:\Users\durai\Downloads\Stocks\RENAMED"

:: Create destination folder if it doesn't exist
if not exist "%destination_folder%" mkdir "%destination_folder%"

:: Process each old format file in the source folder
for %%f in ("%source_folder%\cm*bhav.csv") do (
    set "filename=%%~nxf"

    :: Extract date components from filename (cmDDMMMYYYYbhav.csv)
    set "day=!filename:~2,2!"
    set "month_str=!filename:~4,3!"
    set "year=!filename:~7,4!"

    :: Map the month string to its numerical equivalent
    set "month="
    if /i "!month_str!"=="JAN" set "month=01"
    if /i "!month_str!"=="FEB" set "month=02"
    if /i "!month_str!"=="MAR" set "month=03"
    if /i "!month_str!"=="APR" set "month=04"
    if /i "!month_str!"=="MAY" set "month=05"
    if /i "!month_str!"=="JUN" set "month=06"
    if /i "!month_str!"=="JUL" set "month=07"
    if /i "!month_str!"=="AUG" set "month=08"
    if /i "!month_str!"=="SEP" set "month=09"
    if /i "!month_str!"=="OCT" set "month=10"
    if /i "!month_str!"=="NOV" set "month=11"
    if /i "!month_str!"=="DEC" set "month=12"

    :: Check if the month was successfully mapped
    if defined month (
        :: Format the date as dd-mm-yyyy
        set "formatted_date=!year!-!month!-!day!-old"

        :: Rename and copy the file to the destination folder
        copy "%%f" "%destination_folder%\!formatted_date!.csv"
        echo Renamed "%%~nxf" to "!formatted_date!.csv"
    ) else (
        echo Skipping file "%%~nxf" - invalid month format.
    )
)

:: Loop through each new format file in the source folder matching the pattern
for %%f in ("%source_folder%\BhavCopy_NSE_CM_0_0_0_*.csv") do (
    set "filename=%%~nxf"

    :: Use regex-like substring to extract the date part (YYYYMMDD) from the filename
    set "date_part=!filename:~22,8!"

    echo "!date_part!"

    :: Check if the extracted part is in the correct format
    if "!date_part!" neq "" (
        :: Format the date to YYYY-MM-DD
        set "formatted_date=!date_part:~0,4!-!date_part:~4,2!-!date_part:~6,2!.csv"

        :: Copy the file to the destination folder with the new name
        copy "%%f" "%destination_folder%\!formatted_date!"
        echo Renamed "%%~nxf" to "!formatted_date!"
    ) else (
        echo Skipping file "%%~nxf" - invalid date format.
    )
)

echo All files have been renamed and copied to the new folder.
endlocal
pause
