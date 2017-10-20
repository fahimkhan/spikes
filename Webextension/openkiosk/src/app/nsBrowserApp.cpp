/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "nsXULAppAPI.h"
#include "mozilla/AppData.h"
#include "application.ini.h"
#include "nsXPCOMGlue.h"
#if defined(XP_WIN)
#include <windows.h>
#include <stdlib.h>
#include <io.h>
#include <fcntl.h>
#elif defined(XP_UNIX)
#include <sys/resource.h>
#include <unistd.h>
#endif

#ifdef XP_MACOSX
#include "MacQuirks.h"
#endif

#include <stdio.h>
#include <stdarg.h>
#include <time.h>

#include "nsCOMPtr.h"
#include "nsIFile.h"
#include "nsStringGlue.h"

#ifdef XP_WIN
// we want a wmain entry point
#ifdef MOZ_ASAN
// ASAN requires firefox.exe to be built with -MD, and it's OK if we don't
// support Windows XP SP2 in ASAN builds.
#define XRE_DONT_SUPPORT_XPSP2
#endif
#define XRE_WANT_ENVIRON
#include "nsWindowsWMain.cpp"
#if defined(_MSC_VER) && (_MSC_VER < 1900)
#define snprintf _snprintf
#endif
#define strcasecmp _stricmp
#endif
#include "BinaryPath.h"

#include "nsXPCOMPrivate.h" // for MAXPATHLEN and XPCOM_DLL

#include "mozilla/Telemetry.h"
#include "mozilla/WindowsDllBlocklist.h"

using namespace mozilla;

#ifdef XP_MACOSX
#define kOSXResourcesFolder "Resources"
#endif
#define kDesktopFolder "open-kiosk"

static void Output(const char *fmt, ... )
{
  va_list ap;
  va_start(ap, fmt);

#ifndef XP_WIN
  vfprintf(stderr, fmt, ap);
#else
  char msg[2048];
  vsnprintf_s(msg, _countof(msg), _TRUNCATE, fmt, ap);

  wchar_t wide_msg[2048];
  MultiByteToWideChar(CP_UTF8,
                      0,
                      msg,
                      -1,
                      wide_msg,
                      _countof(wide_msg));
#if MOZ_WINCONSOLE
  fwprintf_s(stderr, wide_msg);
#else
  // Linking user32 at load-time interferes with the DLL blocklist (bug 932100).
  // This is a rare codepath, so we can load user32 at run-time instead.
  HMODULE user32 = LoadLibraryW(L"user32.dll");
  if (user32) {
    decltype(MessageBoxW)* messageBoxW =
      (decltype(MessageBoxW)*) GetProcAddress(user32, "MessageBoxW");
    if (messageBoxW) {
      messageBoxW(nullptr, wide_msg, L"OpenKiosk", MB_OK
                                               | MB_ICONERROR
                                               | MB_SETFOREGROUND);
    }
    FreeLibrary(user32);
  }
#endif
#endif

  va_end(ap);
}

/**
 * Return true if |arg| matches the given argument name.
 */
static bool IsArg(const char* arg, const char* s)
{
  if (*arg == '-')
  {
    if (*++arg == '-')
      ++arg;
    return !strcasecmp(arg, s);
  }

#if defined(XP_WIN)
  if (*arg == '/')
    return !strcasecmp(++arg, s);
#endif

  return false;
}

XRE_GetFileFromPathType XRE_GetFileFromPath;
XRE_CreateAppDataType XRE_CreateAppData;
XRE_FreeAppDataType XRE_FreeAppData;
XRE_TelemetryAccumulateType XRE_TelemetryAccumulate;
XRE_StartupTimelineRecordType XRE_StartupTimelineRecord;
XRE_mainType XRE_main;
XRE_StopLateWriteChecksType XRE_StopLateWriteChecks;
XRE_XPCShellMainType XRE_XPCShellMain;

