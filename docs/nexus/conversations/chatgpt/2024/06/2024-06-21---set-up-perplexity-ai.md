---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Set Up Perplexity AI"
conversation_id: 952a0584-ea39-40a2-8ef7-8f1da8596d89
create_time: 06/21/2024 at 2:33 PM
update_time: 06/21/2024 at 2:33 PM
---

# Title: Set Up Perplexity AI

Created: 06/21/2024 at 2:33 PM
Last Updated: 06/21/2024 at 2:33 PM
Chat URL: https://chat.openai.com/c/952a0584-ea39-40a2-8ef7-8f1da8596d89


>[!nexus_user] **User** - 06/21/2024 at 2:33 PM
> To set up environment variables for Perplexity AI on Windows 11, follow these detailed steps. This guide will help you configure your system to use the Perplexity AI API effectively.
> 
> ## Step-by-Step Instructions
> 
> ### 1. Obtain Your API Key
> First, ensure you have your API key from Perplexity AI. This key is necessary for authenticating your requests to the Perplexity API.
> 
> ### 2. Set Up Environment Variables
> 
> #### Method 1: Using the System Properties
> 
> 1. **Open System Properties**:
>  - Press `Win + I` to open the Settings menu.
>  - Scroll down and click on "About."
>  - Click on "Advanced system settings" under the "Device specifications" section.
> 
> 2. **Access Environment Variables**:
>  - In the System Properties window, click on the "Advanced" tab.
>  - Click the "Environment Variables" button near the bottom-right of the tab.
> 
> 3. **Add a New Environment Variable**:
>  - In the Environment Variables window, you will see two sections: "User variables" and "System variables."
>  - Click "New" under the "User variables" section to create a new environment variable.
> 
> 4. **Set the Variable Name and Value**:
>  - In the "New User Variable" dialog, enter `PERPLEXITY_API_KEY` as the variable name.
>  - Enter your API key as the variable value.
>  - Click "OK" to save the new variable.
> 
> 5. **Confirm and Apply**:
>  - Click "OK" again to close the Environment Variables window.
>  - Click "OK" to close the System Properties window.
> 
> #### Method 2: Using Command Prompt
> 
> 1. **Open Command Prompt**:
>  - Press `Win + R`, type `cmd`, and press `Enter` to open Command Prompt.
> 
> 2. **Set the Environment Variable**:
>  - Use the `setx` command to create a new environment variable. Replace `your_api_key` with your actual API key:
>  ```bash
>  setx PERPLEXITY_API_KEY "your_api_key"
>  ```
> 
> 3. **Verify the Variable**:
>  - To verify that the environment variable has been set, you can use the `echo` command:
>  ```bash
>  echo %PERPLEXITY_API_KEY%
>  ```
> 
> #### Method 3: Using PowerShell
> 
> 1. **Open PowerShell**:
>  - Press `Win + X` and select "Windows PowerShell (Admin)" to open PowerShell with administrative privileges.
> 
> 2. **Set the Environment Variable**:
>  - Use the `[Environment]::SetEnvironmentVariable` method to create a new environment variable. Replace `your_api_key` with your actual API key:
>  ```powershell
>  [Environment]::SetEnvironmentVariable("PERPLEXITY_API_KEY", "your_api_key", "User")
>  ```
> 
> 3. **Verify the Variable**:
>  - To verify that the environment variable has been set, you can use the `Get-ChildItem` command:
>  ```powershell
>  Get-ChildItem Env:PERPLEXITY_API_KEY
>  ```
> 
> ### 3. Using the Environment Variable in Your Project
> 
> Once the environment variable is set, you can use it in your Python scripts or other applications. Here’s an example of how to use it in a Python script:
> 
> ```python
> import os
> 
> # Retrieve the API key from the environment variable
> api_key = os.getenv("PERPLEXITY_API_KEY")
> 
> # Use the API key in your application
> print(f"Your Perplexity API key is: {api_key}")
> ```
> 
> ### Additional Resources
> 
> - **Perplexity AI Toolkit**: For more advanced usage and configuration, you can refer to the [Perplexity AI Toolkit on GitHub](https://github.com/RMNCLDYO/perplexity-ai-toolkit)[3].
> - **Video Tutorials**: For visual learners, you can watch tutorials on setting environment variables on Windows 11, such as [this YouTube video](https://www.youtube.com/watch?v=ow2jROvxyH4)[14].
> 
> By following these steps, you can successfully set up environment variables for Perplexity AI on Windows 11, allowing you to integrate and use the Perplexity API in your projects.
> 
> Citations:
> [1] https://www.reddit.com/r/LocalLLaMA/comments/1bg3ug0/working_on_opensource_perplexity_ai/
> [2] https://answers.microsoft.com/en-us/windows/forum/all/change-system-variables-on-windows-11/f172c29e-fd9e-4f0b-949d-c4696bd656b8
> [3] https://github.com/RMNCLDYO/perplexity-ai-toolkit
> [4] https://answers.microsoft.com/en-us/windows/forum/all/edit-environment-variable/6214727b-7ea6-49d3-a085-2e3261057c77
> [5] https://www.youtube.com/watch?v=46XRqjOjzE0
> [6] https://www.anoopcnair.com/set-up-environment-variables-on-windows-11/
> [7] https://docs.perplexity.ai/docs/getting-started
> [8] https://www.alphr.com/set-environment-variables-windows-11/
> [9] https://www.youtube.com/watch?v=gz3z_YGAVwk
> [10] https://www.computerhope.com/issues/ch000549.htm
> [11] https://github.com/RMNCLDYO/perplexity-ai-toolkit/blob/main/.github/CHANGELOG.md
> [12] https://www.howtogeek.com/787217/how-to-edit-environment-variables-on-windows-10-or-11/
> [13] https://www.yeschat.ai/blog-How-to-Create-and-Use-Perplexity-Personal-AI-Chatbot-Agents-95-14089
> [14] https://www.youtube.com/watch?v=ow2jROvxyH4
> [15] https://www.youtube.com/watch?v=JimBiXaL1nY
> [16] https://www.elevenforum.com/t/create-new-environment-variables-in-windows-11.22062/
<!-- UID: aaa26ed9-88c0-4dd5-a71b-6188041565f5 -->




>[!nexus_agent] **Assistant** - 06/21/2024 at 2:33 PM
> The provided instructions offer a comprehensive guide to setting up environment variables for Perplexity AI on Windows 11. Here’s a simplified and refined version:
> 
> ### Step-by-Step Guide to Setting Up Environment Variables for Perplexity AI on Windows 11
> 
> #### 1. Obtain Your API Key
> Ensure you have your API key from Perplexity AI. This key is essential for authenticating your requests.
> 
> #### 2. Set Up Environment Variables
> 
> ##### Method 1: Using System Properties
> 
> 1. **Open System Properties**:
>  - Press `Win + I` to open Settings.
>  - Scroll down and click on "About."
>  - Click on "Advanced system settings."
> 
> 2. **Access Environment Variables**:
>  - In the System Properties window, go to the "Advanced" tab.
>  - Click the "Environment Variables" button.
> 
> 3. **Add a New Environment Variable**:
>  - Under "User variables," click "New."
>  - Enter `PERPLEXITY_API_KEY` as the variable name.
>  - Enter your API key as the variable value.
>  - Click "OK" to save.
> 
> 4. **Confirm and Apply**:
>  - Click "OK" to close the Environment Variables window.
>  - Click "OK" to close the System Properties window.
> 
> ##### Method 2: Using Command Prompt
> 
> 1. **Open Command Prompt**:
>  - Press `Win + R`, type `cmd`, and press `Enter`.
> 
> 2. **Set the Environment Variable**:
>  - Enter the following command, replacing `your_api_key` with your actual API key:
>  ```cmd
>  setx PERPLEXITY_API_KEY "your_api_key"
>  ```
> 
> 3. **Verify the Variable**:
>  - Use the `echo` command to verify:
>  ```cmd
>  echo %PERPLEXITY_API_KEY%
>  ```
> 
> ##### Method 3: Using PowerShell
> 
> 1. **Open PowerShell**:
>  - Press `Win + X` and select "Windows PowerShell (Admin)."
> 
> 2. **Set the Environment Variable**:
>  - Enter the following command, replacing `your_api_key` with your actual API key:
>  ```powershell
>  [Environment]::SetEnvironmentVariable("PERPLEXITY_API_KEY", "your_api_key", "User")
>  ```
> 
> 3. **Verify the Variable**:
>  - Use the `Get-ChildItem` command to verify:
>  ```powershell
>  Get-ChildItem Env:PERPLEXITY_API_KEY
>  ```
> 
> #### 3. Using the Environment Variable in Your Project
> 
> Here's how to use the environment variable in a Python script:
> 
> ```python
> import os
> 
> # Retrieve the API key from the environment variable
> api_key = os.getenv("PERPLEXITY_API_KEY")
> 
> # Use the API key in your application
> print(f"Your Perplexity API key is: {api_key}")
> ```
> 
> ### Additional Resources
> 
> - **Perplexity AI Toolkit**: For more advanced usage, refer to the [Perplexity AI Toolkit on GitHub](https://github.com/RMNCLDYO/perplexity-ai-toolkit).
> - **Video Tutorials**: For visual guidance, watch [this YouTube video](https://www.youtube.com/watch?v=ow2jROvxyH4).
> 
> By following these steps, you can successfully set up environment variables for Perplexity AI on Windows 11, allowing you to integrate and use the Perplexity API in your projects.
<!-- UID: 3d89a7e5-a58f-4beb-9672-b73317d13587 -->

---


