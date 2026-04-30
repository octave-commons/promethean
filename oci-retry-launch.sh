#!/usr/bin/env bash
set -euo pipefail

export OCI_CLI_SUPPRESS_FILE_PERMISSIONS_WARNING=True
export SUPPRESS_LABEL_WARNING=True

TENANCY=$(grep tenancy ~/.oci/config | cut -d= -f2)

# Set these via env vars to avoid committing tenancy-specific OCIDs.
: "${OCI_SUBNET_ID:?set OCI_SUBNET_ID (ocid1.subnet...)}"
: "${OCI_IMAGE_ID:?set OCI_IMAGE_ID (ocid1.image...)}"

SUBNET_ID="$OCI_SUBNET_ID"
IMAGE_ID="$OCI_IMAGE_ID"
SSH_KEY_FILE="${OCI_SSH_KEY_FILE:-$HOME/.ssh/id_ed25519.pub}"
DISPLAY_NAME="${OCI_INSTANCE_NAME:-openai-proxy}"
SHAPE="VM.Standard.A1.Flex"
OCPUS=4
MEMORY_GB=24
RETRY_INTERVAL=60
ADS=("kKaU:PHX-AD-1" "kKaU:PHX-AD-2" "kKaU:PHX-AD-3")

attempt=0
while true; do
  for AD in "${ADS[@]}"; do
    attempt=$((attempt + 1))
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Attempt $attempt - AD: $AD"

    RESULT=$(oci compute instance launch \
      --compartment-id "$TENANCY" \
      --availability-domain "$AD" \
      --shape "$SHAPE" \
      --shape-config "{\"ocpus\":$OCPUS,\"memoryInGBs\":$MEMORY_GB}" \
      --display-name "$DISPLAY_NAME" \
      --image-id "$IMAGE_ID" \
      --subnet-id "$SUBNET_ID" \
      --assign-public-ip true \
      --ssh-authorized-keys-file "$SSH_KEY_FILE" \
      --output json \
      --connection-timeout 120 \
      --read-timeout 120 2>&1) || true

    if echo "$RESULT" | grep -q '"lifecycle-state"'; then
      echo ""
      echo "========================================="
      echo "  SUCCESS! Instance launched in $AD"
      echo "========================================="
      echo "$RESULT" | python3 -m json.tool 2>/dev/null || echo "$RESULT"

      INSTANCE_ID=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null || echo "unknown")
      echo ""
      echo "Instance ID: $INSTANCE_ID"
      echo ""
      echo "Waiting for public IP..."
      sleep 30

      VNIC_ID=$(oci compute vnic-attachment list \
        --compartment-id "$TENANCY" \
        --instance-id "$INSTANCE_ID" \
        --query 'data[0]."vnic-id"' \
        --raw-output \
        --connection-timeout 30 \
        --read-timeout 30 2>/dev/null) || true

      if [ -n "$VNIC_ID" ] && [ "$VNIC_ID" != "None" ]; then
        PUBLIC_IP=$(oci network vnic get \
          --vnic-id "$VNIC_ID" \
          --query 'data."public-ip"' \
          --raw-output \
          --connection-timeout 30 \
          --read-timeout 30 2>/dev/null) || true
        echo "Public IP: ${PUBLIC_IP:-unknown}"
        echo ""
        echo "Next steps:"
        echo "  ssh opc@$PUBLIC_IP"
      fi

      exit 0
    fi

    if echo "$RESULT" | grep -q "Out of host capacity"; then
      echo "  -> Out of capacity in $AD"
    elif echo "$RESULT" | grep -q "timed out"; then
      echo "  -> Request timed out for $AD"
    else
      echo "  -> Error: $(echo "$RESULT" | grep -o '"message":[^,]*' | head -1)"
    fi
  done

  echo "  Sleeping ${RETRY_INTERVAL}s before next round..."
  sleep "$RETRY_INTERVAL"
done
