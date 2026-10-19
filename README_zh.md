<h4 align="right"><a href="README.md">English</a> | <strong>简体中文</strong></h4>

<div align="center">

<img src=".dev/public/outline/images/favicon.svg" alt="Outline" width="88" height="88">

<h1>Outline</h1>

**一款 ChatGPT 风格的 OpenWrt LuCI 主题。**

<a href="https://github.com/tickcount/luci-theme-outline/releases/latest"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/github/release/tickcount/luci-theme-outline.svg?variant=secondary&font=geist&mode=dark"><img alt="Latest release" src="https://shieldcn.dev/github/release/tickcount/luci-theme-outline.svg?variant=secondary&font=geist&mode=light"></picture></a>
<a href="https://github.com/tickcount/luci-theme-outline/actions/workflows/ci.yml"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/github/ci/tickcount/luci-theme-outline.svg?variant=secondary&font=geist&mode=dark"><img alt="CI" src="https://shieldcn.dev/github/ci/tickcount/luci-theme-outline.svg?variant=secondary&font=geist&mode=light"></picture></a>
<a href="https://github.com/tickcount/luci-theme-outline/releases"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/github/downloads/tickcount/luci-theme-outline.svg?variant=secondary&font=geist&mode=dark"><img alt="Downloads" src="https://shieldcn.dev/github/downloads/tickcount/luci-theme-outline.svg?variant=secondary&font=geist&mode=light"></picture></a>
<a href="LICENSE"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/license-Apache%202.0.svg?variant=secondary&font=geist&logo=lu:Scale&mode=dark"><img alt="License: Apache 2.0" src="https://shieldcn.dev/badge/license-Apache%202.0.svg?variant=secondary&font=geist&logo=lu:Scale&mode=light"></picture></a>
<br>
<a href="https://openwrt.org/"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/OpenWrt-%E2%89%A5%2023.05%20%C2%B7%20ipk%20%C2%B7%20apk.svg?variant=secondary&font=geist&logo=openwrt&mode=dark"><img alt="OpenWrt 23.05 and later" src="https://shieldcn.dev/badge/OpenWrt-%E2%89%A5%2023.05%20%C2%B7%20ipk%20%C2%B7%20apk.svg?variant=secondary&font=geist&logo=openwrt&mode=light"></picture></a>
<a href="https://tailwindcss.com/"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/Tailwind%20CSS-4.svg?variant=secondary&font=geist&logo=tailwindcss&mode=dark"><img alt="Tailwind CSS 4" src="https://shieldcn.dev/badge/Tailwind%20CSS-4.svg?variant=secondary&font=geist&logo=tailwindcss&mode=light"></picture></a>
<a href="https://vite.dev/"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/built%20with-Vite.svg?variant=secondary&font=geist&logo=vite&mode=dark"><img alt="Vite" src="https://shieldcn.dev/badge/built%20with-Vite.svg?variant=secondary&font=geist&logo=vite&mode=light"></picture></a>

