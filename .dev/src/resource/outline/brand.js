"use strict";
"require baseclass";
"require rpc";
"require uci";
"require outline.icons as icons";
"require outline.routericon as routericon";
"require outline.ui as w";

/*
 * The brand pictures on System › Outline Theme › Appearance: three choices,
 * picked like Codex's dock icon.
 *
 *   Logo      the sidebar and sign-in logo: OpenWrt's logo (luci-theme-
 *             bootstrap's, referenced in place -- value `openwrt`), Outline
 *             (the theme's own, value ""), an upload, or a new upload.
 *   App icon  one picture for the browser tab, the home screen and the
 *             installed web app: OpenWrt's logo, Outline, an upload -- the
 *             logo's own upload among them (value `logo`, so the icon follows
 *             the logo). On Save every size is rendered from it
 *             (outline/icons.js) and uploaded into the five icon slots
 *             header.ut serves: favicon, favicon_ico, apple_touch, pwa_192,
 *             pwa_512.
 *   Backdrop  a picture behind the whole window, blurred under a coat of the
 *             page colour; downscaled in the browser before it is uploaded.
 *
 * Uploads are files at once (cgi-upload to a fixed tmp path, then rpcd checks
 * type, size and content and stores <slot>-<time>.<ext> under
 * /www/luci-static/outline-brand). Which picture is used is a setting, stored
 * in `outline.branding` by the page's Save like any other.
 *
 * Outline's picture (outline/routericon.js) wears the accent: the page
 * passes a function that returns it as { key, hex, stock }
 * (Appearance.iconAccent()). The theme's stock files are that picture in the
 * stock accent, so with it nothing is uploaded. Any other accent is baked on
 * Save -- the logo as an SVG upload into the `logo` slot (header.ut serves it
 * like any upload), the App icon into the five icon slots -- and
 * `logo_router` / `icon_router` record the accent key they were baked with,
 * so a changed accent bakes them again and an unchanged one keeps them.
 *
 * create() returns one controller per page render; the page owns the
 * preview's lifetime (restore()) and the save chain (stage()).
 */

const callBrandList = rpc.declare({
  object: "luci.outline",
  method: "brand_list",
});
const callBrandUpload = rpc.declare({
  object: "luci.outline",
  method: "brand_upload",
  params: ["slot", "name"],
});

const BRAND_URL = "/luci-static/outline-brand/";
const UPLOAD_TMP = "/tmp/outline-brand.upload";
const PICTURE = ["svg", "png", "jpg", "jpeg", "webp"];
const PHOTO = ["png", "jpg", "jpeg", "webp"];
/* The slots generated from the App icon, as header.ut reads them. */
const ICON_SLOTS = [
  "favicon",
  "favicon_ico",
  "apple_touch",
  "pwa_192",
  "pwa_512",
];
/* A backdrop is blurred: 2560 px on its long side is plenty, and keeps the
   upload far under the router's 4 MB limit (and its flash). */
const BACKDROP_MAX = 2560;

function extOf(name) {
  const m = /\.([A-Za-z0-9]+)$/.exec(name || "");
  return m ? m[1].toLowerCase() : "";
}

function formatSize(bytes) {
  return bytes >= 1048576
    ? (bytes / 1048576).toFixed(1) + " MB"
    : Math.max(1, Math.round(bytes / 1024)) + " KB";
}

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}

/* A photo re-encoded as JPEG at most BACKDROP_MAX px on its long side; a
   small JPEG or WebP is sent as it is. */
function shrinkPhoto(file) {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(_("The image could not be read")));
    img.src = url;
  })
    .then((img) => {
      const w = img.naturalWidth,
        h = img.naturalHeight;
      const k = Math.min(1, BACKDROP_MAX / Math.max(w, h));
      if (
        k == 1 &&
        file.size <= 1572864 &&
        /^(jpe?g|webp)$/.test(extOf(file.name))
      )
        return file;
      const c = document.createElement("canvas");
      c.width = Math.round(w * k);
      c.height = Math.round(h * k);
      const ctx = c.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, c.width, c.height);
      return new Promise((resolve, reject) =>
        c.toBlob(
          (b) =>
            b
              ? resolve(new File([b], "backdrop.jpg", { type: "image/jpeg" }))
              : reject(new Error(_("The image could not be read"))),
          "image/jpeg",
          0.85,
        ),
      );
    })
    .finally(() => URL.revokeObjectURL(url));
}

