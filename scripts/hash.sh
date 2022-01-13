#! /bin/bash

set -e

[ "$#" -lt 1 ] && echo "missing url" && exit 1

url="$1"

case "$url" in
    https://clavinjune.github.io/*);;
    https://clavinjune.dev/*)
        url="${url//clavinjune.dev/clavinjune.github.io}"
    ;;
    *)
        echo "url should starts with https://clavinjune.github.io/ or https://clavinjune.dev/"
        exit 1
    ;;
esac

echo "$url" | md5sum | cut -c1-5