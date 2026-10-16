-- SWF Cheat Menu / RPG Maker MV-MZ
-- Finder application: no Terminal, Python, or manual chmod required.
on run
    set appRoot to POSIX path of (path to me)
    if appRoot does not end with "/" then set appRoot to appRoot & "/"
    set resourceRoot to appRoot & "Contents/Resources/"
    set cpuType to do shell script "/usr/bin/uname -m"
    if cpuType is "arm64" then
        set cpuType to "arm64"
    else if cpuType is "x86_64" then
        set cpuType to "amd64"
    else
        display alert "Unsupported Mac" message "This Mac architecture is not supported: " & cpuType as critical
        return
    end if

    set setupTool to resourceRoot & "swf-setup-macos-" & cpuType
    try
        do shell script "/usr/bin/test -x " & quoted form of setupTool
    on error
        display alert "Installer is incomplete" message "The app is missing its executable installer. Please extract the complete ZIP again." as critical
        return
    end try
    set payloadPath to resourceRoot & "SWF_CheatMenu.js"
    try
        do shell script "/usr/bin/test -f " & quoted form of payloadPath
    on error
        display alert "Plugin is missing" message "This app does not contain SWF_CheatMenu.js. Extract the complete ZIP again." as critical
        return
    end try

    repeat
        try
            set chosenFolder to choose folder with prompt "Select the RPG Maker MV/MZ game folder (the one containing www or js)."
        on error number -128
            return
        end try
        set gameRoot to POSIX path of chosenFolder
        set validFolder to false
        try
            do shell script "/usr/bin/test -f " & quoted form of (gameRoot & "www/js/main.js") & " && /usr/bin/test -f " & quoted form of (gameRoot & "www/js/plugins.js")
            set validFolder to true
        on error
            try
                do shell script "/usr/bin/test -f " & quoted form of (gameRoot & "js/main.js") & " && /usr/bin/test -f " & quoted form of (gameRoot & "js/plugins.js")
                set validFolder to true
            end try
        end try
        if validFolder then exit repeat
        set answerButton to button returned of (display dialog "This folder does not contain an RPG Maker MV/MZ game. Choose the game folder that contains www/js or js." buttons {"Cancel", "Choose Again"} default button "Choose Again" with title "Wrong folder")
        if answerButton is "Cancel" then return
    end repeat

    set runLine to quoted form of setupTool & " install " & quoted form of gameRoot & " " & quoted form of payloadPath
    try
        set resultText to do shell script runLine
        display dialog "SWF Cheat Menu installed / updated successfully." & return & return & resultText buttons {"OK"} default button "OK" with title "SWF Cheat Menu"
    on error errorText number errorNumber
        display alert "SWF Cheat Menu: operation failed" message errorText as critical
    end try
end run
