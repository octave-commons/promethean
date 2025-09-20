#!/usr/bin/env bash
set -euo pipefail
# 0) sanity: you already have the NVIDIA proprietary driver installed on the host
nvidia-smi

# 1) repo + key
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey \
    | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg

curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list \
    | sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' \
    | sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

# 2) install
sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit

# 3) wire it into Docker and restart
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker
# 4) test it
echo "==> Testing nvidia-container-toolkit installation..."
# run a CUDA base image and print GPU info
docker run --rm --gpus all nvidia/cuda:12.9.0-base-ubuntu22.04 nvidia-smi
