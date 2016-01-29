#/usr/bin/env sh

(cd build && s3cmd sync -P --recursive . s3://lantern-desktop-ui)
