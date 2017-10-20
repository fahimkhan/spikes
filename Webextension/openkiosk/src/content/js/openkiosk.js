var OpenKiosk =
{
               attractEnabled : false,
            attractPageLoaded : false,
               homePageLoaded : true,
            fullscreenEnabled : false,
            fullscreenEntered : false,
  browser_link_open_newwindow : false,

  hooks : function ()
  {
    OpenKioskUtils.init();
    OpenKioskUtils.clearUserData();
    OpenKiosk.setPrefs();
    OpenKiosk.addObservers();
    OpenKiosk.addListeners();

    OpenKioskUtils.setFullscreen();
    OpenKiosk._init();
    OpenKiosk.uiInit();
  },

  uiInit : function ()
  {
    OpenKiosk.resetAttract();
    OpenKiosk.hideUI();
    OpenKiosk.handleUIControls();
    OpenKiosk.handleNavigationKeys();
  },

  init : function ()
  {
    OpenKioskSession.init();
    OpenKioskAdmin.init();

    OpenKiosk.loadAttractURI();

    OpenKiosk.delayedInit();
  },

  _init : function ()
  {
    OpenKiosk.attractEnabled = Services.prefs.getBoolPref("openkiosk.attractscreen.enabled");
    OpenKiosk.fullscreenEnabled = Services.prefs.getBoolPref("openkiosk.fullscreen.enabled");

    OpenKiosk.doNotDisturb();
  },

  delayedInit : function ()
  {
    // white blank screen has nothing to do w/ resize
    OpenKioskUtils.sizeWindow();

    // for when we launch from a terminal
    setTimeout(OpenKioskUtils.sizeWindow, 300);

    setTimeout(OpenKiosk.handleDevControls, 200);

    OpenKioskUtils.loadFrameScript();
  },

  handleTextEntered : function (aEl, aParam)
  {
    if (aEl.value == "about:openkiosk") OpenKioskAdmin.login(); 
    else if (/^javascript:/.test(aEl.value)) OpenKiosk.handleJavascriptCmd(aEl, aParam);
    else aEl.handleCommand(aParam);
  },

  handleJavascriptCmd : function (aEl, aParam)
  {
    if (Services.prefs.getBoolPref("openkiosk.filters.protocol.javascript.enabled")) aEl.handleCommand(aParam);
    else OpenKioskUtils.loadRedirectPage();
  },

  doNotDisturb : function ()
  {
    /********
    try
    {
      let alertsService = Cc["@mozilla.org/alerts-service;1"]
                          .getService(Ci.nsIAlertsService)
                          .QueryInterface(Ci.nsIAlertsDoNotDisturb);

      // This will throw if manualDoNotDisturb isn't implemented.
      // OpenKioskDebug.print("ALERT SERVICE SET DO NOT DISTURB");
      // alertsService.manualDoNotDisturb = true;
    } 
      catch (e) { OpenKioskDebug.error(e); }
    ********/
  },

  delayedStartupFinished :
  {
    observe : function (subject, topic, data)
    {
      if (topic == "browser-delayed-startup-finished")
      {
        OpenKiosk.init();
        Services.obs.removeObserver(OpenKiosk.delayedStartupFinished, topic);
      }
    }
  },

  addObservers : function ()
  {
    Services.obs.addObserver(OpenKiosk.delayedStartupFinished, "browser-delayed-startup-finished", false);
    Services.prefs.addObserver("browser.link.open_newwindow", OpenKiosk.prefObserver, false);
    Services.prefs.addObserver("openkiosk.attractscreen.enabled", OpenKiosk.prefObserver, false);
    Services.prefs.addObserver("openkiosk.fullscreen.enabled", OpenKiosk.prefObserver, false);
    Services.prefs.addObserver("openkiosk.ui.personalbar.enabled", OpenKiosk.prefObserver, false);
  },

  addListeners : function ()
  {
    gBrowser.tabContainer.addEventListener("TabOpen", OpenKiosk.onNewTabOpened, true);
    gBrowser.tabContainer.addEventListener("TabSelect", OpenKiosk.onTabSelect, true);
    gBrowser.addProgressListener(openkioskProgressListener);

    window.addEventListener("MozDOMFullscreen:Entered", OpenKiosk.onEnterFullScreen, true, false);
    window.addEventListener("MozDOMFullscreen:Exited", OpenKiosk.onExitFullScreen, true, false);
 
    messageManager.addMessageListener("OpenKiosk:FrameMessageListener", OpenKiosk.FrameMessageListener);
  },

  prefObserver :
  {
    observe : function (subject, topic, data)
    {
      if (topic == "nsPref:changed")
      {
        if (data == "browser.link.open_newwindow") 
        {
          OpenKiosk.browser_link_open_newwindow = (Services.prefs.getIntPref("browser.link.open_newwindow") == 1);
          // OpenKioskDebug.print("browser_link_open_newwindow", OpenKiosk.browser_link_open_newwindow);
          OpenKiosk.handleUIControls();
        }

        if (data == "openkiosk.attractscreen.enabled") OpenKiosk.attractEnabled = Services.prefs.getBoolPref("openkiosk.attractscreen.enabled");

        if (data == "openkiosk.fullscreen.enabled") OpenKiosk.fullscreenEnabled = Services.prefs.getBoolPref("openkiosk.fullscreen.enabled");

        if (data == "openkiosk.ui.personalbar.enabled") OpenKiosk._handlePersonalBar();
      }
    }
  },

  unload : function ()
  {
    OpenKioskDebug.print("UNLOAD");
    OpenKioskUtils.clearBookmarks();
    OpenKioskDebug.print("REMOVING ALL LISTENERS");
    OpenKioskUtils.removeListeners()
    OpenKioskSession.removeListeners()
    OpenKioskAdmin.removeListeners()
    OpenKioskUtils.mOK = null;
    OpenKioskAdmin.setAdminPrefs(false);
  },

  onNewTabOpened : function ()
  {
    OpenKioskAdmin.showNotification();
  },

  onTabSelect : function ()
  {
    // OpenKioskDebug.print("TAB SELECTED", "OPENKIOSK JSENABLED", OpenKioskUtils.jsEnabled);

    // if filters are off then set global js to OpenKiosk js setting
    if (!OpenKioskSession.filtersEnabled)
    {
      OpenKioskUtils.enableJavascript(OpenKioskUtils.jsEnabled);
      return;
    }

    if (!OpenKioskUtils.jsEnabled) return;
    
    // OpenKioskDebug.print("TAB SELECTED", "URI", gBrowser.currentURI.spec, "JSENABLED", typeof(gBrowser.selectedBrowser.jsEnabled));

    // value is undefined when we reset new tab to homepage
    if (gBrowser.selectedBrowser.jsEnabled == undefined) return;

    OpenKioskUtils.enableJavascript(gBrowser.selectedBrowser.jsEnabled);
  },

  onEnterFullScreen : function ()
  {
    OpenKioskDebug.print("ENTER FULL SCREEN");
    OpenKiosk.fullscreenEntered = true;
    
    if (!OpenKioskAdmin.adminMode) 
    {
      OpenKioskUtils.setFullscreen();
      OpenKioskUtils.hideMenubar(true);
    }
  },

  onExitFullScreen : function ()
  {
    OpenKioskDebug.print("EXIT FULL SCREEN");
    OpenKiosk.fullscreenEntered = false;

    if (!OpenKioskAdmin.adminMode) 
    {
      OpenKioskUtils.setFullscreen();
      OpenKioskUtils.hideMenubar(true);
    }
  },

  invalidateHomePage : function () { OpenKiosk.homePageLoaded = false; },

  invalidateHomeAndAttractPage : function () 
  { 
    OpenKiosk.invalidateHomePage();
    OpenKiosk.resetAttract();
  },

  handleUIControls : function ()
  {
    if (OpenKioskAdmin.adminMode) return;

    // 1 means all windows diverted to single tab
    let c = (OpenKiosk.browser_link_open_newwindow);
        
    // set collapsed state of our broadcaster
    let el = document.getElementById("OpenKiosk:Tabs");
    el.collapsed = c;

    el = document.getElementById("cmd_newNavigatorTab");

    // if we are a single tab then remove new tab command
    if (c) el.removeAttribute("oncommand");
    else el.setAttribute("oncommand", "BrowserOpenNewTabOrWindow(event);");

    OpenKiosk.hideTabsToolbar();
  },

  handleNavigationKeys : function ()
  {
    let enabled = Services.prefs.getBoolPref("openkiosk.keys.navigation.enabled");

    // OpenKioskDebug.print("HANDLE NAVIGATION KEYS", "ENABLED", enabled); 

    // okHandleBackspace, okHandleShiftBackspace, goBackKb, goForwardKb, goBackKb, goForwardKb, goBackKb2, goForwardKb2

    let a = ["okHandleBackspace", "okHandleShiftBackspace", "goBackKb", "goForwardKb", "goBackKb", "goForwardKb", "goBackKb2", "goForwardKb2"];

    for (let i=0; i<a.length; ++i)
    {
      let e = document.getElementById(a[i]);

      if (e)
      {
        let c = e.getAttribute("command");

        // comment out command attribute if keys not enabled
        if (!enabled) c = c.replace(/^/, "\/\/ ");
        else c = c.replace(/^\/\/ /, "");

        e.setAttribute("command", c);

        // OpenKioskDebug.print("KEY", e.id, "command", c);
      }
    }
  },

  handleDevControls : function ()
  {
    if (gDevToolsBrowser && OpenKioskAdmin.exiting) 
    {
      const { devtools } = Cu.import("resource://devtools/shared/Loader.jsm", {});

      // OpenKioskDebug.print("HANDLE DEV CONTROLS", typeof(devtools));

      let l = gBrowser.browsers.length;

      for (i=0; i<l; i++)
      {
        let b = gBrowser.browsers[i];

        let tab = gBrowser.getTabForBrowser(b);
        let t = devtools.TargetFactory.forTab(tab);

        let toolbox = gDevTools.getToolbox(t);
        if (toolbox) toolbox.destroy();
      }
    }

    if (!OpenKioskAdmin.adminMode)
    {
      // remove the key command Cmd+Option+C
      gDevToolsBrowser = null;
      // let e = document.getElementById("key_inspector");
      // if (e) e.removeAttribute("command");
    }
      else
    {
      XPCOMUtils.defineLazyModuleGetter(window, "gDevToolsBrowser", "resource://devtools/client/framework/gDevTools.jsm");
    }
  },

  // hide the tabs toolbar
  hideTabsToolbar : function ()
  {
    // if (OpenKioskAdmin.adminMode) return;

    // hide temporarily while browser UI is uncollapsing
    if (OpenKiosk.browser_link_open_newwindow) document.getElementById("TabsToolbar").hidden = true;

    setTimeout(OpenKiosk._hideTabsToolbar, 300);
  },

  // this has to be a delayed call 
  _hideTabsToolbar : function ()
  {
    let el = document.getElementById("TabsToolbar");
    el.hidden = false;

    // show or hide tabs toolbar
    let c = (OpenKiosk.browser_link_open_newwindow);

    // in admin mode always show tabs
    if (OpenKioskAdmin.adminMode) el.collapsed = false;
    else el.collapsed = c;

    // OpenKioskDebug.print("_hideTabsToolbar", OpenKiosk.browser_link_open_newwindow, "IS COLLAPSED", el.collapsed);

    // hide or show "Open Link in New Tab" context menuitem
    el = document.getElementById("context-openlinkintab");
    el.collapsed = c;
  },

  loadAttractURI : function ()
  {
    if (OpenKiosk.attractEnabled && !OpenKiosk.attractPageLoaded)
    {
      OpenKioskDebug.print("LOAD ATTRACT SCREEN", OpenKioskUtils.attractURI.spec);

      OpenKiosk.hideMainToolbar(true);

      var url = OpenKioskUtils.attractURI.spec;
      loadURI(url);

      OpenKiosk.attractPageLoaded = true;
    }
  },

  resetAttract : function () { OpenKiosk.attractPageLoaded = false; },

  handleAttract : function (aURI)
  {
    if (OpenKiosk.attractEnabled && OpenKiosk.attractPageLoaded)
    {
      // OpenKioskDebug.print("HANDLE ATTRACT");
      if (!OpenKiosk.fullscreenEnabled) OpenKiosk.hideMainToolbar(false);
      OpenKiosk.resetAttract();
    }
  },

  hideMainToolbar : function (aHide)
  {
    // OpenKioskDebug.print(aHide ? "HIDE" : "SHOW", "MAIN TOOLBAR");

    document.getElementById("navigator-toolbox").collapsed = aHide;
  },

  hideUI : function (aIsAdmin)
  {
    try
    {
      let allow = (aIsAdmin == true);

      // OpenKioskDebug.delayedAlert("hideUI", "allow", allow);

      /** 
       * Main Toolbox & Titlebar 
       */

      if (OpenKiosk.fullscreenEnabled || OpenKiosk.attractEnabled) this.hideMainToolbar(!allow);

      /** 
       * Toolbar Buttons
       */

      let el = document.getElementById("PanelUI-button");
      el.hidden = el.collapsed = !allow;

      // titlebar
      el = document.getElementById("titlebar");
      if (el) el.hidden = el.collapsed = true;

      /** 
       * URLBar
       */
      let show = allow || Services.prefs.getBoolPref("openkiosk.ui.urlbar.enabled");  
      OpenKioskUtils.hideURLBar(!show);

      /** 
       * Main Menubar
       */

      if (!allow) OpenKioskUtils.showMainMenubar(false);

      /** 
       * Toolbar Context Menu
       */

      // "Bookmark All Tabs"
      el = document.getElementById("toolbar-context-bookmarkAllTabs");
      el.hidden = el.collapsed = true;
    
      // Menu Separator
      el = document.getElementById("viewToolbarsMenuSeparator");
      el.hidden = el.collapsed = true;

      // "Customize..."
      el.nextSibling.hidden = el.collapsed = true;

      /** 
       * Tab Context Menu
       */

      el = document.getElementById("context_openTabInWindow");
      el.hidden = el.collapsed = true;

      el = document.getElementById("context_bookmarkAllTabs");
      el.hidden = el.collapsed = true;

      OpenKiosk.handlePersonalBar();

      let c = OpenKiosk.browser_link_open_newwindow;

      // set collapsed state of our UI broadcaster 
      el = document.getElementById("OpenKiosk:Tabs");
      el.collapsed = c;

      /** 
       * Context Menu Search
       */

      el = document.getElementById("context-searchselect");
      el.hidden = el.collapsed = !Services.prefs.getBoolPref("openkiosk.ui.context.search.enabled");
    }
      catch (e) { OpenKioskDebug.error(e); }
  },

  handleHomePage : function (aURI)
  {
    if (OpenKioskUtils.equalsDomainURI(aURI, OpenKioskUtils.homePageURI) && OpenKiosk.homePageLoaded) return;

    // OpenKioskDebug.print("CALL", "INVALIDATE HOME PAGE");

    OpenKiosk.invalidateHomePage();
  }, 

  handlePersonalBar : function ()
  {
    // OpenKioskDebug.print("HANDLE PERSONALBAR", "HIDE", !Services.prefs.getBoolPref("openkiosk.ui.personalbar.enabled"), "ADMIN MODE", OpenKioskAdmin.adminMode);

    if (OpenKioskAdmin.adminMode || OpenKioskAdmin.exiting) return;

    OpenKiosk._handlePersonalBar();
  },

  _handlePersonalBar : function ()
  {
    let enabled = Services.prefs.getBoolPref("openkiosk.ui.personalbar.enabled");
    document.getElementById("PersonalToolbar").collapsed = !enabled;
  },

  setPrefs : function ()
  {
    // 0 blank 1 home page 2 last visited 3 previous session
    Services.prefs.setIntPref("browser.startup.page", 1);

    // OpenKioskDebug.print("HIDE TABS", (Services.prefs.getIntPref("browser.link.open_newwindow") == 1));

    // 1 means all windows diverted to single tab
    OpenKiosk.browser_link_open_newwindow = (Services.prefs.getIntPref("browser.link.open_newwindow") == 1);
  },

  print : function ()
  {
    OpenKioskDebug.print("PRINT");

    if (!Services.prefs.getBoolPref("openkiosk.print.silent.enabled"))
    {
      PrintUtils.printWindow(window.gBrowser.selectedBrowser.outerWindowID, window.gBrowser.selectedBrowser);
      return;
    }
    
    // let printSettings = Cc["@mozilla.org/gfx/printsettings-service;1"].getService(Ci.nsIPrintSettingsService).newPrintSettings;
    let printSettings = Cc["@mozilla.org/gfx/printsettings-service;1"].getService(Ci.nsIPrintSettingsService).globalPrintSettings;

    OpenKioskDebug.print("PRINT SETTINGS", printSettings, "DEFAULT PRINTER", printSettings.defaultPrinterName);

    try
    {
      // No feedback to user
      printSettings.printSilent   = true;
      printSettings.showPrintProgress = false;

      // Other settings
      printSettings.printBGImages = true;
      printSettings.shrinkToFit = true;

      // Frame settings
      printSettings.howToEnableFrameUI = printSettings.kFrameEnableAll;
      printSettings.printFrameType = printSettings.kFramesAsIs;

      try
      {
        let webBrowserPrint = gBrowser.contentWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIWebBrowserPrint);

        webBrowserPrint.print(printSettings, OpenKiosk.printProgressListener);
      }
        catch (e) { OpenKioskDebug.error(e); }
    }
      catch (e) { OpenKioskDebug.error(e); }
  },

  printProgressListener : 
  {
       onStateChange : function (webProgress, request, stateFlags, status) {},
    onProgressChange : function () {},
    onLocationChange : function () {},
      onStatusChange : function () {},
    onSecurityChange : function () {}
  },

  FrameMessageListener : function (aMsg)
  {
    let command = aMsg.data.command;

    // OpenKioskDebug.print(aMsg.name, "COMMAND", command);

    switch (command)
    {
      case "openkiosk-dom-quit":
        OpenKioskAdmin.quitFromKeys();
        break;

      case "openkiosk-dom-settings":
        OpenKioskAdmin.login();
        break;
    }
  }
};

