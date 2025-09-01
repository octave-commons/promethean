---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Set up i3 on WSL"
conversation_id: dcdddae2-ab46-4896-ad7a-73b79f63a4b0
create_time: 07/04/2024 at 9:04 AM
update_time: 07/04/2024 at 9:14 AM
---

# Title: Set up i3 on WSL

Created: 07/04/2024 at 9:04 AM
Last Updated: 07/04/2024 at 9:14 AM
Chat URL: https://chat.openai.com/c/dcdddae2-ab46-4896-ad7a-73b79f63a4b0


>[!nexus_user] **User** - 07/04/2024 at 9:04 AM
> x11 windows i3 wsl 2
<!-- UID: aaa2467a-a84b-4e30-9ec2-618c46ae4f4f -->




>[!nexus_agent] **Assistant** - 07/04/2024 at 9:05 AM
> To set up and use X11 windows with i3 on WSL 2, follow these steps:
> 
> ### Prerequisites
> 1. **WSL 2**: Ensure you have WSL 2 installed and configured on your Windows system.
> 2. **Distro**: Have a Linux distribution installed (e.g., Ubuntu).
> 
> ### Step-by-Step Guide
> 
> #### 1. Install X Server on Windows
> You need an X server on Windows to display GUI applications. One popular choice is [VcXsrv](https://sourceforge.net/projects/vcxsrv/).
> 
> - Download and install VcXsrv.
> - Run `xlaunch` and configure it:
>  - Select "Multiple windows".
>  - Start no client.
>  - Disable access control (optional, for easier setup).
> 
> #### 2. Configure WSL
> Edit the WSL configuration to set the DISPLAY environment variable correctly.
> 
> - Open your WSL terminal and add the following lines to your `~/.bashrc` or `~/.profile`:
> 
> ```sh
> export DISPLAY=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}'):0.0
> ```
> 
> - Reload the profile with `source ~/.bashrc` or `source ~/.profile`.
> 
> #### 3. Install i3 Window Manager
> Install i3 and necessary dependencies on your WSL distribution.
> 
> ```sh
> sudo apt update
> sudo apt install i3 x11-apps
> ```
> 
> #### 4. Start VcXsrv
> Ensure VcXsrv is running on your Windows machine.
> 
> #### 5. Start i3 in WSL
> Now, you can start i3 from your WSL terminal.
> 
> ```sh
> i3
> ```
> 
> #### 6. Test X11 Applications
> To ensure everything is set up correctly, you can test with a simple X11 application like `xclock`.
> 
> ```sh
> xclock
> ```
> 
> If `xclock` or any other X11 application opens in a window, your setup is working correctly.
> 
> #### 7. Configure i3 (Optional)
> You can further configure i3 by editing its configuration file located at `~/.config/i3/config`.
> 
> ### Additional Tips
> 
> - **Startup Script**: You might want to create a script to start VcXsrv and i3 together for convenience.
> - **Performance**: Running GUI applications in WSL 2 might not be as fast as on a native Linux system. Adjust your expectations accordingly.
> - **Updates**: Keep your X server and Linux distribution updated for the latest features and security patches.
> 
> By following these steps, you should be able to run i3 window manager and X11 applications on your WSL 2 setup.
<!-- UID: c35e9aa6-f391-41e1-8663-244cddd6f874 -->

---


