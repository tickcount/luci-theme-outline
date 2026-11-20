# The theme's settings

The theme ships its own settings, with no menu entry of their own: in
System › System › **Language and Style**, under the Design field while it
says Outline -- the **Outline** section (the package: updates, automatic
updates, removal), then **Appearance** (with the brand pictures and the
backdrop).

## Files

| Path                                                | Role                                                               |
| --------------------------------------------------- | ------------------------------------------------------------------ |
| `.dev/src/resource/outline/appearance.js`           | Appearance: state, page-only preview, Save/Reset (`load`/`create`) |
| `.dev/src/resource/outline/package.js`              | the Outline section: release check, update, schedule, purge        |
| `.dev/src/resource/patches/admin-system-system.js`  | both, embedded in System › Language and Style                      |
| `.dev/src/resource/outline/brand.js`                | Its brand pictures: logo, app icon, backdrop, uploads              |
| `.dev/src/resource/outline/palette.js`              | 4 inputs → token overrides → stylesheet (`tokens()`, `assemble()`) |
| `.dev/src/resource/outline/presets.js`              | Vercel, ChatGPT and the Codex presets; named accents; font lists   |
| `.dev/src/resource/outline/share.js`                | `outline-theme-v1:` / `codex-theme-v1:` share strings              |
| `.dev/src/resource/outline/icons.js`                | App icon → favicon / ICO / 180 / 192 / 512 in the browser          |
| `.dev/src/resource/outline/ui.js`                   | Codex-style widgets and their CSS (`ot-*`)                         |
| `root/usr/share/rpcd/ucode/luci.outline`            | rpcd object `luci.outline`                                         |
| `root/usr/libexec/outline/job`                      | detached package worker                                            |
| `root/usr/share/rpcd/acl.d/luci-theme-outline.json` | ACL                                                                |
| `root/etc/uci-defaults/30_luci-theme-outline`       | activation + `/etc/config/outline` sections                        |
| `install.sh`                                        | first installation / removal over SSH                              |

