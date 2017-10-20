
#include "mozOpenKioskWin.h"
#include "stdio.h"

#include <windows.h>
#include <Tlhelp32.h> 
#include <VersionHelpers.h>

#include "nsEmbedString.h"


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
  HWND hwnd = FindWindow("Shell_traywnd", NULL);

  if (!aIsAdmin)
  {
    printf("******** LOCK ********\n");

    HandleExplorer(true);
    ShowWindow(hwnd, SW_HIDE); // hide it
    EnableWindow(hwnd, FALSE); // disable it
    EnableWindow(FindWindowEx(hwnd, 0, "Button", NULL), FALSE); // disable it

    if (IsWindowsVistaOrGreater())
    {
      HWND startOrb = FindWindowEx(NULL, NULL, MAKEINTATOM(0xC017), NULL);
      ShowWindow(startOrb, SW_HIDE); // Hide Vista Start Orb
    }
  }
    else
  {
    printf("******** OPEN ********\n");

    HandleExplorer(false);
    ShowWindow(hwnd, SW_SHOW); // show it
    EnableWindow(hwnd, TRUE);  // enable it
    EnableWindow(FindWindowEx(hwnd, 0, "Button", NULL), TRUE); // enable it
    ShowWindow(FindWindowEx(hwnd, 0, "Button", NULL), SW_SHOW);

    if (IsWindowsVistaOrGreater())
    {
      HWND startOrb = FindWindowEx(NULL, NULL, MAKEINTATOM(0xC017), NULL);
      ShowWindow(startOrb, SW_SHOW); // Show Vista Start Orb
    }
  }

  return NS_OK;
}


void 
mozOpenKiosk::HandleExplorer (bool aDisable)
{
  if (!IsWindows8OrGreater()) return;

  if (aDisable)
  {
    HANDLE hProcess, hSnapshot;
    PROCESSENTRY32 ProcessEntry;
    BOOL moreproc = FALSE;

    hSnapshot = CreateToolhelp32Snapshot(TH32CS_SNAPALL, 0);

    if (hSnapshot == (HANDLE)-1) return;

    ProcessEntry.dwSize = sizeof(ProcessEntry);
    moreproc = Process32First(hSnapshot, &ProcessEntry);

    while (moreproc)
    {

      hProcess = OpenProcess(PROCESS_TERMINATE, FALSE, ProcessEntry.th32ProcessID);

      if (hProcess == NULL)
      {
        moreproc = Process32Next(hSnapshot, &ProcessEntry);
        continue;
      }

      nsAutoString pname;

      pname.AssignLiteral(ProcessEntry.szExeFile);

      if (pname.LowerCaseEqualsLiteral("explorer.exe")) TerminateProcess(hProcess, 1);

      CloseHandle(hProcess);
      moreproc = Process32Next(hSnapshot, &ProcessEntry);
    }
  }
    else
  {
    STARTUPINFOW si;
    PROCESS_INFORMATION pi;

    ZeroMemory(&si, sizeof(si));
    si.cb = sizeof(si);
    ZeroMemory(&pi, sizeof(pi));

    CreateProcessW(L"C:\\Windows\\explorer.exe", nullptr, nullptr, nullptr, FALSE, DETACHED_PROCESS, nullptr, nullptr, &si, &pi);
  }
}


