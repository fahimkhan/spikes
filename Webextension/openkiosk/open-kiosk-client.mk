# open-kiosk-client.mk
#
# Automate checkout of the base mozilla firefox code and the open kiosk client code.

# set this for latest target branch
TARGET_REV = FIREFOX_47_0_2_RELEASE
BUNDLE_HOST=https://hg.cdn.mozilla.net
BUNDLE_CONFIG_FILE=$(BUNDLE_HOST)/bundles.json
BUNDLE_PATH=""
BUNDLE_EXT=gzip-v2.hg

PATCH = open-kiosk-core-changes.patch

MOZ_CONFIG = mozilla/.mozconfig

JSLIB_XPI_URL = https://www.mozdevgroup.com/dropbox/jslib/jslib_current.xpi

OS_ARCH = $(shell uname -s)

all: checkout

checkout: bundle-checkout openkiosk-checkout patch mozconfig

mozilla-checkout: bundle-checkout

mercurial-checkout: 
	@if [ ! -d mozilla ]; then \
	  hg clone -r $(TARGET_REV) http://hg.mozilla.org/releases/mozilla-release/ mozilla/; \
	fi

fetch-bundle:
	echo fetching bundle file [$(BUNDLE_CONFIG_FILE)];
	wget -N $(BUNDLE_CONFIG_FILE); wait;                                                                                                             \

bundle-checkout: fetch-bundle
	@if [ ! -d mozilla ]; then hg init mozilla; fi
	export BUNDLE_PATH=$(shell grep mozilla-release bundles.json | grep $(BUNDLE_EXT) | sed -e's:^.*"r:r:g' | sed -e's:",::g;');                     \
	export BUNDLE_FILE=$(shell grep mozilla-release bundles.json | grep $(BUNDLE_EXT) | sed -e's:^.*"r:r:g' | sed -e's:",::g;' | sed -e's:^.*/::g'); \
	export BUNDLE_URL=$(BUNDLE_HOST)/$$BUNDLE_PATH;                                                                                                  \
	echo Fetching Mercurial Bundle [$$BUNDLE_URL];                                                                                                   \
	wget -N $$BUNDLE_URL;                                                                                                                            \
	cd mozilla; hg unbundle ../$$BUNDLE_FILE; wait; hg up; wait; hg up -r $(TARGET_REV);

openkiosk-checkout:
	if [ ! -d mozilla/openkiosk ]; then \
	  cp -r src mozilla/openkiosk;      \
	fi;

jslib-checkout:
	wget --no-check-certificate -N $(JSLIB_XPI_URL) -P mozilla/openkiosk/jslib;

mozconfig:
	echo '# OKCD Release Build' > $(MOZ_CONFIG);
  ifeq ($(OS_ARCH),Linux)
	echo '. $$topsrcdir/openkiosk/config/mozconfig.'$(OS_ARCH) >> $(MOZ_CONFIG);
	echo  >> $(MOZ_CONFIG);
	echo '# . $$topsrcdir/openkiosk/config/mozconfig.'$(OS_ARCH)_64 >> $(MOZ_CONFIG);
	echo  >> $(MOZ_CONFIG);
  else
    ifeq ($(OS_ARCH),Darwin)
	echo '. $$topsrcdir/openkiosk/config/mozconfig.universal' >> $(MOZ_CONFIG);
	echo  >> $(MOZ_CONFIG);
    else
	echo '. $$topsrcdir/openkiosk/config/mozconfig.WINNT' >> $(MOZ_CONFIG);
	echo  >> $(MOZ_CONFIG);
    endif
  endif
	echo '# OKCD Debug Build' >> $(MOZ_CONFIG);
  ifeq ($(OS_ARCH),Linux)
	echo '# . $$topsrcdir/openkiosk/config/mozconfig-debug.'$(OS_ARCH) >> $(MOZ_CONFIG);
	echo  >> $(MOZ_CONFIG);
  else
    ifeq ($(OS_ARCH),Darwin)
	echo '# . $$topsrcdir/openkiosk/config/mozconfig-debug.'$(OS_ARCH).universal >> $(MOZ_CONFIG);
	echo  >> $(MOZ_CONFIG);
    else
	echo '# . $$topsrcdir/openkiosk/config/mozconfig-debug.WINNT' >> $(MOZ_CONFIG);
	echo  >> $(MOZ_CONFIG);
    endif
  endif
	echo '# Vanilla Firefox Release Build' >> $(MOZ_CONFIG);
  ifeq ($(OS_ARCH),Linux)
	echo '# . $$topsrcdir/browser/config/mozconfigs/linux32/release' >> $(MOZ_CONFIG);
  else
    ifeq ($(OS_ARCH),Darwin)
	echo '# . $$topsrcdir/browser/config/mozconfigs/macosx-universal/release' >> $(MOZ_CONFIG);
    else
	echo '# important comment out reference to "mozconfig.vs2013-win64" in win32/commmon-opt' >> $(MOZ_CONFIG);
	echo '# it has mozilla specific build paths that will break this build' >> $(MOZ_CONFIG);
	echo '# . $$topsrcdir/browser/config/mozconfigs/win32/nightly' >> $(MOZ_CONFIG);
    endif
  endif
	echo  '# mk_add_options MOZ_OBJDIR=@TOPSRCDIR@/../opt-vanilla-@CONFIG_GUESS@' >> $(MOZ_CONFIG);
	echo  '# ac_add_options --disable-tests' >> $(MOZ_CONFIG);

ifeq ($(OS_ARCH),Linux)
mozconfig-linux64:
	echo '# OKCD Linux 64 bit Release Build' > $(MOZ_CONFIG);
	echo '. $$topsrcdir/kiosk/config/mozconfig.'$(OS_ARCH)_64 >> $(MOZ_CONFIG);
	echo  >> $(MOZ_CONFIG);
endif

patch:
ifeq ($(OS_ARCH),MINGW32_NT-6.1)
	@cp open-kiosk-core-changes.patch{,.orig}; dos2unix.exe open-kiosk-core-changes.patch;
endif
	cd mozilla; patch -p1 < ../$(PATCH);
ifeq ($(OS_ARCH),MINGW32_NT-6.1)
	mv open-kiosk-core-changes.patch{.orig,};
endif

repatch: cleanpatch patch

cleanpatch: 
	@cd mozilla; hg up -C; (hg up -r $(TARGET_REV) 2> /dev/null | true); 

help:
	@echo build targets: checkout mozilla-checkout openkiosk-checkout jslib-checkout mozconfig patch repatch cleanpatch test

test:
	@echo "hg clone -r $(TARGET_REV)  http://hg.mozilla.org/releases/mozilla-$(REPOS)/ mozilla/";
	@echo $(PATCH)

