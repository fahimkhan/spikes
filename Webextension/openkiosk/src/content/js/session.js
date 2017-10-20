
var OpenKioskSession =
{
              timer : null,
             bundle : null,
            enabled : null,
            started : false,
            minutes : null,
            seconds : null, 
               warn : null, 
           wseconds : null, 
           cseconds : null, 
       mouseStopped : true, 
         keyStopped : true, 
      scrollStopped : true, 
       clickStopped : true, 
    mouseEventTimer : null, 
      keyEventTimer : null, 
   scrollEventTimer : null, 
    clickEventTimer : null, 
     countdownTimer : null, 
           canceled : false, 
    needsSanitizing : false, 
     protocolString : [], 
      protocolRegEx : null, 
         aupEnabled : false, 
        aupAccepted : false, 
        aupDeclined : false, 
         aupUserURL : false, 
     filtersEnabled : false, 
   whitelistEnabled : false, 
        filtersData : null, 
        filtersFile : null,
  chromeFiltersFile : "chrome://openkiosk/content/filters.txt",

  readPrefs : function ()
  {
             this.enabled = Services.prefs.getBoolPref("openkiosk.session.inactiveTerminal.enabled"); 
             this.minutes = Services.prefs.getIntPref("openkiosk.session.inactiveTerminal.minutes"); 
             this.seconds = Services.prefs.getIntPref("openkiosk.session.inactiveTerminal.seconds"); 
                this.warn = Services.prefs.getBoolPref("openkiosk.session.inactiveTerminal.warn.enabled");
            this.wseconds = Services.prefs.getIntPref("openkiosk.session.inactiveTerminal.warn.seconds"); 
          this.aupEnabled = Services.prefs.getBoolPref("openkiosk.session.aup.enabled");
      this.filtersEnabled = Services.prefs.getBoolPref("openkiosk.filters.enabled");
    this.whitelistEnabled = Services.prefs.getBoolPref("openkiosk.filters.whitelist.enabled");

    try 
    { 
      this.filtersFile = Services.prefs.getComplexValue("openkiosk.filters.file", Ci.nsIFile); 

      // OpenKioskDebug.print("FILTERS FILE", this.filtersFile, this.filtersFile.path, "EXISTS", this.filtersFile.exists());

      // turn filters pref file path into an nsIFile
      if (this.filtersFile && !this.filtersFile.exists()) this.filtersFile = null;
    }  
      catch (e) {}

    this.initValidProtocols();
  },

  clearPrefs : function ()
  {
    Services.prefs.clearUserPref("openkiosk.session.aup.accepted");
  },

  init : function ()
  {
    this.addListeners();
    this.clearPrefs();
    this.readPrefs();
    OpenKioskUtils.clearTabPrefs();
    this.initTimer();

    // init locals
    this.bundle = Services.strings.createBundle("chrome://openkiosk/locale/session.properties");
    this.setCountdownSeconds();
    this.initFiltersData();
  },

  reinit : function ()
  {
    // OpenKioskDebug.print("SESSION REINIT");
    this.removeNotification();
    this.readPrefs();
    this.clearPrefs();
    this.resetTimer();
    this.resetEventTimers();
    this.setCountdownSeconds();

    this.countdownTimer = null;
    this.started = false;
    this.canceled = false;
  },

  setCountdownSeconds : function ()
  {
    // add 1 so that user will see the number 10 at start of countdown
    this.cseconds = this.wseconds+1;
  },

  get delay ()
  {
    // convert minutes and seconds to milliseconds
    let ms = ((this.minutes * 60 + this.seconds) * 1000);

    return ms;
  },

  initTimer : function ()
  {
    if (!this.timer) this.timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);

    if (!OpenKioskSession.enabled) return;

    this.timer.initWithCallback(this, this.delay, this.timer.TYPE_REPEATING_SLACK);

    // OpenKioskDebug.print("INIT TIMER", "DELAY", this.delay);
  },

  addListeners : function ()
  {
    addEventListener("mousemove", OpenKioskSession.invalidate, false);
    addEventListener("keyup", OpenKioskSession.invalidate, false);
    addEventListener("scroll", OpenKioskSession.invalidate, false);
    addEventListener("click", OpenKioskSession.invalidate, false);

    Services.prefs.addObserver("openkiosk.session.", OpenKioskSession.prefObserver, false);
    Services.prefs.addObserver("openkiosk.filters.", OpenKioskSession.prefObserver, false);
  },

  removeListeners : function ()
  {
    removeEventListener("mousemove", OpenKioskSession.invalidate, false);
    removeEventListener("keyup", OpenKioskSession.invalidate, false);
    removeEventListener("scroll", OpenKioskSession.invalidate, false);
    removeEventListener("click", OpenKioskSession.invalidate, false);

    Services.prefs.removeObserver("openkiosk.session.inactiveTerminal.", OpenKioskSession.prefObserver);
    Services.prefs.removeObserver("openkiosk.session.", OpenKioskSession.prefObserver);
    Services.prefs.removeObserver("openkiosk.filters.", OpenKioskSession.prefObserver);

    OpenKioskSession.clearPrefs();
  },
  
  resetTimer : function ()
  {
    OpenKioskSession.initTimer();
  },

  clearTimer : function ()
  {
    OpenKioskSession.timer.cancel();
    OpenKioskSession.timer = null;
  },

  clearTimers : function ()
  {
    OpenKioskSession.clearTimer();
    OpenKioskSession.resetWarningTimer();
  },

  resetWarningTimer : function (aStartSession)
  {
    clearTimeout(OpenKioskSession.countdownTimer);
    OpenKioskSession.countdownTimer = null;

    if (aStartSession) OpenKioskSession.sessionStarted();
  },

  resetEventTimers : function ()
  {
    OpenKioskSession.resetMouseTimer();
    OpenKioskSession.resetKeyTimer();
    OpenKioskSession.resetScrollTimer();
    OpenKioskSession.resetClickTimer();
  },

  resetMouseTimer : function ()
  {
    OpenKioskSession.mouseStopped = true;
  },

  resetKeyTimer : function ()
  {
    OpenKioskSession.keyStopped = true;
  },

  resetScrollTimer : function ()
  {
    OpenKioskSession.scrollStopped = true;
  },

  resetClickTimer : function ()
  {
    OpenKioskSession.clickStopped = true;
  },

  sessionStarted : function ()
  {
    if (!OpenKioskSession.timer) OpenKioskSession.initTimer();

    OpenKioskSession.started = true;
  },

  handleMouseMove : function ()
  {
    clearTimeout(OpenKioskSession.mouseEventTimer);
    OpenKioskSession.mouseEventTimer = setTimeout(OpenKioskSession.resetMouseTimer, 1000);

    // return while mouse is moving
    if (!OpenKioskSession.mouseStopped) return;

    OpenKioskSession.mouseStopped = false;
  },

  handleKeyup : function ()
  {
    OpenKioskSession.sessionStarted();

    clearTimeout(OpenKioskSession.keyEventTimer);
    OpenKioskSession.keyEventTimer = setTimeout(OpenKioskSession.resetKeyTimer, 1000);

    // return while keyboard is active
    if (!OpenKioskSession.keyStopped) return;

    OpenKioskSession.keyStopped = false;
    OpenKiosk.invalidateHomePage();
    OpenKioskSession.sessionStarted();
  },

  handleScroll : function ()
  {
    OpenKioskSession.sessionStarted();

    clearTimeout(OpenKioskSession.scrollEventTimer);
    OpenKioskSession.scrollEventTimer = setTimeout(OpenKioskSession.resetScrollTimer, 1000);

    // return while scrolling
    if (!OpenKioskSession.scrollStopped) return;

    OpenKioskSession.scrollStopped = false;
    OpenKiosk.invalidateHomePage();
    OpenKioskSession.sessionStarted();
  },

  handleClick : function ()
  {
    OpenKioskSession.sessionStarted();

    clearTimeout(OpenKioskSession.clickEventTimer);
    OpenKioskSession.scrollEventTimer = setTimeout(OpenKioskSession.resetClickTimer, 1000);

    // return while clicking
    if (!OpenKioskSession.clickStopped) return;

    OpenKioskSession.clickStopped = false;
    OpenKiosk.invalidateHomePage();
    OpenKioskSession.sessionStarted();
  },

  handleMailtoClick : function (aEvent)
  {
    if (aEvent.target.nodeName.toLowerCase() != "a") return;

    if (/^mailto:/i.test(aEvent.target.href)) aEvent.preventDefault();
  },

  invalidate : function ()
  {
    let event = arguments[0];

    switch (event.type)
    {
      case "mousemove":
        OpenKioskSession.handleMouseMove();
        break;

      case "keyup":
        OpenKioskSession.handleKeyup();
        break;

      case "scroll":
        OpenKioskSession.handleScroll();
        break;
        break;

      case "click":
        OpenKioskSession.handleMailtoClick(event);
        OpenKioskSession.handleClick();
        break;
    }
  },

  get isSoundPlaying ()
  {
    // if attract of fullscreen there is no UI so return false
    if (OpenKiosk.attractEnabled || OpenKiosk.fullscreenEnabled) return false;

    let tab = gBrowser.getTabForBrowser(gBrowser.selectedBrowser);

    return tab.soundPlaying;
  },

  startCountdown : function ()
  {
    try
    {
      // if we have a selection on the html page, invalidate the home page so we can reset it
      let sel = gBrowser.contentWindow.getSelection();
      if (sel && sel.toString().length) OpenKiosk.invalidateHomeAndAttractPage();
    }
      catch (e) { OpenKioskDebug.error(e); }

    // OpenKioskDebug.print("START COUNTDOWN", "attractPageLoaded", OpenKiosk.attractPageLoaded, "homePageLoaded", OpenKiosk.homePageLoaded);

    // don't start if we are on attract page
    if (OpenKiosk.attractEnabled && OpenKiosk.attractPageLoaded || OpenKiosk.homePageLoaded) return;

    // don't countdown unless a session was started
    if (OpenKioskSession.started && (!OpenKioskSession.isSoundPlaying || !OpenKiosk.fullscreenEntered))
    {
      OpenKioskSession.canceled = false;

      if (!OpenKioskSession.warn) 
      {
        // OpenKioskDebug.print("START COUNTDOWN", "NO WARN", "FINISH RESET");
        OpenKioskSession.finishReset();
      }
        else 
      {
        // OpenKioskDebug.print("START COUNTDOWN", OpenKioskSession.wseconds, "SECONDS", "started", OpenKioskSession.started);
        OpenKioskSession.setCountdownSeconds();
        OpenKioskSession.continueCountdown();
      }
    }
  },

  continueCountdown : function ()
  {
    --OpenKioskSession.cseconds;

    // OpenKioskDebug.print("continueCountdown", "cseconds", OpenKioskSession.cseconds, "wseconds", OpenKioskSession.wseconds);

    // clear the main timer while we are counting down
    if (OpenKioskSession.timer) OpenKioskSession.clearTimer();

    if (OpenKioskSession.cseconds >= 0)
    {
      OpenKioskSession.showNotification();
      OpenKioskSession.countdownTimer = setTimeout(OpenKioskSession.continueCountdown, 1000);
    }
      else
    {
      OpenKioskSession.finishReset();
    }
  },

  showNotification : function ()
  {
    if (!gBrowser.browsers) return;

    let message = OpenKioskSession.bundle.formatStringFromName("sessionWarning", [OpenKioskSession.cseconds], 1);

    let l = gBrowser.browsers.length;

    for (i=0; i<l; i++)
    {
      let b = gBrowser.browsers[i];
      let nb = gBrowser.getNotificationBox(b); 
    
      if (!nb.currentNotification)
      {
        // need to get from user set pref
        let label = Services.prefs.getCharPref("openkiosk.reset.buttontext");

        let buttons = [{
                             label : label,
                         accessKey : null,
                             popup : null,
                          callback : OpenKioskSession.continue
                       }];


        const priority = nb.PRIORITY_WARNING_HIGH;
        nb.appendNotification(message,
                              null,
                              "chrome://browser/skin/Info.png",
                              priority, buttons);
      }
        else
      {
        nb.currentNotification.label = message;
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

      if (nb.currentNotification) if (nb.currentNotification.type != "critical") nb.removeCurrentNotification();
    }
  },

  continue : function ()
  {
    OpenKioskSession.removeNotification();
    OpenKioskSession.resetWarningTimer(true);
    OpenKioskSession.resetTimer();
  },


  finishReset : function ()
  {
    // OpenKioskDebug.print("FINISH COUNTDOWN");

    if (OpenKioskSession.canceled) 
    {
      OpenKioskDebug.print("CANCELED");
      OpenKioskSession.canceled = false;
      return;
    }

    OpenKioskSession.continue();
    OpenKioskSession.needsSanitizing = true;

    OpenKioskUtils.removeAllTabs();
    OpenKiosk.hideTabsToolbar();

    // since we are creating a newtab with the homepage our progress 
    // listener doesn't pick it up for sanitizing so let's do it here
    OpenKioskSession.handleSanitizing();
  },

  /**
   *  will be called from progressListener 
   *  after home page is loaded
   */
  clearAndReset : function ()
  {
    // OpenKioskDebug.print("CLEAR AND RESET");

    OpenKioskSession.resetWarningTimer(true);
    OpenKioskSession.clear();
    OpenKioskSession.reinit();
    OpenKiosk.hideUI();
    OpenKioskSession.needsSanitizing = false;
  },

  handleSanitizing : function ()
  {
    // OpenKioskDebug.print("HANDLE SANITIZING", "NEEDS SANITIZING", OpenKioskSession.needsSanitizing);

    if (OpenKioskSession.needsSanitizing)
    {
      OpenKioskSession.clearAndReset();
      return true;
    }
    return false;
  },

  // clear user data and UI after session has ended 
  clear : function ()
  {
    // OpenKioskDebug.print("CLEAR DATA");
    // make a call to utils for individual data clearing functions

    OpenKioskUtils.handleUserData();
  },

  cancel : function ()
  {
    OpenKioskSession.cseconds = -1;
    OpenKioskSession.canceled = true;
    OpenKioskSession.clearTimers(); 
    OpenKioskSession.removeNotification();
  },

  reset : function ()
  {
    // return if session is active
    if (!OpenKioskSession.enabled       || 
        !OpenKioskSession.mouseStopped  || 
        !OpenKioskSession.keyStopped    ||
        !OpenKioskSession.scrollStopped ||
        !OpenKioskSession.clickStopped) 
      return;

    // OpenKioskDebug.print("RESET SESSION", "admin.mode", Services.prefs.getBoolPref("openkiosk.admin.mode"));

    // return if in admin mode
    if (OpenKioskAdmin.adminMode)
    {
      OpenKioskSession.cancel();
      return;
    }

    // OpenKioskDebug.print("RESET SESSION");
    OpenKioskSession.startCountdown();
  },

  manualReset : function ()
  {
    if (OpenKioskAdmin.adminMode) return;

    OpenKioskDebug.print("MANUAL RESET SESSION");

    OpenKioskSession.toggleAUPUI();

    OpenKioskSession.started = true;
    OpenKioskSession.canceled = false;
    OpenKioskSession.startCountdown();
  },

  prefObserver : 
  {
    observe : function (subject, topic, data)
    {
      // OpenKioskDebug.print("SUBJECT", subject, "TOPIC", topic, "DATA", data);

      if (topic == 'nsPref:changed') 
      {
        if (/inactiveTerminal/.test(data))
        {
          OpenKioskSession.readPrefs();
          OpenKioskSession.resetTimer();
        }

        if (/protocol/.test(data)) OpenKioskSession.initValidProtocols();

        if (data == "openkiosk.filters.enabled") OpenKioskSession.filtersEnabled = Services.prefs.getBoolPref("openkiosk.filters.enabled");

        if (data == "openkiosk.filters.whitelist.enabled") OpenKioskSession.whitelistEnabled = Services.prefs.getBoolPref("openkiosk.filters.whitelist.enabled");

        if (data == "openkiosk.filters.file") 
        {
          try 
          { 
            OpenKioskSession.filtersFile = Services.prefs.getComplexValue("openkiosk.filters.file", Ci.nsIFile); 
            OpenKioskSession.initFiltersData();
          }
          catch (e) {}
        }

        if (/aup/.test(data)) 
        {
          if (data == "openkiosk.session.aup.accepted") OpenKioskSession.aupAccepted = Services.prefs.getBoolPref("openkiosk.session.aup.accepted");

          if (data == "openkiosk.session.aup.enabled") OpenKioskSession.aupEnabled = Services.prefs.getBoolPref("openkiosk.session.aup.enabled");
        }
      }
    }
  },

  notify : function ()
  {
    // OpenKioskDebug.print("TIMER NOTIFY", "SET TO", OpenKioskSession.delay/1000, "SECONDS");
    OpenKioskSession.reset();
  },

  initValidProtocols : function ()
  {
    this.protocolString = new Array;

    let about = Services.prefs.getBoolPref("openkiosk.filters.protocol.about.enabled");
    let data = Services.prefs.getBoolPref("openkiosk.filters.protocol.data.enabled");
    let email = Services.prefs.getBoolPref("openkiosk.filters.protocol.email.enabled");
    let file = Services.prefs.getBoolPref("openkiosk.filters.protocol.file.enabled");
    let ftp = Services.prefs.getBoolPref("openkiosk.filters.protocol.ftp.enabled");
    let javascript = Services.prefs.getBoolPref("openkiosk.filters.protocol.javascript.enabled");
    let res = Services.prefs.getBoolPref("openkiosk.filters.protocol.res.enabled");
    let viewsource = Services.prefs.getBoolPref("openkiosk.filters.protocol.viewsource.enabled");

    if (about) this.protocolString.push("about");
    if (data) this.protocolString.push("data");
    if (email) this.protocolString.push("mailto");
    if (file) this.protocolString.push("file");
    if (ftp) this.protocolString.push("ftp");
    if (javascript) this.protocolString.push("javascript");
    if (res) this.protocolString.push("resource");
    if (viewsource) this.protocolString.push("viewsource");

    this.protocolString = this.protocolString.join("|");

    this.protocolRegEx = new RegExp(this.protocolString);
  },

  handleProtocol : function (aURI, aReq)
  {
    if (!OpenKioskSession.isValidProtocol(aURI))
    {
      OpenKioskUtils.cancelRequestAndRedirect(aReq);
      return false;
    }

    return true;
  },

  validProtocols : function (aURI)
  {
    if (OpenKioskAdmin.adminMode) return true;

    if (/^http|^https|^wyciwyg/.test(aURI.scheme)) return true;

    return false;
  },

  isValidProtocol : function (aURI)
  {
    // OpenKioskDebug.print("PROTOCOL", aURI.scheme);

    if (OpenKioskSession.validProtocols(aURI)) return true;

    if (!this.protocolString || !this.protocolRegEx.test(aURI.scheme)) 
    {
      OpenKioskDebug.print("BLOCKED PROTOCOL", aURI.scheme);
      return false;
    }

    return true;
  },

  toggleAUPUI : function (aShow)
  {
     document.getElementById("content-deck").hidden = aShow;

     document.getElementById("ok-aup").hidden = !aShow;
  },

  isAUPURI : function (aURI)
  {
     let aupURI = OpenKioskUtils.URIFixUp("openkiosk.mozdevgroup.com/AUP.html");

     if (aURI.equals(aupURI)) return true;

     return false; 
  },

  isAUPEnabled : function ()
  {
    if (OpenKioskAdmin.adminMode) return false;

    // OpenKioskDebug.print("AUP ENABLED", OpenKioskSession.aupEnabled);

    return OpenKioskSession.aupEnabled;
  },

  loadAUP : function ()
  {
    document.getElementById("aup-browser").loadURI(OpenKioskUtils.aupURI.spec);
  },

  resetAUP : function ()
  {
    OpenKioskSession.aupDeclined = false;
  }, 

  clearAndResetAUP : function ()
  {
    if (!OpenKioskSession.isAUPEnabled()) return;

    OpenKioskSession.resetAUP();
    OpenKioskSession.toggleAUPUI();
    OpenKioskUtils.loadHomePage();
  },

  handleAUP : function (aURI, aReq)
  {
    if (OpenKioskAdmin.adminMode || OpenKioskUtils.exemptURI(aURI)) return;

    if (!OpenKioskUtils.exemptAbout(aURI))
    {
      OpenKioskSession.aupUserURL = null;

      if (OpenKioskSession.isAUPEnabled() && !OpenKioskSession.aupAccepted && !OpenKioskSession.aupDeclined)
      {
        OpenKioskUtils.cancelRequest(aReq);

        OpenKioskDebug.print("SHOW AUP");
        OpenKioskSession.showAUP();
        OpenKioskSession.aupUserURL = aURI;
      }
    }

    OpenKioskSession.resetAUP();
  },

  showAUP : function ()
  {
    OpenKioskUtils.loadBlankPage();
    OpenKioskSession.loadAUP();
    OpenKioskSession.toggleAUPUI(true);
  },

  aupLoadURI : function ()
  {
    let url = gBrowser.currentURI.spec;
    if (OpenKioskSession.aupUserURL) url = OpenKioskSession.aupUserURL.spec;

    loadURI(url);

    OpenKioskSession.toggleAUPUI();
  },

  acceptAUP : function ()
  {
    Services.prefs.setBoolPref("openkiosk.session.aup.accepted", true);
    OpenKioskSession.aupLoadURI();
  },

  declineAUP : function ()
  {
    Services.prefs.setBoolPref("openkiosk.session.aup.accepted", false);
    OpenKioskSession.aupDeclined = true;
    OpenKioskSession.aupLoadURI();
  },

  parseFiltersData : function ()
  {
    OpenKioskSession.filtersData = null;

    if (!OpenKioskSession.filtersFile) 
    {
      // OpenKioskDebug.print("NO FILTERS FILE USE CHROME INSTEAD");

      function callback (inputStream, status)
      {
        if (!Components.isSuccessCode(status))
        {
          // Handle error!
          OpenKioskDebug.print("ERROR READING FILE", aURL);
          return;
        }

        let cstream = Cc['@mozilla.org/intl/converter-input-stream;1'].createInstance(Ci.nsIConverterInputStream);
        cstream.init(inputStream, "UTF-8", 0, 0);


        cstream instanceof Ci.nsIUnicharLineInputStream;

        // OpenKioskDebug.print("INPUT STREAM", cstream);

        OpenKioskSession._readLine(cstream);
      }

      OpenKioskUtils.getURLInputStream(OpenKioskSession.chromeFiltersFile, callback);

      return;
    }
      else
    {
      // OpenKioskDebug.print("PARSE FILTERS DATA", OpenKioskSession.filtersFile.path, "WHITELIST ENABLED", OpenKioskSession.whitelistEnabled);

      var fis = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
      fis.init(OpenKioskSession.filtersFile, -1, -1, false);

      let lis = fis.QueryInterface(Ci.nsILineInputStream);

      OpenKioskSession._readLine(lis);

      fis.close();
    }
  },

  _readLine : function (aLIS)
  {
    let line = { value: "" };
    let more = false;
    let all = [];
    let strict = [];

    do
    {
      more = aLIS.readLine(line);

      let text = line.value;

      // OpenKioskDebug.print("FILTERS DATA", text);
  
      if (text && !/#/.test(text))
      {
        if (/STRICT/.test(text)) strict.push(OpenKioskSession.parseFiltersLine(text));
        else all.push(OpenKioskSession.parseFiltersLine(text));
      }
    } while (more);

    OpenKioskSession.filtersData = strict.concat(all);
  },

  /**
   * Example formats for a line
   * allowed[www.brooklynmuseum.org/programs/, ALL, JAVASCRIPT];
   * allowed[www.mozilla.org/projects/firefox/, STRICT, NOJAVASCRIPT];
   */
  parseFiltersLine : function (aLine)
  {
    let rv = [];

    if (!aLine) return rv;

    try
    {
      let match = /\[([^\\]*)\]/.exec(aLine);

      if (!match) return rv;

      let [url, mode, jsenabled] = match[1].split(',');

      let uri = OpenKioskUtils.URIFixUpPerf(url);

      // if (!OpenKioskUtils.jsEnabled) jsenabled = "JAVASCRIPT";

      rv = [uri, OpenKioskUtils.stripWhiteSpace(mode), OpenKioskUtils.stripWhiteSpace(jsenabled)];
    }
      catch (e) { OpenKioskDebug.error(e); }

    // OpenKioskDebug.print("parseFiltersLine", rv);

    return rv;
  },

  initFiltersData : function ()
  {
    // OpenKioskDebug.print("INIT FILTERS DATA");
  
    this.parseFiltersData();

    // OpenKioskDebug.print("FILTERS DATA", this.filtersData);
  },

  wildcardMatch : function (aURI, aFilter)
  {
    let rv = false;

    try
    {
      // OpenKioskDebug.print("WILD CARD", "IN HOST", aURI.host, "FILTER HOST", aFilter.host.replace(/\*\./, ""));
      let r = aFilter.host.replace(/\*\./, "");

      rv = new RegExp(r).test(aURI.host);
    }
      catch (e) {}

    // OpenKioskDebug.print("WILDCARD MATCH", "HOST", aURI.host, "FILTER HOST", aFilter.host, aURI.spec, rv ? "PASS" : "FAIL");

    return rv;
  },

  pathMatch : function (aRequest, aFilter)
  {
    aRequest = aRequest.path;
    aFilter = aFilter.path;

    var filterLen;
    // Its not enough to check domains for regular URLs
    // e.g allowed[www.mozilla.org/projects/firefox/, ALL];
    filterLen = aFilter.length;
    reqLen = aRequest.len;

    // clean up filter root
    if (aFilter.charAt(filterLen-1) != "/")
    {
      aFilter += "/";
      filterLen = aFilter.length;
    }

    // There is method in the following madness!! - Brian
    choppedReq = aRequest.substring(0, filterLen);
    delimitChar = choppedReq.charAt(filterLen-1);

    if (delimitChar != "")
    {
      if (delimitChar == "/" && choppedReq == aFilter) return true;
    }
      else
    {
      choppedReq += "/";
    }

    if (choppedReq == aFilter) return true;

    OpenKioskDebug.print("PATH MATCH FAILED for URL", aRequest);
    return false;
  },

  // return true for matches whether white or black listed
  filterURI : function (aURI)
  {
    // OpenKioskDebug.print("FILTER URI", "FILTERS DATA", OpenKioskSession.filtersData);

    let rv = !OpenKioskSession.whitelistEnabled;

    for each ([uri, mode, jsenabled] in OpenKioskSession.filtersData)
    {
      // if javascript is empty then revert to default which is enabled
      let enableJS = (jsenabled != "NOJAVASCRIPT");

      // OpenKioskDebug.print(uri.spec, "jsenabled", jsenabled);

      // OpenKioskDebug.print(uri.spec, enableJS ? "TRUE" : "FALSE");

      // OpenKioskDebug.print("filter URI", uri.spec, "mode", mode);

      // OpenKioskDebug.print("EQUALS", uri.equals(aURI), "FILTER URI", uri.spec, "PAGE URI", aURI.spec, "JAVASCRIPT", enableJS, "WHITELIST ENABLED", OpenKioskSession.whitelistEnabled);

      let equalURIs = uri.equals(aURI);

      // this handles STRICT mode
      // if the URI's are equal then no need to proceed
      if (equalURIs) 
      {
        rv = OpenKioskSession.whitelistEnabled;

        OpenKioskUtils.handleJavascript(enableJS);

        break;
      }
 
      if (mode == "ALL")
      {
        if (OpenKioskSession.wildcardMatch(aURI, uri) && OpenKioskSession.pathMatch(aURI, uri))
        {
          // OpenKioskDebug.print("FILTERED URI", uri.spec, "IN URI", aURI.spec, "mode", mode, "enableJS", enableJS);

          OpenKioskUtils.handleJavascript(enableJS);

          rv = OpenKioskSession.whitelistEnabled;

          break;
        }
      }
    }

    // OpenKioskDebug.print(rv ? "TRUE" : "FALSE");

    return rv;
  },

  handleFilters : function (aURI, aReq)
  {
    // OpenKioskDebug.print("HANDLE FILTERS", "ENABLED", OpenKioskSession.filtersEnabled, "FILE", OpenKioskSession.filtersFile);

    if (!OpenKioskSession.filtersEnabled || OpenKioskAdmin.adminMode) return;

    if (OpenKioskUtils.exemptExceptProtocolURI(aURI)) return;

    if (!OpenKioskSession.filterURI(aURI)) 
    {
      OpenKioskDebug.print("BLOCKED URL", aURI.spec);
      OpenKioskUtils.cancelRequestAndLoadBlankPage(aReq);
      OpenKioskUtils.showBlockedURLNotification(aURI);
    }
  }
}

