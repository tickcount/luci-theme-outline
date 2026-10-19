<h4 align="right"><strong>English</strong> | <a href="README_zh.md">简体中文</a></h4>

<div align="center">

<img src=".dev/public/outline/images/favicon.svg" alt="Outline" width="88" height="88">

<h1>Outline</h1>

**A ChatGPT-style LuCI theme for OpenWrt.**

<a href="https://github.com/tickcount/luci-theme-outline/releases/latest"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/github/release/tickcount/luci-theme-outline.svg?variant=secondary&font=geist&mode=dark"><img alt="Latest release" src="https://shieldcn.dev/github/release/tickcount/luci-theme-outline.svg?variant=secondary&font=geist&mode=light"></picture></a>
<a href="https://github.com/tickcount/luci-theme-outline/actions/workflows/ci.yml"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/github/ci/tickcount/luci-theme-outline.svg?variant=secondary&font=geist&mode=dark"><img alt="CI" src="https://shieldcn.dev/github/ci/tickcount/luci-theme-outline.svg?variant=secondary&font=geist&mode=light"></picture></a>
<a href="https://github.com/tickcount/luci-theme-outline/releases"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/github/downloads/tickcount/luci-theme-outline.svg?variant=secondary&font=geist&mode=dark"><img alt="Downloads" src="https://shieldcn.dev/github/downloads/tickcount/luci-theme-outline.svg?variant=secondary&font=geist&mode=light"></picture></a>
<a href="LICENSE"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/license-Apache%202.0.svg?variant=secondary&font=geist&logo=lu:Scale&mode=dark"><img alt="License: Apache 2.0" src="https://shieldcn.dev/badge/license-Apache%202.0.svg?variant=secondary&font=geist&logo=lu:Scale&mode=light"></picture></a>
<br>
<a href="https://openwrt.org/"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/OpenWrt-%E2%89%A5%2023.05%20%C2%B7%20ipk%20%C2%B7%20apk.svg?variant=secondary&font=geist&logo=openwrt&mode=dark"><img alt="OpenWrt 23.05 and later" src="https://shieldcn.dev/badge/OpenWrt-%E2%89%A5%2023.05%20%C2%B7%20ipk%20%C2%B7%20apk.svg?variant=secondary&font=geist&logo=openwrt&mode=light"></picture></a>
<a href="https://tailwindcss.com/"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/Tailwind%20CSS-4.svg?variant=secondary&font=geist&logo=tailwindcss&mode=dark"><img alt="Tailwind CSS 4" src="https://shieldcn.dev/badge/Tailwind%20CSS-4.svg?variant=secondary&font=geist&logo=tailwindcss&mode=light"></picture></a>
<a href="https://vite.dev/"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/built%20with-Vite.svg?variant=secondary&font=geist&logo=vite&mode=dark"><img alt="Vite" src="https://shieldcn.dev/badge/built%20with-Vite.svg?variant=secondary&font=geist&logo=vite&mode=light"></picture></a>

