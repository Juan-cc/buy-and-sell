rsync -r src/ docs/
rsync build/contracts/ChainList.json docs/
git add .
git commmit -m "Adding frontend files to github pages"
git push