static const nsDynamicFunctionLoad kXULFuncs[] = {
    { "XRE_GetFileFromPath", (NSFuncPtr*) &XRE_GetFileFromPath },
    { "XRE_CreateAppData", (NSFuncPtr*) &XRE_CreateAppData },
    { "XRE_FreeAppData", (NSFuncPtr*) &XRE_FreeAppData },
    { "XRE_TelemetryAccumulate", (NSFuncPtr*) &XRE_TelemetryAccumulate },
    { "XRE_StartupTimelineRecord", (NSFuncPtr*) &XRE_StartupTimelineRecord },
    { "XRE_main", (NSFuncPtr*) &XRE_main },
    { "XRE_StopLateWriteChecks", (NSFuncPtr*) &XRE_StopLateWriteChecks },
    { "XRE_XPCShellMain", (NSFuncPtr*) &XRE_XPCShellMain },
    { nullptr, nullptr }
};

static int do_main(int argc, char* argv[], char* envp[], nsIFile *xreDirectory)
{
  nsCOMPtr<nsIFile> appini;
  nsresult rv;
  uint32_t mainFlags = 0;

  // Allow firefox.exe to launch XULRunner apps via -app <application.ini>
  // Note that -app must be the *first* argument.
  const char *appDataFile = getenv("XUL_APP_FILE");
  if (appDataFile && *appDataFile) {
    rv = XRE_GetFileFromPath(appDataFile, getter_AddRefs(appini));
    if (NS_FAILED(rv)) {
      Output("Invalid path found: '%s'", appDataFile);
      return 255;
    }
  }
  else if (argc > 1 && IsArg(argv[1], "app")) {
    if (argc == 2) {
      Output("Incorrect number of arguments passed to -app");
      return 255;
    }

    rv = XRE_GetFileFromPath(argv[2], getter_AddRefs(appini));
    if (NS_FAILED(rv)) {
      Output("application.ini path not recognized: '%s'", argv[2]);
      return 255;
    }

    char appEnv[MAXPATHLEN];
    snprintf(appEnv, MAXPATHLEN, "XUL_APP_FILE=%s", argv[2]);
    if (putenv(appEnv)) {
      Output("Couldn't set %s.\n", appEnv);
      return 255;
    }
    argv[2] = argv[0];
    argv += 2;
    argc -= 2;
  } else if (argc > 1 && IsArg(argv[1], "xpcshell")) {
    for (int i = 1; i < argc; i++) {
      argv[i] = argv[i + 1];
    }
    return XRE_XPCShellMain(--argc, argv, envp);
  }

  if (appini) {
    nsXREAppData *appData;
    rv = XRE_CreateAppData(appini, &appData);
    if (NS_FAILED(rv)) {
      Output("Couldn't read application.ini");
      return 255;
    }
    // xreDirectory already has a refcount from NS_NewLocalFile
    appData->xreDirectory = xreDirectory;
    int result = XRE_main(argc, argv, appData, mainFlags);
    XRE_FreeAppData(appData);
    return result;
  }

  ScopedAppData appData(&sAppData);
  nsCOMPtr<nsIFile> exeFile;
  rv = mozilla::BinaryPath::GetFile(argv[0], getter_AddRefs(exeFile));
  if (NS_FAILED(rv)) {
    Output("Couldn't find the application directory.\n");
    return 255;
  }

  nsCOMPtr<nsIFile> greDir;
  exeFile->GetParent(getter_AddRefs(greDir));
#ifdef XP_MACOSX
  greDir->SetNativeLeafName(NS_LITERAL_CSTRING(kOSXResourcesFolder));
#endif
  nsCOMPtr<nsIFile> appSubdir;
  greDir->Clone(getter_AddRefs(appSubdir));
  appSubdir->Append(NS_LITERAL_STRING(kDesktopFolder));

  SetStrongPtr(appData.directory, static_cast<nsIFile*>(appSubdir.get()));
  // xreDirectory already has a refcount from NS_NewLocalFile
  appData.xreDirectory = xreDirectory;

  return XRE_main(argc, argv, &appData, mainFlags);
}