[**Quick start**](#-quick-start) &nbsp;·&nbsp; [Features](#-features) &nbsp;·&nbsp; [Gallery](#-gallery) &nbsp;·&nbsp; [Settings](#-settings) &nbsp;·&nbsp; [Compatibility](#-compatibility) &nbsp;·&nbsp; [FAQ](#-faq)

</div>

<br>

Outline makes your router's LuCI look and feel like **ChatGPT's settings**: pill
controls, hairline cards, calm type, **light and dark**, with pages that switch
**without reloading**. It is a drop-in theme: install it, and every page,
including the apps you added, follows it.

<p align="center">
  <img src=".github/preview/hero.png" alt="Outline in light and dark" width="100%">
</p>

## 🚀 Quick start

1. **Install** on the router (over SSH):

   ```sh
   wget -qO- https://raw.githubusercontent.com/tickcount/luci-theme-outline/master/install.sh | sh
   ```

2. **Reload LuCI.** The script makes Outline the active theme.
3. **Make it yours** in <kbd>System</kbd> › <kbd>Outline Theme</kbd>: mode,
   preset, colours, fonts, logo and app icon.

> [!TIP]
> Press <kbd>⌘</kbd> <kbd>K</kbd> (or <kbd>Ctrl</kbd> <kbd>K</kbd>) anywhere to
> jump to any page or tab.

## ✨ Features

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>🧭 Navbar or sidebar</h3>
      <p>Floating pills across the top, or a ChatGPT-style icon rail with one section at a time. On phones, a drawer under glass pills that blur as the page scrolls.</p>
    </td>
    <td width="50%" valign="top">
      <h3>⚡ No full reloads</h3>
      <p>Moving between LuCI pages swaps only the content, so it feels instant. Browsers without the Navigation API keep classic page loads.</p>
    </td>
  </tr>
  <tr>
    <td valign="top">
      <h3>🌗 Light, dark and presets</h3>
      <p>System, light or dark, remembered without a flash. Presets from ChatGPT and the Codex collection (Catppuccin, Dracula, Nord, Tokyo Night, …), or your own colours.</p>
    </td>
    <td valign="top">
      <h3>⌘ Command palette</h3>
      <p>A ChatGPT-style search: type a few letters to jump to any page or tab from the menu.</p>
    </td>
  </tr>
  <tr>
    <td valign="top">
      <h3>🎨 ChatGPT's look</h3>
      <p>Pill controls, hairline cards, secondary-ink descriptions, and Analytics-style charts and legends on the realtime graphs.</p>
    </td>
    <td valign="top">
      <h3>🧩 Apps fit in</h3>
      <p>Per-page fixes for third-party apps such as Podkop and its forks; apps built for Bootstrap's colours get Outline's; unknown sections get a letter icon.</p>
    </td>
  </tr>
  <tr>
    <td valign="top">
      <h3>🏷️ Your branding</h3>
      <p>The Outline logo, OpenWrt's, or your own, and one app icon from which every favicon and home-screen size is made.</p>
    </td>
    <td valign="top">
      <h3>📦 Updates from LuCI</h3>
      <p>Check for updates, update, switch LuCI to or away from Outline, or uninstall, all from the theme's own settings.</p>
    </td>
  </tr>
</table>

## 📸 Gallery

<table>
  <tr>
    <td width="50%" valign="top"><img src=".github/preview/mounts.png" alt="Mount Points"><p align="center"><sub><b>Settings pages</b>: cards with hairline rows and pill buttons</sub></p></td>
    <td width="50%" valign="top"><img src=".github/preview/login.png" alt="Login"><p align="center"><sub><b>Login</b></sub></p></td>
  </tr>
  <tr>
    <td valign="top"><img src=".github/preview/analytics.png" alt="Realtime charts"><p align="center"><sub><b>Realtime graphs</b> in the Analytics style</sub></p></td>
    <td valign="top"><img src=".github/preview/palette.png" alt="Command palette"><p align="center"><sub><b>Command palette</b>: <kbd>⌘</kbd> <kbd>K</kbd></sub></p></td>
  </tr>
  <tr>
    <td valign="top"><img src=".github/preview/interfaces.png" alt="Interfaces"><p align="center"><sub><b>Interfaces</b></sub></p></td>
    <td valign="top"><img src=".github/preview/rules.png" alt="Firewall rules"><p align="center"><sub><b>Firewall rules</b></sub></p></td>
  </tr>
  <tr>
    <td valign="top"><img src=".github/preview/wireless.png" alt="Wireless"><p align="center"><sub><b>Wireless</b></sub></p></td>
    <td valign="top"><img src=".github/preview/load.png" alt="Load chart"><p align="center"><sub><b>Load</b></sub></p></td>
  </tr>
</table>

<p align="center">
  <img src=".github/preview/mobile.png" alt="Outline on phones" width="100%">
  <br>
  <sub><b>On phones</b>: the menu in a drawer, the controls in floating glass pills.</sub>
</p>

## 🔧 Settings

<kbd>System</kbd> › <kbd>Outline Theme</kbd>, after ChatGPT and Codex's
<i>Settings › Appearance</i>:

| Tab            | What it holds                                                                                                                                                                                                                                                                                                                                                                             |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Appearance** | Mode (System, Light, Dark); navigation (navbar or sidebar); a preset (Outline, ChatGPT and the Codex collection: Absolutely, Ayu, Catppuccin, Dracula, Everforest, GitHub, Gruvbox, Linear, Nord, Rose Pine, Solarized, Tokyo Night, Vercel, …); accent, background and foreground colours; fonts and UI, content and code sizes; contrast; reduce motion; separate light and dark themes |
| **Branding**   | The logo (Outline, OpenWrt's, or an upload) and one app icon for every favicon and home-screen size                                                                                                                                                                                                                                                                                       |
| **Package**    | Check for updates, update, switch LuCI to or away from Outline, uninstall                                                                                                                                                                                                                                                                                                                 |

Changes preview on the settings page only and are kept with LuCI's own
<kbd>Save</kbd> or <kbd>Save & Apply</kbd>. Themes copy and import as
`outline-theme-v1:` strings, and Codex `codex-theme-v1:` strings import too.
How it works: [.dev/docs/settings.md](.dev/docs/settings.md).

## 🧪 Compatibility

|                   | Supported                                                                                            |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| **OpenWrt**       | 23.05.0 or later (ucode templates and LuCI's JavaScript APIs); `.ipk` up to 24.10, `.apk` from 25.12 |
| **Chrome / Edge** | 111+ (March 2023)                                                                                    |
| **Safari**        | 16.4+ (March 2023)                                                                                   |
| **Firefox**       | 128+ (July 2024)                                                                                     |

> [!NOTE]
> Switching pages without a reload uses the
> [Navigation API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API)
> where there is one (Chrome and Edge 105+, Safari 26.2+, Firefox 147+). Other
> browsers keep classic page loads, with nothing missing.

## 📥 Install

```sh
wget -qO- https://raw.githubusercontent.com/tickcount/luci-theme-outline/master/install.sh | sh
```

The script picks the `.ipk` (opkg, OpenWrt 24.10 and earlier) or the `.apk`
(apk, 25.12 and later) from the latest release, checks it against its checksum,
installs it and makes Outline the active LuCI theme. Run it again to update.

<details>
<summary><b>Options and removal</b></summary>

<br>

Pass options after `sh -s --`:

```sh
wget -qO- https://raw.githubusercontent.com/tickcount/luci-theme-outline/master/install.sh | sh -s -- --uninstall
```

| Option          | Effect                                                       |
| --------------- | ------------------------------------------------------------ |
| `--no-activate` | Install without switching LuCI to Outline                    |
| `--uninstall`   | Remove the theme; its settings stay in `/etc/config/outline` |
| `--purge`       | Remove the theme, its settings and uploaded brand images     |

Updates, switching the theme on or off and removal are also in LuCI, under
<kbd>System</kbd> › <kbd>Outline Theme</kbd> › <kbd>Package</kbd>.

</details>

<details>
<summary><b>Build from source</b></summary>

<br>

`htdocs/` is not in git: the theme's CSS and JS are built from `.dev/` with
[pnpm](https://pnpm.io) (Node 22+) first, then the OpenWrt SDK packs them.

**With Docker**, as the release does:

```sh
git clone https://github.com/tickcount/luci-theme-outline.git
cd luci-theme-outline
.dev/scripts/build-packages.sh        # or: ipk | apk
```

It builds `htdocs/`, then the `.ipk` (OpenWrt 24.10 SDK) and the `.apk` (25.12
SDK) in Docker, and writes them with `sha256sums.txt` to `dist/`.

**In your own source tree or SDK**, with the feeds installed (24.10 and earlier
build `.ipk`, 25.12 and later `.apk`):

```sh
git clone https://github.com/tickcount/luci-theme-outline.git package/luci-theme-outline
(cd package/luci-theme-outline/.dev && pnpm install --frozen-lockfile && pnpm build)
./scripts/feeds update -a && ./scripts/feeds install -a
make menuconfig    # LuCI → Themes → luci-theme-outline
make package/luci-theme-outline/compile V=s
```

The package lands in `bin/packages/<arch>/base/`; copy it to the router and
install it with opkg or apk.

</details>

## ❓ FAQ

<details>
<summary><b>How do I go back to the default theme?</b></summary>

<br>

<kbd>System</kbd> › <kbd>Outline Theme</kbd> › <kbd>Package</kbd> switches
LuCI away from Outline, or run the installer with `--uninstall`. Your Outline
settings stay, so switching back later restores them.

</details>

<details>
<summary><b>Will my apps' pages look broken?</b></summary>

<br>

Outline styles LuCI's own building blocks, which most apps use, and carries
fixes for the pages that do their own thing (Podkop and its forks among them).
Apps written for Bootstrap's colour variables get Outline's colours instead.

</details>

<details>
<summary><b>My browser is older. Will it work?</b></summary>

<br>

It needs the browsers in [Compatibility](#-compatibility). Instant page
switching is a bonus where the browser supports it; everywhere else pages load
as usual.

</details>

## 🙏 Acknowledgments

Thanks to:

- [luci-theme-shadcn](https://github.com/eamonxg/luci-theme-shadcn), the theme Outline is forked from
- [shadcn/ui](https://github.com/shadcn-ui/ui), the original design language
- [Lucide](https://github.com/lucide-icons/lucide), icons
- [Twemoji](https://github.com/twitter/twemoji), country flags on systems without them (CC-BY 4.0, via [country-flag-emoji-polyfill](https://github.com/talkjs/country-flag-emoji-polyfill))
- [Linear](https://linear.app), colour system inspiration
- [Vite](https://vite.dev/) and [Tailwind CSS](https://tailwindcss.com/)
- [luci-theme-bootstrap](https://github.com/openwrt/luci/tree/master/themes/luci-theme-bootstrap), template structure and LuCI integration patterns
- [luci-theme-material](https://github.com/openwrt/luci/tree/master/themes/luci-theme-material), the sidebar menu rendering approach
- [luci-theme-footstrap](https://github.com/VizzleTF/luci-theme-footstrap), a LuCI theme with its own client-side router; Outline's page switching borrows some of its ideas and builds them on the Navigation API (see the [router doc](.dev/docs/router.md))
- [Claude Code](https://claude.ai/code)

---

<div align="center">
<sub>Made for OpenWrt · <a href="LICENSE">Apache 2.0</a> · <a href="#readme">Back to top ↑</a></sub>
</div>
