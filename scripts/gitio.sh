#! /bin/sh

set -e

[ "$#" -lt 1 ] && echo "missing url" && exit 1

url="$1"

case "$url" in
    https://clavinjune.github.io/*);;
    *)
        echo "url should starts with https://clavinjune.github.io/"
        exit 1
    ;;
esac

hash=$(echo "$url" | md5sum | cut -c1-5)
result="/tmp/response.txt"

code=$(curl https://git.io/ \
    -is \
    -o $result \
    -w "%{http_code}\n" \
    -F "url=$url" \
    -F "code=cj-$hash")

[ "$code" -ne "201" ] && cat "$result" && rm -rf "$result" && exit 1

short=$(cat "$result" | grep "Location: " | cut -c11- | tr -d [:space:])
ok=$(grep "$short" urls.txt || true)

[ "$ok" = "" ] && echo "$short => $url" >> urls.txt

echo "$short"

rm -rf "$result"