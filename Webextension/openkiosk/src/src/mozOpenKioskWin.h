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

  private:

    void HandleExplorer(bool aDisable);

};

#endif /* __mozOpenKiosk_h */