static bool
FileExists(const char *path)
{
#ifdef XP_WIN
  wchar_t wideDir[MAX_PATH];
  MultiByteToWideChar(CP_UTF8, 0, path, -1, wideDir, MAX_PATH);
  DWORD fileAttrs = GetFileAttributesW(wideDir);
  return fileAttrs != INVALID_FILE_ATTRIBUTES;
#else
  return access(path, R_OK) == 0;
#endif
}

static nsresult
InitXPCOMGlue(const char *argv0, nsIFile **xreDirectory)
{
  char exePath[MAXPATHLEN];

  nsresult rv = mozilla::BinaryPath::Get(argv0, exePath);
  if (NS_FAILED(rv)) {
    Output("Couldn't find the application directory.\n");
    return rv;
  }

  char *lastSlash = strrchr(exePath, XPCOM_FILE_PATH_SEPARATOR[0]);
  if (!lastSlash || (size_t(lastSlash - exePath) > MAXPATHLEN -
sizeof(XPCOM_DLL) - 1))
    return NS_ERROR_FAILURE;

  strcpy(lastSlash + 1, XPCOM_DLL);

  if (!FileExists(exePath)) {
    Output("Could not find the Mozilla runtime.\n");
    return NS_ERROR_FAILURE;
  }

  // We do this because of data in bug 771745
  XPCOMGlueEnablePreload();

  rv = XPCOMGlueStartup(exePath);
  if (NS_FAILED(rv)) {
    Output("Couldn't load XPCOM.\n");
    return rv;
  }

  rv = XPCOMGlueLoadXULFunctions(kXULFuncs);
  if (NS_FAILED(rv)) {
    Output("Couldn't load XRE functions.\n");
    return rv;
  }

  // This will set this thread as the main thread.
  NS_LogInit();

  // chop XPCOM_DLL off exePath
  *lastSlash = '\0';
#ifdef XP_MACOSX
  lastSlash = strrchr(exePath, XPCOM_FILE_PATH_SEPARATOR[0]);
  strcpy(lastSlash + 1, kOSXResourcesFolder);
#endif
#ifdef XP_WIN
  rv = NS_NewLocalFile(NS_ConvertUTF8toUTF16(exePath), false,
                       xreDirectory);
#else
  rv = NS_NewNativeLocalFile(nsDependentCString(exePath), false,
                             xreDirectory);
#endif

  return rv;
}

