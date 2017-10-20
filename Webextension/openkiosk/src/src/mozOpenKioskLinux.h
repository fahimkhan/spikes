#ifndef __mozOpenKiosk_h
#define __mozOpenKiosk_h

#include "mozIOpenKiosk.h"


class mozOpenKiosk : public mozIOpenKiosk
{
  public:
    NS_DECL_ISUPPORTS
    NS_DECL_MOZIOPENKIOSK

    mozOpenKiosk();
    virtual ~mozOpenKiosk();

    void Enable();
    void Disable();

    void PrintPointer(const char* aName, nsISupports* aPointer);

  private:
};

#endif /* __mozOpenKiosk_h */

