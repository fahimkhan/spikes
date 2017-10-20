var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/ExtensionContent.jsm");

var BrowserDebug =
{
  log : function (aMsg)
  {
    Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService).logStringMessage(aMsg);
  },

  print : function ()
  {
    var msg = "TAB:FRAME: "+Array.join(arguments, ": ");
    BrowserDebug.log(msg);
  },

  error : function ()
  {
    BrowserDebug.log("ERROR", Array.join(arguments, ": "));
  }
};

/********
addMessageListener("OpenKiosk:InsertTopLevelJS", function (aMsg)
{
  BrowserDebug.print("OpenKiosk:InsertTopLevelJS", "MESSAGE", aMsg.data.one, aMsg.data.two, content.location);

  // BrowserDebug.print("sendAsyncMessage", typeof(sendAsyncMessage));
});
********/

var OpenKioskFrame =
{
  // OPENKIOSKDOM OBSERVER
  OpenKioskDOM :
  {
    _window : null,

    observe : function (subject, topic, data)
    {
      /**
       * QUIT
       */
      if (topic == "openkiosk-dom-quit")
      {
        // BrowserDebug.print("QUIT");
        try { sendAsyncMessage("OpenKiosk:FrameMessageListener", { command: "openkiosk-dom-quit" }); }
        catch (e) {}
      }

      /**
       * SETTINGS
       */
      if (topic == "openkiosk-dom-settings")
      {
        // BrowserDebug.print("SETTINGS");
        try { sendAsyncMessage("OpenKiosk:FrameMessageListener", { command: "openkiosk-dom-settings" }); }
        catch (e) {}
      }
    }
  }
};

// only add observers once 
if (!Services.prefs.getBoolPref("openkiosk.contentframe.observers.added"))
{
  // BrowserDebug.print("CONTENT FRAME OBSERVERS ADDED");
  Services.obs.addObserver(OpenKioskFrame.OpenKioskDOM, "openkiosk-dom-quit", false);
  Services.obs.addObserver(OpenKioskFrame.OpenKioskDOM, "openkiosk-dom-settings", false);
  Services.prefs.setBoolPref("openkiosk.contentframe.observers.added", true);
}

