#Requires AutoHotkey v2.0
#SingleInstance Force

; ============================================
;  PRESSINGSANA - LAUNCHER
;  Node.js/Express — Port 3000
; ============================================

BaseDir   := "D:\Pressing_Lab\GESTION\CORE\V3\pressingsana"
ServerBat := BaseDir "\START.bat"
IconFile  := BaseDir "\app.ico"
FIXED_URL := "http://localhost:3000"

; ========== DETECTION SERVEUR ==========
; On ping HTTP uniquement — pas de check ProcessExist
; car node.exe peut être wrappé ou prendre du temps à démarrer

IsServerRunning() {
    try {
        req := ComObject("WinHttp.WinHttpRequest.5.1")
        req.Open("GET", "http://localhost:3000", false)
        req.SetTimeouts(1000, 1000, 1000, 1000)
        req.Send()
        return (req.Status >= 200 && req.Status < 500)
    } catch {
        return false
    }
}

UpdateServerIndicator() {
    global IndicatorText, StatusText
    if (IsServerRunning()) {
        IndicatorText.Value := "🟢 SERVEUR ACTIF"
        IndicatorText.SetFont("cLime")
        StatusText.Value := "✅ Serveur opérationnel"
    } else {
        IndicatorText.Value := "🔴 SERVEUR INACTIF"
        IndicatorText.SetFont("cRed")
        StatusText.Value := "⏳ En attente du serveur..."
    }
}

; ============================================
;  INTERFACE GRAPHIQUE
; ============================================
MyGui := Gui("+AlwaysOnTop +Resize +MinSize500x500", "PressingSana")
MyGui.BackColor := "0a1929"
MyGui.MarginX   := 50
MyGui.MarginY   := 20

if FileExist(IconFile)
    MyGui.Icon := IconFile

MyGui.SetFont("s24 cWhite bold", "Segoe UI")
MyGui.Add("Text", "Center xm w400", "PRESSINGSANA")
MyGui.SetFont("s12 cFFD700", "Segoe UI")
MyGui.Add("Text", "Center xm w400 y+10", "Gestion de pressing — Ouagadougou")
MyGui.Add("Text", "h30", "")

MyGui.SetFont("s11 bold", "Segoe UI")
IndicatorText := MyGui.Add("Text", "Center xm w400", "🔴 SERVEUR INACTIF")
IndicatorText.SetFont("cRed")
MyGui.Add("Text", "h15", "")

MyGui.SetFont("s14 cBlack bold", "Segoe UI")
BtnStart := MyGui.Add("Button", "Center xm w400 h55 BackgroundYellow", "🚀 1. DEMARRER LE SERVEUR")
BtnStart.OnEvent("Click", StartServer)

BtnOpen := MyGui.Add("Button", "Center xm w400 h55 BackgroundWhite", "🌐 2. OUVRIR L'APPLICATION")
BtnOpen.OnEvent("Click", OpenApp)

BtnStop := MyGui.Add("Button", "Center xm w400 h55 BackgroundRed", "🛑 3. ARRETER LE SERVEUR")
BtnStop.OnEvent("Click", StopServer)

MyGui.Add("Text", "h15", "")
MyGui.SetFont("s10 cWhite", "Segoe UI")
StatusText := MyGui.Add("Text", "Center xm w400", "⏳ En attente du serveur...")
MyGui.SetFont("s8 cGray", "Segoe UI")
MyGui.Add("Text", "Center xm w400", "Serveur: " FIXED_URL)

MyGui.Show("AutoSize Center")

; Vérification immédiate + timer toutes les 2 secondes
UpdateServerIndicator()
SetTimer(UpdateServerIndicator, 2000)

; ============================================
;  FONCTIONS DES BOUTONS
; ============================================
StartServer(*) {
    global StatusText, ServerBat
    try {
        Run('"' ServerBat '"',, "Hide")
        StatusText.Value := "⏳ Démarrage en cours..."
        ; Vérifier toutes les 500ms pendant 10 secondes max
        loop 20 {
            Sleep(500)
            if IsServerRunning() {
                UpdateServerIndicator()
                return
            }
        }
        UpdateServerIndicator()
    } catch as err {
        StatusText.Value := "❌ Erreur: " err.Message
    }
}

OpenApp(*) {
    global FIXED_URL, StatusText
    try {
        Run(FIXED_URL)
        Sleep(500)
        ExitApp
    } catch as err {
        StatusText.Value := "❌ Erreur ouverture: " err.Message
    }
}

StopServer(*) {
    global StatusText
    try {
        RunWait('taskkill /F /IM node.exe',, "Hide")
        StatusText.Value := "🛑 Serveur arrêté"
        UpdateServerIndicator()
    } catch as err {
        StatusText.Value := "❌ Erreur arrêt: " err.Message
    }
}
