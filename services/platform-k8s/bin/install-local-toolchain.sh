#!/usr/bin/env bash
set -euo pipefail

TARGET_DIR="${TARGET_DIR:-$HOME/.local/bin}"
TMP_DIR="$(mktemp -d)"
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH_RAW="$(uname -m)"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

case "$ARCH_RAW" in
  x86_64|amd64)
    ARCH="amd64"
    ;;
  aarch64|arm64)
    ARCH="arm64"
    ;;
  *)
    echo "Unsupported architecture: $ARCH_RAW" >&2
    exit 1
    ;;
esac

if [[ "$OS" != "linux" ]]; then
  echo "Unsupported OS: $OS" >&2
  exit 1
fi

mkdir -p "$TARGET_DIR"

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

require_cmd curl
require_cmd python3
require_cmd sha256sum
require_cmd tar

log() {
  printf '[platform-k8s] %s\n' "$*"
}

github_latest_tag() {
  local repo="$1"
  curl -fsSL \
    -H 'Accept: application/vnd.github+json' \
    -H 'User-Agent: platform-k8s-bootstrap' \
    "https://api.github.com/repos/${repo}/releases/latest" \
    | python3 -c 'import json,sys; print(json.load(sys.stdin)["tag_name"])'
}

download() {
  local url="$1"
  local output="$2"
  curl -fsSL "$url" -o "$output"
}

install_binary() {
  local src="$1"
  local name="$2"
  install -m 0755 "$src" "$TARGET_DIR/$name"
  log "installed $name -> $TARGET_DIR/$name"
}

KUBECTL_VERSION="${KUBECTL_VERSION:-$(curl -fsSL https://dl.k8s.io/release/stable.txt)}"
KIND_VERSION="${KIND_VERSION:-$(github_latest_tag kubernetes-sigs/kind)}"
SKAFFOLD_VERSION="${SKAFFOLD_VERSION:-$(github_latest_tag GoogleContainerTools/skaffold)}"
HELM_VERSION="${HELM_VERSION:-$(github_latest_tag helm/helm)}"

log "target dir: $TARGET_DIR"
log "kubectl version: $KUBECTL_VERSION"
log "kind version: $KIND_VERSION"
log "skaffold version: $SKAFFOLD_VERSION"
log "helm version: $HELM_VERSION"

KUBECTL_BIN="$TMP_DIR/kubectl"
KUBECTL_SHA="$TMP_DIR/kubectl.sha256"
download "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/${OS}/${ARCH}/kubectl" "$KUBECTL_BIN"
download "https://dl.k8s.io/${KUBECTL_VERSION}/bin/${OS}/${ARCH}/kubectl.sha256" "$KUBECTL_SHA"
(
  cd "$TMP_DIR"
  echo "$(cat "$KUBECTL_SHA")  kubectl" | sha256sum --check >/dev/null
)
install_binary "$KUBECTL_BIN" kubectl

KIND_BIN="$TMP_DIR/kind"
download "https://kind.sigs.k8s.io/dl/${KIND_VERSION}/kind-${OS}-${ARCH}" "$KIND_BIN"
install_binary "$KIND_BIN" kind

SKAFFOLD_BIN="$TMP_DIR/skaffold"
download "https://storage.googleapis.com/skaffold/releases/${SKAFFOLD_VERSION}/skaffold-${OS}-${ARCH}" "$SKAFFOLD_BIN"
install_binary "$SKAFFOLD_BIN" skaffold

HELM_TARBALL="helm-${HELM_VERSION}-${OS}-${ARCH}.tar.gz"
HELM_ARCHIVE="$TMP_DIR/$HELM_TARBALL"
HELM_SHA_FILE="$TMP_DIR/${HELM_TARBALL}.sha256sum"
download "https://get.helm.sh/${HELM_TARBALL}" "$HELM_ARCHIVE"
download "https://get.helm.sh/${HELM_TARBALL}.sha256sum" "$HELM_SHA_FILE"
(
  cd "$TMP_DIR"
  sha256sum --check "${HELM_TARBALL}.sha256sum" >/dev/null
)
tar -xzf "$HELM_ARCHIVE" -C "$TMP_DIR"
install_binary "$TMP_DIR/${OS}-${ARCH}/helm" helm

log "toolchain install complete"
"$TARGET_DIR/kubectl" version --client --output=yaml | sed -n '1,12p'
"$TARGET_DIR/kind" version
"$TARGET_DIR/skaffold" version
"$TARGET_DIR/helm" version --short