var OpenKioskAdmin = 
{
  adminMode : false,
     pass : null,
     bundle : false,
    exiting : false,
    prefURL : "about:preferences#openKiosk",

  init : function ()
  {
    this.bundle = Services.strings.createBundle("chrome://openkiosk/locale/admin.properties");

    let sp = Services.prefs.getCharPref("openkiosk.admin.password");
    sp == "admin" ? this.pass = sp : OpenKioskUtils.decryptGlobal(sp);
  },

  login : function ()
  {
    if (OpenKioskAdmin.adminMode) return;

    if (!OpenKioskAdmin.prompt()) return;

    // reset AUP if it's being displayed
    OpenKioskSession.clearAndResetAUP()

    // cancel the session while in admin mode
    OpenKioskSession.cancel();
    OpenKioskAdmin.setUI();
    OpenKioskAdmin.resize(1);
    OpenKioskDebug.print("FINISH LOGIN");
  },

  resize : function (aEnter)
  {
    if (aEnter) setTimeout(OpenKioskUtils.resizeWindow, 500);
    else setTimeout(OpenKioskUtils.sizeWindow, 500);
  },

  setAdminPrefs : function (aAdmin)
  {
    let isAdmin = (aAdmin == true);

    Services.prefs.setBoolPref("xpinstall.enabled", isAdmin);
    Services.prefs.setBoolPref("openkiosk.admin.mode", isAdmin);

    this.adminMode = isAdmin;
  },

  _promptActive : false,
  prompt : function ()
  {
    if (OpenKioskAdmin._promptActive) return;

    OpenKioskAdmin._promptActive = true;

    ps = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);

    const sTitle =  OpenKioskAdmin.bundle.GetStringFromName("adminLoginTitle");
    const sEnterPass =  OpenKioskAdmin.bundle.GetStringFromName("adminEnterPassword");

    password = { value: "" };

    let isAdmin = ps.promptPassword(null, sTitle, sEnterPass, password, null, { value: false });

    // just return if no value was entered
    if (!password.value) 
    {
      OpenKioskAdmin._promptActive = false;
      return false;
    }

    // if there is an old legacy pass then revert to 'admin'
    let savedPass = OpenKioskAdmin.pass || "admin";

    // OpenKioskDebug.print("PROMPT", "savedPass", savedPass);

    // issue fail alert if wrong pass is entered
    if (savedPass != password.value)
    {
      let sFail = OpenKioskAdmin.bundle.GetStringFromName("adminPasswordFail");
      ps.alert(null, sTitle, sFail);
      OpenKioskAdmin._promptActive = false;
      return false;
    }

    OpenKioskAdmin._promptActive = false;
    return true;
  },

  setUI : function ()
  {
    OpenKioskAdmin.setAdminPrefs(true);
    OpenKiosk.hideUI(true);
    OpenKiosk.hideTabsToolbar();
    OpenKioskUtils.hideMenubar(false);
#ifdef XP_LINUX
    OpenKioskUtils.unsetFullscreen();
#endif
    OpenKiosk.handleDevControls();

    switchToTabHavingURI(OpenKioskAdmin.prefURL, true);

    OpenKioskAdmin.showNotification();
  },

  showNotification : function ()
  {
    if (OpenKioskAdmin.adminMode) setTimeout(OpenKioskAdmin.notification, 1000);
  },

  notification : function ()
  {
    if (!gBrowser.browsers) return;

    let l = gBrowser.browsers.length;

    for (i=0; i<l; i++)
    {
      let b = gBrowser.browsers[i];
      let nb = gBrowser.getNotificationBox(b);

      if (!nb.currentNotification)
      {
        let message = OpenKioskAdmin.bundle.GetStringFromName("adminMode");

        const priority = nb.PRIORITY_CRITICAL_BLOCK;

        var buttons = [{
                               label : OpenKioskAdmin.bundle.GetStringFromName("adminShutdown"),
                           accessKey : null,
                               popup : null,
                            callback : OpenKioskAdmin.quit
                       },
                       {
                               label : OpenKioskAdmin.bundle.GetStringFromName("adminModeExit"),
                           accessKey : null,
                               popup : null,
                            callback : OpenKioskAdmin.exit
                       }];

        nb.appendNotification(message,
                              null,
                              "chrome://browser/skin/Info.png",
                              priority, buttons, null);
      }
    }
  },

  removeNotification : function ()
  {
    let l = gBrowser.browsers.length;

    for (i=0; i<l; i++)
    {
      let b = gBrowser.browsers[i];
      let nb = gBrowser.getNotificationBox(b);

      if (nb.currentNotification) nb.removeCurrentNotification();
    }
  },

  exit : function ()
  {
    OpenKioskAdmin.exiting = true;
    OpenKioskDebug.print("EXIT ADMIN");
    
    OpenKioskUtils.enableJavascript(OpenKioskUtils.jsEnabled);

    OpenKioskAdmin.setAdminPrefs();
    OpenKioskAdmin.removeNotification();
    OpenKiosk._init();

    OpenKioskUtils.hideMenubar(true);
#ifdef XP_LINUX
    OpenKioskUtils.setFullscreen();
#endif

    OpenKioskAdmin.resize();
    OpenKioskUtils.closeInsecureTabs();
    OpenKioskUtils.closeAllWindows();
    OpenKioskAdmin.clear();
    OpenKiosk.hideUI();
    OpenKiosk.handleUIControls();
    OpenKiosk.handleNavigationKeys();
    OpenKiosk.handleDevControls();
    OpenKioskAdmin.exiting = false;
  },

  get clearOnExitEnabled ()
  {
    return Services.prefs.getBoolPref("openkiosk.admin.clearsession.onexit.enabled");
  },

  clear : function ()
  {
    // OpenKioskDebug.print("ADMIN CLEAR");
    if (OpenKioskAdmin.clearOnExitEnabled) 
    {
      OpenKioskSession.clear();
      OpenKioskSession.reinit();
      OpenKioskUtils.removeAllTabs();
    }
  },

  removeListeners : function ()
  {
    gBrowser.removeProgressListener(openkioskProgressListener);
    gBrowser.tabContainer.removeEventListener("TabSelect", OpenKiosk.onTabSelect, true);
    gBrowser.tabContainer.removeEventListener("TabOpen", OpenKiosk.onNewTabOpened, true);

    window.removeEventListener("MozDOMFullscreen:Entered", OpenKiosk.onEnterFullScreen, true, false);
    window.removeEventListener("MozDOMFullscreen:Exited", OpenKiosk.onExitFullScreen, true, false);

    Services.prefs.removeObserver("browser.link.open_newwindow", OpenKiosk.prefObserver);
    Services.prefs.removeObserver("openkiosk.attractscreen.enabled", OpenKiosk.prefObserver);
    Services.prefs.removeObserver("openkiosk.fullscreen.enabled", OpenKiosk.prefObserver);

    Services.prefs.clearUserPref("openkiosk.contentframe.observers.added");
  },

  shutdown : function ()
  {
    OpenKioskAdmin.setAdminPrefs();
    // OpenKioskAdmin.removeListeners();
  },

  quitFromKeys : function ()
  {
    if (OpenKioskAdmin.adminMode || OpenKioskAdmin.prompt()) OpenKioskAdmin.quit();
  },

  quit : function ()
  {
    OpenKioskAdmin.shutdown();
    Cc['@mozilla.org/toolkit/app-startup;1'].getService(Ci.nsIAppStartup).quit(Ci.nsIAppStartup.eAttemptQuit);
  }
};

