
<!-- OPENKIOSK KEYSETS -->
<keyset id="mainKeyset">
  <key keycode="VK_F1" oncommand="OpenKioskAdmin.login();" modifiers="shift" />
<keyset id="sbKeyset">
    <key keycode="VK_F9" oncommand="OpenKioskAdmin.quitFromKeys();" modifiers="shift" />
</keyset>
</keyset>

<broadcasterset id="okBroadcasterSet">
  <broadcaster id="OpenKiosk:Tabs" />
</broadcasterset>
