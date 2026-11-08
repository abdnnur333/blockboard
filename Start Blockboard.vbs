Option Explicit

Dim shell, fso, folder, url, chrome
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
folder = fso.GetParentFolderName(WScript.ScriptFullName)

' If you use the hosted version (GitHub Pages), put its address here
' and the local server below is skipped automatically.
url = "http://localhost:4173/index.html"

If InStr(url, "localhost") > 0 Then
  shell.Run "py -m http.server 4173 --directory """ & folder & """", 0, False
  WScript.Sleep 1500
End If

chrome = shell.ExpandEnvironmentStrings("%ProgramFiles%") & "\Google\Chrome\Application\chrome.exe"
If Not fso.FileExists(chrome) Then chrome = shell.ExpandEnvironmentStrings("%ProgramFiles(x86)%") & "\Google\Chrome\Application\chrome.exe"
If Not fso.FileExists(chrome) Then chrome = shell.ExpandEnvironmentStrings("%LocalAppData%") & "\Google\Chrome\Application\chrome.exe"

If fso.FileExists(chrome) Then
  ' --app opens its own window, no tabs or address bar, like a desktop app
  shell.Run """" & chrome & """ --app=" & url, 1, False
Else
  shell.Run url, 1, False
End If
