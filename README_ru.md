<div align="center">

<img src=".dev/public/outline/images/favicon.svg" alt="Outline" width="88" height="88">

<h1>Outline</h1>

**Тема LuCI для OpenWrt в стиле ChatGPT.**

<a href="https://github.com/tickcount/luci-theme-outline/releases/latest"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/github/release/tickcount/luci-theme-outline.svg?variant=secondary&font=geist&mode=dark"><img alt="Последний релиз" src="https://shieldcn.dev/github/release/tickcount/luci-theme-outline.svg?variant=secondary&font=geist&mode=light"></picture></a>
<a href="https://github.com/tickcount/luci-theme-outline/actions/workflows/ci.yml"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/github/ci/tickcount/luci-theme-outline.svg?variant=secondary&font=geist&mode=dark"><img alt="CI" src="https://shieldcn.dev/github/ci/tickcount/luci-theme-outline.svg?variant=secondary&font=geist&mode=light"></picture></a>
<a href="https://github.com/tickcount/luci-theme-outline/releases"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/github/downloads/tickcount/luci-theme-outline.svg?variant=secondary&font=geist&mode=dark"><img alt="Загрузки" src="https://shieldcn.dev/github/downloads/tickcount/luci-theme-outline.svg?variant=secondary&font=geist&mode=light"></picture></a>
<a href="LICENSE"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/license-Apache%202.0.svg?variant=secondary&font=geist&logo=lu:Scale&mode=dark"><img alt="Лицензия: Apache 2.0" src="https://shieldcn.dev/badge/license-Apache%202.0.svg?variant=secondary&font=geist&logo=lu:Scale&mode=light"></picture></a>
<br>
<a href="https://openwrt.org/"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/OpenWrt-%E2%89%A5%2023.05%20%C2%B7%20ipk%20%C2%B7%20apk.svg?variant=secondary&font=geist&logo=openwrt&mode=dark"><img alt="OpenWrt 23.05 и новее" src="https://shieldcn.dev/badge/OpenWrt-%E2%89%A5%2023.05%20%C2%B7%20ipk%20%C2%B7%20apk.svg?variant=secondary&font=geist&logo=openwrt&mode=light"></picture></a>
<a href="https://tailwindcss.com/"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/Tailwind%20CSS-4.svg?variant=secondary&font=geist&logo=tailwindcss&mode=dark"><img alt="Tailwind CSS 4" src="https://shieldcn.dev/badge/Tailwind%20CSS-4.svg?variant=secondary&font=geist&logo=tailwindcss&mode=light"></picture></a>
<a href="https://vite.dev/"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/built%20with-Vite.svg?variant=secondary&font=geist&logo=vite&mode=dark"><img alt="Vite" src="https://shieldcn.dev/badge/built%20with-Vite.svg?variant=secondary&font=geist&logo=vite&mode=light"></picture></a>

