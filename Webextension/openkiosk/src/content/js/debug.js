var OpenKioskDebug =
{
  log : function (aMsg)
  {
    Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService).logStringMessage(aMsg);
  },

  print : function ()
  {
    var msg = "OPENKIOSK: "+Array.join(arguments, ": ");
    OpenKioskDebug.log(msg);
  },

  printProperties : function (aObj)
  {
    let p = this.getProperties(aObj);

    for (let i=0; i<p.length; i++) this.print(p[i]);
  },

  getProperties : function (aObj)
  {
    let p = new Array;

    for (let list in aObj) p.push(list);

    let rv = p.sort();;

    return rv;
  },

  displayProperties : function (aObj)
  {
    let props = this.getProperties(aObj);

    let rv = "";

    for (let i=0; i<props.length; i++) 
    {
      this.print(props[i], typeof(aObj[props[i]]), aObj[props[i]]);
      rv += typeof(aObj[props[i]]) + " : " + props[i] + "\n";
    }

    return rv;
  },

  error : function ()
  {
    var caller = this.caller ? this.caller.name : "top level";

    OpenKioskDebug.print("ERROR", caller, Array.join(arguments, ": "));
    OpenKioskDebug.log("ERROR", caller, Array.join(arguments, ": "));
  },

  alert : function () 
  { 
    let ps = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
    ps.alert(window, "OpenKiosk Debug", Array.join(arguments, ": ")); 
  },

  delayedAlert : function ()
  {
    setTimeout(OpenKioskDebug.alert, 2000, Array.join(arguments, ": "));
  }
};


