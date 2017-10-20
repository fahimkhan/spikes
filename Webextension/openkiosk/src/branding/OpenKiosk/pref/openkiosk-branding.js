/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

pref("startup.homepage_override_url", "");
pref("startup.homepage_welcome_url", "http://openkiosk.mozdevgroup.com/release47.html");
pref("startup.homepage_welcome_url.additional", "");
// Interval: Time between checks for a new version (in seconds)
pref("app.update.interval", 43200); // 12 hours
// The time interval between the downloading of mar file chunks in the
// background (in seconds)
pref("app.update.download.backgroundInterval", 60);
// Give the user x seconds to react before showing the big UI. default=48 hours
pref("app.update.promptWaitTime", 172800);
// URL user can browse to manually if for some reason all update installation
// attempts fail.
pref("app.update.url.manual", "https://www.mozilla.org/firefox/");
// A default value for the "More information about this update" link
// supplied in the "An update is available" page of the update wizard.
pref("app.update.url.details", "https://www.mozilla.org/%LOCALE%/firefox/notes");

// The number of days a binary is permitted to be old
// without checking for an update.  This assumes that
// app.update.checkInstallTime is true.
pref("app.update.checkInstallTime.days", 63);

// Give the user x seconds to reboot before showing a badge on the hamburger
// button. default=immediately
pref("app.update.badgeWaitTime", 0);

// Number of usages of the web console or scratchpad.
// If this is less than 5, then pasting code into the web console or scratchpad is disabled
pref("devtools.selfxss.count", 0);

// pref("app.vendorURL", "http://localhost/app-dummy/");
// pref("app.releaseNotesURL", "http://localhost/app-dummy/");

/** 
 * BEGIN OPENKIOSK PREFS
 */

// Screens
pref("openkiosk.attractscreen.enabled", false);
pref("openkiosk.attractscreen.url", "");

pref("openkiosk.fullscreen.enabled", false);
pref("openkiosk.fullscreen.url", "");

pref("openkiosk.redirectscreen.enabled", false);
pref("openkiosk.redirectscreen.url", "");

// Admin
pref("openkiosk.admin.password", "admin");
pref("openkiosk.admin.mode", false);

/**
 *  Preferences
 */
pref("openkiosk.preferences.selectedTabIndex", 0);

// General
pref("openkiosk.tabs.enabled", true);

// UI
pref("openkiosk.ui.personalbar.enabled", false);
pref("openkiosk.ui.personalbar.bookmarks.enabled", false);
pref("openkiosk.ui.urlbar.enabled", true);
pref("openkiosk.ui.context.search.enabled", true);

// Filters
pref("openkiosk.filters.enabled", false);
pref("openkiosk.filters.file", "");
pref("openkiosk.filters.whitelist.enabled", true);
pref("openkiosk.filters.protocol.about.enabled", false);
pref("openkiosk.filters.protocol.data.enabled", true);
pref("openkiosk.filters.protocol.email.enabled", false);
pref("openkiosk.filters.protocol.file.enabled", false);
pref("openkiosk.filters.protocol.ftp.enabled", false);
pref("openkiosk.filters.protocol.res.enabled", false);
pref("openkiosk.filters.protocol.viewsource.enabled", false);
pref("openkiosk.filters.protocol.javascript.enabled", false);

// session
pref("openkiosk.session.inactiveTerminal.enabled", true);
pref("openkiosk.session.inactiveTerminal.warn.enabled", true);
pref("openkiosk.session.inactiveTerminal.minutes", 5);
pref("openkiosk.session.inactiveTerminal.seconds", 0);
pref("openkiosk.session.inactiveTerminal.warn.seconds", 10);
pref("openkiosk.session.diskcache.enabled", false);
pref("openkiosk.session.history.enabled", false);
pref("openkiosk.session.cookies.enabled", false);
pref("openkiosk.session.aup.enabled", false);
pref("openkiosk.session.aup.url", "http://openkiosk.mozdevgroup.com/AUP.html");
pref("openkiosk.session.aup.accepted", false);

// buttons
pref("openkiosk.reset.buttontext", "Continue Session");

// admin
pref("openkiosk.admin.clearsession.onexit.enabled", true);

// file upload
pref("openkiosk.file.upload.enabled", false);

// keys
pref("openkiosk.keys.navigation.enabled", true);

// downloads
pref("openkiosk.downloads.enabled", false);

// web printing
pref("openkiosk.print.silent.enabled", true);
pref("openkiosk.print.web.enabled", false);

// enable javascript
pref("openkiosk.javascript.enabled", true);

// crypto
pref("openkiosk.crypto.key", "6f2d54080295e91fb151d85acd6885ae");

// about
pref("app.releaseNotesURL", "");
pref("app.vendorURL", "openkiosk.mozdevgroup.com");

// content frame
pref("openkiosk.contentframe.observers.added", false);

