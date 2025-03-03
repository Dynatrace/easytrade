#!/bin/bash

replace_all() {
    FROM=$1
    TO=$2
    echo "Replacing [$FROM] with [$TO]"
    grep -rl $FROM . --exclude-dir={.git,node_modules,bin,obj,build} | xargs sed -i "s/$FROM/$TO/g"
}

BUILD_VERSION=$1
WORKDIR=${2:-.}
BUILD_DATE=${3:-$(date '+%Y-%m-%d %H:%M')}
BUILD_COMMIT=${4:-$(git log --pretty=format:'%h' -n 1)}

if [ -z "$BUILD_VERSION" ]; then
    echo "Build version not set"
    exit 1
fi

cd $WORKDIR

echo "Build version: $BUILD_VERSION, date: $BUILD_DATE, commit: $BUILD_COMMIT, path: $(pwd)"

replace_all "1.0.0-easytrade" "$BUILD_VERSION"
replace_all "{{BUILD_VERSION}}" "$BUILD_VERSION"
replace_all "{{BUILD_DATE}}" "$BUILD_DATE"
replace_all "{{BUILD_COMMIT}}" "$BUILD_COMMIT"
