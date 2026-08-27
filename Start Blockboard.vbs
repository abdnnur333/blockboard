Option Explicit

Dim shell, folder, serverCommand
Set shell = CreateObject("WScript.Shell")
folder = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
serverCommand = "py -m http.server 4173 --directory """ & folder & """"
shell.Run serverCommand, 0, False
shell.Run "http://localhost:4173/index.html", 1, False
Set shell = Nothing
