#!/bin/bash

tmp_dir="/tmp"
version="2.3.1"
minor_version="2.3"
ruby_version="ruby-$version"

echo "*******************"
echo "* Installing Ruby *"
echo "*******************"

sudo apt-get install -y autoconf build-essential libreadline-dev libssl-dev libyaml-dev zlib1g-dev libffi-dev

mkdir -p "$tmp_dir"
cd "$tmp_dir"

wget "http://cache.ruby-lang.org/pub/ruby/$minor_version/$ruby_version.tar.gz"
tar -xvzf $ruby_version.tar.gz
cd $ruby_version

./configure --disable-install-doc
make --jobs `nproc`
sudo make install

cd ..
rm $ruby_version.tar.gz
rm -rf $ruby_version

echo "*******************"
echo "* Ruby installed! *"
echo "*******************"
