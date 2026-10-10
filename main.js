// Boot: wire global controls and show the start screen
$('#snd').onclick=()=>{S.soundEnabled=!S.soundEnabled;hud();save()};
menu();
