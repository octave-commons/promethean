nvidia-smi
lsmod | grep -E 'nvidia|nouveu'    # make sure nouveau is NOT loaded
ls -l /dev/nvidia*                  # expect nvidia0, nvidiactl, nvidia-uvm
id -nG ollama 2>/dev/null || echo "service user isn't 'ollama' (that's ok)"
sudo systemctl edit ollama.service
## Add the following lines:
# [Service]
# # Remove any inherited GPU-hiding env
# UnsetEnvironment=CUDA_VISIBLE_DEVICES
# # Optional: nudge Ollama to the NVIDIA path explicitly
# Environment=OLLAMA_LLM_LIBRARY=cublas
# Environment=OLLAMA_DEBUG=INFO
# # Ensure the driver is live before Ollama starts
# ExecStartPre=/usr/sbin/modprobe nvidia
# ExecStartPre=/usr/sbin/modprobe nvidia_uvm

# You want to see something like library=cublas and a discovered GPU, not library=cpu.
sudo systemctl daemon-reload
sudo systemctl restart ollama
journalctl -u ollama -b -n 200 | sed -n '1,120p'
#  If 999 persists: kick the driver stack (no reboot)

#    Sometimes UVM gets wedged; reloading the modules clears 999.
#    Stack Overflow
sudo modprobe -r nvidia_uvm nvidia_drm nvidia_modeset nvidia || true
sudo modprobe nvidia && sudo modprobe nvidia_uvm
sudo systemctl restart ollama
sudo usermod -aG video,render ollama  # if the service runs as user 'ollama'
# then log out/in for that user or restart the service
sudo systemctl enable --now nvidia-persistenced.service
nvidia-smi; \
    ldconfig -p | grep libcuda; \
    ls -l /dev/nvidia*; \
    systemctl cat ollama | sed -n '1,120p'
