---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Docker SonarQube error fix"
conversation_id: 68b5e55e-3bf4-8325-a8b6-eb2276993107
create_time: 09/01/2025 at 1:26 PM
update_time: 09/01/2025 at 1:28 PM
---

# Title: Docker SonarQube error fix

Created: 09/01/2025 at 1:26 PM
Last Updated: 09/01/2025 at 1:28 PM
Chat URL: https://chat.openai.com/c/68b5e55e-3bf4-8325-a8b6-eb2276993107


>[!nexus_user] **User** - 09/01/2025 at 1:26 PM
> 01:22:21 err@err-Stealth-16-AI-Studio-A1VGG promethean ±|dev/stealth ✗|→ docker compose start service "sonarqube" has no container to start
<!-- UID: ced0ec01-1e66-4fa0-8e22-3929223389c6 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 1:26 PM
> ​The error message you're encountering—`docker compose start service "sonarqube" has no container to start`—indicates that the SonarQube container hasn't been created yet. The `docker compose start` command only starts existing containers; it doesn't create them.
> 
> ### Steps to Resolve
> 
> 1. **Verify Service Definition**: Ensure that your `docker-compose.yml` file includes a service named `sonarqube`. The service name is defined under the `services` section, like so:
> 
>  ```yaml
>  services:
>  sonarqube:
>  image: sonarqube:latest
>  ports:
>  - "9000:9000"
>  environment:
>  - SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true
>  ```
> 
> 2. **Create and Start Containers**: If the service is correctly defined, you can create and start the containers using:
> 
>  ```bash
>  docker compose up -d
>  ```
> 
>  This command builds (if necessary), creates, and starts the containers in detached mode.
> 
> 3. **Check Container Status**: After running the above command, verify that the containers are running:
> 
>  ```bash
>  docker compose ps
>  ```
> 
>  This will list the status of all services defined in your `docker-compose.yml`.
> 
> 4. **Review Logs for Errors**: If the SonarQube container isn't running as expected, check its logs for any errors:
> 
>  ```bash
>  docker compose logs sonarqube
>  ```
> 
>  This will provide insight into any issues that occurred during startup.
> 
> ### Additional Tips
> 
> - **Ensure You're in the Correct Directory**: The `docker compose` commands should be run from the directory containing your `docker-compose.yml` file.
> 
> - **Avoid Deprecated Commands**: Previously, `docker-compose create` was used to create containers without starting them, but this command is now deprecated. Instead, you can use:
> 
>  
> ```bash
>  docker compose up --no-start
>  ```
> 
>  This will create the containers without starting them, allowing you to start them later with `docker compose start`.
> 
> If you continue to experience issues, please provide the contents of your `docker-compose.yml` file, and I can offer more targeted assistance.
<!-- UID: 62c4e380-bbd8-4373-a28a-78c874aed516 -->

---




>[!nexus_user] **User** - 09/01/2025 at 1:28 PM
> how do I make my docker compose persist between system boots
<!-- UID: 5c64c2c2-f882-4403-abcf-b20111e50c97 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 1:28 PM
> Short version: use **restart policies** in your `docker-compose.yml` so containers come back after a reboot, **persist data with volumes**, and (optionally) wrap the compose project in a **systemd unit** so it’s brought up at boot in a known order.
> 
> ### 1) Make Docker itself start on boot
> ```bash
> sudo systemctl enable docker.service
> sudo systemctl enable containerd.service
> ```
> This ensures the Docker daemon is running after reboot. cite
> 
> ### 2) Add restart policies in `docker-compose.yml`
> ```yaml
> services:
>  sonarqube:
>  image: sonarqube:latest
>  restart: always # or: unless-stopped
>  ports: ["9000:9000"]
>  volumes:
>  - sonarqube_data:/opt/sonarqube/data
>  - sonarqube_logs:/opt/sonarqube/logs
> 
> volumes:
>  sonarqube_data:
>  sonarqube_logs:
> ```
> - `restart: always` means the container starts whenever Docker starts (e.g., after a reboot) and keeps retrying if it crashes. `unless-stopped` is similar but won’t auto-start if you previously stopped it manually. cite 
> - Use **named volumes** for data so it survives container recreation. cite
> 
> ### 3) (Optional, but solid) Manage the stack with systemd
> If you want the whole compose project to come up on boot (even if you didn’t set `restart:` on every service), create a systemd unit. Replace `/path/to/project` with your repo path.
> 
> `/etc/systemd/system/promethean-compose.service`
> ```ini
> [Unit]
> Description=Promethean Docker Compose stack
> Requires=docker.service
> After=docker.service network-online.target
> 
> [Service]
> Type=oneshot
> WorkingDirectory=/path/to/project
> ExecStart=/usr/bin/docker compose up -d
> ExecStop=/usr/bin/docker compose stop
> RemainAfterExit=yes
> TimeoutStartSec=0
> 
> [Install]
> WantedBy=multi-user.target
> ```
> 
> Enable it:
> ```bash
> sudo systemctl daemon-reload
> sudo systemctl enable promethean-compose.service
> sudo systemctl start promethean-compose.service
> ```
> This pattern is widely used for bringing a Compose stack up on boot and stopping it cleanly on shutdown. cite
> 
> ---
> 
> ### Sanity check commands
> - See what’s running: `docker compose ps` 
> - Logs for a service: `docker compose logs -f sonarqube`
> 
> That’s it. With **Docker enabled on boot**, **restart policies** (or a **systemd unit**), and **named volumes**, your Compose services will survive reboots and keep their data. cite
> 
> #docker #docker-compose #systemd #autostart #linux
<!-- UID: f5fc234b-0466-4f1b-8939-c0823555b921 -->

---


