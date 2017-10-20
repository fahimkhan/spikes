
#include "mozOpenKioskOSX.h"

// Mozilla includes
#include "nsEmbedString.h"
#include "nsIClassInfoImpl.h"

#include <Carbon/Carbon.h>

mozOpenKiosk::mozOpenKiosk()
{
  // printf("-------- mozOpenKiosk::CREATE --------\n");
}

mozOpenKiosk::~mozOpenKiosk() 
{
  // printf("-------- mozOpenKiosk::DESTROY --------\n");
}

NS_IMPL_ISUPPORTS(mozOpenKiosk, mozIOpenKiosk)

NS_IMETHODIMP
mozOpenKiosk::SetOpenKioskUIMode(bool aIsAdmin)
{ 
  OSStatus status = noErr;
  
  if (!aIsAdmin)
  {
    // printf("-------- LOCK SYSTEM UI --------\n");
    status = SetSystemUIMode(kUIModeAllHidden, kUIOptionDisableProcessSwitch     |
                                               kUIOptionDisableForceQuit         |
                                               kUIOptionDisableSessionTerminate  |
                                               kUIOptionDisableAppleMenu);
    if (status != noErr) 
    {
      printf("-------- ERROR --------\n");
      return NS_ERROR_FAILURE;
    }
  }
    else
  {
    // printf("-------- UNLOC SYSTEM UI --------\n");
    status = SetSystemUIMode(kUIModeContentHidden, kUIOptionDisableAppleMenu|kUIOptionDisableProcessSwitch|kUIOptionDisableForceQuit);

    if (status != noErr)
    {
      printf("-------- ERROR --------\n");
      return NS_ERROR_FAILURE;
    }
  }

  return NS_OK;
}

void
mozOpenKiosk::PrintPointer(const char* aName, nsISupports* aPointer)
{
  printf ("%s (%p)\n", aName, (void*)aPointer);
}


