#ifndef __mozOpenKiosk_h
#define __mozOpenKiosk_h

#include "mozIOpenKiosk.h"

/********
#include "nsCOMPtr.h"
#include "nsAutoPtr.h"
#include "nsStringAPI.h"
#include "nsServiceManagerUtils.h"
#include "nsIPrefService.h"
#include "nsIPrefBranch.h"
********/

class mozOpenKiosk : public mozIOpenKiosk
{
  public:
    NS_DECL_ISUPPORTS
    NS_DECL_MOZIOPENKIOSK

    mozOpenKiosk();

  // DEBUG
  void PrintPointer(const char* aName, nsISupports* aPointer);

  private:
    virtual ~mozOpenKiosk();
};

#endif /* __mozOpenKiosk_h */

