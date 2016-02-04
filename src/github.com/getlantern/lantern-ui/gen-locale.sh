#!/bin/bash

function die() {
echo $*
exit 1
}

command -v i18next >/dev/null 2>&1 || npm i -g i18next
command -v json >/dev/null 2>&1 || npm i -g json

mkdir -p locale/tmp
for file in locale/*
do
  if [ -f "$file" ]
  then
    locale=$(basename -s .json "$file")
    echo $file $locale
    echo "extract locale $locale from js source code..."
    i18next js -k '~' -s '`' -r -o locale/tmp -l "$locale"
    echo "merging newly extracted to existing $locale.json..."
    echo "" | cat locale/tmp/"$locale"/translation.json - locale/"$locale".json | json --merge | sed "s/\"\"/\"TODO\"/" > locale/tmp/"$locale".json
  fi
done

cp locale/tmp/*.json locale/
rm -r locale/tmp