function Brand(lib, onChange, accent) {
  this.lib = lib || { assets: [], max: 4194304, rev: "0" };
  this.onChange = onChange;
  this.accentOf =
    accent ||
    (() => ({
      key: "dark:" + routericon.DEFAULT,
      hex: routericon.DEFAULT,
      stock: true,
    }));
  const b = uci.get("outline", "branding") || {};
  /* What the stored Outline files wear; "" for the theme's stock ones. */
  this.baked = {
    logo: b.logo_router ? b.logo || "" : "",
    logoKey: b.logo_router || "",
    iconKey: b.icon_router || "",
  };
  this.state = {
    /* A baked Outline logo is still the Outline choice. */
    logo: b.logo_router ? "" : b.logo || "",
    icon: b.icon || "",
    backdrop: b.backdrop || "",
  };
  this.saved = clone(this.state);
  this.busy = {};
  this.input = E("input", {
    type: "file",
    hidden: "",
    change: (ev) => {
      const file = ev.target.files && ev.target.files[0];
      ev.target.value = "";
      if (file && this.pending) this.upload(this.pending, file);
    },
  });
  this.captureOriginal();
}

Brand.prototype = {
  /* ── Sources ── */

  assetUrl(name) {
    return (
      BRAND_URL +
      encodeURIComponent(name) +
      "?v=" +
      encodeURIComponent(this.lib.rev || "0")
    );
  },

  has(name) {
    return !!name && this.lib.assets.some((a) => a.name == name);
  },

  openwrtUrl() {
    return (this.lib.builtin && this.lib.builtin.openwrt) || null;
  },

  /* The accent Outline's picture wears now; the page keeps the variant the
     stored files came from unless an accent was edited. */
  accent() {
    const m = /(light|dark):/.exec(this.baked.iconKey || this.baked.logoKey);
    return this.accentOf(m ? m[1] : null);
  },

  /* What Outline's files are keyed by: "stock" for the theme's own. */
  outlineKey(state) {
    if (state === this.saved) return this.baked.iconKey || "stock";
    const a = this.accent();
    return a.stock ? "stock" : routericon.REV + "/" + a.key;
  },

  /* Stored Outline files that no longer match: another accent, or baked
     from an earlier drawing. The page counts this as a change to save. */
  stale() {
    return (
      this.iconKey(this.state) != this.iconKey(this.saved) ||
      this.logoKey(this.state) != this.logoKey(this.saved)
    );
  },

  /* A blob: URL of Outline's picture (light and dark in one) in the current
     accent; the previous one goes when the accent moves. */
  outlineUrl() {
    const hex = this.accent().hex;
    const hit = this.blob;
    if (hit && hit.hex == hex) return hit.url;
    if (hit) URL.revokeObjectURL(hit.url);
    const url = URL.createObjectURL(
      new Blob([routericon.svg(hex)], { type: "image/svg+xml" }),
    );
    this.blob = { hex: hex, url: url };
    return url;
  },

  /* The logo's own picture (OpenWrt's, an upload), or null for Outline. */
  customLogoUrl(state) {
    const v = (state || this.state).logo;
    if (v == "openwrt") return this.openwrtUrl();
    return this.has(v) ? this.assetUrl(v) : null;
  },

  logoUrl(state) {
    return this.customLogoUrl(state) || this.outlineUrl();
  },

  logoKey(state) {
    if (this.customLogoUrl(state)) return "logo:" + state.logo;
    return (
      "outline:" +
      (state === this.saved
        ? this.baked.logoKey || "stock"
        : this.outlineKey(state))
    );
  },

  /* Which App icon tile the state means: "outline", "openwrt", "logo" (the
     logo's upload) or an icon upload. `logo` follows the logo, so with
     OpenWrt's or Outline's logo it is that tile, never one of its own. */
  iconChoice(state) {
    state = state || this.state;
    const v = state.icon;
    if (v == "logo") {
      if (state.logo == "openwrt" && this.openwrtUrl()) return "openwrt";
      return this.has(state.logo) ? "logo" : "outline";
    }
    if (v == "openwrt") return this.openwrtUrl() ? "openwrt" : "outline";
    return this.has(v) ? v : "outline";
  },

  /* The App icon source picture. */
  iconUrl(state) {
    state = state || this.state;
    const c = this.iconChoice(state);
    if (c == "outline") return this.outlineUrl();
    if (c == "openwrt") return this.openwrtUrl();
    return this.assetUrl(c == "logo" ? state.logo : c);
  },

  /* What the App icon resolves to, for "has it changed since Save?". */
  iconKey(state) {
    const c = this.iconChoice(state);
    if (c == "outline")
      return (
        "outline:" +
        (state === this.saved
          ? this.baked.iconKey || "stock"
          : this.outlineKey(state))
      );
    return c == "logo" ? "logo:" + state.logo : c;
  },

  /* The backdrop picture, or null for none. */
  backdropUrl(state) {
    const v = (state || this.state).backdrop;
    return this.has(v) ? this.assetUrl(v) : null;
  },

  uploadsFor(slot) {
    const prefix = slot + "-";
    /* A baked Outline logo is the Outline tile, not a "Custom" one. */
    const baked = [this.baked.logo, this.staged && this.staged.logo];
    return this.lib.assets.filter(
      (a) =>
        a.name.indexOf(prefix) == 0 &&
        PICTURE.indexOf(a.type) > -1 &&
        baked.indexOf(a.name) < 0,
    );
  },

  /* ── Preview, only while the page is shown ── */

  targets() {
    const q = (sel) =>
      Array.prototype.slice.call(document.querySelectorAll(sel));
    return {
      /* The rail's and the panel's, and the phone navbar's brand pill. */
      logo: q("img.sidebar-logo, .topbar-brand img"),
      favicon: q('link[rel="icon"]'),
      apple: q('link[rel="apple-touch-icon"]'),
    };
  },

  captureOriginal() {
    this.original = [];
    const t = this.targets();
    for (const k in t)
      t[k].forEach((el) => {
        const attr = el.tagName == "IMG" ? "src" : "href";
        this.original.push([
          el,
          attr,
          el.getAttribute(attr),
          el.getAttribute("type"),
        ]);
      });
    const sb = document.getElementById("sidebar");
    if (sb)
      this.original.push([sb, "data-logo", sb.getAttribute("data-logo"), null]);
    const html = document.documentElement;
    this.original.push([
      html,
      "data-backdrop",
      html.getAttribute("data-backdrop"),
      null,
    ]);
    const image = document.querySelector("#outline-backdrop .backdrop-image");
    if (image)
      this.original.push([image, "style", image.getAttribute("style"), null]);
  },

  restore() {
    (this.original || []).forEach((e) => {
      if (e[2] == null) e[0].removeAttribute(e[1]);
      else e[0].setAttribute(e[1], e[2]);
      if (e[0].tagName == "LINK") {
        if (e[3] == null) e[0].removeAttribute("type");
        else e[0].setAttribute("type", e[3]);
      }
    });
  },

  /* The sidebar logo, the tab icon and the backdrop follow the page state;
     untouched ones go back to what the page loaded with. */
  preview() {
    this.restore();
    const t = this.targets();
    if (this.logoKey(this.state) != this.logoKey(this.saved)) {
      const logo = this.logoUrl();
      t.logo.forEach((el) => el.setAttribute("src", logo));
      const sb = document.getElementById("sidebar");
      if (sb) sb.setAttribute("data-logo", logo);
    }
    if (this.iconKey(this.state) != this.iconKey(this.saved)) {
      const icon = this.iconUrl();
      t.favicon.concat(t.apple).forEach((el) => {
        el.setAttribute("href", icon);
        el.removeAttribute("type");
      });
    }
    const bd = this.backdropUrl();
    const image = document.querySelector("#outline-backdrop .backdrop-image");
    if (bd && image) {
      document.documentElement.setAttribute("data-backdrop", "image");
      image.style.backgroundImage = `url("${bd}")`;
    } else document.documentElement.removeAttribute("data-backdrop");
  },

  set(field, value) {
    this.state[field] = value;
    this.preview();
    this.onChange();
  },

  /* ── Uploads ── */

  /* One file into one slot; resolves to its library name. */
  send(slot, file) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.addEventListener("load", () =>
        xhr.status == 200
          ? resolve()
          : reject(new Error(_("Upload failed (HTTP %s)").format(xhr.status))),
      );
      xhr.addEventListener("error", () =>
        reject(new Error(_("Upload failed"))),
      );
      const fd = new FormData();
      fd.append("sessionid", rpc.getSessionID());
      fd.append("filename", UPLOAD_TMP);
      fd.append("filemode", "0600");
      fd.append("filedata", file, file.name);
      xhr.open("POST", L.env.cgi_base + "/cgi-upload");
      xhr.send(fd);
    })
      .then(() => callBrandUpload(slot, file.name))
      .then((res) => {
        if (!res || res.error)
          throw new Error(
            res && res.error ? res.error : _("no answer from the router"),
          );
        this.lib = res.state;
        return res.state.name;
      });
  },

  pick(field) {
    this.pending = field;
    this.input.accept = (field == "backdrop" ? PHOTO : PICTURE)
      .map((t) => "." + t)
      .join(",");
    this.input.click();
  },

  upload(field, file) {
    const photo = field == "backdrop";
    const ext = extOf(file.name),
      max = this.lib.max || 4194304;
    if ((photo ? PHOTO : PICTURE).indexOf(ext) < 0) {
      w.toast(
        photo
          ? _("Use a PNG, JPG or WebP picture.")
          : _("Use an SVG, PNG, JPG or WebP picture."),
        "warning",
      );
      return;
    }
    this.busy[field] = true;
    this.onChange();
    return (photo ? shrinkPhoto(file) : Promise.resolve(file))
      .then((f) => {
        if (f.size > max)
          throw new Error(
            _("%s is %s; the limit is %s.").format(
              file.name,
              formatSize(f.size),
              formatSize(max),
            ),
          );
        return this.send(field, f);
      })
      .then((name) => {
        this.state[field] = name;
      })
      .catch((err) => {
        w.toast(
          _("Could not upload %s: %s").format(file.name, err.message || err),
          "danger",
        );
      })
      .then(() => {
        delete this.busy[field];
        this.preview();
        this.onChange();
      });
  },

  /* ── Save / Reset ── */

  /* Render and upload the five icon sizes when the App icon changed (or
     they are missing); resolves to { slot: name } or null for the theme's
     own icons (Outline in the stock accent). */
  iconFiles() {
    const outline = this.iconChoice(this.state) == "outline";
    if (outline && this.outlineKey(this.state) == "stock")
      return Promise.resolve(null);
    /* Outline is SVG only: one favicon, no rasters (header.ut then serves
       no ICO and no Apple touch icon). */
    const slots = outline ? ["favicon"] : ICON_SLOTS;
    const b = uci.get("outline", "branding") || {};
    if (
      this.iconKey(this.state) == this.iconKey(this.saved) &&
      slots.every((s) => this.has(b[s]))
    ) {
      const keep = {};
      slots.forEach((s) => (keep[s] = b[s]));
      return Promise.resolve(keep);
    }
    if (outline) {
      const file = new File(
        [routericon.svg(this.accent().hex)],
        "favicon.svg",
        { type: "image/svg+xml" },
      );
      return this.send("favicon", file).then((n) => ({ favicon: n }));
    }
    w.toast(_("Generating the icons…"));
    return icons.generate(this.iconUrl()).then((files) => {
      const out = {};
      return ICON_SLOTS.reduce(
        (p, slot) =>
          p.then(() =>
            this.send(slot, files[slot]).then((n) => {
              out[slot] = n;
            }),
          ),
        Promise.resolve(),
      ).then(() => out);
    });
  },

  /* The logo option's value: Outline in a non-stock accent is baked and
     uploaded into the logo slot unless the stored file already wears it.
     Resolves to { name, key }. */
  logoFile() {
    if (this.customLogoUrl())
      return Promise.resolve({ name: this.state.logo, key: "" });
    const key = this.outlineKey(this.state);
    if (key == "stock") return Promise.resolve({ name: "", key: "" });
    if (this.baked.logoKey == key && this.has(this.baked.logo))
      return Promise.resolve({ name: this.baked.logo, key: key });
    const file = new File([routericon.svg(this.accent().hex)], "outline.svg", {
      type: "image/svg+xml",
    });
    return this.send("logo", file).then((name) => ({ name: name, key: key }));
  },

  /* Stage the brand choices as LuCI unsaved changes (the page saves). */
  stage() {
    /* One after the other: every upload goes through the same tmp file. */
    let files;
    return this.iconFiles()
      .then((f) => {
        files = f;
        return this.logoFile();
      })
      .then((logo) => {
        const choice = this.iconChoice(this.state);
        const outlineKey = this.outlineKey(this.state);
        const iconKey =
          choice == "outline" && outlineKey != "stock" ? outlineKey : "";
        if (!uci.get("outline", "branding"))
          uci.add("outline", "branding", "branding");
        /* Only what differs: LuCI counts every write as a change. */
        const put = (opt, val) => {
          const cur = uci.get("outline", "branding", opt);
          if (val) {
            if (cur !== String(val)) uci.set("outline", "branding", opt, val);
          } else if (cur != null) uci.unset("outline", "branding", opt);
        };

        put("logo", logo.name);
        put("logo_router", logo.key);
        put("icon", choice == "outline" ? "" : choice);
        put("icon_router", iconKey);
        this.staged = {
          logo: logo.key ? logo.name : "",
          logoKey: logo.key,
          iconKey: iconKey,
        };
        put("backdrop", this.backdropUrl() ? this.state.backdrop : "");
        ICON_SLOTS.forEach((s) => put(s, files ? files[s] : ""));
        /* Options earlier builds wrote and nothing reads any more. */
        put("app_name", "");
        put("manifest", "");
      });
  },

  markSaved() {
    if (this.staged) this.baked = this.staged;
    this.staged = null;
    this.saved = clone(this.state);
  },

  reset() {
    this.state = clone(this.saved);
    this.preview();
  },

  /* ── Rows ── */

  tile(opts) {
    return E(
      "button",
      {
        type: "button",
        class:
          "ot-pick" + (opts.add ? " add" : "") + (opts.none ? " none" : ""),
        role: opts.add ? null : "radio",
        "aria-checked": opts.add ? null : opts.checked ? "true" : "false",
        title: opts.title || opts.label,
        disabled: opts.disabled ? "" : null,
        click: opts.onClick,
      },
      [
        E("span", { class: "ot-pick-face" + (opts.cover ? " cover" : "") }, [
          opts.src
            ? E("img", { src: opts.src, alt: "", decoding: "async" })
            : w.icon(opts.icon),
          opts.add
            ? ""
            : E(
                "span",
                { class: "ot-pick-check", "aria-hidden": "true" },
                w.icon("check"),
              ),
        ]),
        E("span", { class: "ot-pick-name" }, opts.label),
      ],
    );
  },

  uploadTiles(field, current, cover) {
    const out = [];
    const own = this.uploadsFor(field);
    if (this.has(current) && !own.some((a) => a.name == current))
      own.unshift(this.lib.assets.find((a) => a.name == current));
    own.slice(0, 2).forEach((a, i) => {
      const meta = [a.type.toUpperCase(), formatSize(a.size)];
      if (a.width && a.height) meta.push(a.width + "×" + a.height);
      out.push(
        this.tile({
          label: i == 0 ? _("Custom") : _("Earlier"),
          title: meta.join(" · "),
          src: this.assetUrl(a.name),
          cover: cover,
          checked: current == a.name,
          onClick: () => this.set(field, a.name),
        }),
      );
    });
    out.push(
      this.tile({
        add: true,
        icon: this.busy[field] ? "refresh" : "plus",
        label: this.busy[field] ? _("Uploading…") : _("Upload"),
        title:
          field == "backdrop"
            ? _("Upload a PNG, JPG or WebP picture")
            : _("Upload an SVG, PNG, JPG or WebP picture"),
        disabled: this.busy[field],
        onClick: () => this.pick(field),
      }),
    );
    return out;
  },

  pickerRow(label, desc, tiles) {
    const row = w.row({
      label: label,
      description: desc,
      /* Compact tiles: the same scale as the page's pills and chips. */
      control: E(
        "div",
        { class: "ot-picks sm", role: "radiogroup", "aria-label": label },
        tiles,
      ),
    });
    row.classList.add("picker");
    return row;
  },

  /* OpenWrt, Outline, then the uploads: the same order in both rows. */
  baseTiles(field, current) {
    const tiles = [];
    if (this.openwrtUrl())
      tiles.push(
        this.tile({
          label: "OpenWrt",
          src: this.openwrtUrl(),
          checked: current == "openwrt",
          onClick: () => this.set(field, "openwrt"),
        }),
      );
    tiles.push(
      this.tile({
        label: "Outline",
        title: _("Outline (theme default) · wears the accent"),
        src: this.outlineUrl(),
        checked: current == "outline",
        onClick: () => this.set(field, ""),
      }),
    );
    return tiles;
  },

  logoRow() {
    const v = this.customLogoUrl() ? this.state.logo : "";
    return this.pickerRow(
      _("Logo"),
      _("Sidebar and sign-in page"),
      this.baseTiles("logo", v || "outline").concat(
        this.uploadTiles("logo", v),
      ),
    );
  },

  iconRow() {
    const c = this.iconChoice();
    /* Custom: the logo's upload (the icon then follows the logo), then the
       icon's own uploads. */
    const own = [];
    if (this.has(this.state.logo))
      own.push({ value: "logo", name: this.state.logo });
    this.uploadsFor("icon").forEach((a) =>
      own.push({ value: a.name, name: a.name }),
    );
    if (this.has(c) && !own.some((o) => o.value == c))
      own.unshift({ value: c, name: c });
    const custom = own.slice(0, 2).map((o, i) => {
      const a = this.lib.assets.find((x) => x.name == o.name) || {};
      const meta = [
        String(a.type || "").toUpperCase(),
        formatSize(a.size || 0),
      ];
      if (a.width && a.height) meta.push(a.width + "×" + a.height);
      return this.tile({
        label: i == 0 ? _("Custom") : _("Earlier"),
        title: o.value == "logo" ? _("Same as the logo") : meta.join(" · "),
        src: this.assetUrl(o.name),
        checked: c == o.value,
        onClick: () => this.set("icon", o.value),
      });
    });
    return this.pickerRow(
      _("App icon"),
      _("Tab, home screen and app · every size is made from one picture"),
      this.baseTiles("icon", c)
        .concat(custom)
        .concat(this.uploadTiles("icon", "").slice(-1)),
    );
  },

  backdropRow() {
    const v = this.backdropUrl() ? this.state.backdrop : "";
    return this.pickerRow(
      _("Picture"),
      _("Behind the whole window, blurred under the page colour"),
      [
        this.tile({
          label: _("None"),
          icon: "x",
          none: true,
          checked: v == "",
          onClick: () => this.set("backdrop", ""),
        }),
      ].concat(this.uploadTiles("backdrop", v, true)),
    );
  },
};

return baseclass.extend({
  list() {
    return L.resolveDefault(callBrandList(), null);
  },

  create(lib, onChange, accent) {
    return new Brand(lib, onChange, accent);
  },
});