The pages are built like every other resource: `luci-js-compress` runs terser
over `src/resource/**` (they are excluded from Tailwind's scan in `main.css`).
`LUCI_MINIFY_JS:=0` in the Makefile keeps luci.mk's jsmin away from them: it
would squeeze the CSS inside `ui.js`'s template literal (`.ot *` → `.ot*`).

## Storage and rendering

```
/etc/config/outline
  appearance  mode, reduced_motion, ui/content/code_font_size,
              navigation (navbar | sidebar; unset = navbar),
              nav_style (docked | floating | inset for a sidebar, pills | bar
              for a navbar; unset or foreign to the kind = its first),
              backdrop_blur (0–80 px; 48), backdrop_coat (86–100 %; 90),
              backdrop_fit (fill | fit | stretch | center | tile; fill),
              content_width (600–2560 px; default 920)
  light|dark  preset, accent_name, accent, surface, ink, contrast,
              font_ui, font_ui_weight, font_content, font_code,
              list token 'name=#rrggbb[aa]'      ← derived by palette.tokens()
  branding    logo, icon, favicon, favicon_ico, apple_touch, pwa_192, pwa_512,
              backdrop, rev,
              logo_router, icon_router   ← accent key a baked Router wears
  updates     repo (optional; default tickcount/luci-theme-outline)
```

`header.ut` assembles the override sheet from the committed config with a
line-for-line ucode copy of `palette.assemble()` and emits it in
`<style id="outline-appearance" data-luci-shell>` (the login page included),
plus `html[data-default-theme]`, `html[data-reduced-motion]`,
`html[data-nav]` / `html[data-nav-style]` (its own copy of the page's
`NAV_KIND` map, held to it by `settings-palette.test.js`),
`html[data-backdrop]` with `#outline-backdrop` (the picture's URL and the
blur/coat as custom properties on it), the theme-color
metas, the brand URLs, `#sidebar[data-logo]` and the PWA manifest (written to
`/www/luci-static/outline-brand/site.webmanifest` whenever it is out of date).
An unset or legacy Outline preset uses the Vercel token defaults embedded in the template. `settings-palette.test.js` holds
the ucode constants to the JS ones; the assembly itself can only run on a
device -- after a change, compare the rendered `#outline-appearance` text with
`palette.stylesheet()` for the same state.

Two template pitfalls, both learned on the device:

- No `}}` anywhere inside a `{% %}` block, comments included: the template
  lexer reads it as the end of a `{{ }}` tag. Build such strings by
  concatenation.
- No `\x00` in a regex: ucode hands it to POSIX `regcomp`, which stops at the
  NUL and fails at render time with "Missing ']'" -- `ucode -c` does not catch
  it, and it takes every page down. Use `[:cntrl:]`.

## Preview and saving

Controls preview on their page only: Appearance rewrites `#outline-appearance`,
the mode/motion/navigation attributes and `#outline-backdrop`; its brand
pictures the sidebar logo, the icon links and the backdrop. A
MutationObserver restores the originals when the view leaves `#view` (the
router swaps pages in place). Save stages the brand choices first (rendering
and uploading the app icon sizes when needed), then the appearance options,
then one `uci.save()`. Only options whose value differs from the stored one
are written: LuCI counts every write as a pending change, each value of a
list on its own, so restaging the two `token` lists alone would add ~320
changes to every save. Nothing is stored until the footer's **Save**
(`uci.set` + `uci.save()`, staged as LuCI unsaved changes) or **Save & Apply**
(view's default `handleSaveApply` → `ui.changes.apply()`, with rollback).
**Reset** returns to the loaded or last saved state.

### Where it is drawn: System › Language and Style

`patches/admin-system-system.js` (a [page patch](patches.md)) draws the
Outline section and Appearance under the tab's card while the tab is open
and its **Design** field says Outline; picking another theme there hides
them and drops the preview. There is no menu entry and no page of their
own. Both are modules (`outline/package.js`, `outline/appearance.js`:
`load()`, then `create()` → `render()`; Appearance adds `handleSave()`,
`handleReset()`, `dirty()`) because a view cannot be required on another
page: LuCI instantiates it, and a view's constructor takes over `#view`.

It stands after the System form, not in it -- the form re-renders on every
save -- and rides that page's footer: LuCI's view saves and resets every
`.cbi-map` in `#maincontent` through its bound class instance, so the embed
is a `.cbi-map` bound to one. Its save stages only when `dirty()` and
Outline is picked, so a hostname edit never touches `outline`.

## Palette

Codex expands accent A, surface S, ink I and contrast c with integer sRGB
lerps and ink-alpha fills, c folded into k (`contrastK`, D/100 at the variant
default D = 45 light / 60 dark). The constants are solved against
`.dev/tokens/defaults.js` with Codex's slopes in k, so the stock inputs
reproduce every neutral exactly (`settings-palette.test.js`). Only the accent
family is written when only the accent moved. The theme flattens aliases and
alpha variants into literals, so `derive()` writes every consumer name: if a
token is renamed in `defaults.js`/`spec.js`, update `derive()` and the test.

## Brand pictures and the backdrop

Uploads go through `cgi-upload` to `/tmp/outline-brand.upload`; `brand_upload`
checks type, size (4 MB) and content (magic bytes; an SVG with script, event
handlers, `foreignObject` or external references is refused, since it is
served from LuCI's origin) and stores `<slot>-<time>.<ext>` under
`/www/luci-static/outline-brand/` (kept across sysupgrade by
`/lib/upgrade/keep.d/luci-theme-outline`). Per slot an upload keeps only
itself and the committed file (earlier uploads go at once), and every applied
change to `/etc/config/outline` runs `/usr/libexec/outline/brand-prune`
(through the init script's reload trigger): files no committed
`outline.branding` option names are deleted, so a slot set back to its stock
choice leaves no upload behind. An upload commits only `rev`, which sends no
`config.change`, so a picture awaiting its Save & Apply survives until then. `logo=openwrt` points at
luci-theme-bootstrap's `logo.svg`. The App icon is rendered in the browser
(canvas) into the five icon slots on Save.

**Outline** -- the theme's own Logo and App icon, the first choice after
OpenWrt's in both rows (OpenWrt, Outline, then uploads) -- is a picture that
wears the accent: a ceramic router under a glass lens, no background, SVG
only. `outline/routericon.js` builds it from one hex, every colour a literal
(no `var()`/`color-mix()`), so it renders alike in an `<img>`, as a favicon
and on the sign-in page, and passes `svg_safe`. Its viewBox is optically
centred (halfway between the drawing's box centre and its centre of mass).
It has a dark and a light look in one file (on a light page the white body
gets a hairline, a deeper side and a denser shadow; the lens stays smoked),
the light one under `@media (prefers-color-scheme: light)`: in an `<img>` that
follows the page's `color-scheme`, which `_shared.css` sets from
`html[data-darkmode]`, so the sidebar, navbar and sign-in logo switch with
the theme's own mode; in a favicon it follows the browser.

The stock `logo.svg` and `favicon.svg` (`.dev/public/outline/images`) are
it in the stock dark accent (`#006efe`); `main.css` keeps that folder out of
Tailwind's scan (an SVG's `transform` attribute is no class). There are no
stock rasters: header.ut links an ICO and an Apple touch icon only when an
App icon picture was rendered into them, and the default manifest names
`favicon.svg` (`sizes: any`). With the stock accent nothing is uploaded. Any
other accent is baked on Save into two SVG uploads -- the `logo` slot
(header.ut and sysauth.ut serve it like any upload) and the `favicon` slot,
the other icon slots cleared -- and the key goes into `logo_router` /
`icon_router`. The key is `<rev>/<variant>:<accent>`: `REV` in
`routericon.js` is the drawing's revision, so files baked from an earlier
drawing are stale (`brand.stale()` makes the page dirty) and the next Save
bakes them anew; the same key keeps the files. A baked Outline logo is still
the Outline tile, never a "Custom" one.

`<variant>:<accent>` comes from `Appearance.iconAccent()`: the variant whose
accent was edited on the page (the shown one first), else the one the stored
files came from, else the shown one -- so opening the page in the other mode
changes nothing, though the stock accents differ by a shade (`#006aff` /
`#006efe`). A named accent counts by its id and is drawn in its dark shade;
a custom one by its hex. The preview follows the accent live
(`Appearance.commit()` calls `brand.preview()`; it repaints the rail's and
panel's `.sidebar-logo` and the phone navbar's `.topbar-brand img`). Uploads
go one after another -- they share `/tmp/outline-brand.upload`.

The App icon's `logo` value (follow the logo) has no tile of its own: with
OpenWrt's logo it is the OpenWrt tile, with Outline's the Outline tile, and
with an uploaded logo that upload shows as the row's Custom tile. Other App
icon pictures (OpenWrt's, uploads) still go through `icons.js` into all five
slots. `settings-router-icon.test.js` holds these rules and the tile order.

The backdrop is a raster slot (`backdrop`): the browser re-encodes a picture
larger than 2560 px or 1.5 MB as a JPEG of at most 2560 px (it is blurred
anyway, and the router's flash is small) before it uploads it. Its
position follows macOS (`#outline-backdrop[data-fit]`: Fill covers the
window, Fit and Stretch show the whole picture). header.ut renders
`#outline-backdrop` on every page, the login page included; footer.ut and
sysauth.ut keep its markup in `localStorage['outline.backdrop']` for the
static site root (`/www/outline.html`). The base rules are
`_backdrop.css`, imported by main.css and login.css alike; over a picture
LuCI's dialogs and the sign-in card are frosted (`--elevated-a60` over a
blur). header.ut
emits it only while the file exists. Its coat has one floor in CSS, 86 % in
either mode, so muted text keeps AA over any picture; cards and tables take
`--elevated-a60` over it (`_nav.css`).

## Package

The Outline section: the installed version with the last check (**Check for
updates**, or **Update** once a newer release is known), **Automatic
updates**, and **Remove Outline completely**. Its actions run at once; none
is a staged setting.

Automatic updates are on by default: uci-defaults turns them on (weekly, at a
time picked once at random, 03:00-05:59) whenever `outline.updates.auto` is
unset, that is until someone chooses; a router where they were switched off
keeps them off.

`job_start` forks `/usr/libexec/outline/job` (which re-runs itself from
`/tmp`), the page polls `job_status`. Releases resolve as manifest.json → API →
Atom feed + `expanded_assets` (the API rate-limits CGNAT addresses);
`manifest.json` is published by the release workflow with a sha256 per
package. `install.sh` uses the same chain.

- **Uninstall** (the job and `install.sh --uninstall`; not offered in LuCI):
  LuCI → Bootstrap, `luci.themes.Outline` deleted, package and leftovers
  removed; `/etc/config/outline` and brand images kept.
- **Remove completely**: the above plus the config and brand images; the page
  clears this browser's `outline.*` storage.
