/* -*- Mode: JavaScript; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const {classes: Cc, interfaces: Ci, utils: Cu} = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

var BrowserDebug =
{
  log : function (aMsg)
  {
    Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService).logStringMessage(aMsg);
  },

  print : function ()
  {
    let msg = "OPENKIOSKDOM: "+Array.join(arguments, ": ");
    BrowserDebug.log(msg);
  },

  error : function ()
  {
    let msg = "OPENKIOSKDOM:ERROR: "+Array.join(arguments, ": ");
    BrowserDebug.log(msg);
  }
};

function OpenKioskDOM () 
{
  // BrowserDebug.print("CONSTRUCTOR");
}

OpenKioskDOM.prototype = 
{
     _window : null,
        _uri : null,

  init : function (window) 
  {
    try
    {
      // BrowserDebug.print("INIT");

      this._window = window;
      this._uri = window.document.documentURIObject;

      window.QueryInterface(Ci.nsIInterfaceRequestor);

      return window.IOpenKiosk._create(window, this);
    }
      catch (e) { BrowserDebug.error(e); }
  },

  quit : function ()
  { 
    // BrowserDebug.print("QUIT");

    let o = { window:this._window };

    Services.obs.notifyObservers({ wrappedJSObject:o }, "openkiosk-dom-quit", "");
  },

  settings : function ()
  { 
    // BrowserDebug.print("SETTINGS");

    let o = { window:this._window };

    Services.obs.notifyObservers({ wrappedJSObject:o }, "openkiosk-dom-settings", "");
  },

         classID : Components.ID("{5ef66ec6-8c35-4f37-923d-74bfc7e0a6a3}"),
      contractID : "@mozdevgroup.com/openkioskdom;1",
  QueryInterface : XPCOMUtils.generateQI([Ci.nsISupports, Ci.nsIDOMGlobalPropertyInitializer])
};

this.NSGetFactory = XPCOMUtils.generateNSGetFactory([OpenKioskDOM])

