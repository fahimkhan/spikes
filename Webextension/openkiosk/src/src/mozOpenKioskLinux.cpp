// SB header file
#include "mozOpenKioskLinux.h"

#include <stdio.h>

mozOpenKiosk::mozOpenKiosk()
{
  printf("-------- mozOpenKiosk::CREATE --------\n");
}

mozOpenKiosk::~mozOpenKiosk()
{
  printf("-------- mozOpenKiosk::DESTROY --------\n");
}

NS_IMPL_ISUPPORTS(mozOpenKiosk, mozIOpenKiosk)

NS_IMETHODIMP
mozOpenKiosk::SetOpenKioskUIMode(bool aIsAdmin)
{
  // printf("-------- mozOpenKiosk::SetOpenKioskUIMode --------\n");

  if (aIsAdmin) Enable();
  else Disable();

  return NS_OK;
}

void
mozOpenKiosk::Enable()
{
  // printf("-------- mozOpenKiosk::Enable --------\n");

  int sysrv = 0;

  sysrv = system("gsettings reset org.gnome.settings-daemon.plugins.media-keys screenshot  > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.settings-daemon.plugins.media-keys screenshot-clip  > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.settings-daemon.plugins.media-keys window-screenshot  > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.settings-daemon.plugins.media-keys window-screenshot-clip  > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.settings-daemon.plugins.media-keys area-screenshot  > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.settings-daemon.plugins.media-keys area-screenshot-clip  > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.mutter overlay-key  > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.desktop.wm.keybindings minimize  > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.desktop.wm.keybindings switch-to-workspace-down  > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.desktop.wm.keybindings switch-to-workspace-up  > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.shell.keybindings toggle-message-tray  > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.shell.keybindings toggle-overview  > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.shell.keybindings toggle-application-view  > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.desktop.wm.keybindings cycle-panels  > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.desktop.wm.keybindings cycle-windows  > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.desktop.wm.keybindings activate-window-menu  > /dev/null 2>&1");
  sysrv = system("gsettings reset com.canonical.Unity2d.Launcher super-key-enable  > /dev/null 2>&1");
  sysrv = system("gsettings reset org.compiz.unityshell:/org/compiz/profiles/unity/plugins/unityshell/ launcher-hide-mode > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.mutter overlay-key > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.desktop.wm.keybindings panel-main-menu > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.desktop.wm.preferences mouse-button-modifier > /dev/null 2>&1");
  sysrv = system("gsettings reset org.compiz.core:/org/compiz/profiles/unity/plugins/core/ hsize > /dev/null 2>&1");
  sysrv = system("gsettings reset org.compiz.core:/org/compiz/profiles/unity/plugins/core/ vsize > /dev/null 2>&1");
  sysrv = system("gsettings reset org.compiz.expo:/org/compiz/profiles/unity/plugins/expo/ expo-edge > /dev/null 2>&1");
  sysrv = system("gsettings reset org.compiz.scale:/org/compiz/profiles/unity/plugins/scale/ initiate-edge > /dev/null 2>&1");
  sysrv = system("gsettings reset org.compiz.core:/org/compiz/profiles/unity/plugins/core/ show-desktop-edge > /dev/null 2>&1");
  sysrv = system("gsettings reset org.compiz.unityshell:/org/compiz/profiles/unity/plugins/unityshell/ panel-first-menu > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.settings-daemon.plugins.media-keys screensaver > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.desktop.wm.keybindings switch-applications-backward > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.desktop.wm.keybindings switch-applications > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.desktop.wm.keybindings switch-group-backward > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.desktop.wm.keybindings switch-group > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.desktop.screensaver lock-enabled > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.desktop.notifications show-in-lock-screen > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.shell.keybindings open-application-menu > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.desktop.lockdown disable-lock-screen > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.desktop.screensaver lock-enabled > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.desktop.screensaver ubuntu-lock-on-suspend > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.desktop.wm.keybindings close > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.desktop.wm.keybindings switch-input-source > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.desktop.wm.keybindings switch-input-source-backward > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.settings-daemon.plugins.power button-sleep > /dev/null 2>&1");
  sysrv = system("gsettings reset org.gnome.settings-daemon.plugins.power button-suspend > /dev/null 2>&1");

  // Mint Linux
  sysrv = system("gsettings set org.cinnamon.desktop.keybindings.wm switch-windows \"['']\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.cinnamon.desktop.keybindings.wm switch-panels \"['']\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.cinnamon.desktop.keybindings.wm switch-group \"['']\" > /dev/null 2>&1");

  sysrv = system("gconftool-2 --type string --set /apps/metacity/global_keybindings/run_command_screenshot \"Print\" > /dev/null 2>&1");

  sysrv = system("gconftool --set /apps/compiz-1/general/screen0/options/hsize --type=int 2 > /dev/null 2>&1");
  sysrv = system("gconftool --set /apps/compiz-1/general/screen0/options/vsize --type=int 2 > /dev/null 2>&1");
  sysrv = system("gconftool --set /apps/metacity/window_keybindings/close --type=string \"<Alt>F4\" > /dev/null 2>&1");
  sysrv = system("gconftool-2 --set /apps/metacity/window_keybindings/close --type=string \"<Alt>F4\" > /dev/null 2>&1");
  sysrv = system("gconftool-2 --set /apps/metacity/window_keybindings/activate_window_menu --type=string \"[<Alt>space]\" > /dev/null 2>&1");

  // harmlessly use this variable to prevent compiler uninitialized variable fail on warning
  ++sysrv;
}

