"use strict";
"require baseclass";
"require rpc";
"require uci";
"require ui";
"require outline.palette as palette";
"require outline.presets as presets";
"require outline.share as share";
"require outline.ui as w";
"require outline.brand as brand";

/*
 * The theme's Appearance settings -- the Codex "Appearance" page for LuCI --
 * drawn in System › System › Language and Style under the Design field
 * while Outline is picked there (patches/admin-system-system.js). A module,
 * not a view: a view cannot be required on another page -- LuCI
 * instantiates it, and a view's constructor takes over #view.
 *
 * Controls preview on this page only: the page rewrites the
 * <style id="outline-appearance"> element header.ut emits (and the mode and
 * motion attributes), and puts everything back when it is left. Nothing is
 * stored until the footer's Save (staged as LuCI unsaved changes) or Save &
 * Apply (committed with LuCI's rollback). The stored form is the inputs plus
 * the derived `list token` entries header.ut assembles the sheet from.
 * Two themes are always kept -- light and dark -- and "Separate light and
 * dark modes" only decides whether both are shown (page state, as in Codex).
 * The brand pictures (logo, app icon, backdrop) are outline/brand.js, saved
 * in the same chain.
 */

const callState = rpc.declare({ object: "luci.outline", method: "get_state" });

const VARIANT_FIELDS = [
  "preset",
  "accent_name",
  "accent",
  "surface",
  "ink",
  "contrast",
  "font_ui",
  "font_ui_weight",
  "font_content",
  "font_code",
];

const CONTENT_WIDTH = { min: 600, max: 2560, def: 920 };

/* Navigation styles by kind (header.ut keeps the same map). */
const NAV_KIND = {
  docked: "sidebar",
  floating: "sidebar",
  inset: "sidebar",
  pills: "navbar",
  bar: "navbar",
};

/* The backdrop's blur (px) and coat (% of the page colour over it). The
   coat's floor keeps muted text at AA over any picture (light keeps 90). */
/* How the picture sits in the window, as macOS offers it. */
const BACKDROP_FIT = ["fill", "fit", "stretch", "center", "tile"];

const BACKDROP = {
  backdrop_blur: { min: 0, max: 80, def: 48 },
  backdrop_coat: { min: 86, max: 100, def: 90 },
};

const SIZES = {
  ui_font_size: { min: 11, max: 16, def: 14 },
  content_font_size: { min: 12, max: 24, def: 14 },
  code_font_size: { min: 8, max: 24, def: 13 },
};

function variantFrom(conf, v) {
  const d = presets.VERCEL[v];
  conf = conf || {};
  if (conf.preset == "outline") conf = {};
  const t = {
    preset: conf.preset || "vercel",
    accent_name: conf.accent_name || "custom",
    accent: conf.accent || d.accent,
    surface: conf.surface || d.surface,
    ink: conf.ink || d.ink,
    contrast:
      conf.contrast != null && conf.contrast !== ""
        ? +conf.contrast
        : d.contrast,
    font_ui: conf.font_ui || "",
    font_ui_weight: conf.font_ui_weight || "",
    font_content: conf.font_content || "",
    font_code: conf.font_code || "",
  };
  return Object.assign(t, palette.normalize(v, t));
}

function stateFrom(mode) {
  const ap = uci.get("outline", "appearance") || {};
  const size = (k) => {
    const n = parseInt(ap[k], 10),
      s = SIZES[k];
    return n >= s.min && n <= s.max ? n : s.def;
  };
  const range = (k) => {
    const n = parseInt(ap[k], 10),
      s = BACKDROP[k];
    return n >= s.min && n <= s.max ? n : s.def;
  };
  const navigation = ap.navigation == "sidebar" ? "sidebar" : "navbar";
  return {
    appearance: {
      mode: mode,
      reduced_motion:
        ["system", "on", "off"].indexOf(ap.reduced_motion) > -1
          ? ap.reduced_motion
          : "system",
      ui_font_size: size("ui_font_size"),
      content_font_size: size("content_font_size"),
      code_font_size: size("code_font_size"),
      navigation: navigation,
      nav_style:
        NAV_KIND[ap.nav_style] == navigation
          ? ap.nav_style
          : navigation == "sidebar"
            ? "docked"
            : "pills",
      backdrop_blur: range("backdrop_blur"),
      backdrop_coat: range("backdrop_coat"),
      backdrop_fit:
        BACKDROP_FIT.indexOf(ap.backdrop_fit) > 0 ? ap.backdrop_fit : "fill",
      content_width:
        Number.isInteger(Number(ap.content_width)) &&
        +ap.content_width >= CONTENT_WIDTH.min &&
        +ap.content_width <= CONTENT_WIDTH.max
          ? +ap.content_width
          : CONTENT_WIDTH.def,
    },
    light: variantFrom(uci.get("outline", "light"), "light"),
    dark: variantFrom(uci.get("outline", "dark"), "dark"),
  };
}

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}

