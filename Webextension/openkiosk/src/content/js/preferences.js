// OPENKIOSK PREFERENCES

var gOpenKioskPane = 
{
  _inited: false,

  init: function ()
  {
    this._inited = true;
    OpenKioskPreferences.init();
    OpenKioskUtils.initCrypto();
  }
};

var OpenKioskPreferences =
{
                   _win : null,
                _inited : false,
  filtersTexboxModified : false,
        mFiltersTextBox : null,
         mFiltersButton : null,
           mFiltersFile : null,
    mDefaultFiltersFile : "chrome://openkiosk/content/filters.txt",

  init : function ()
  {
    this.mFiltersTextBox = document.getElementById("filtersEdit");
    this.mFiltersButton = document.getElementById("filtersSaveButton");

    try 
    { 
      this.mFiltersFile = Services.prefs.getComplexValue("openkiosk.filters.file", Ci.nsIFile); 

      if (this.mFiltersFile && !this.mFiltersFile.exists()) this.mFiltersFile = this.mDefaultFiltersFile;
    }
      catch (e) { this.mFiltersFile = this.mDefaultFiltersFile; }

    this.handleControls();

    function setEventListener(aId, aEventType, aCallback)
    {
      document.getElementById(aId).addEventListener(aEventType, aCallback.bind(OpenKioskPreferences));
    }

    setEventListener("openkioskPrefs", "select", OpenKioskPreferences.tabSelectionChanged);

    var pref = document.getElementById("openkiosk.preferences.selectedTabIndex");
    var okPrefs = document.getElementById("openkioskPrefs");

    if (pref.value != null) okPrefs.selectedIndex = pref.value;

    this.loadFilters();

    this._inited = true;
  },

  get window ()
  {
    var rv = this._win;

    if (rv) return rv;

    let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
    rv = wm.getMostRecentWindow("navigator:browser");

    return rv;
  },

  tabSelectionChanged: function ()
  {
    if (!this._inited) return;

    var okPrefs = document.getElementById("openkioskPrefs");
    var pref = document.getElementById("openkiosk.preferences.selectedTabIndex");

    pref.valueFromPreferences = okPrefs.selectedIndex;
  },

  openNewTab : function (aURL)
  {
    var win = this.window;

    if (win) 
    {
      let tab = win.gBrowser.addTab(aURL);
      win.gBrowser.selectedTab = tab;
    }
  },

  displayPassword : function ()
  {
    document.getElementById("password").value = this.window.OpenKioskAdmin.pass;
  },

  setPassword : function (aPass)
  {
    OpenKioskUtils.encryptAndSave(aPass);
    this.window.OpenKioskAdmin.pass = aPass;
  },

  resetPassword : function (aPass)
  {
    Services.prefs.clearUserPref("openkiosk.admin.password");

    // now get the default password
    let dp = Services.prefs.getCharPref("openkiosk.admin.password");
    document.getElementById("password").value = this.window.OpenKioskAdmin.pass = dp;
  },

  handleControls : function ()
  {
    let c = (Services.prefs.getIntPref("browser.link.open_newwindow") == 3);
    document.getElementById("enableTabs").checked = c; 

    this.displayPassword();
  },

  setFiltersButtonToSave : function ()
  {
    this.filtersButton.label = "Save";
  },

  setFiltersButtonToChoose : function ()
  {
    this.filtersButton.label = "Choose...";
  },

  handleFiltersTextInput : function ()
  {
    if (!this.filtersTextbox.value) 
    {
      this.setFiltersButtonToChoose();
      this.filtersTexboxModified = false;
      return;
    }

    if (this.filtersTexboxModified) return;

    this.setFiltersButtonToSave();

    this.filtersTexboxModified = true;
  },

  resetFiltersUI : function ()
  {
    // OpenKioskDebug.print("RESET FILTERS UI");

    OpenKioskPreferences.filtersTexboxModified = false;
    OpenKioskPreferences.setFiltersButtonToChoose();
    OpenKioskPreferences.window.OpenKioskSession.initFiltersData();
  },

  handleFiltersFile : function (aBtn)
  {
    let fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
   
    let title = "Filters File";
    let mode = aBtn.label == "Save" ? Ci.nsIFilePicker.modeSave : Ci.nsIFilePicker.modeOpen;

    fp.init(window, title, mode);
    fp.appendFilters(Ci.nsIFilePicker.filterText);

    if (mode == Ci.nsIFilePicker.modeSave) fp.defaultString = "filters.txt";

    let rv = fp.show();
    let f = fp.file;

    if (mode == Ci.nsIFilePicker.modeSave)
    {
      if (rv == Ci.nsIFilePicker.returnOK || rv == Ci.nsIFilePicker.returnReplace)
      {
        // OpenKioskDebug.print("WRITE TO FILE", f.path);
        OpenKioskUtils.writeToFile(this.filtersTextbox.value, f, OpenKioskPreferences.resetFiltersUI);
        this.filtersFile = f;
      }
    }

    if (mode == Ci.nsIFilePicker.modeOpen)
    {
      OpenKioskDebug.print("READ FILE", f.path);
      OpenKioskUtils.readFile(f, this.filtersTextbox);
    }
  },

  loadFilters : function ()
  {
    OpenKioskUtils.readURLIntoTextbox(this.filtersFile, this.filtersTextbox);
  },

  get filtersFile ()
  {
    return this.mFiltersFile || this.mDefaultFiltersFile;
  },

  // set an nsIFile object
  set filtersFile (aFile)
  {
    Services.prefs.setComplexValue("openkiosk.filters.file", Ci.nsIFile, aFile);
    
    this.mFiltersFile = aFile;
  },

  get filtersTextbox ()
  {
    return this.mFiltersTextBox; 
  },

  get filtersButton ()
  {
    return this.mFiltersButton; 
  },

  customizeToolbar : function ()
  {
    this.window.gCustomizeMode.toggle();
  },

  exit : function ()
  {
    this.window.OpenKioskAdmin.exit();
  },

  quit : function ()
  {
    Cc['@mozilla.org/toolkit/app-startup;1'].getService(Ci.nsIAppStartup).quit(Ci.nsIAppStartup.eAttemptQuit);
  }
};