void
mozOpenKiosk::Disable()
{
  // printf("-------- mozOpenKiosk::Disable --------\n");

  int sysrv = 0;

  sysrv = system("gconftool-2 --type string --set /apps/metacity/global_keybindings/run_command_screenshot \"disabled\" > /dev/null 2>&1");
  sysrv = system("gconftool --set /apps/compiz-1/general/screen0/options/hsize --type=int 1 > /dev/null 2>&1");
  sysrv = system("gconftool --set /apps/compiz-1/general/screen0/options/vsize --type=int 1 > /dev/null 2>&1");
  sysrv = system("gconftool --set /apps/metacity/window_keybindings/close --type=string '' > /dev/null 2>&1");
  sysrv = system("gconftool-2 --set /apps/metacity/window_keybindings/close --type=string '' > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.settings-daemon.plugins.media-keys screenshot \"disabled\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.settings-daemon.plugins.media-keys screenshot-clip \"disabled\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.settings-daemon.plugins.media-keys window-screenshot \"disabled\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.settings-daemon.plugins.media-keys window-screenshot-clip \"disabled\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.settings-daemon.plugins.media-keys area-screenshot \"disabled\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.settings-daemon.plugins.media-keys area-screenshot-clip \"disabled\" > /dev/null 2>&1");
  sysrv = system("gsettings set overlay-key \"\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.desktop.wm.keybindings minimize \"['']\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-down \"['']\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-up \"['']\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.shell.keybindings toggle-message-tray \"['']\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.shell.keybindings toggle-overview \"['']\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.shell.keybindings toggle-application-view \"['']\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.desktop.wm.keybindings cycle-panels \"['']\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.desktop.wm.keybindings cycle-windows \"['']\" > /dev/null 2>&1");
  sysrv = system("gsettings set com.canonical.Unity2d.Launcher super-key-enable \"['']\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.compiz.unityshell:/org/compiz/profiles/unity/plugins/unityshell/ launcher-hide-mode 1 > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.mutter overlay-key \"''\" > /dev/null 2>&1");

  // this is causing the app menu when right clicking...
  // sysrv = system("gsettings set org.gnome.desktop.wm.preferences mouse-button-modifier \"''\" > /dev/null 2>&1");

  sysrv = system("gsettings set org.compiz.core:/org/compiz/profiles/unity/plugins/core/ hsize 1 > /dev/null 2>&1");
  sysrv = system("gsettings set org.compiz.core:/org/compiz/profiles/unity/plugins/core/ vsize 1 > /dev/null 2>&1");
  sysrv = system("gsettings set org.compiz.expo:/org/compiz/profiles/unity/plugins/expo/ expo-edge \"''\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.compiz.scale:/org/compiz/profiles/unity/plugins/scale/ initiate-edge \"''\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.compiz.core:/org/compiz/profiles/unity/plugins/core/ show-desktop-edge \"''\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.settings-daemon.plugins.media-keys screensaver \"''\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.desktop.wm.keybindings switch-applications-backward \"['']\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.desktop.wm.keybindings switch-applications \"['']\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.desktop.wm.keybindings switch-group-backward \"['']\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.desktop.wm.keybindings switch-group \"['']\" > /dev/null 2>&1");

  sysrv = system("gsettings set org.gnome.desktop.screensaver lock-enabled false > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.desktop.notifications show-in-lock-screen false > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.desktop.lockdown disable-lock-screen true > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.desktop.screensaver ubuntu-lock-on-suspend false > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.desktop.wm.keybindings close \"['']\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.desktop.wm.keybindings switch-input-source \"['']\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.desktop.wm.keybindings switch-input-source-backward \"['']\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.settings-daemon.plugins.power button-sleep 'blank' > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.settings-daemon.plugins.power button-suspend 'blank' > /dev/null 2>&1");

  // Mint Linux
  sysrv = system("gsettings reset org.cinnamon.desktop.keybindings.wm switch-windows > /dev/null 2>&1");
  sysrv = system("gsettings reset org.cinnamon.desktop.keybindings.wm switch-panels > /dev/null 2>&1");
  sysrv = system("gsettings reset org.cinnamon.desktop.keybindings.wm switch-group > /dev/null 2>&1");

  sysrv = system("gconftool-2 --set /apps/metacity/window_keybindings/activate_window_menu --type=string '' > /dev/null 2>&1");

  sysrv = system("gsettings set org.gnome.desktop.wm.keybindings panel-main-menu  \"['']\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.compiz.unityshell:/org/compiz/profiles/unity/plugins/unityshell/ panel-first-menu \"''\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.shell.keybindings open-application-menu \"['']\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.desktop.wm.keybindings activate-window-menu \"['']\" > /dev/null 2>&1");

  // harmlessly use this variable to prevent compiler uninitialized variable fail on warning
  ++sysrv;
}

void
mozOpenKiosk::PrintPointer(const char* aName, nsISupports* aPointer)
{
  printf ("%s (%p)\n", aName, (void*)aPointer);
}

