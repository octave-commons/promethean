---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Install Chocolatey Troubleshoot"
conversation_id: ce9db7cf-19c4-42df-a226-045f8508f516
create_time: 06/23/2024 at 2:11 PM
update_time: 06/23/2024 at 2:18 PM
---

# Title: Install Chocolatey Troubleshoot

Created: 06/23/2024 at 2:11 PM
Last Updated: 06/23/2024 at 2:18 PM
Chat URL: https://chat.openai.com/c/ce9db7cf-19c4-42df-a226-045f8508f516


>[!nexus_user] **User** - 06/23/2024 at 2:11 PM
> Restricted
> PS C:\Windows\system32> Set-ExecutionPolicy AllSigned
> 
> Execution Policy Change
> The execution policy helps protect you from scripts that you do not trust. Changing the execution policy might expose
> you to the security risks described in the about_Execution_Policies help topic at
> https:/go.microsoft.com/fwlink/?LinkID=135170. Do you want to change the execution policy?
> [Y] Yes [A] Yes to All [N] No [L] No to All [S] Suspend [?] Help (default is "N"): y
> PS C:\Windows\system32>
> PS C:\Windows\system32> Get-ExecutionPolicy
> AllSigned
> PS C:\Windows\system32> Set-ExecutionPolicy AllSigned^C
> PS C:\Windows\system32> ^C
> PS C:\Windows\system32> Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
> WARNING: An existing Chocolatey installation was detected. Installation will not continue. This script will not
> overwrite existing installations.
> If there is no Chocolatey installation at 'C:\ProgramData\chocolatey', delete the folder and attempt the installation
> again.
> 
> Please use choco upgrade chocolatey to handle upgrades of Chocolatey itself.
> If the existing installation is not functional or a prior installation did not complete, follow these steps:
>  - Backup the files at the path listed above so you can restore your previous installation if needed.
>  - Remove the existing installation manually.
>  - Rerun this installation script.
>  - Reinstall any packages previously installed, if needed (refer to the lib folder in the backup).
> 
> Once installation is completed, the backup folder is no longer needed and can be deleted.
> PS C:\Windows\system32> choco
> choco : The term 'choco' is not recognized as the name of a cmdlet, function, script file, or operable program. Check
> the spelling of the name, or if a path was included, verify that the path is correct and try again.
> At line:1 char:1
> + choco
> + ~~~~~
>  + CategoryInfo : ObjectNotFound: (choco:String) [], CommandNotFoundException
>  + FullyQualifiedErrorId : CommandNotFoundException
> 
> PS C:\Windows\system32>
<!-- UID: aaa29d32-3af3-4ea4-b3c9-1b106fa091b4 -->




>[!nexus_agent] **Assistant** - 06/23/2024 at 2:11 PM
> It seems like you are trying to install Chocolatey but encountered some issues. The error message indicates that the 'choco' command is not recognized, meaning Chocolatey is not installed correctly or its path is not set. Here's how you can troubleshoot and resolve this issue:
> 
> 1. **Check if Chocolatey is Installed:**
>  Verify if the Chocolatey installation folder exists:
> 
>  ```powershell
>  Get-ChildItem -Path C:\ProgramData\chocolatey
>  ```
> 
>  If the folder exists, Chocolatey might be partially installed or corrupted.
> 
> 2. **Remove Any Existing Chocolatey Installation:**
>  If you have a previous installation that is not functional, you can remove it manually:
> 
>  ```powershell
>  Remove-Item -Recurse -Force C:\ProgramData\chocolatey
>  ```
> 
> 3. **Reinstall Chocolatey:**
>  After removing any previous installation, you can try reinstalling Chocolatey using the following command:
> 
>  ```powershell
>  Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
>  ```
> 
> 4. **Verify the Installation:**
>  After running the installation script, verify if Chocolatey is installed correctly:
> 
>  ```powershell
>  choco -v
>  ```
> 
> 5. **Add Chocolatey to Path (if necessary):**
>  If `choco` is still not recognized, you might need to add Chocolatey to your system's PATH environment variable manually. Here’s how to do it:
> 
>  - Open the Environment Variables settings:
>  - Right-click on "This PC" or "Computer" on the desktop or in File Explorer.
>  - Select "Properties."
>  - Click on "Advanced system settings."
>  - Click on "Environment Variables."
> 
>  - In the "System variables" section, find the "Path" variable and select it.
>  - Click "Edit," then "New," and add the following path:
>  ```plaintext
>  C:\ProgramData\chocolatey\bin
>  ```
>  - Click "OK" to save and close all windows.
> 
> 6. **Restart PowerShell:**
>  Close and reopen PowerShell to apply the changes to the PATH variable.
> 
> 7. **Verify Again:**
>  Try running the `choco` command again to verify that it is now recognized.
> 
>  ```powershell
>  choco -v
>  ```
> 
> Following these steps should help you resolve the issue and get Chocolatey installed correctly on your system. If you encounter any further problems, please let me know!
<!-- UID: 2c97d9d1-9da8-47f7-90e1-871b27fd5bea -->