function variantName(v) {
  return v == "light" ? _("Light") : _("Dark");
}

const Page = {
  load() {
    return Promise.all([
      L.resolveDefault(callState(), null),
      brand.list(),
      uci.load("outline").catch(() => null),
    ]);
  },

  render(data) {
    this.data = data[0] || {};
    this.brand = brand.create(
      data[1],
      () => this.paint(),
      (prefer) => this.iconAccent(prefer),
    );
    this.state = stateFrom(this.initialMode());
    this.saved = clone(this.state);
    this.separate = false;
    this.advanced = /[#&]advanced\b/.test(location.hash);
    this.root = E("div", { class: "ot" });
    this.captureOriginal();
    /* Stale Outline files (another drawing): show what Save will bake. */
    if (this.brand.stale()) this.brand.preview();

    /* The header toggle and ⌘K can flip the mode under us; the single
		   theme card follows whichever variant is showing. Leaving the page
		   (the theme's router swaps #view in place) drops the preview. */
    const mo = new MutationObserver(() => {
      if (!this.root.isConnected) {
        mo.disconnect();
        this.restoreOriginal();
        this.brand.restore();
        return;
      }
      if (!this.separate && this.shownVariant != this.effectiveVariant())
        this.paint();
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-darkmode"],
    });
    mo.observe(document.body, { childList: true, subtree: true });

    this.paint();
    return E("div", {}, [w.styleNode(), this.root, this.brand.input]);
  },

  /* ── Preview, only while this page is shown ── */

  outlineActive() {
    return !!(
      this.data.theme &&
      this.data.theme.active &&
      document.documentElement.hasAttribute("data-outline-media")
    );
  },

  captureOriginal() {
    const html = document.documentElement;
    const el = document.getElementById("outline-appearance");
    this.original = {
      css: el ? el.textContent : null,
      darkmode: html.getAttribute("data-darkmode"),
      reduced: html.getAttribute("data-reduced-motion"),
      nav: html.getAttribute("data-nav-style"),
      collapsed: html.getAttribute("data-sidebar-collapsed"),
      backdrop: document
        .getElementById("outline-backdrop")
        ?.getAttribute("style"),
      fit: document
        .getElementById("outline-backdrop")
        ?.getAttribute("data-fit"),
      metas: Array.prototype.map.call(
        document.querySelectorAll('meta[name="theme-color"]'),
        (m) => [m, m.getAttribute("content")],
      ),
    };
  },

  restoreOriginal() {
    const o = this.original,
      html = document.documentElement;
    if (!o) return;
    const el = document.getElementById("outline-appearance");
    if (el) {
      if (o.css == null) el.remove();
      else if (el.textContent !== o.css) el.textContent = o.css;
    }
    if (o.darkmode != null) html.setAttribute("data-darkmode", o.darkmode);
    if (o.reduced == null) html.removeAttribute("data-reduced-motion");
    else html.setAttribute("data-reduced-motion", o.reduced);
    if (o.nav != null) this.applyNav(o.nav, o.collapsed);
    const bd = document.getElementById("outline-backdrop");
    if (bd && o.backdrop != null) bd.setAttribute("style", o.backdrop);
    if (bd && o.fit != null) bd.setAttribute("data-fit", o.fit);
    o.metas.forEach((e) => e[0].setAttribute("content", e[1]));
    w.closePopover();
  },

  effectiveVariant() {
    const attr = document.documentElement.getAttribute("data-darkmode");
    if (attr != null) return attr == "true" ? "dark" : "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  },

  /* The mode this browser shows: its own stored choice, else the router
	   default. That is what the Mode tiles start on. */
  initialMode() {
    let m = null;
    try {
      m = localStorage.getItem("outline.theme");
    } catch (e) {}
    if (m == "device") return "system";
    if (m == "light" || m == "dark") return m;
    const def = (uci.get("outline", "appearance") || {}).mode;
    return ["system", "light", "dark"].indexOf(def) > -1 ? def : "system";
  },

  stylesheet(state) {
    return palette.stylesheet(state || this.state);
  },

  /* Rewrite the theme's override element in place. It is marked
	   data-luci-shell, so the theme's router keeps the document clean. */
  writeStyle(css, state) {
    if (!this.outlineActive()) return;
    state = state || this.state;
    let el = document.getElementById("outline-appearance");
    if (!el) {
      el = E("style", { id: "outline-appearance", "data-luci-shell": "" });
      document.head.appendChild(el);
    }
    if (el.textContent !== css) el.textContent = css;

    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
      const v = /dark/.test(m.getAttribute("media") || "") ? "dark" : "light";
      m.setAttribute("content", palette.themeColor(v, state[v]));
    });
  },

  previewMode(mode) {
    if (!this.outlineActive()) return;
    const dark =
      mode == "dark" ||
      (mode == "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.setAttribute(
      "data-darkmode",
      dark ? "true" : "false",
    );
  },

  /* The layout attributes header.ut sets (kind and style), plus the
     sidebar's collapsed state: a navbar has none, a sidebar gets this
     browser's back. */
  applyNav(style, collapsed) {
    const html = document.documentElement;
    const nav = NAV_KIND[style] || "navbar";
    if (collapsed == null) {
      let stored = null;
      try {
        stored = localStorage.getItem("outline.sidebar");
      } catch (e) {}
      collapsed = nav != "navbar" && stored == "true" ? "true" : "false";
    }
    window.OutlineSidebar?._hideCollapsedPopover?.();
    html.setAttribute("data-nav", nav);
    html.setAttribute("data-nav-style", style);
    html.setAttribute("data-sidebar-collapsed", collapsed);
    document
      .getElementById("sidebar")
      ?.setAttribute("data-collapsed", collapsed);
  },

  previewNav(style) {
    if (this.outlineActive()) this.applyNav(style);
  },

  setNavStyle(style) {
    this.state.appearance.nav_style = style;
    this.state.appearance.navigation = NAV_KIND[style];
    this.previewNav(style);
    this.paint();
  },

  previewBackdrop() {
    const bd = document.getElementById("outline-backdrop");
    if (!bd || !this.outlineActive()) return;
    const ap = this.state.appearance;
    bd.style.setProperty("--backdrop-blur", ap.backdrop_blur + "px");
    bd.style.setProperty("--backdrop-coat", ap.backdrop_coat / 100);
    bd.setAttribute("data-fit", ap.backdrop_fit);
  },

  setBackdrop(patch) {
    Object.assign(this.state.appearance, patch);
    this.previewBackdrop();
  },

  previewMotion(value) {
    const html = document.documentElement;
    if (value == "system") html.removeAttribute("data-reduced-motion");
    else
      html.setAttribute(
        "data-reduced-motion",
        value == "on" ? "true" : "false",
      );
  },

  preview(v, patch) {
    const tmp = Object.assign({}, this.state);
    tmp[v] = Object.assign({}, this.state[v], patch);
    this.writeStyle(this.stylesheet(tmp), tmp);
  },

  /* The accent Outline's brand picture wears, as { key, hex, stock }; key is
     "<variant>:<accent>". Which variant: one whose accent was edited on
     this page (the shown one first), else `prefer` -- the variant the stored
     files came from -- else the shown one. So only an accent edit (or a
     first bake) changes the key; opening the page in the other mode does
     not, though the two stock accents differ by a shade. A named accent
     counts by its id and is drawn in its dark shade (the tile is dark). */
  iconAccent(prefer) {
    const id = (t) => {
      const named = presets.ACCENTS.find((a) => a.id == t.accent_name);
      return named ? named.id : String(t.accent || "").toLowerCase();
    };
    const edited = (v) => id(this.state[v]) != id(this.saved[v]);
    const shown = this.effectiveVariant();
    const other = shown == "light" ? "dark" : "light";
    const v = edited(shown)
      ? shown
      : edited(other)
        ? other
        : prefer == "light" || prefer == "dark"
          ? prefer
          : shown;
    const t = this.state[v];
    const named = presets.ACCENTS.find((a) => a.id == t.accent_name);
    const hex = (named && presets.accentHex(named.id, "dark")) || t.accent;
    /* The stock accent: the theme's own images already wear it. */
    const stock = id(t) == id({ accent: presets.VERCEL[v].accent });
    return { key: v + ":" + id(t), hex: hex, stock: stock };
  },

  commit(paint) {
    this.writeStyle(this.stylesheet());
    /* The Router logo and icon follow the accent while previewed. */
    this.brand.preview();
    if (paint !== false) this.paint();
  },

  setTheme(v, patch, paint) {
    this.state[v] = Object.assign({}, this.state[v], patch);
    this.commit(paint);
  },

  setAppearance(patch, paint) {
    Object.assign(this.state.appearance, patch);
    this.commit(paint);
  },

  setMode(mode) {
    this.state.appearance.mode = mode;
    this.previewMode(mode);
    if (this.separate) this.paint();
  },

  setReducedMotion(value) {
    this.previewMotion(value);
    this.setAppearance({ reduced_motion: value }, false);
  },

  /* ── Footer: Save / Save & Apply / Reset ── */

  /* Stage the page state as LuCI unsaved changes. view's default
	   handleSaveApply runs this, then ui.changes.apply(). */
  handleSave() {
    return this.brand
      .stage()
      .then(() => this.stageAppearance())
      .catch((err) => {
        ui.addNotification(
          null,
          E(
            "p",
            {},
            _("Unable to save the appearance settings: %s").format(
              err.message || err,
            ),
          ),
          "danger",
        );
        return Promise.reject(err);
      });
  },

  stageAppearance() {
    const s = this.state;
    const ensure = (sid, type) => {
      if (!uci.get("outline", sid)) uci.add("outline", type, sid);
    };
    /* Only what differs from the stored value: LuCI counts every write as
       a change (each value of a list on its own), so restaging the token
       lists would add ~300 changes to every save. */
    const put = (sid, opt, val) => {
      const cur = uci.get("outline", sid, opt);
      if (val == null || val === "" || (Array.isArray(val) && !val.length)) {
        if (cur != null) uci.unset("outline", sid, opt);
      } else if (Array.isArray(val)) {
        const same =
          Array.isArray(cur) &&
          cur.length == val.length &&
          cur.every((x, i) => x === val[i]);
        if (!same) uci.set("outline", sid, opt, val);
      } else if (cur !== String(val)) uci.set("outline", sid, opt, String(val));
    };

    ensure("appearance", "appearance");
    for (const k of Object.keys(s.appearance))
      put("appearance", k, s.appearance[k]);
    /* The router no longer reads these two; drop them from older setups. */
    put("appearance", "theme_color_light", null);
    put("appearance", "theme_color_dark", null);

    for (const v of ["light", "dark"]) {
      ensure(v, "theme");
      for (const k of VARIANT_FIELDS) put(v, k, s[v][k]);
      put(v, "token", palette.tokens(v, s[v]));
    }

    return uci.save().then(() => {
      this.saved = clone(s);
      this.brand.markSaved();
      /* The mode is also this browser's own choice. */
      const stored =
        s.appearance.mode == "system" ? "device" : s.appearance.mode;
      if (window.OutlineSidebar && window.OutlineSidebar.applyTheme)
        window.OutlineSidebar.applyTheme(stored);
      else
        try {
          localStorage.setItem("outline.theme", stored);
        } catch (e) {}
      this.original.darkmode =
        document.documentElement.getAttribute("data-darkmode");
      if (ui.changes && ui.changes.init) ui.changes.init();
      this.paint();
    });
  },

  /* Anything to stage: the settings or a brand picture changed since they
     were loaded (or last saved). */
  dirty() {
    return (
      JSON.stringify(this.state) != JSON.stringify(this.saved) ||
      JSON.stringify(this.brand.state) != JSON.stringify(this.brand.saved) ||
      this.brand.stale()
    );
  },

  /* Back to what was loaded (or last saved) -- preview included. */
  handleReset() {
    this.state = clone(this.saved);
    this.separate = false;
    this.previewMode(this.state.appearance.mode);
    this.previewMotion(this.state.appearance.reduced_motion);
    this.previewNav(this.state.appearance.nav_style);
    this.previewBackdrop();
    this.brand.reset();
    this.commit();
  },

  advancedDirty() {
    const ap = this.state.appearance;
    if (ap.reduced_motion != "system") return true;
    for (const k in SIZES) if (ap[k] != SIZES[k].def) return true;
    for (const v of ["light", "dark"]) {
      const t = this.state[v];
      if (
        t.contrast != presets.VERCEL[v].contrast ||
        t.font_code ||
        t.font_content ||
        t.font_ui_weight
      )
        return true;
    }
    return false;
  },

  /* Codex's "Reset to default": sizes, motion, and per variant contrast,
	   content/code fonts and the font style. Colours, the UI font, the preset
	   and the mode are left alone. Like every control here, it previews
	   until Save. */
  resetAdvanced() {
    const ap = this.state.appearance;
    for (const k in SIZES) ap[k] = SIZES[k].def;
    this.separate = false;
    this.setReducedMotion("system");
    for (const v of ["light", "dark"])
      Object.assign(this.state[v], {
        contrast: presets.VERCEL[v].contrast,
        font_code: "",
        font_content: "",
        font_ui_weight: "",
      });
    this.commit();
  },

  /* ── Render ── */

  paint() {
    w.closePopover();
    // The backdrop's blur and coat follow the page state, whatever the
    // server rendered (a picture picked or uploaded meanwhile included).
    this.previewBackdrop();
    const variants = this.separate
      ? ["light", "dark"]
      : [this.effectiveVariant()];
    this.shownVariant = variants[0];

    const visual = w.section(_("Visual style"), null, [
      w.card([
        w.row({
          variant: "nested",
          label: _("Mode"),
          control: w.modePicker(this.state.appearance.mode, (m) =>
            this.setMode(m),
          ),
        }),
        w.row({
          variant: "nested",
          label: _("Sidebar"),
          description: _("Docked, floating on the page, or the page inset"),
          control: w.navPicker(
            "sidebar",
            this.state.appearance.nav_style,
            (n) => this.setNavStyle(n),
            "ot-nav",
          ),
        }),
        w.row({
          variant: "nested",
          label: _("Navbar"),
          description: _("Floating pills, or a bar along the top"),
          control: w.navPicker(
            "navbar",
            this.state.appearance.nav_style,
            (n) => this.setNavStyle(n),
            "ot-nav",
          ),
        }),
        w.row({
          variant: "nested",
          label: _("Content width"),
          description: _("Maximum width of the page content"),
          control: w.slider({
            value: this.state.appearance.content_width,
            min: CONTENT_WIDTH.min,
            max: CONTENT_WIDTH.max,
            step: 20,
            label: _("Content width"),
            unit: " px",
            onCommit: (n) => this.setAppearance({ content_width: n }, false),
          }),
        }),
      ]),
      this.separate
        ? E(
            "div",
            { class: "ot-pair" },
            variants.map((v) => this.themeCard(v)),
          )
        : this.themeCard(variants[0]),
    ]);

    const ap = this.state.appearance;
    const hasBackdrop = !!this.brand.backdropUrl();
    const backdrop = w.section(_("Backdrop"), null, [
      w.card([
        this.brand.backdropRow(),
        hasBackdrop
          ? w.row({
              label: _("Position"),
              control: w.segmented(
                [
                  { value: "fill", label: _("Fill") },
                  { value: "fit", label: _("Fit") },
                  { value: "stretch", label: _("Stretch") },
                  { value: "center", label: _("Center") },
                  { value: "tile", label: _("Tile") },
                ],
                ap.backdrop_fit,
                (v) => this.setBackdrop({ backdrop_fit: v }),
              ),
            })
          : null,
        hasBackdrop
          ? w.row({
              label: _("Blur"),
              control: w.slider({
                value: ap.backdrop_blur,
                min: BACKDROP.backdrop_blur.min,
                max: BACKDROP.backdrop_blur.max,
                label: _("Blur"),
                unit: " px",
                onInput: (n) => this.setBackdrop({ backdrop_blur: n }),
                onCommit: (n) => this.setBackdrop({ backdrop_blur: n }),
              }),
            })
          : null,
        hasBackdrop
          ? w.row({
              label: _("Page colour over it"),
              control: w.slider({
                value: ap.backdrop_coat,
                min: BACKDROP.backdrop_coat.min,
                max: BACKDROP.backdrop_coat.max,
                label: _("Page colour over it"),
                unit: "%",
                onInput: (n) => this.setBackdrop({ backdrop_coat: n }),
                onCommit: (n) => this.setBackdrop({ backdrop_coat: n }),
              }),
            })
          : null,
      ]),
    ]);

    const brandSection = w.section(_("Brand"), null, [
      w.card([this.brand.logoRow(), this.brand.iconRow()]),
    ]);

    const advToggle = E(
      "button",
      {
        type: "button",
        class: "ot-link",
        "aria-expanded": this.advanced ? "true" : "false",
        "aria-controls": "ot-advanced",
        click: () => {
          this.advanced = !this.advanced;
          this.paint();
        },
      },
      [_("Advanced"), w.icon(this.advanced ? "chevronUp" : "chevronDown")],
    );

    const reset =
      this.advancedDirty() || this.separate
        ? E(
            "button",
            {
              type: "button",
              class: "ot-link big",
              click: () => this.resetAdvanced(),
            },
            _("Reset to default"),
          )
        : "";

    const advanced = w.section(
      advToggle,
      reset,
      this.advanced
        ? [
            this.sizesCard(),
            this.motionCard(),
            this.separate
              ? E(
                  "div",
                  { class: "ot-pair" },
                  variants.map((v) => this.advancedThemeCard(v, true)),
                )
              : this.advancedThemeCard(variants[0], false),
          ]
        : [],
    );
    advanced.lastChild.id = "ot-advanced";

    const nodes = [
      this.banner(),
      E("div", { class: "ot-sections" }, [
        visual,
        backdrop,
        brandSection,
        advanced,
      ]),
    ];

    this.root.replaceChildren(...nodes.filter(Boolean));
  },

  /* Shown only while Outline is the theme (the tab's patch), so the one
     thing to say is that the settings service did not answer. */
  banner() {
    if (this.data.config) return null;
    return E("div", { class: "ot-banner warn" }, [
      E(
        "span",
        {},
        _(
          "The settings service did not answer. Reload the page; if it persists, restart rpcd.",
        ),
      ),
    ]);
  },

  themeCard(v) {
    const t = this.state[v];
    const title = this.separate
      ? v == "light"
        ? _("Light theme")
        : _("Dark theme")
      : _("Theme");

    const header = w.row({
      variant: "nested",
      label: title,
      control: [
        w.iconButton(
          "download",
          _("Import %s theme").format(variantName(v).toLowerCase()),
          () => this.openImport(v),
        ),
        w.iconButton(
          "copy",
          _("Copy %s theme").format(variantName(v).toLowerCase()),
          () => {
            w.copyText(share.encode(v, t))
              .then(() => w.toast(_("%s theme copied").format(variantName(v))))
              .catch(() =>
                w.toast(_("Could not copy to the clipboard"), "warning"),
              );
          },
        ),
        this.presetPill(v),
      ],
    });

    return w.card([
      header,
      w.row({
        variant: "compact",
        label: _("Accent"),
        control: this.accentControl(v),
      }),
      w.row({
        variant: "compact",
        label: _("Background"),
        control: this.chip(v, "surface", _("Background")),
      }),
      w.row({
        variant: "compact",
        label: _("Foreground"),
        control: this.chip(v, "ink", _("Foreground")),
      }),
      w.row({
        variant: "compact",
        label: _("Font"),
        control: this.fontPill(v, "font_ui", presets.UI_FONTS, _("Font")),
      }),
    ]);
  },

  presetPill(v) {
    const t = this.state[v];
    const list = presets.forVariant(v);
    const current = presets.byId(t.preset);
    const seedSwatch = (p) => w.swatch(p[v]);

    return w.pill({
      cls: "wide",
      ariaLabel: _("Theme"),
      label: current ? current.label : _("Custom"),
      swatch: w.swatch(t, true),
      /* One flat, scrolling list: the top-level pair, a rule, then the
			   collection by name -- no "Themes" flyout. */
      menu: { cls: "wide", scroll: true },
      items: () => {
        const item = (p) => ({
          label: p.label,
          swatch: seedSwatch(p),
          checked: t.preset == p.id,
          onSelect: () =>
            this.setTheme(v, presets.apply(this.state[v], p.id, v)),
        });
        return list.top
          .map(item)
          .concat([{ separator: true }], list.themes.map(item));
      },
    });
  },

  accentControl(v) {
    const t = this.state[v];
    const named = presets.ACCENTS.find((a) => a.id == t.accent_name);
    const label = (a) => (typeof a.label == "object" ? a.label[v] : a.label);
    const dot = (a) => (typeof a.dot == "object" ? a.dot[v] : a.dot);

    const items = presets.ACCENTS.map((a) => ({
      label: label(a),
      dot: dot(a),
      checked: t.accent_name == a.id,
      onSelect: () =>
        this.setTheme(v, {
          accent_name: a.id,
          accent: presets.accentHex(a.id, v),
        }),
    }));
    items.push({
      label: _("Custom"),
      checked: !named,
      onSelect: () => this.setTheme(v, { accent_name: "custom" }),
    });

    const pill = w.pill({
      cls: "auto",
      ariaLabel: _("Accent"),
      label: named ? label(named) : _("Custom"),
      dot: named ? dot(named) : null,
      menu: { cls: "narrow" },
      items: items,
    });

    return named ? [pill] : [pill, this.chip(v, "accent", _("Accent"))];
  },

  chip(v, field, label) {
    return w.colorChip({
      value: this.state[v][field],
      label: label,
      onInput: (hex) => this.preview(v, { [field]: hex }),
      onCommit: (hex) => this.setTheme(v, { [field]: hex }, false),
      onClose: () => this.paint(),
    });
  },

  fontPill(v, field, list, label, opts) {
    opts = opts || {};
    const t = this.state[v];
    const value = t[field] || "";
    const choices = opts.first ? [opts.first].concat(list) : list;
    const set = (val) => this.setTheme(v, { [field]: val });

    const items = () => {
      const out = choices.map((f) => ({
        label: f.label,
        value: f.value,
        checked: f.value == value,
        onSelect: set,
      }));
      if (this.localFonts && this.localFonts.length)
        out.push(
          { separator: true },
          {
            label: _("Installed fonts"),
            submenu: this.localFonts.map((fam) => {
              const val = '"' + fam.replace(/"/g, "") + '"';
              return {
                label: fam,
                value: val,
                checked: val == value,
                onSelect: set,
              };
            }),
          },
        );
      out.push({ separator: true });
      if (!this.localFonts && window.queryLocalFonts)
        out.push({
          label: _("Show installed fonts…"),
          onSelect: () => this.loadLocalFonts(),
        });
      out.push({
        label: _("Use custom font value…"),
        onSelect: () => this.customFont(v, field, label),
      });
      return out;
    };

    return w.pill({
      ariaLabel: label,
      label:
        value == "" && opts.first
          ? opts.first.label
          : presets.labelFor(list, value),
      disabled: opts.disabled,
      menu: { cls: "wide", scroll: true },
      items: items,
    });
  },

  /* Local Font Access (Chromium): the visitor's own families, after a
	   permission prompt. Elsewhere the menu offers only the curated list. */
  loadLocalFonts() {
    Promise.resolve(window.queryLocalFonts())
      .then((faces) => {
        const fams = {};
        faces.forEach((f) => {
          if (palette.FONT_STACK_RE.test(f.family)) fams[f.family] = true;
        });
        this.localFonts = Object.keys(fams).sort((a, b) => a.localeCompare(b));
        this.paint();
      })
      .catch(() => {
        this.localFonts = [];
        w.toast(
          _("The browser did not allow reading installed fonts."),
          "warning",
        );
      });
  },

  customFont(v, field, label) {
    const input = E("input", {
      class: "ot-dialog-input",
      type: "text",
      spellcheck: "false",
      autocomplete: "off",
      value:
        this.state[v][field] && this.state[v][field] != "system"
          ? this.state[v][field]
          : "",
      placeholder: '"Inter", sans-serif',
    });
    const save = E(
      "button",
      { type: "button", class: "ot-btn primary" },
      _("Save"),
    );
    const valid = () =>
      input.value.trim() == "" ||
      palette.FONT_STACK_RE.test(input.value.trim());
    input.addEventListener("input", () => {
      save.disabled = !valid();
    });
    const go = () => {
      if (!valid()) return;
      ui.hideModal();
      this.setTheme(v, { [field]: input.value.trim() });
    };
    input.addEventListener("keydown", (ev) => {
      if (ev.key == "Enter") go();
    });
    save.addEventListener("click", go);

    ui.showModal(label, [
      E("div", { class: "ot" }, [
        E(
          "p",
          { class: "ot-desc" },
          _(
            "A CSS font-family list. The font must be installed on the device viewing LuCI; otherwise Geist is used.",
          ),
        ),
        input,
        E("div", { class: "ot-dialog-actions" }, [
          E(
            "button",
            { type: "button", class: "ot-btn", click: ui.hideModal },
            _("Cancel"),
          ),
          save,
        ]),
      ]),
    ]);
    input.focus();
  },

  openImport(v) {
    const input = E("input", {
      class: "ot-dialog-input",
      type: "text",
      spellcheck: "false",
      autocomplete: "off",
      placeholder: share.encode(v, this.state[v]),
    });
    const submit = E(
      "button",
      { type: "button", class: "ot-btn primary", disabled: "" },
      _("Import theme"),
    );
    const name = variantName(v);

    input.addEventListener("input", () => {
      submit.disabled = !!share.decode(input.value, v).error;
    });
    const go = () => {
      const res = share.decode(input.value, v);
      if (res.error) {
        w.toast(
          _("Couldn’t import %s theme").format(name.toLowerCase()),
          "warning",
        );
        return;
      }
      ui.hideModal();
      this.setTheme(v, res.theme);
      w.toast(_("%s theme imported").format(name));
    };
    input.addEventListener("keydown", (ev) => {
      if (ev.key == "Enter" && !submit.disabled) go();
    });
    submit.addEventListener("click", go);

    ui.showModal(_("Import theme"), [
      E("div", { class: "ot" }, [
        E(
          "p",
          { class: "ot-desc" },
          _(
            "Paste a theme string copied from another router (outline-theme-v1:…) or from Codex (codex-theme-v1:…).",
          ),
        ),
        input,
        E("div", { class: "ot-dialog-actions" }, [
          E(
            "button",
            { type: "button", class: "ot-btn", click: ui.hideModal },
            _("Cancel"),
          ),
          submit,
        ]),
      ]),
    ]);
    input.focus();
  },

  sizesCard() {
    const ap = this.state.appearance;
    const field = (k, label) =>
      w.sizeField(
        ap[k],
        SIZES[k].min,
        SIZES[k].max,
        (n) => this.setAppearance({ [k]: n }),
        label,
      );

    return w.card([
      w.row({
        label: _("UI font size"),
        description: _("Adjust the base size used for the LuCI interface"),
        control: field("ui_font_size", _("UI font size")),
      }),
      w.row({
        label: _("Content font size"),
        description: _("Adjust the base size used for pages"),
        control: field("content_font_size", _("Content font size")),
      }),
      w.row({
        label: _("Code font size"),
        description: _(
          "Adjust the base size used for code, logs and config editors",
        ),
        control: field("code_font_size", _("Code font size")),
      }),
    ]);
  },

  motionCard() {
    return w.card([
      w.row({
        label: _("Reduce motion"),
        description: _("Reduce animations or match your system"),
        control: w.segmented(
          [
            { value: "system", label: _("System") },
            { value: "on", label: _("On") },
            { value: "off", label: _("Off") },
          ],
          this.state.appearance.reduced_motion,
          (val) => this.setReducedMotion(val),
        ),
      }),
      w.row({
        label: _("Separate light and dark modes"),
        description: _("Choose a theme, colors, and font for each"),
        control: w.toggle(
          this.separate,
          (on) => {
            this.separate = on;
            this.paint();
          },
          _("Separate light and dark modes"),
        ),
      }),
    ]);
  },

  advancedThemeCard(v, titled) {
    const t = this.state[v];
    const weight = presets.FONT_WEIGHTS.find(
      (f) => f.value == (t.font_ui_weight || "400"),
    );
    const contentFonts = [{ value: '"Geist Variable"', label: "Geist" }].concat(
      presets.UI_FONTS.slice(1),
    );

    return w.card([
      titled
        ? w.row({
            variant: "nested",
            label: v == "light" ? _("Light theme") : _("Dark theme"),
          })
        : null,
      w.row({
        label: _("UI font style"),
        control: w.pill({
          ariaLabel: _("UI font style"),
          label: weight ? weight.label : _("Regular"),
          menu: { cls: "narrow" },
          items: presets.FONT_WEIGHTS.map((f) => ({
            label: f.label,
            checked: f.value == (t.font_ui_weight || "400"),
            onSelect: () =>
              this.setTheme(v, {
                font_ui_weight: f.value == "400" ? "" : f.value,
              }),
          })),
        }),
      }),
      w.row({
        label: _("Content font"),
        control: this.fontPill(
          v,
          "font_content",
          contentFonts,
          _("Content font"),
          { first: { value: "", label: _("Same as UI font") } },
        ),
      }),
      w.row({
        label: _("Code font"),
        control: this.fontPill(
          v,
          "font_code",
          presets.CODE_FONTS,
          _("Code font"),
        ),
      }),
      w.row({
        label: _("Contrast"),
        control: w.slider({
          value: t.contrast,
          min: 0,
          max: 100,
          label: _("Contrast"),
          accent: t.accent,
          surface: t.surface,
          onInput: (n) => this.preview(v, { contrast: n }),
          onCommit: (n) => this.setTheme(v, { contrast: n }, false),
        }),
      }),
    ]);
  },
};

return baseclass.extend({
  /* What the page needs before it draws (the state rpc, the brand
     pictures, the outline config). */
  load() {
    return Page.load();
  },

  /* A page instance: render(data) builds it; handleSave stages it as LuCI
     unsaved changes, dirty() says whether there is anything to stage,
     handleReset drops what was changed. */
  create() {
    return Object.create(Page);
  },
});
