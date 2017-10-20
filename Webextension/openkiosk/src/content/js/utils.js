Components.utils.import("resource://gre/modules/NetUtil.jsm");
Components.utils.import("resource://gre/modules/FileUtils.jsm");

var OpenKioskUtils =
{
               mOK : null,
           mAUPURI : null,
              mKey : null,
       mAttractURI : null,
      mHomePageURI : null,
  mRedirectPageURI : null,
         jsEnabled : null,

  init : function ()
  {
    this.initPrefs();
    this.addPrefObservers();
    this.mOK = Cc["@mozilla.org/openkiosk;1"].createInstance(Ci.mozIOpenKiosk);

    this.initCrypto();
  },

  initPrefs : function ()
  {
    OpenKioskUtils.jsEnabled = Services.prefs.getBoolPref("openkiosk.javascript.enabled");

    // set global js to OK js setting
    OpenKioskUtils.enableJavascript(OpenKioskUtils.jsEnabled);

    OpenKioskUtils.mAUPURI = OpenKioskUtils.URIFixUp(Services.prefs.getCharPref("openkiosk.session.aup.url"));
    OpenKioskUtils.mAttractURI = OpenKioskUtils.URIFixUp(Services.prefs.getCharPref("openkiosk.attractscreen.url"));
    // OpenKioskUtils.mHomePageURI = OpenKioskUtils.URIFixUp(getDefaultHomePage());
    OpenKioskUtils.mRedirectPageURI = OpenKioskUtils.URIFixUp(Services.prefs.getCharPref("openkiosk.redirectscreen.url"));

    // let synchronize browser history pref state w/ our pref state
    // Services.prefs.setBoolPref("places.history.enabled", Services.prefs.getBoolPref("openkiosk.session.history.enabled"));
  },

  addPrefObservers : function ()
  {
    Services.prefs.addObserver("openkiosk.session.aup.url", OpenKioskUtils.prefObserver, false);
    Services.prefs.addObserver("openkiosk.attractscreen.url", OpenKioskUtils.prefObserver, false);
    Services.prefs.addObserver("openkiosk.redirectscreen.url", OpenKioskUtils.prefObserver, false);
    Services.prefs.addObserver("openkiosk.javascript.enabled", OpenKioskUtils.prefObserver, false);
    Services.prefs.addObserver("openkiosk.session.history.enabled", OpenKioskUtils.prefObserver, false);
    // Services.prefs.addObserver("places.history.enabled", OpenKioskUtils.prefObserver, false);
    Services.prefs.addObserver("browser.startup.homepage", OpenKioskUtils.prefObserver, false);
  },

  prefObserver :
  {
    observe : function (subject, topic, data)
    {
      // OpenKioskDebug.print("SUBJECT", subject, "TOPIC", topic, "DATA", data);

      if (data == "openkiosk.javascript.enabled")     
      {
        OpenKioskUtils.jsEnabled = Services.prefs.getBoolPref("openkiosk.javascript.enabled");

        OpenKioskDebug.print("JAVASCRIPT PREF CHANGED", "SETTING TO", OpenKioskUtils.jsEnabled);

        // set global js to OK js setting
        OpenKioskUtils.enableJavascript(OpenKioskUtils.jsEnabled);
      }

      if (data == "places.history.enabled")     
      {
        // let synchronize our pref state w/ browser history pref state
        // Services.prefs.setBoolPref("openkiosk.session.history.enabled", Services.prefs.getBoolPref("places.history.enabled"));
      }
        else if (topic == 'nsPref:changed') OpenKioskUtils.initPrefs();
    }
  },

  removeListeners : function ()
  {
    Services.prefs.removeObserver("openkiosk.session.aup.url", OpenKioskUtils.prefObserver);
    Services.prefs.removeObserver("openkiosk.attractscreen.url", OpenKioskUtils.prefObserver);
    Services.prefs.removeObserver("openkiosk.redirectscreen.url", OpenKioskUtils.prefObserver);
    Services.prefs.removeObserver("openkiosk.session.history.enabled", OpenKioskUtils.prefObserver);
    Services.prefs.removeObserver("places.history.enabled", OpenKioskUtils.prefObserver);
    Services.prefs.removeObserver("browser.startup.homepage", OpenKioskUtils.prefObserver);
  },

  loadHomePage : function () 
  { 
    if (OpenKiosk.attractEnabled) OpenKiosk.loadAttractURI();
    else 
    {
      OpenKioskDebug.print("LOAD HOME PAGE", gHomeButton.getHomePage());
      BrowserGoHome(); 
      OpenKiosk.homePageLoaded = true;
    }
  },

  loadRedirectPage : function () 
  { 
    if (Services.prefs.getBoolPref("openkiosk.redirectscreen.enabled")) loadURI(OpenKioskUtils.redirectPageURI.spec);
    else BrowserGoHome(); 
  },

  loadBlankPage : function () 
  { 
    loadURI("about:blank");
  },

  newURI : function (aURL) { return NetUtil.newURI(aURL); },

  URIFixUp : function (aURL)
  {
    var rv = Services.io.newURI("about:blank", null, null);

    try
    {
      let flags = Services.uriFixup.FIXUP_FLAG_ALLOW_KEYWORD_LOOKUP | Services.uriFixup.FIXUP_FLAG_FIX_SCHEME_TYPOS | Services.uriFixup.FIXUP_FLAGS_MAKE_ALTERNATE_URI;

      rv = Services.uriFixup.createFixupURI(aURL, flags);
    }
      catch (e) {}

    // OpenKioskDebug.print("URIFixUp", rv.spec);

    return rv;
  },

  URIFixUpPerf : function (aURL) { return Services.uriFixup.createFixupURI(aURL, Services.uriFixup.FIXUP_FLAG_ALLOW_KEYWORD_LOOKUP | Services.uriFixup.FIXUP_FLAG_FIX_SCHEME_TYPOS); },

  get attractURI ()
  {
    return OpenKioskUtils.mAttractURI;
  },

  get aupURI ()
  {
    return OpenKioskUtils.mAUPURI;
  },

  get homeOrAttractPageURI ()
  {
    return OpenKiosk.attractEnabled ? OpenKioskUtils.attractURI : OpenKioskUtils.homePageURI;
  },

  get homePageURI ()
  {
    return OpenKioskUtils.URIFixUp(gHomeButton.getHomePage());
  },

  get redirectPageURI ()
  {
    return OpenKioskUtils.mRedirectPageURI;
  },

  cancelRequest : function (aReq)
  {
    if (aReq) aReq.cancel(Cr.NS_BINDING_ABORTED);
  },

  cancelRequestAndRedirect : function (aReq)
  {
    if (aReq) aReq.cancel(Cr.NS_BINDING_ABORTED);

    OpenKioskUtils.loadRedirectPage();
  },

  cancelRequestAndLoadBlankPage : function (aReq)
  {
    if (aReq) aReq.cancel(Cr.NS_BINDING_ABORTED);

    OpenKioskUtils.loadBlankPage();

    setTimeout(OpenKioskUtils.loadRedirectPage, 3000);
  },

  exemptURI : function (aURI)
  {
    return aURI.equals(this.homePageURI) || aURI.equals(this.aupURI) || aURI.equals(this.attractURI) || aURI.equals(this.mRedirectPageURI);
  },

  exemptExceptProtocolURI : function (aURI)
  {
    if (!/^http|^https/.test(aURI.scheme)) return false;

    // OpenKioskDebug.print("exemptExceptProtocolURI", "HOST", aURI.host);

    let url = aURI.host + aURI.path;
    let sURL = this.aupURI.host + this.aupURI.path;

    if (url == sURL) return true;

    // OpenKioskDebug.print("exemptExceptProtocolURI", "attractURI", this.attractURI.spec);

    // ignore if attract URI hasn't been set
    if (this.attractURI.spec != "about:blank")
    {
      sURL = this.attractURI.host + this.attractURI.path;

      if (url == sURL) return true;
    }

    // home page doesn't always have a host eg: about:blank
    try
    {
      sURL = this.homePageURI.host + this.homePageURI.path; 

      if (url == sURL) return true;
    }
      catch (e) {}

    return false;
  },

  exemptAbout : function (aURI)
  {
    // OpenKioskDebug.print("EXEMPT ABOUT", aURI.spec, /^about:preferences#openKiosk/.test(aURI.spec));

    if (OpenKioskAdmin.adminMode && /^about:preferences#openKiosk/.test(aURI.spec)) return true;

    if (/^about:blank|^about:reader|^about:newtab/.test(aURI.spec)) return true;

    return false;
  }, 

  equalsDomainURI : function (aURIOne, aURITwo)
  {
    // OpenKioskDebug.print("EQUALS", (aURIOne.spec.replace(aURIOne.scheme, "") == aURITwo.spec.replace(aURITwo.scheme, "")));
 
    return aURIOne.equals(aURITwo) || (aURIOne.spec.replace(aURIOne.scheme, "") == aURITwo.spec.replace(aURITwo.scheme, ""));
  },

  byteArrayToHexString : function (aByteArray)
  {
    let rv = "";
    let nextHexByte;

    for (let i=0; i<aByteArray.byteLength; i++) 
    {
      nextHexByte = aByteArray[i].toString(16); 

      if (nextHexByte.length < 2) nextHexByte = "0" + nextHexByte;

      rv += nextHexByte;
    }

    return rv;
  },

  hexStringToByteArray : function (aHexString) 
  {
    if (aHexString.length % 2 !== 0) throw "Must have an even number of hex digits to convert to bytes";

    let numBytes = aHexString.length / 2;
    let rv = new Uint8Array(numBytes);

    for (let i=0; i<numBytes; i++) rv[i] = parseInt(aHexString.substr(i*2, 2), 16);

    return rv;
  },

  convertArrayBufferViewtoString : function (aBuf)
  {
    // OpenKioskDebug.print("convertArrayBufferViewtoString", "LENGTH", aBuf.byteLength);

    let rv = "";

    for (let i=0; i<aBuf.byteLength; i++) rv += String.fromCharCode(aBuf[i]);

    return rv;
  },

  sha256 : function (aStr) 
  {
    let converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"]
                      .createInstance(Ci.nsIScriptableUnicodeConverter);

    converter.charset = "UTF-8";

    // Data is an array of bytes.
    let data = converter.convertToByteArray(aStr, {});
    let hasher = Cc["@mozilla.org/security/hash;1"]
                   .createInstance(Ci.nsICryptoHash);

    hasher.init(hasher.SHA256);
    hasher.update(data, data.length);

    return hasher.finish(true);
  },

  initCrypto : function ()
  {
    let exportedKey = Services.prefs.getCharPref("openkiosk.crypto.key");

    if (!exportedKey) OpenKioskUtils.generateKey();
    else OpenKioskUtils.importKey(exportedKey);

  },

  encrypt : function (aStr)
  {
    var crypto = Cc["@mozilla.org/login-manager/crypto/SDR;1"].getService(Ci.nsILoginManagerCrypto);
    var rv = crypto.encrypt(aStr);

    return rv;
  },

  decrypt : function (aStr)
  {
    var crypto = Cc["@mozilla.org/login-manager/crypto/SDR;1"].getService(Ci.nsILoginManagerCrypto);
    var rv = crypto.decrypt(aStr);

    return rv;
  },

  saveKeyAsPref : function (aKey)
  {
    let hash = OpenKioskUtils.byteArrayToHexString(new Uint8Array(aKey));

    OpenKioskDebug.print("SAVE KEY AS PREF", hash);

    Services.prefs.setCharPref("openkiosk.crypto.key", hash);
  },

  importKey : function (aKey)
  {
    let aeskey = OpenKioskUtils.hexStringToByteArray(aKey);

    // OpenKioskDebug.print("IMPORT KEY", aKey, aeskey);

    let importPromise = window.crypto.subtle.importKey(
                                                       "raw",                          // Exported key format
                                                       aeskey,                         // The exported key
                                                       {name: "AES-CBC", length: 128}, // Algorithm the key will be used with
                                                       true,                           // Can extract key value to binary string
                                                       ["encrypt", "decrypt"]          // Use for these operations
                                                      );

    importPromise.then(key => OpenKioskUtils.mKey = key);
    importPromise.catch(e => OpenKioskDebug.error(e.message));
  },

  exportKey : function (aKey)
  {
    // OpenKioskDebug.print("EXPORT AES KEY", aKey);

    let promiseExportKey = window.crypto.subtle.exportKey("raw", aKey);

    promiseExportKey.then(key => OpenKioskUtils.saveKeyAsPref(key));
    promiseExportKey.catch(e => OpenKioskDebug.error(e.message));
  },

  generateKey : function ()
  {
    let keyPromise = window.crypto.subtle.generateKey(
                                                      {name: "AES-CBC", length: 128}, // Algorithm the key will be used with
                                                      true,                           // Can extract key value to binary string
                                                      ["encrypt", "decrypt"]          // Use for these operations
                                                     );

    keyPromise.then(key => OpenKioskUtils.exportKey(key));
    keyPromise.catch(e => OpenKioskDebug.error(e.message));
  }, 

  encryptAndSave : function (aStr)
  {
    // OpenKioskDebug.print("ENCRYPT AND SAVE", aStr);

    let aeskey = OpenKioskUtils.mKey;

    if (!aeskey) 
    {
      OpenKioskDebug.error("ENCRYPT", "NO IMPORTED KEY FOUND!");
      return;
    }

    // Initialization Vector
    let iv = window.crypto.getRandomValues(new Uint8Array(16));

    let l = aStr.length;
    let bytes = new Uint8Array(l);

    for (let i=0; i<l; i++) bytes[i] = aStr.charCodeAt(i);

    var encryptPromise = window.crypto.subtle.encrypt(
                                                      {name: "AES-CBC", iv: iv}, // Random data for security
                                                      aeskey,                    // The key to use 
                                                      bytes                      // Data to encrypt
                                                     );

    encryptPromise.then(cipher => Services.prefs.setCharPref("openkiosk.admin.password", OpenKioskUtils.byteArrayToHexString(iv) +","+OpenKioskUtils.byteArrayToHexString(new Uint8Array(cipher))));
    encryptPromise.catch( e => OpenKioskDebug.error("ENCRYPT", e.message));
  },

  decryptGlobal : function (aStr)
  {
    let a = aStr.split(",");

    if (a.length == 1)
    {
      OpenKioskDebug.print("LEGACY PASSWORD RETURNING");
      Services.prefs.clearUserPref("openkiosk.admin.password");
      return;
    }

    // OpenKioskDebug.print("DECRYPT GLOBAL", "ARRAY", a, "LENGTH", a.length);

    let aeskey = OpenKioskUtils.mKey;

    if (!aeskey) 
    {
      OpenKioskDebug.error("DECRYPT", "NO IMPORTED KEY FOUND!");
      return;
    }

    let iv = OpenKioskUtils.hexStringToByteArray(a[0]);
    let d = OpenKioskUtils.hexStringToByteArray(a[1]);

    let decryptPromise = window.crypto.subtle.decrypt(
                                                      {name: "AES-CBC", iv: iv},
                                                      aeskey,
                                                      d
                                                     );

    decryptPromise.then(buf => OpenKioskAdmin.pass = OpenKioskUtils.convertArrayBufferViewtoString(new Uint8Array(buf)));
    decryptPromise.catch( e => OpenKioskDebug.error("DECRYPT", e.message));
  },

  sizeWindow : function ()
  {
    var height = screen.height;
    var width = screen.width;

    window.moveTo(0, 0);
    window.resizeTo(width, height);
  },

  resizeWindow : function ()
  {
    var height = screen.availHeight;
    var width = screen.width;

    window.resizeTo(width, height);
  },

  setFullscreen : function ()
  {
    // OpenKioskDebug.delayedAlert("SET FULL SCREEN");
    window.fullScreen = true;
#ifdef XP_MACOSX
    // because we are setting to fullscreen mozilla unlock the UI
    // so we need to relock it
    OpenKioskUtils.mOK.setOpenKioskUIMode(false);
#endif
  },

  unsetFullscreen : function ()
  {
    window.fullScreen = false;
  },

  hideURLBar : function (aHide)
  {
    el = document.getElementById("urlbar-container");
    el.collapsed = aHide;
  },

  showMainMenubar : function (aShow)
  {
    let m = document.getElementById("toolbar-menubar");

    // OpenKioskDebug.delayedAlert("SHOW", aShow, m.height);

    if (m.height == 0) m.height = 19;

    m.setAttribute("collapsed", !aShow);

    // setToolbarVisibility(m, aShow);
  },

  hideMenubar : function (aHide)
  {
    // OpenKioskDebug.delayedAlert("MENUBAR", aHide ? "HIDE" : "SHOW");

    // OpenKioskDebug.print("MENUBAR", aHide ? "HIDE" : "SHOW");

#ifdef XP_MACOSX
    // OpenKioskUtils.setFullscreen();
#endif

    let hide = (aHide == true);

#ifndef XP_MACOSX
    OpenKioskUtils.showMainMenubar(!hide);
#endif

    // enable Menubar on OSX
    OpenKioskUtils.mOK.setOpenKioskUIMode(!aHide);

    if (aHide) OpenKioskUtils.sizeWindow();
#ifndef XP_LINUX
    else setTimeout(OpenKioskUtils.resizeWindow, 100);
#endif
  },

  closeTargetTab : function (aURL)
  {
    let l = gBrowser.browsers.length;

    let r = new RegExp(aURL);

    for (i=0; i<l; i++)
    {
      let b = gBrowser.browsers[i];
      let url = b.currentURI.spec;

      if (r.test(url)) 
      {
        let t = gBrowser.getTabForBrowser(b);
        gBrowser.removeTab(t);
        break;
      }
    }
  },

  closePrefTab : function ()
  {
    OpenKioskUtils.closeTargetTab("about:preferences");
  },

  closeInsecureTabs : function ()
  {
    OpenKioskUtils.closeTargetTab("about:preferences");
    OpenKioskUtils.closeTargetTab("about:addons");
  },

  clearAllTabs : function ()
  {
    gBrowser.removeAllTabsBut(gBrowser.mCurrentTab);
  },

  removeAllTabs : function ()
  {
    OpenKioskUtils.enableJavascript(true);

    let tab = gBrowser.addTab("about:blank");
    gBrowser.removeAllTabsBut(tab);

    // OpenKioskDebug.print("REMOVE ALL TABS BUT", OpenKioskUtils.homeOrAttractPageURI.spec);

    // since adding a tab is a page load we need to 
    // set attract or home Page loaded flags
    OpenKiosk.attractEnabled ?  OpenKiosk.attractPageLoaded = true : OpenKiosk.homePageLoaded = true;

    OpenKioskUtils.loadHomePage()
  },

  handleUserData : function ()
  {
    OpenKioskUtils.clearUserData();
  },

  clearUserData : function ()
  {
    OpenKioskUtils.zoomReset();
    OpenKioskUtils.sanitize();
    OpenKioskUtils.clearTabPrefs();
    OpenKioskUtils.emptyClipBoard();
    OpenKioskUtils.clearBookmarks();
    OpenKioskSession.toggleAUPUI();
  },

  // clear all user data
  sanitize : function ()
  {
    let placesHistoryEnabled = Services.prefs.getBoolPref("places.history.enabled");

    // OpenKioskDebug.print("SANITIZE", "places.history.enabled", placesHistoryEnabled);

    OpenKioskSession.aupAccepted = false;

    try
    {
      // turn off this pref so we can purge history
      Services.prefs.setBoolPref("places.history.enabled", false);

      let {Sanitizer} = Cu.import("resource:///modules/Sanitizer.jsm", {});

      let s = new Sanitizer;

      let itemsToClear = new Array;

      if (!Services.prefs.getBoolPref("openkiosk.session.cookies.enabled")) itemsToClear.push("cookies");
      if (!Services.prefs.getBoolPref("openkiosk.session.history.enabled")) itemsToClear.push("history");
      if (!Services.prefs.getBoolPref("openkiosk.session.diskcache.enabled")) itemsToClear.push("cache", "sessions");

      itemsToClear.push("formdata", "downloads");

      // OpenKioskDebug.print("SANITIZE", itemsToClear.toString());

      s.sanitize(itemsToClear);

      var os = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
      os.notifyObservers(null, "browser:purge-session-history", "");

      if (PrivateBrowsingUtils.isWindowPrivate(window)) os.notifyObservers(null, "last-pb-context-exited", "");

      // now restore it to it's original setting
      Services.prefs.setBoolPref("places.history.enabled", placesHistoryEnabled);
    }
      catch (e) { OpenKioskDebug.error(e); }
  },

  zoomReset : function ()
  {
    let l = gBrowser.browsers.length;

    for (i=0; i<l; i++)
    {
      let b = gBrowser.browsers[i];

      Services.obs.notifyObservers(b, "browser-fullZoom:zoomReset", "");
    }

    let cps2 = Cc["@mozilla.org/content-pref/service;1"].getService(Ci.nsIContentPrefService2);
    cps2.removeByName("browser.content.full-zoom", null);
  },

  clearTabPrefs : function ()
  {
    Services.prefs.clearUserPref("browser.newtabpage.enabled");
    Services.prefs.clearUserPref("browser.newtabpage.enhanced");
    Services.prefs.clearUserPref("browser.newtabpage.storageVersion");
  },

  emptyClipBoard : function ()
  {
    try
    {
      let ch = Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper);

      try
      {
        // OS's that support selection like Linux
        let supportsSelect = Cc["@mozilla.org/widget/clipboard;1"].getService(Ci.nsIClipboard).supportsSelectionClipboard();

        if (supportsSelect) ch.copyStringToClipboard("", Ci.nsIClipboard.kSelectionClipboard);

        ch.copyStringToClipboard("", Ci.nsIClipboard.kGlobalClipboard);

      }
        catch (e) { OpenKioskDebug.error(e); }

    }
      catch (e) { OpenKioskDebug.error(e); }
  },

  clearBookmarks : function ()
  {
    if (Services.prefs.getBoolPref("openkiosk.ui.personalbar.bookmarks.enabled")) return;

    try
    {
      PlacesUtils.bookmarks.removeFolderChildren(PlacesUtils.bookmarks.toolbarFolder);
    }
      catch (e) { OpenKioskDebug.error(e); }
  },

  clearHistory : function ()
  {
    OpenKioskDebug.print("CLEAR HISTORY");

    try
    {
      var s = new Date(Date.UTC(0, 0, 0, 0, 0, 0));
      PlacesUtils.bhistory.removePagesByTimeframe(s, Date.now());
    }
      catch (e) { OpenKioskDebug.error(e); }
  },

  closeAllWindows : function ()
  {
    let wm = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);
 
    let e = wm.getEnumerator(null);

    while (e.hasMoreElements()) 
    {
      let w = e.getNext().QueryInterface(Ci.nsIDOMWindow);

      let type = w.document.documentElement.getAttribute("windowtype");
      // OpenKioskDebug.print("WINDOW", w, "TYPE", type);

      if (type != "navigator:browser") w.close();
    }
  },

  stripWhiteSpace : function (aStr)
  {
    return aStr ? aStr.replace(/^\s*(.*)\s*$/, "$1") : "";
  },

  // read chromeURL data into a textbox 
  getURLInputStream : function (aURL, aCallback)
  {
    NetUtil.asyncFetch(aURL, aCallback);
  },

  // read chromeURL data into a textbox 
  readURLIntoTextbox : function (aURL, aEl)
  {
    function callback (inputStream, status)
    {
      if (!Components.isSuccessCode(status)) 
      {
        // Handle error!
        OpenKioskDebug.print("ERROR READING FILE", aURL);
        return;
      }

      let data = NetUtil.readInputStreamToString(inputStream, inputStream.available());
      aEl.value = data;
    }

    NetUtil.asyncFetch(aURL, callback);
  },

  // write data to an nsIFile
  writeToFile : function (aData, aFile, aCallback=null)
  {
    let ostream = FileUtils.openSafeFileOutputStream(aFile);

    let converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
    converter.charset = "UTF-8";
    let istream = converter.convertToInputStream(aData);

    NetUtil.asyncCopy(istream, ostream, aCallback);
  },

  // read file data into textbox value
  readFile : function (aFile, aEl)
  {
    function callback (inputStream, status)
    {
      if (!Components.isSuccessCode(status)) 
      {
        // Handle error!
        OpenKioskDebug.print("ERROR READING FILE", aFile.path);
        return;
      }

      let data = NetUtil.readInputStreamToString(inputStream, inputStream.available());
      aEl.value = data;
    }

    NetUtil.asyncFetch(aFile, callback);
  },

  showBlockedURLNotification : function (aURI)
  {
    setTimeout(OpenKioskUtils.notification, 500, aURI);
    // OpenKioskUtils.alertPopup(aURI);
  },

  alertPopup : function (aURI)
  {
    // "chrome://mozapps/skin/extensions/alerticon-error.svg"
    Cc['@mozilla.org/alerts-service;1'].getService(Ci.nsIAlertsService)
      .showAlertNotification(null, "Blocked Page", aURI.spec, false, '', null);
  },

  notification : function (aURI)
  {
    let b = gBrowser.selectedBrowser;
    let nb = gBrowser.getNotificationBox(b);

    if (!nb.currentNotification)
    {
      // let message = OpenKioskAdmin.bundle.GetStringFromName("adminMode");
      let message = "Blocked Page:  "+aURI.spec;

      const priority = nb.PRIORITY_CRITICAL_BLOCK;

      nb.appendNotification(message,
                            null,
                            "chrome://browser/skin/Info.png",
                            priority, null, null);
    }
  },

  removeNotification : function ()
  {
    let b = gBrowser.selectedBrowser;
    let nb = gBrowser.getNotificationBox(b);

    if (nb.currentNotification) nb.removeCurrentNotification();
  },

  handleJavascript : function (aEnable)
  {
    // OpenKioskDebug.print("HANDLE JAVASCRIPT", "ENABLE", aEnable);
    OpenKioskUtils.enableJavascript(aEnable);
    OpenKioskUtils.enableJavascriptInTab(aEnable);
  },

  enableJavascriptInTab : function (aEnable)
  {
    gBrowser.selectedBrowser.jsEnabled = aEnable;
  },

  enableJavascript : function (aEnable)
  {
    // return if OK js enabled is false
    // so we never turn it on regardless of filter setting
    if (!OpenKioskUtils.jsEnabled && !Services.prefs.getBoolPref("javascript.enabled")) return;

    // OpenKioskDebug.print("SET GLOBAL JAVASCRIPT TO", aEnable);
    Services.prefs.setBoolPref("javascript.enabled", aEnable);
  },

  loadFrameScript : function ()
  {
    // ensure content frame pref is cleared
    Services.prefs.clearUserPref("openkiosk.contentframe.observers.added");

    // let mm = window.getGroupMessageManager("browsers");

    // use the global message manager instead of one per tab
    let mm = messageManager;

    // OpenKioskDebug.print("MESSAGE MANAGER", messageManager);

    // OpenKioskDebug.print("UTILS ADD CONTENT FRAME SCRIPT");
    mm.loadFrameScript("chrome://openkiosk/content/js/content-frame.js", true);
  }
};

