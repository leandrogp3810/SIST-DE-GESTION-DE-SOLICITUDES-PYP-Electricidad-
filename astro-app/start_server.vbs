Dim WShell
Set WShell = CreateObject("WScript.Shell")
WShell.CurrentDirectory = "C:\Users\leandro prado\Desktop\SIST-DE-GESTION-DE-SOLICITUDES-PYP-Electricidad-\astro-app"
' Ejecuta el comando para servir la pagina (preview usa el puerto 4321 por defecto)
' El 0 al final indica que se ejecute sin ventana (oculto)
WShell.Run "cmd /c npm run preview -- --host", 0
Set WShell = Nothing
