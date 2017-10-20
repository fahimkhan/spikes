#!/bin/bash

# Installs shortcut to the browser on the desktop
# and dependencies

SCRIPT_PATH="$0";
WD=`pwd`

if([ -h "${SCRIPT_PATH}" ]) then
   while([ -h "${SCRIPT_PATH}" ]) do SCRIPT_PATH=`readlink "${SCRIPT_PATH}"`; done
fi
pushd . > /dev/null
cd `dirname ${SCRIPT_PATH}` > /dev/null
SCRIPT_PATH=`pwd`
popd > /dev/null

# Now we know where we are installed. Lets create the shortcut.
INSTALLDIR=${SCRIPT_PATH};
DESKTOP=~/Desktop;
ARCH=`/bin/uname -p`

SHORTCUT=openkiosk.desktop;

touch ${DESKTOP}/${SHORTCUT};
chmod a+rx ${DESKTOP}/${SHORTCUT};

echo "[Desktop Entry]"                            > ${DESKTOP}/${SHORTCUT};
echo "Encoding=UTF-8"                            >> ${DESKTOP}/${SHORTCUT};
echo "Version=8.0"                               >> ${DESKTOP}/${SHORTCUT};
echo "Type=Application"                          >> ${DESKTOP}/${SHORTCUT};
echo "Terminal=false"                            >> ${DESKTOP}/${SHORTCUT};
echo "Exec=$INSTALLDIR/openkiosk"                >> ${DESKTOP}/${SHORTCUT};
echo "Icon=$INSTALLDIR/openkiosk.png"            >> ${DESKTOP}/${SHORTCUT};
echo "Name=OpenKiosk"                            >> ${DESKTOP}/${SHORTCUT};

if [ "$1" = "-i" ]; then
  echo "icon only installed...";
  exit 0;
fi

exit 0;

# If SELINUX is running, we need to set the security context for 
# one of our libs - otherwise, the browser won't launch.
if [ -e /selinux/enforce ]; then
   chcon -t texrel_shlib_t ${INSTALLDIR}/libxul.so   
fi

ARCH=`/bin/uname -p`

which yum > /dev/null 2>&1;

if [ $? -eq 0  ]; then 
  echo Installing OpenKiosk dependencies...;

  sudo yum -y update glibc gtk2 dbus-glib libXt readline;

  wait;

  sudo yum -y install glibc gtk2 dbus-glib libXt readline;

  exit 0;
fi

which apt-get > /dev/null 2>&1;

if [ $? -eq 0  ]; then 
  echo Installing OpenKiosk dependencies...;
  echo;

  if [ "${ARCH}" = "x86_64" ]; then
    sudo apt-get -y install libdbus-glib-1-2 libreadline6 libgtk2.0;
  else
    sudo apt-get -y install libstdc++6 libdbus-glib-1-2 libreadline6 libgtk2.0;
  fi

  exit 0;
fi

which zypper > /dev/null 2>&1;

if [ $? -eq 0  ]; then 
  echo Installing OpenKiosk dependencies...;

  sudo zypper -n install glibc dbus-1-glib gtk2-tools libXt6 libreadline6 libgthread-2_0-0;
fi

exit 0;