[**快速开始**](#-快速开始) &nbsp;·&nbsp; [特性](#-特性) &nbsp;·&nbsp; [截图](#-截图) &nbsp;·&nbsp; [设置](#-设置) &nbsp;·&nbsp; [兼容性](#-兼容性) &nbsp;·&nbsp; [常见问题](#-常见问题)

</div>

<br>

Outline 让路由器的 LuCI 看起来、用起来都像 **ChatGPT 的设置页**：胶囊控件、细线卡片、
沉静的字体，**浅色与深色**，页面切换**无需整页刷新**。它是即装即用的主题：装上之后，
所有页面，包括你另外安装的应用，都会随之换上新外观。

<p align="center">
  <img src=".github/preview/hero.png" alt="Outline 的浅色与深色" width="100%">
</p>

## 🚀 快速开始

1. 在路由器上（通过 SSH）**安装**：

   ```sh
   wget -qO- https://raw.githubusercontent.com/tickcount/luci-theme-outline/master/install.sh | sh
   ```

2. **刷新 LuCI**。脚本会把 Outline 设为当前主题。
3. 在 <kbd>系统</kbd> › <kbd>Outline Theme</kbd> 中**按你的喜好调整**：模式、
   预设、颜色、字体、Logo 和应用图标。

> [!TIP]
> 在任意页面按 <kbd>⌘</kbd> <kbd>K</kbd>（或 <kbd>Ctrl</kbd> <kbd>K</kbd>），
> 即可跳转到任意页面或标签页。

## ✨ 特性

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>🧭 顶栏或侧边栏</h3>
      <p>页面顶部的悬浮胶囊导航，或 ChatGPT 风格的图标栏（每次显示一个分区）。手机上是抽屉菜单，顶部的玻璃胶囊会在页面滚动时变得模糊。</p>
    </td>
    <td width="50%" valign="top">
      <h3>⚡ 无需整页刷新</h3>
      <p>在 LuCI 页面之间切换时只替换内容，几乎瞬间完成。不支持 Navigation API 的浏览器保持传统的整页加载。</p>
    </td>
  </tr>
  <tr>
    <td valign="top">
      <h3>🌗 浅色、深色与预设</h3>
      <p>跟随系统、浅色或深色，偏好自动保存，加载时无闪烁。可选 ChatGPT 与 Codex 系列预设（Catppuccin、Dracula、Nord、Tokyo Night……），也可以自定义颜色。</p>
    </td>
    <td valign="top">
      <h3>⌘ 命令面板</h3>
      <p>ChatGPT 风格的搜索：输入几个字母，即可跳转到菜单中的任意页面或标签页。</p>
    </td>
  </tr>
  <tr>
    <td valign="top">
      <h3>🎨 ChatGPT 的外观</h3>
      <p>胶囊控件、细线卡片、次级色说明文字，实时图表采用 Analytics 风格的曲线与图例。</p>
    </td>
    <td valign="top">
      <h3>🧩 应用同样适配</h3>
      <p>为第三方应用（如 Podkop 及其分支）提供按页面的修正；按 Bootstrap 配色编写的应用会使用 Outline 的颜色；未知分区显示首字母图标。</p>
    </td>
  </tr>
  <tr>
    <td valign="top">
      <h3>🏷️ 你的品牌</h3>
      <p>使用 Outline 的 Logo、OpenWrt 的，或上传你自己的；一张应用图标即可生成全部 favicon 与主屏幕图标尺寸。</p>
    </td>
    <td valign="top">
      <h3>📦 在 LuCI 中更新</h3>
      <p>检查更新、更新、在 Outline 与其他主题之间切换，或卸载，都在主题自己的设置页完成。</p>
    </td>
  </tr>
</table>

## 📸 截图

<table>
  <tr>
    <td width="50%" valign="top"><img src=".github/preview/mounts.png" alt="挂载点"><p align="center"><sub><b>设置页</b>：细线分隔的卡片与胶囊按钮</sub></p></td>
    <td width="50%" valign="top"><img src=".github/preview/login.png" alt="登录页"><p align="center"><sub><b>登录页</b></sub></p></td>
  </tr>
  <tr>
    <td valign="top"><img src=".github/preview/analytics.png" alt="实时图表"><p align="center"><sub><b>实时图表</b>，Analytics 风格</sub></p></td>
    <td valign="top"><img src=".github/preview/palette.png" alt="命令面板"><p align="center"><sub><b>命令面板</b>：<kbd>⌘</kbd> <kbd>K</kbd></sub></p></td>
  </tr>
  <tr>
    <td valign="top"><img src=".github/preview/interfaces.png" alt="接口"><p align="center"><sub><b>接口</b></sub></p></td>
    <td valign="top"><img src=".github/preview/rules.png" alt="防火墙规则"><p align="center"><sub><b>防火墙规则</b></sub></p></td>
  </tr>
  <tr>
    <td valign="top"><img src=".github/preview/wireless.png" alt="无线"><p align="center"><sub><b>无线</b></sub></p></td>
    <td valign="top"><img src=".github/preview/load.png" alt="负载图表"><p align="center"><sub><b>负载</b></sub></p></td>
  </tr>
</table>

<p align="center">
  <img src=".github/preview/mobile.png" alt="Outline 在手机上" width="100%">
  <br>
  <sub><b>手机上</b>：菜单在抽屉里，控件在悬浮的玻璃胶囊中。</sub>
</p>

## 🔧 设置

<kbd>系统</kbd> › <kbd>Outline Theme</kbd>，参照 ChatGPT 与 Codex 的
<i>设置 › 外观</i>：

| 标签页                 | 内容                                                                                                                                                                                                                                                                                                                         |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Appearance（外观）** | 模式（跟随系统、浅色、深色）；导航（顶栏或侧边栏）；主题预设（Outline、ChatGPT 以及 Codex 系列：Absolutely、Ayu、Catppuccin、Dracula、Everforest、GitHub、Gruvbox、Linear、Nord、Rose Pine、Solarized、Tokyo Night、Vercel……）；强调色、背景色与前景色；字体以及界面、内容、代码字号；对比度；减少动效；浅色与深色可分别设置 |
| **Branding（品牌）**   | Logo（Outline、OpenWrt 或上传的图片）以及一张生成全部 favicon 与主屏幕图标的应用图标                                                                                                                                                                                                                                         |
| **Package（软件包）**  | 检查更新、更新、在 Outline 与其他主题之间切换、卸载                                                                                                                                                                                                                                                                          |

修改只在设置页预览，通过 LuCI 自带的 <kbd>保存</kbd> 或 <kbd>保存并应用</kbd> 生效。
主题可以以 `outline-theme-v1:` 字符串复制和导入，Codex 的 `codex-theme-v1:` 字符串也可导入。
实现原理：[.dev/docs/settings.md](.dev/docs/settings.md)。

## 🧪 兼容性

|                   | 支持                                                                                                  |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| **OpenWrt**       | 23.05.0 或更高版本（依赖 ucode 模板与 LuCI JavaScript API）；24.10 及以下为 `.ipk`，25.12 起为 `.apk` |
| **Chrome / Edge** | 111+（2023 年 3 月）                                                                                  |
| **Safari**        | 16.4+（2023 年 3 月）                                                                                 |
| **Firefox**       | 128+（2024 年 7 月）                                                                                  |

> [!NOTE]
> 无刷新切换页面在支持的浏览器上使用
> [Navigation API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API)
> （Chrome 与 Edge 105+、Safari 26.2+、Firefox 147+）。其他浏览器保持传统整页加载，功能完全不受影响。

## 📥 安装

```sh
wget -qO- https://raw.githubusercontent.com/tickcount/luci-theme-outline/master/install.sh | sh
```

脚本会从最新 Release 中选择 `.ipk`（opkg，OpenWrt 24.10 及以下）或 `.apk`（apk，25.12 起），
校验其校验和，安装后把 Outline 设为当前 LuCI 主题。再次运行即可更新。

<details>
<summary><b>选项与卸载</b></summary>

<br>

选项写在 `sh -s --` 之后：

```sh
wget -qO- https://raw.githubusercontent.com/tickcount/luci-theme-outline/master/install.sh | sh -s -- --uninstall
```

| 选项            | 作用                                       |
| --------------- | ------------------------------------------ |
| `--no-activate` | 安装但不把 LuCI 切换到 Outline             |
| `--uninstall`   | 卸载主题；设置保留在 `/etc/config/outline` |
| `--purge`       | 卸载主题，并删除其设置与上传的品牌图片     |

更新、启用或停用主题以及卸载，也可以在 LuCI 的 <kbd>系统</kbd> › <kbd>Outline Theme</kbd> › <kbd>Package</kbd> 中完成。

</details>

<details>
<summary><b>从源码构建</b></summary>

<br>

`htdocs/` 不在 git 中：主题的 CSS 和 JS 需要先在 `.dev/` 中用 [pnpm](https://pnpm.io)（Node 22+）构建，再由 OpenWrt SDK 打包。

**使用 Docker**，与发布流程相同：

```sh
git clone https://github.com/tickcount/luci-theme-outline.git
cd luci-theme-outline
.dev/scripts/build-packages.sh        # 或：ipk | apk
```

它会构建 `htdocs/`，然后在 Docker 中用 OpenWrt 24.10 SDK 生成 `.ipk`、用 25.12 SDK 生成 `.apk`，
并连同 `sha256sums.txt` 写入 `dist/`。

**在你自己的源码树或 SDK 中**（需已安装 feeds；24.10 及以下构建 `.ipk`，25.12 起构建 `.apk`）：

```sh
git clone https://github.com/tickcount/luci-theme-outline.git package/luci-theme-outline
(cd package/luci-theme-outline/.dev && pnpm install --frozen-lockfile && pnpm build)
./scripts/feeds update -a && ./scripts/feeds install -a
make menuconfig    # LuCI → Themes → luci-theme-outline
make package/luci-theme-outline/compile V=s
```

软件包位于 `bin/packages/<arch>/base/`，拷贝到路由器后用 opkg 或 apk 安装即可。

</details>

## ❓ 常见问题

<details>
<summary><b>怎样换回默认主题？</b></summary>

<br>

在 <kbd>系统</kbd> › <kbd>Outline Theme</kbd> › <kbd>Package</kbd> 中把 LuCI 切换到其他主题，
或运行安装脚本并加上 `--uninstall`。Outline 的设置会保留，以后切换回来时自动恢复。

</details>

<details>
<summary><b>我安装的应用页面会显示错乱吗？</b></summary>

<br>

Outline 为 LuCI 自身的组件设计样式，大多数应用都基于这些组件；对于自行布局的页面
（其中包括 Podkop 及其分支），主题自带专门的修正。按 Bootstrap 配色变量编写的应用会改用 Outline 的颜色。

</details>

<details>
<summary><b>我的浏览器比较旧，能用吗？</b></summary>

<br>

需要[兼容性](#-兼容性)中列出的浏览器。无刷新切换只是支持的浏览器上的额外体验，其他浏览器照常加载页面。

</details>

## 🙏 致谢

感谢：

- [luci-theme-shadcn](https://github.com/eamonxg/luci-theme-shadcn)：Outline 由此主题分叉而来
- [shadcn/ui](https://github.com/shadcn-ui/ui)：最初的设计语言
- [Lucide](https://github.com/lucide-icons/lucide)：图标
- [Twemoji](https://github.com/twitter/twemoji)：在缺少国旗字体的系统上显示国旗（CC-BY 4.0，通过 [country-flag-emoji-polyfill](https://github.com/talkjs/country-flag-emoji-polyfill)）
- [Linear](https://linear.app)：色彩系统灵感
- [Vite](https://vite.dev/) 和 [Tailwind CSS](https://tailwindcss.com/)
- [luci-theme-bootstrap](https://github.com/openwrt/luci/tree/master/themes/luci-theme-bootstrap)：模板结构与 LuCI 集成参考
- [luci-theme-material](https://github.com/openwrt/luci/tree/master/themes/luci-theme-material)：侧边栏菜单渲染参考
- [luci-theme-footstrap](https://github.com/VizzleTF/luci-theme-footstrap)：一个自带客户端路由的 LuCI 主题；Outline 的页面切换借鉴了它的部分思路，并基于 Navigation API 实现（详见[路由文档](.dev/docs/router.md)）
- [Claude Code](https://claude.ai/code)

---

<div align="center">
<sub>为 OpenWrt 打造 · <a href="LICENSE">Apache 2.0</a> · <a href="#readme">回到顶部 ↑</a></sub>
</div>