[**Быстрый старт**](#-быстрый-старт) &nbsp;·&nbsp; [Возможности](#-возможности) &nbsp;·&nbsp; [Скриншоты](#-скриншоты) &nbsp;·&nbsp; [Настройки](#-настройки) &nbsp;·&nbsp; [Совместимость](#-совместимость) &nbsp;·&nbsp; [Вопросы](#-вопросы-и-ответы)

[English](README.md) &nbsp;·&nbsp; **Русский** &nbsp;·&nbsp; [简体中文](README_zh.md)

</div>

<br>

Outline делает LuCI вашего роутера похожим на **настройки ChatGPT** и по виду, и
по ощущениям: кнопки-пилюли, карточки с тонкими разделителями, спокойная
типографика, **светлая и тёмная тема**, а страницы переключаются **без
перезагрузки**. Это обычная тема: установите её, и все страницы, включая
установленные вами приложения, подстроятся под неё.

<p align="center">
  <img src=".github/preview/hero.png" alt="Outline в светлой и тёмной теме" width="100%">
</p>

## 🚀 Быстрый старт

1. **Установите** на роутер (по SSH):

   ```sh
   wget -qO- https://raw.githubusercontent.com/tickcount/luci-theme-outline/master/install.sh | sh
   ```

2. **Обновите страницу LuCI.** Скрипт сам делает Outline активной темой.
3. **Настройте под себя** в <kbd>Система</kbd> › <kbd>Outline Theme</kbd>: режим,
   пресет, цвета, шрифты, логотип и иконку приложения.

> [!TIP]
> Нажмите <kbd>⌘</kbd> <kbd>K</kbd> (или <kbd>Ctrl</kbd> <kbd>K</kbd>) на любой
> странице, чтобы перейти к любой странице или вкладке.

## ✨ Возможности

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>🧭 Верхнее меню или боковая панель</h3>
      <p>Плавающие пилюли вверху страницы или панель с иконками в стиле ChatGPT, где открыт один раздел за раз. На телефонах меню в выдвижной панели, а стеклянные пилюли сверху размываются при прокрутке.</p>
    </td>
    <td width="50%" valign="top">
      <h3>⚡ Без полной перезагрузки</h3>
      <p>При переходе между страницами LuCI меняется только содержимое, поэтому всё происходит мгновенно. Браузеры без Navigation API загружают страницы как обычно.</p>
    </td>
  </tr>
  <tr>
    <td valign="top">
      <h3>🌗 Светлая, тёмная и пресеты</h3>
      <p>Как в системе, светлая или тёмная; выбор запоминается и не мигает при загрузке. Пресеты из ChatGPT и коллекции Codex (Catppuccin, Dracula, Nord, Tokyo Night, …) или свои цвета.</p>
    </td>
    <td valign="top">
      <h3>⌘ Командная палитра</h3>
      <p>Поиск в стиле ChatGPT: наберите несколько букв, чтобы перейти к любой странице или вкладке из меню.</p>
    </td>
  </tr>
  <tr>
    <td valign="top">
      <h3>🎨 Внешний вид ChatGPT</h3>
      <p>Кнопки-пилюли, карточки с тонкими разделителями, приглушённые описания, графики и легенды в стиле Analytics на графиках реального времени.</p>
    </td>
    <td valign="top">
      <h3>🧩 Приложения тоже вписываются</h3>
      <p>Исправления для страниц сторонних приложений, например Podkop и его форков; приложения, рассчитанные на цвета Bootstrap, получают цвета Outline; у неизвестных разделов иконка с буквой.</p>
    </td>
  </tr>
  <tr>
    <td valign="top">
      <h3>🏷️ Ваш брендинг</h3>
      <p>Логотип Outline, OpenWrt или свой, и одна иконка приложения, из которой делаются все favicon и иконки для домашнего экрана.</p>
    </td>
    <td valign="top">
      <h3>📦 Обновления из LuCI</h3>
      <p>Проверить и установить обновление, переключить LuCI на Outline или обратно, удалить тему: всё в собственных настройках темы.</p>
    </td>
  </tr>
</table>

## 📸 Скриншоты

<table>
  <tr>
    <td width="50%" valign="top"><img src=".github/preview/mounts.png" alt="Точки монтирования"><p align="center"><sub><b>Страницы настроек</b>: карточки с тонкими разделителями и кнопки-пилюли</sub></p></td>
    <td width="50%" valign="top"><img src=".github/preview/login.png" alt="Вход"><p align="center"><sub><b>Вход</b></sub></p></td>
  </tr>
  <tr>
    <td valign="top"><img src=".github/preview/analytics.png" alt="Графики в реальном времени"><p align="center"><sub><b>Графики реального времени</b> в стиле Analytics</sub></p></td>
    <td valign="top"><img src=".github/preview/palette.png" alt="Командная палитра"><p align="center"><sub><b>Командная палитра</b>: <kbd>⌘</kbd> <kbd>K</kbd></sub></p></td>
  </tr>
  <tr>
    <td valign="top"><img src=".github/preview/interfaces.png" alt="Интерфейсы"><p align="center"><sub><b>Интерфейсы</b></sub></p></td>
    <td valign="top"><img src=".github/preview/rules.png" alt="Правила межсетевого экрана"><p align="center"><sub><b>Правила межсетевого экрана</b></sub></p></td>
  </tr>
  <tr>
    <td valign="top"><img src=".github/preview/wireless.png" alt="Беспроводная сеть"><p align="center"><sub><b>Беспроводная сеть</b></sub></p></td>
    <td valign="top"><img src=".github/preview/load.png" alt="График загрузки"><p align="center"><sub><b>Загрузка</b></sub></p></td>
  </tr>
</table>

<p align="center">
  <img src=".github/preview/mobile.png" alt="Outline на телефонах" width="100%">
  <br>
  <sub><b>На телефонах</b>: меню в выдвижной панели, элементы управления в плавающих стеклянных пилюлях.</sub>
</p>

## 🔧 Настройки

<kbd>Система</kbd> › <kbd>Outline Theme</kbd>, по образцу
<i>Настройки › Внешний вид</i> в ChatGPT и Codex:

| Вкладка                      | Что в ней                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Appearance (внешний вид)** | Режим (как в системе, светлый, тёмный); навигация (верхнее меню или боковая панель); пресет (Outline, ChatGPT и коллекция Codex: Absolutely, Ayu, Catppuccin, Dracula, Everforest, GitHub, Gruvbox, Linear, Nord, Rose Pine, Solarized, Tokyo Night, Vercel, …); акцентный цвет, цвета фона и текста; шрифты и размеры интерфейса, содержимого и кода; контраст; меньше анимации; отдельные светлая и тёмная темы |
| **Branding (брендинг)**      | Логотип (Outline, OpenWrt или загруженный) и одна иконка приложения для всех favicon и иконок домашнего экрана                                                                                                                                                                                                                                                                                                    |
| **Package (пакет)**          | Проверка и установка обновлений, переключение LuCI на Outline или обратно, удаление                                                                                                                                                                                                                                                                                                                               |

Изменения видны только на странице настроек и сохраняются обычными кнопками LuCI
<kbd>Сохранить</kbd> или <kbd>Сохранить и применить</kbd>. Темы копируются и
импортируются строками `outline-theme-v1:`, строки Codex `codex-theme-v1:` тоже
импортируются. Как это устроено: [.dev/docs/settings.md](.dev/docs/settings.md).

## 🧪 Совместимость

|                   | Поддержка                                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------------------------- |
| **OpenWrt**       | 23.05.0 и новее (шаблоны ucode и JavaScript API LuCI); `.ipk` до 24.10 включительно, `.apk` начиная с 25.12 |
| **Chrome / Edge** | 111+ (март 2023)                                                                                            |
| **Safari**        | 16.4+ (март 2023)                                                                                           |
| **Firefox**       | 128+ (июль 2024)                                                                                            |

> [!NOTE]
> Переход между страницами без перезагрузки использует
> [Navigation API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API)
> там, где он есть (Chrome и Edge 105+, Safari 26.2+, Firefox 147+). Остальные
> браузеры загружают страницы как обычно, и ничего не теряется.

## 📥 Установка

```sh
wget -qO- https://raw.githubusercontent.com/tickcount/luci-theme-outline/master/install.sh | sh
```

Скрипт берёт из последнего релиза `.ipk` (opkg, OpenWrt 24.10 и старше) или
`.apk` (apk, 25.12 и новее), сверяет контрольную сумму, устанавливает пакет и
делает Outline активной темой LuCI. Чтобы обновиться, запустите его ещё раз.

<details>
<summary><b>Параметры и удаление</b></summary>

<br>

Параметры передаются после `sh -s --`:

```sh
wget -qO- https://raw.githubusercontent.com/tickcount/luci-theme-outline/master/install.sh | sh -s -- --uninstall
```

| Параметр        | Что делает                                                     |
| --------------- | -------------------------------------------------------------- |
| `--no-activate` | Установить, не переключая LuCI на Outline                      |
| `--uninstall`   | Удалить тему; её настройки остаются в `/etc/config/outline`    |
| `--purge`       | Удалить тему, её настройки и загруженные изображения брендинга |

Обновление, включение и выключение темы и удаление есть и в LuCI:
<kbd>Система</kbd> › <kbd>Outline Theme</kbd> › <kbd>Package</kbd>.

</details>

<details>
<summary><b>Сборка из исходников</b></summary>

<br>

`htdocs/` нет в git: CSS и JS темы сначала собираются из `.dev/` с помощью
[pnpm](https://pnpm.io) (Node 22+), а потом OpenWrt SDK упаковывает их.

**В Docker**, как при выпуске релиза:

```sh
git clone https://github.com/tickcount/luci-theme-outline.git
cd luci-theme-outline
.dev/scripts/build-packages.sh        # или: ipk | apk
```

Скрипт собирает `htdocs/`, затем в Docker `.ipk` (SDK OpenWrt 24.10) и `.apk`
(SDK 25.12) и складывает их вместе с `sha256sums.txt` в `dist/`.

**В своём дереве исходников или SDK** с установленными feeds (24.10 и старше
собирают `.ipk`, 25.12 и новее `.apk`):

```sh
git clone https://github.com/tickcount/luci-theme-outline.git package/luci-theme-outline
(cd package/luci-theme-outline/.dev && pnpm install --frozen-lockfile && pnpm build)
./scripts/feeds update -a && ./scripts/feeds install -a
make menuconfig    # LuCI → Themes → luci-theme-outline
make package/luci-theme-outline/compile V=s
```

Пакет появится в `bin/packages/<arch>/base/`; скопируйте его на роутер и
установите через opkg или apk.

</details>

## ❓ Вопросы и ответы

<details>
<summary><b>Как вернуть стандартную тему?</b></summary>

<br>

В <kbd>Система</kbd> › <kbd>Outline Theme</kbd> › <kbd>Package</kbd> можно
переключить LuCI на другую тему, или запустите установщик с `--uninstall`.
Настройки Outline сохраняются, и если вернуться к ней позже, они восстановятся.

</details>

<details>
<summary><b>Не сломаются ли страницы моих приложений?</b></summary>

<br>

Outline оформляет стандартные элементы LuCI, на которых построено большинство
приложений, и содержит исправления для страниц, которые свёрстаны по-своему
(среди них Podkop и его форки). Приложения, написанные под цветовые переменные
Bootstrap, получают цвета Outline.

</details>

<details>
<summary><b>У меня старый браузер. Всё будет работать?</b></summary>

<br>

Нужен один из браузеров из раздела [Совместимость](#-совместимость). Мгновенное
переключение страниц работает там, где браузер это поддерживает; в остальных
страницы просто загружаются как обычно.

</details>

## 🙏 Благодарности

Спасибо:

- [luci-theme-shadcn](https://github.com/eamonxg/luci-theme-shadcn), теме, форком которой является Outline
- [shadcn/ui](https://github.com/shadcn-ui/ui), исходному дизайн-языку
- [Lucide](https://github.com/lucide-icons/lucide), за иконки
- [Twemoji](https://github.com/twitter/twemoji), за флаги стран в системах, где их нет (CC-BY 4.0, через [country-flag-emoji-polyfill](https://github.com/talkjs/country-flag-emoji-polyfill))
- [Linear](https://linear.app), за вдохновение для цветовой системы
- [Vite](https://vite.dev/) и [Tailwind CSS](https://tailwindcss.com/)
- [luci-theme-bootstrap](https://github.com/openwrt/luci/tree/master/themes/luci-theme-bootstrap), за структуру шаблонов и приёмы интеграции с LuCI
- [luci-theme-material](https://github.com/openwrt/luci/tree/master/themes/luci-theme-material), за подход к отрисовке бокового меню
- [luci-theme-footstrap](https://github.com/VizzleTF/luci-theme-footstrap), теме LuCI со своим клиентским роутером; переключение страниц в Outline заимствует часть её идей и строит их на Navigation API (см. [документацию роутера](.dev/docs/router.md))
- [Claude Code](https://claude.ai/code)

---

<div align="center">
<sub>Сделано для OpenWrt · <a href="LICENSE">Apache 2.0</a> · <a href="#readme">Наверх ↑</a></sub>
</div>
