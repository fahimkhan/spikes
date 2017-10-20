
#ok-reset-button
{
  list-style-image : url("chrome://openkiosk/skin/reset.png") !important;
}

#ok-context-home
{
  list-style-image : url("chrome://openkiosk/skin/home-black.png") !important;
}

#main-window[tabsintitlebar] #TabsToolbar,
#main-window[tabsintitlebar] #toolbar-menubar,
#main-window[tabsintitlebar] #navigator-toolbox > toolbar:-moz-lwtheme 
{
  -moz-window-dragging : no-drag;
}

#main-window:not([customizing]) #navigator-toolbox[inFullscreen] > #TabsToolbar:not(:-moz-lwtheme),
#main-window:not(:-moz-any([customizing],[tabsintitlebar])) #navigator-toolbox > #TabsToolbar:not(:-moz-lwtheme) {
  -moz-appearance: none !important;
}

#ok-aup
{
  background: -moz-Dialog;
  padding: 20em;
  font: message-box;
}

#aup-browser
{
  color: -moz-FieldText;
  position: relative;
  border: 1px solid ThreeDShadow;
  border-radius: 10px;
  padding: 3em;
  padding-inline-start: 30px;
  background: -moz-Field;
}