var openkioskProgressListener =
{
  onProgressChange : function (wp, req, cur, max, curtotal, maxtotal) {},

  onStateChange : function (wp, req, state, status) 
  { 
    if (!req) return;

    // OpenKioskDebug.print("NAME", req.name);

    // if (req instanceof Ci.nsIChannel || "URI" in req) OpenKioskDebug.print("LOCATION", req.URI.spec);

    if (wp.isTopLevel && state & Ci.nsIWebProgressListener.STATE_START) 
    {
      if (req instanceof Ci.nsIChannel || "URI" in req) 
      {
        // OpenKioskDebug.print("STATE_START");

        let loc = req.originalURI;

        // OpenKioskDebug.print("onStateChange", "ENABLE JAVASCRIPT", "ENABLE", OpenKioskUtils.jsEnabled);
        OpenKioskUtils.enableJavascript(OpenKioskUtils.jsEnabled);
        OpenKioskUtils.enableJavascript(true);

        // OpenKioskDebug.print("ORIGINAL LOCATION", loc.spec);

        OpenKiosk.handleAttract(loc);

        if (OpenKioskSession.handleSanitizing()) return;

        // if a strict URI match doesn't work try comparing w/out the protocol as http sometimes gets server redirect to https
        if (OpenKioskUtils.exemptURI(loc) || OpenKioskUtils.exemptAbout(loc) || OpenKioskUtils.exemptExceptProtocolURI(loc)) return;

        if (!OpenKioskSession.handleProtocol(loc, req)) return;

        OpenKioskSession.handleAUP(loc, req);

        OpenKioskSession.handleFilters(loc, req);
      }
    }
  },

  onLocationChange : function (wp, req, loc) 
  {
    // if we switch tabs there is no request so return
    if (!req) return;

    OpenKiosk.handleHomePage(loc);

    OpenKioskDebug.print("PAGE LOADED", loc.spec);

    OpenKioskSession.continue();

    OpenKioskAdmin.showNotification(); 
  },

  onStatusChange : function (wp, req, status, message) {},

  onSecurityChange : function (wp, req, state) {}
};

