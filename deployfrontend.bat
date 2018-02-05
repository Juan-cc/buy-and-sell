xcopy .\src\* .\docs\ /y /s /e
xcopy .\build\contracts\ChainList.json .\docs\ /y /s /e
git add .
git commit -m "Updating frontend files to github pages"
git push