---




>[!nexus_user] **User** - 06/23/2024 at 2:18 PM
> $ bash shell/install-dependencies.sh
> Installing Love2D...
> Chocolatey v2.3.0
> Installing the following packages:
> love
> By installing, you accept licenses for the packages.
> Downloading package from source 'https://community.chocolatey.org/api/v2/'
> 
> love.install v11.5.0 [Approved] - Likely broken for FOSS users (due to download location changes)
> love.install package files install completed. Performing other installation steps.
> Downloading love.install 64 bit
>  from 'https://github.com/love2d/love/releases/download/11.5/love-11.5-win64.exe'
> Progress: 100% - Completed download of C:\Users\foamy\AppData\Local\Temp\chocolatey\love.install\11.5.0\love-11.5-win64.exe (4.03 MB).
> Download of love-11.5-win64.exe (4.03 MB) completed.
> Error - hashes do not match. Actual value was 'A91EC9BEB1EA9FA74ADA64C2DD9F052CE142077E718920EB91B059FCFB950FAA'.
> ERROR: Checksum for 'C:\Users\foamy\AppData\Local\Temp\chocolatey\love.install\11.5.0\love-11.5-win64.exe' did not meet '108d4ddab8f98c8572ea9b26a144ea8c77bc01cdce875209b366a8abc4b13924' for checksum type 'sha256'. Consider passing the actual checksums through with --checksum --checksum64 once you validate the checksums are appropriate. A less secure option is to pass --ignore-checksums if necessary.
> The install of love.install was NOT successful.
> Error while running 'C:\ProgramData\chocolatey\lib\love.install\tools\chocolateyinstall.ps1'.
>  See log for details.
> Downloading package from source 'https://community.chocolatey.org/api/v2/'
> Progress: Downloading love 11.5... 100%
> 
> love v11.5.0 [Approved] - Possibly broken
> love package files install completed. Performing other installation steps.
>  The install of love was successful.
>  Software install location not explicitly set, it could be in package or
>  default install location of installer.
> 
> Chocolatey installed 1/2 packages. 1 packages failed.
>  See the log for details (C:\ProgramData\chocolatey\logs\chocolatey.log).
> 
> Failures
>  - love.install (exited -1) - Error while running 'C:\ProgramData\chocolatey\lib\love.install\tools\chocolateyinstall.ps1'.
>  See log for details.
<!-- UID: aaa265d9-6654-4799-b414-52b8bb8b54df -->




>[!nexus_agent] **Assistant** - 06/23/2024 at 2:18 PM
> It appears that the `love.install` package failed due to a checksum mismatch, but the `love` package was successfully installed. The `love.install` package seems to be broken for some users. You can still use the installed `love` package, but if you prefer, you can manually download and install LÖVE2D. Here's how you can manually install it:
> 
> 1. **Download LÖVE2D:**
>  Go to the [official LÖVE2D download page](https://love2d.org/#download) and download the appropriate installer for your system.
> 
> 2. **Install LÖVE2D:**
>  Run the downloaded installer and follow the installation instructions.
> 
> 3. **Verify Installation:**
>  After installation, you can verify it by opening a command prompt or PowerShell and typing:
> 
>  ```powershell
>  love --version
>  ```
> 
>  This should display the version of LÖVE2D installed on your system.
> 
> Alternatively, you can use Chocolatey to install the `love` package directly without the `love.install` package:
> 
> ```powershell
> choco install love --ignore-checksums
> ```
> 
> This will bypass the checksum verification for the `love` package and should complete the installation process.
> 
> If you have any other questions or need further assistance, feel free to ask!
<!-- UID: 854296a3-e8ef-4c34-b164-d97cc500287c -->

---