int main(int argc, char* argv[], char* envp[])
{
  mozilla::TimeStamp start = mozilla::TimeStamp::Now();

#if defined(XP_UNIX)
#ifndef XP_MACOSX
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

  // Mint Linux
  sysrv = system("gsettings set org.cinnamon.desktop.keybindings.wm switch-windows \"['']\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.cinnamon.desktop.keybindings.wm switch-panels \"['']\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.cinnamon.desktop.keybindings.wm switch-group \"['']\" > /dev/null 2>&1");

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

  sysrv = system("gconftool-2 --set /apps/metacity/window_keybindings/activate_window_menu --type=string '' > /dev/null 2>&1");

  sysrv = system("gsettings set org.gnome.desktop.wm.keybindings panel-main-menu  \"['']\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.compiz.unityshell:/org/compiz/profiles/unity/plugins/unityshell/ panel-first-menu \"''\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.shell.keybindings open-application-menu \"['']\" > /dev/null 2>&1");
  sysrv = system("gsettings set org.gnome.desktop.wm.keybindings activate-window-menu \"['']\" > /dev/null 2>&1");
#endif
#endif

#ifdef XP_MACOSX
  TriggerQuirks();
#endif

  int gotCounters;
#if defined(XP_UNIX)
  struct rusage initialRUsage;
  gotCounters = !getrusage(RUSAGE_SELF, &initialRUsage);
#elif defined(XP_WIN)
  IO_COUNTERS ioCounters;
  gotCounters = GetProcessIoCounters(GetCurrentProcess(), &ioCounters);
#else
  #error "Unknown platform"  // having this here keeps cppcheck happy
#endif

  nsIFile *xreDirectory;

#ifdef HAS_DLL_BLOCKLIST
  DllBlocklist_Initialize();

#ifdef DEBUG
  // In order to be effective against AppInit DLLs, the blocklist must be
  // initialized before user32.dll is loaded into the process (bug 932100).
  if (GetModuleHandleA("user32.dll")) {
    fprintf(stderr, "DLL blocklist was unable to intercept AppInit DLLs.\n");
  }
#endif
#endif

  nsresult rv = InitXPCOMGlue(argv[0], &xreDirectory);
  if (NS_FAILED(rv)) {
    return 255;
  }

  XRE_StartupTimelineRecord(mozilla::StartupTimeline::START, start);

  if (gotCounters) {
#if defined(XP_WIN)
    XRE_TelemetryAccumulate(mozilla::Telemetry::EARLY_GLUESTARTUP_READ_OPS,
                            int(ioCounters.ReadOperationCount));
    XRE_TelemetryAccumulate(mozilla::Telemetry::EARLY_GLUESTARTUP_READ_TRANSFER,
                            int(ioCounters.ReadTransferCount / 1024));
    IO_COUNTERS newIoCounters;
    if (GetProcessIoCounters(GetCurrentProcess(), &newIoCounters)) {
      XRE_TelemetryAccumulate(mozilla::Telemetry::GLUESTARTUP_READ_OPS,
                              int(newIoCounters.ReadOperationCount - ioCounters.ReadOperationCount));
      XRE_TelemetryAccumulate(mozilla::Telemetry::GLUESTARTUP_READ_TRANSFER,
                              int((newIoCounters.ReadTransferCount - ioCounters.ReadTransferCount) / 1024));
    }
#elif defined(XP_UNIX)
    XRE_TelemetryAccumulate(mozilla::Telemetry::EARLY_GLUESTARTUP_HARD_FAULTS,
                            int(initialRUsage.ru_majflt));
    struct rusage newRUsage;
    if (!getrusage(RUSAGE_SELF, &newRUsage)) {
      XRE_TelemetryAccumulate(mozilla::Telemetry::GLUESTARTUP_HARD_FAULTS,
                              int(newRUsage.ru_majflt - initialRUsage.ru_majflt));
    }
#else
  #error "Unknown platform"  // having this here keeps cppcheck happy
#endif
  }

  int result = do_main(argc, argv, envp, xreDirectory);

  NS_LogTerm();

#ifdef XP_MACOSX
  // Allow writes again. While we would like to catch writes from static
  // destructors to allow early exits to use _exit, we know that there is
  // at least one such write that we don't control (see bug 826029). For
  // now we enable writes again and early exits will have to use exit instead
  // of _exit.
  XRE_StopLateWriteChecks();
#endif

#if defined(XP_UNIX)
#ifndef XP_MACOSX
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
  sysrv = system("gsettings reset org.cinnamon.desktop.keybindings.wm switch-windows > /dev/null 2>&1");
  sysrv = system("gsettings reset org.cinnamon.desktop.keybindings.wm switch-panels > /dev/null 2>&1");
  sysrv = system("gsettings reset org.cinnamon.desktop.keybindings.wm switch-group > /dev/null 2>&1");

  sysrv = system("gconftool-2 --type string --set /apps/metacity/global_keybindings/run_command_screenshot \"Print\" > /dev/null 2>&1");

  sysrv = system("gconftool --set /apps/compiz-1/general/screen0/options/hsize --type=int 2 > /dev/null 2>&1");
  sysrv = system("gconftool --set /apps/compiz-1/general/screen0/options/vsize --type=int 2 > /dev/null 2>&1");
  sysrv = system("gconftool --set /apps/metacity/window_keybindings/close --type=string \"<Alt>F4\" > /dev/null 2>&1");
  sysrv = system("gconftool-2 --set /apps/metacity/window_keybindings/close --type=string \"<Alt>F4\" > /dev/null 2>&1");
  sysrv = system("gconftool-2 --set /apps/metacity/window_keybindings/activate_window_menu --type=string \"[<Alt>space]\" > /dev/null 2>&1");

  // harmlessly use this variable to prevent compiler uninitialized variable fail on warning
  ++sysrv;
#endif
#endif

  return result;
}
