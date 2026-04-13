<!-- source: https://docs.helm.sh/docs/intro/install/ | content-type: text/html; charset=UTF-8 | bytes: 57097 -->

[Skip to main content](https://docs.helm.sh/docs/intro/install/#__docusaurus_skipToContent_fallback)

🎉 Helm v4.0.0 is out! See the [Helm 4 Overview](https://docs.helm.sh/docs/overview) for details!

**Helm**[Docs](https://docs.helm.sh/docs)[Community](https://docs.helm.sh/community)[Blog](https://docs.helm.sh/blog)[Charts](https://artifacthub.io/)

[4.1.1](https://docs.helm.sh/docs/intro/install)

- [4.1.1](https://docs.helm.sh/docs/intro/install)
- [3.20.0](https://docs.helm.sh/docs/v3/intro/install)
- [2.17.0](https://docs.helm.sh/docs/v2/)

[English](https://docs.helm.sh/docs/intro/install/#)

- [English](https://docs.helm.sh/docs/intro/install)
- [Deutsch (German)](https://docs.helm.sh/de/docs/intro/install)
- [Ελληνικά (Greek)](https://docs.helm.sh/el/docs/intro/install)
- [Español (Spanish)](https://docs.helm.sh/es/docs/intro/install)
- [Français (French)](https://docs.helm.sh/fr/docs/intro/install)
- [Italiano (Italian)](https://docs.helm.sh/it/docs/intro/install)
- [日本語 (Japanese)](https://docs.helm.sh/ja/docs/intro/install)
- [한국어 (Korean)](https://docs.helm.sh/ko/docs/intro/install)
- [Português (Portuguese)](https://docs.helm.sh/pt/docs/intro/install)
- [Русский (Russian)](https://docs.helm.sh/ru/docs/intro/install)
- [Українська (Ukrainian)](https://docs.helm.sh/uk/docs/intro/install)
- [中文 (Chinese)](https://docs.helm.sh/zh/docs/intro/install)

Search

- [Docs Home](https://docs.helm.sh/docs/)

- [Helm 4 Overview](https://docs.helm.sh/docs/overview)

- [Full Changelog](https://docs.helm.sh/docs/changelog)

- 

  [Introduction](https://docs.helm.sh/docs/intro/)

  

  - [Quickstart Guide](https://docs.helm.sh/docs/intro/quickstart)
  - [Installing Helm](https://docs.helm.sh/docs/intro/install)
  - [Using Helm](https://docs.helm.sh/docs/intro/using_helm)
  - [Cheat Sheet](https://docs.helm.sh/docs/intro/CheatSheet)

- 

  [How-to](https://docs.helm.sh/docs/howto/)

  

- 

  [Topics](https://docs.helm.sh/docs/topics/)

  

- 

  [Best Practices](https://docs.helm.sh/docs/chart_best_practices/)

  

- 

  [Chart Template Guide](https://docs.helm.sh/docs/chart_template_guide/)

  

- 

  [Plugins](https://docs.helm.sh/docs/plugins/)

  

- 

  [Helm Commands](https://docs.helm.sh/docs/helm/)

  

- 

  [Go SDK](https://docs.helm.sh/docs/sdk/)

  

- [Glossary](https://docs.helm.sh/docs/glossary/)

- 
- [Docs](https://docs.helm.sh/docs/)
- [Introduction](https://docs.helm.sh/docs/intro/)
- Installing Helm

Version: 4.1.1

On this page

# Installing Helm

This guide shows how to install the Helm CLI. Helm can be installed either from source, or from pre-built binary releases.

## From The Helm Project[](https://docs.helm.sh/docs/intro/install/#from-the-helm-project)

The Helm project provides two ways to fetch and install Helm. These are the official methods to get Helm releases. In addition to that, the Helm community provides methods to install Helm through different package managers. Installation through those methods can be found below the official methods.

### From the Binary Releases[](https://docs.helm.sh/docs/intro/install/#from-the-binary-releases)

Every [release](https://github.com/helm/helm/releases) of Helm provides binary releases for a variety of OSes. These binary versions can be manually downloaded and installed.

1.  Download your [desired version](https://github.com/helm/helm/releases)
2.  Verify the binary. See [Verifying Helm Binaries](https://docs.helm.sh/docs/intro/install/#verifying-helm-binaries) on this page.
3.  Unpack it (`tar -zxvf helm-v4.0.0-linux-amd64.tar.gz`)
4.  Find the `helm` binary in the unpacked directory, and move it to its desired destination (`mv linux-amd64/helm /usr/local/bin/helm`)

From there, you should be able to run the client and [add the stable chart repository](https://docs.helm.sh/docs/intro/quickstart#initialize-a-helm-chart-repository): `helm help`.

**Note:** Helm automated tests are performed for Linux AMD64 only during GitHub Actions builds and releases. Testing of other OSes are the responsibility of the community requesting Helm for the OS in question.

### From Script[](https://docs.helm.sh/docs/intro/install/#from-script)

Helm now has an installer script that will automatically grab the latest version of Helm and [install it locally](https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-4).

You can fetch that script, and then execute it locally. It's well documented so that you can read through it and understand what it is doing before you run it.

``` prism-code
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-4
chmod 700 get_helm.sh
./get_helm.sh
```

Yes, you can `curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-4 | bash` if you want to live on the edge.

## Through Package Managers[](https://docs.helm.sh/docs/intro/install/#through-package-managers)

The Helm community provides the ability to install Helm through operating system package managers. These are not supported by the Helm project and are not considered trusted 3rd parties.

### From Homebrew (macOS)[](https://docs.helm.sh/docs/intro/install/#from-homebrew-macos)

Members of the Helm community have contributed a Helm formula build to Homebrew. This formula is generally up to date.

``` prism-code
brew install helm
```

(Note: There is also a formula for emacs-helm, which is a different project.)

### From Chocolatey (Windows)[](https://docs.helm.sh/docs/intro/install/#from-chocolatey-windows)

Members of the Helm community have contributed a [Helm package](https://chocolatey.org/packages/kubernetes-helm) build to [Chocolatey](https://chocolatey.org/). This package is generally up to date.

``` prism-code
choco install kubernetes-helm
```

### From Scoop (Windows)[](https://docs.helm.sh/docs/intro/install/#from-scoop-windows)

Members of the Helm community have contributed a [Helm package](https://github.com/ScoopInstaller/Main/blob/master/bucket/helm.json) build to [Scoop](https://scoop.sh). This package is generally up to date.

``` prism-code
scoop install helm
```

### From Winget (Windows)[](https://docs.helm.sh/docs/intro/install/#from-winget-windows)

Members of the Helm community have contributed a [Helm package](https://github.com/microsoft/winget-pkgs/tree/master/manifests/h/Helm/Helm) build to [Winget](https://learn.microsoft.com/en-us/windows/package-manager/). This package is generally up to date.

``` prism-code
winget install Helm.Helm
```

### From Apt (Debian/Ubuntu)[](https://docs.helm.sh/docs/intro/install/#from-apt-debianubuntu)

Members of the Helm community have contributed an Apt package for Debian/Ubuntu. This package is generally up to date. Thanks to [Buildkite](https://buildkite.com/organizations/helm-linux/packages/registries/helm-debian) for hosting the repo.

``` prism-code
sudo apt-get install curl gpg apt-transport-https --yes
curl -fsSL https://packages.buildkite.com/helm-linux/helm-debian/gpgkey | gpg --dearmor | sudo tee /usr/share/keyrings/helm.gpg > /dev/null
echo "deb [signed-by=/usr/share/keyrings/helm.gpg] https://packages.buildkite.com/helm-linux/helm-debian/any/ any main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
sudo apt-get update
sudo apt-get install helm
```

### From dnf/yum (fedora)[](https://docs.helm.sh/docs/intro/install/#from-dnfyum-fedora)

Since Fedora 35, Helm is available on the official repository. You can install Helm by invoking:

``` prism-code
sudo dnf install helm
```

### From Snap[](https://docs.helm.sh/docs/intro/install/#from-snap)

The [Snapcrafters](https://github.com/snapcrafters) community maintains the Snap version of the [Helm package](https://snapcraft.io/helm):

``` prism-code
sudo snap install helm --classic
```

### From pkg (FreeBSD)[](https://docs.helm.sh/docs/intro/install/#from-pkg-freebsd)

Members of the FreeBSD community have contributed a [Helm package](https://www.freshports.org/sysutils/helm) build to the [FreeBSD Ports Collection](https://man.freebsd.org/ports). This package is generally up to date.

``` prism-code
pkg install helm
```

### Development Builds[](https://docs.helm.sh/docs/intro/install/#development-builds)

In addition to releases you can download or install development snapshots of Helm.

### From Canary Builds[](https://docs.helm.sh/docs/intro/install/#from-canary-builds)

"Canary" builds are versions of the Helm software that are built from the latest `main` branch. They are not official releases, and may not be stable. However, they offer the opportunity to test the cutting edge features.

Canary Helm binaries are stored at `get.helm.sh`. Here are links to the common builds:

- [Linux AMD64](https://get.helm.sh/helm-canary-linux-amd64.tar.gz)
- [macOS AMD64](https://get.helm.sh/helm-canary-darwin-amd64.tar.gz)
- [Experimental Windows AMD64](https://get.helm.sh/helm-canary-windows-amd64.zip)

### From Source (Linux, macOS)[](https://docs.helm.sh/docs/intro/install/#from-source-linux-macos)

Building Helm from source is slightly more work, but is the best way to go if you want to test the latest Helm version.

You must have a working Go environment.

``` prism-code
git clone https://github.com/helm/helm.git
cd helm
make
```

If required, it will fetch the dependencies and cache them, and validate configuration. It will then compile `helm` and place it in `bin/helm`.

## Verifying Helm Binaries[](https://docs.helm.sh/docs/intro/install/#verifying-helm-binaries)

Each Helm release includes cryptographic signatures that confirm the binary was built and signed by Helm maintainers. To help protect against supply chain attacks, you should always verify the authenticity of Helm binaries before installing.

Published release assets on `get.helm.sh` (served through a CDN) generally cannot be altered after a GitHub release is published. However, the supply chain involves multiple components (CDN, hosting infrastructure, and so on), so signature verification is important even for older or pinned versions.

### Requirements[](https://docs.helm.sh/docs/intro/install/#requirements)

To verify a Helm binary, you need the following:

- The binary archive (for example, `helm-v4.0.0-linux-amd64.tar.gz`)
- The corresponding signature file (for example, `helm-v4.0.0-linux-amd64.tar.gz.asc`)
- The Helm maintainers' public PGP keys

### Verification Steps[](https://docs.helm.sh/docs/intro/install/#verification-steps)

To verify a Helm binary:

1.  Verify the SHA256 checksum to confirm the download wasn't corrupted. For example:

    

    

    ``` prism-code
    $ sha256sum -c helm-v4.0.0-linux-amd64.tar.gz.sha256sum
    helm-v4.0.0-linux-amd64.tar.gz: OK
    ```

    

    

2.  Import the Helm maintainers' public keys:

    

    

    ``` prism-code
    $ curl https://raw.githubusercontent.com/helm/helm/main/KEYS | gpg --import
    ```

    

    

    

    

    ![](data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgMTQgMTYiPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTYuMyA1LjY5YS45NDIuOTQyIDAgMCAxLS4yOC0uN2MwLS4yOC4wOS0uNTIuMjgtLjcuMTktLjE4LjQyLS4yOC43LS4yOC4yOCAwIC41Mi4wOS43LjI4LjE4LjE5LjI4LjQyLjI4LjcgMCAuMjgtLjA5LjUyLS4yOC43YTEgMSAwIDAgMS0uNy4zYy0uMjggMC0uNTItLjExLS43LS4zek04IDcuOTljLS4wMi0uMjUtLjExLS40OC0uMzEtLjY5LS4yLS4xOS0uNDItLjMtLjY5LS4zMUg2Yy0uMjcuMDItLjQ4LjEzLS42OS4zMS0uMi4yLS4zLjQ0LS4zMS42OWgxdjNjLjAyLjI3LjExLjUuMzEuNjkuMi4yLjQyLjMxLjY5LjMxaDFjLjI3IDAgLjQ4LS4xMS42OS0uMzEuMi0uMTkuMy0uNDIuMzEtLjY5SDhWNy45OHYuMDF6TTcgMi4zYy0zLjE0IDAtNS43IDIuNTQtNS43IDUuNjggMCAzLjE0IDIuNTYgNS43IDUuNyA1LjdzNS43LTIuNTUgNS43LTUuN2MwLTMuMTUtMi41Ni01LjY5LTUuNy01LjY5di4wMXpNNyAuOThjMy44NiAwIDcgMy4xNCA3IDdzLTMuMTQgNy03IDctNy0zLjEyLTctNyAzLjE0LTcgNy03eiI+PC9wYXRoPjwvc3ZnPg==)note

    

    

    Avoid fetching keys from the Helm repository each time you verify a Helm binary. Instead, import the keys one time and then store them in a secure location you control. This protects you if the repository is ever compromised and keys are swapped; your local copy lets you detect the tampering.

    You can also cross-check maintainer keys on [Keybase](https://keybase.io), where Helm maintainers have profiles linking their identities to their PGP keys.

    

    

3.  Verify the binary's signature. For example:

    

    

    ``` prism-code
    $ gpg --verify helm-v4.0.0-linux-amd64.tar.gz.asc helm-v4.0.0-linux-amd64.tar.gz
    gpg: Signature made [date] using RSA key ID [key-id]
    gpg: Good signature from "Helm Maintainer "
    ```

    

    

    A "Good signature" message confirms the binary is authentic and hasn't been tampered with.

    

    

    ![](data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgMTQgMTYiPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTYuMyA1LjY5YS45NDIuOTQyIDAgMCAxLS4yOC0uN2MwLS4yOC4wOS0uNTIuMjgtLjcuMTktLjE4LjQyLS4yOC43LS4yOC4yOCAwIC41Mi4wOS43LjI4LjE4LjE5LjI4LjQyLjI4LjcgMCAuMjgtLjA5LjUyLS4yOC43YTEgMSAwIDAgMS0uNy4zYy0uMjggMC0uNTItLjExLS43LS4zek04IDcuOTljLS4wMi0uMjUtLjExLS40OC0uMzEtLjY5LS4yLS4xOS0uNDItLjMtLjY5LS4zMUg2Yy0uMjcuMDItLjQ4LjEzLS42OS4zMS0uMi4yLS4zLjQ0LS4zMS42OWgxdjNjLjAyLjI3LjExLjUuMzEuNjkuMi4yLjQyLjMxLjY5LjMxaDFjLjI3IDAgLjQ4LS4xMS42OS0uMzEuMi0uMTkuMy0uNDIuMzEtLjY5SDhWNy45OHYuMDF6TTcgMi4zYy0zLjE0IDAtNS43IDIuNTQtNS43IDUuNjggMCAzLjE0IDIuNTYgNS43IDUuNyA1LjdzNS43LTIuNTUgNS43LTUuN2MwLTMuMTUtMi41Ni01LjY5LTUuNy01LjY5di4wMXpNNyAuOThjMy44NiAwIDcgMy4xNCA3IDdzLTMuMTQgNy03IDctNy0zLjEyLTctNyAzLjE0LTcgNy03eiI+PC9wYXRoPjwvc3ZnPg==)note

    

    

    Signature files are safe to pull from upstream as long as you have trusted copies of the public keys. An attacker cannot forge a valid signature without the private key, which only the legitimate maintainer has.

    

    

## FAQ[](https://docs.helm.sh/docs/intro/install/#faq)

### Why aren't there native packages of Helm for Fedora and other Linux distros?[](https://docs.helm.sh/docs/intro/install/#why-arent-there-native-packages-of-helm-for-fedora-and-other-linux-distros)

The Helm project does not maintain packages for operating systems and environments. The Helm community may provide native packages and if the Helm project is made aware of them they will be listed. This is how the Homebrew formula was started and listed. If you're interested in maintaining a package, we'd love it.

### Why do you provide a `curl ...|bash` script?[](https://docs.helm.sh/docs/intro/install/#why-do-you-provide-a-curl-bash-script)

There is a script in our repository (`scripts/get-helm-4`) that can be executed as a `curl ..|bash` script. The transfers are all protected by HTTPS, and the script does some auditing of the packages it fetches. However, the script has all the usual dangers of any shell script.

We provide it because it is useful, but we suggest that users carefully read the script first. What we'd really like, though, are better packaged releases of Helm.

### How do I put the Helm client files somewhere other than their defaults?[](https://docs.helm.sh/docs/intro/install/#how-do-i-put-the-helm-client-files-somewhere-other-than-their-defaults)

Helm uses the XDG structure for storing files. There are environment variables you can use to override these locations:

- `$XDG_CACHE_HOME`: set an alternative location for storing cached files.
- `$XDG_CONFIG_HOME`: set an alternative location for storing Helm configuration.
- `$XDG_DATA_HOME`: set an alternative location for storing Helm data.

Note that if you have existing repositories, you will need to re-add them with `helm repo add...`.

### I want to delete my local Helm. Where are all its files?[](https://docs.helm.sh/docs/intro/install/#i-want-to-delete-my-local-helm-where-are-all-its-files)

Along with the `helm` binary, Helm stores some files in the following locations:

- \$XDG_CACHE_HOME
- \$XDG_CONFIG_HOME
- \$XDG_DATA_HOME

The following table gives the default folder for each of these, by OS:

| Operating System | Cache Path                  | Configuration Path               | Data Path                 |
|------------------|-----------------------------|----------------------------------|---------------------------|
| Linux            | `$HOME/.cache/helm`         | `$HOME/.config/helm`             | `$HOME/.local/share/helm` |
| macOS            | `$HOME/Library/Caches/helm` | `$HOME/Library/Preferences/helm` | `$HOME/Library/helm`      |
| Windows          | `%TEMP%\helm`               | `%APPDATA%\helm`                 | `%APPDATA%\helm`          |

## Conclusion[](https://docs.helm.sh/docs/intro/install/#conclusion)

In most cases, installation is as simple as getting a pre-built `helm` binary. This document covers additional cases for those who want to do more sophisticated things with Helm.

Once you have the Helm Client successfully installed, you can move on to using Helm to manage charts and [add the stable chart repository](https://docs.helm.sh/docs/intro/quickstart#initialize-a-helm-chart-repository).

[Edit this page](https://github.com/helm/helm-www/blob/main/docs/intro/install.mdx)

Previous

Quickstart Guide

Next

Using Helm

- [From The Helm Project](https://docs.helm.sh/docs/intro/install/#from-the-helm-project)
  - [From the Binary Releases](https://docs.helm.sh/docs/intro/install/#from-the-binary-releases)
  - [From Script](https://docs.helm.sh/docs/intro/install/#from-script)
- [Through Package Managers](https://docs.helm.sh/docs/intro/install/#through-package-managers)
  - [From Homebrew (macOS)](https://docs.helm.sh/docs/intro/install/#from-homebrew-macos)
  - [From Chocolatey (Windows)](https://docs.helm.sh/docs/intro/install/#from-chocolatey-windows)
  - [From Scoop (Windows)](https://docs.helm.sh/docs/intro/install/#from-scoop-windows)
  - [From Winget (Windows)](https://docs.helm.sh/docs/intro/install/#from-winget-windows)
  - [From Apt (Debian/Ubuntu)](https://docs.helm.sh/docs/intro/install/#from-apt-debianubuntu)
  - [From dnf/yum (fedora)](https://docs.helm.sh/docs/intro/install/#from-dnfyum-fedora)
  - [From Snap](https://docs.helm.sh/docs/intro/install/#from-snap)
  - [From pkg (FreeBSD)](https://docs.helm.sh/docs/intro/install/#from-pkg-freebsd)
  - [Development Builds](https://docs.helm.sh/docs/intro/install/#development-builds)
  - [From Canary Builds](https://docs.helm.sh/docs/intro/install/#from-canary-builds)
  - [From Source (Linux, macOS)](https://docs.helm.sh/docs/intro/install/#from-source-linux-macos)
- [Verifying Helm Binaries](https://docs.helm.sh/docs/intro/install/#verifying-helm-binaries)
  - [Requirements](https://docs.helm.sh/docs/intro/install/#requirements)
  - [Verification Steps](https://docs.helm.sh/docs/intro/install/#verification-steps)
- [FAQ](https://docs.helm.sh/docs/intro/install/#faq)
  - [Why aren't there native packages of Helm for Fedora and other Linux distros?](https://docs.helm.sh/docs/intro/install/#why-arent-there-native-packages-of-helm-for-fedora-and-other-linux-distros)
  - [Why do you provide a curl ...|bash script?](https://docs.helm.sh/docs/intro/install/#why-do-you-provide-a-curl-bash-script)
  - [How do I put the Helm client files somewhere other than their defaults?](https://docs.helm.sh/docs/intro/install/#how-do-i-put-the-helm-client-files-somewhere-other-than-their-defaults)
  - [I want to delete my local Helm. Where are all its files?](https://docs.helm.sh/docs/intro/install/#i-want-to-delete-my-local-helm-where-are-all-its-files)
- [Conclusion](https://docs.helm.sh/docs/intro/install/#conclusion)

Helm Project

- [Source code](https://github.com/helm/helm)
- [Blog](https://docs.helm.sh/blog)
- [Events](https://www.cncf.io/community/kubecon-cloudnativecon-events/)
- [Code of Conduct](https://github.com/cncf/foundation/blob/master/code-of-conduct.md)

Charts

- [Introduction](https://docs.helm.sh/docs/intro)
- [Chart tips & tricks](https://docs.helm.sh/docs/howto/charts_tips_and_tricks)
- [Developing Charts](https://docs.helm.sh/docs/topics/charts)
- [Search 800+ Charts](https://artifacthub.io/)

Development

- [Slack (#helm-dev)](https://kubernetes.slack.com/messages/C51E88VDG)
- [Contribution Guide](https://github.com/helm/helm/blob/main/CONTRIBUTING.md)
- [Maintainers](https://github.com/helm/helm/blob/main/OWNERS)
- [Weekly Meetings](https://github.com/helm/community/blob/main/communication.md#meetings)

Community

- [GitHub Community](https://github.com/helm/community)
- [Slack (#helm-users)](https://kubernetes.slack.com/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/kubernetes-helm)
- [X](https://x.com/helmpack)

We are a [Cloud Native Computing Foundation](https://www.cncf.io/) graduated project.

© Helm Authors 2026. Documentation distributed under [CC-BY-4.0.](https://creativecommons.org/licenses/by/4.0)

© 2026 The Linux Foundation. All rights reserved. The Linux Foundation has registered trademarks and uses trademarks. For a list of trademarks of The Linux Foundation, please see our [Trademark Usage page](https://www.linuxfoundation.org/trademark-usage/).
