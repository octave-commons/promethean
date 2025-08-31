---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Install Latest Emacs Ubuntu"
conversation_id: c686dcfd-0243-438f-ab84-75390997765c
create_time: 07/17/2023 at 6:20 AM
update_time: 07/17/2023 at 6:20 AM
---

# Title: Install Latest Emacs Ubuntu

Created: 07/17/2023 at 6:20 AM
Last Updated: 07/17/2023 at 6:20 AM
Chat URL: https://chat.openai.com/c/c686dcfd-0243-438f-ab84-75390997765c


>[!nexus_user] **User** - 07/17/2023 at 6:20 AM
> How do I install the latest emacs on ubuntu?
<!-- UID: aaa28ac0-b35a-4684-b652-94762c10ad13 -->




>[!nexus_agent] **Assistant** - 07/17/2023 at 6:20 AM
> To install the latest version of Emacs on Ubuntu, you can follow these steps:
> 
> 1. Update the package lists on your system by opening a terminal and running the following command:
>  ```
>  sudo apt update
>  ```
> 
> 2. Install Emacs by executing the following command:
>  ```
>  sudo apt install emacs
>  ```
> 
> By default, Ubuntu's package repositories may not always have the latest version of Emacs. If you specifically want the most up-to-date version, you can use a PPA (Personal Package Archive) that provides the latest Emacs packages. Here's how you can do that:
> 
> 1. Add the Emacs PPA to your system by running the following command:
>  ```
>  sudo add-apt-repository ppa:kelleyk/emacs
>  ```
> 
> 2. Update the package lists again by running:
>  ```
>  sudo apt update
>  ```
> 
> 3. Install Emacs using the PPA by running:
>  ```
>  sudo apt install emacs27
>  ```
> 
>  Note: The package name `emacs27` is used in this example, as it represents the latest stable version available at the time of writing. Please verify the latest version available in the PPA and adjust the package name accordingly.
> 
> After the installation is complete, you can launch Emacs by typing `emacs` in the terminal or searching for "Emacs" in the application launcher.
<!-- UID: a4224bb7-6804-4da7-aa53-363e407dd912 -->

---


