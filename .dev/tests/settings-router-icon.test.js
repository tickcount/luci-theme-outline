import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { loadAll, loadModule, root } from "./settings-load.js";

// Outline's brand picture (the router under a glass lens): which accent it
// wears, when Save bakes it, and how the Logo / App icon tiles read the
// stored options. Appearance.iconAccent() and brand.js run against stubbed
// LuCI.

const { palette, presets, share } = loadAll();
const routericon = loadModule("outline/routericon.js");

function stubs(branding) {
  const conf = { branding: { ...branding } };
  globalThis.E = (tag, attrs, kids) => ({ tag, attrs, kids });
  globalThis.L = { resolveDefault: (p) => p, env: {} };
  globalThis.document = {
    querySelectorAll: () => [],
    querySelector: () => null,
    getElementById: () => null,
    documentElement: { getAttribute: () => null },
  };
  const uci = {
    get: (c, s, o) => (o == null ? conf[s] : conf[s] && conf[s][o]),
    set: (c, s, o, v) => (conf[s][o] = v),
    unset: (c, s, o) => delete conf[s][o],
    add: (c, t, s) => (conf[s] = {}),
  };
  const rpc = { declare: () => () => Promise.resolve(null) };
  return { conf, uci, rpc };
}

function page(
  uci,
  rpc,
  lightAccent = "#006aff",
  darkAccent = "#006efe",
  icons = { generate: () => Promise.reject(new Error("not in this test")) },
) {
  const brand = loadModule("outline/brand.js", {
    rpc,
    uci,
    icons,
    routericon,
    w: {
      toast() {},
      icon() {},
      row: (o) => ({ ...o, classList: { add() {} } }),
    },
  });
  const appearance = loadModule("outline/appearance.js", {
    rpc,
    uci,
    ui: {},
    palette,
    presets,
    share,
    w: {},
    brand,
  });
  const variant = (accent) => ({ accent_name: "custom", accent });
  const p = appearance.create();
  p.state = { light: variant(lightAccent), dark: variant(darkAccent) };
  p.saved = JSON.parse(JSON.stringify(p.state));
  p.mode = "light";
  p.effectiveVariant = () => p.mode;
  return { p, brand };
}

const LIB = {
  assets: [
    { name: "logo-1.png", type: "png", size: 1000 },
    { name: "logo-2.svg", type: "svg", size: 1000 },
  ],
  rev: "0",
  builtin: { openwrt: "/luci-static/bootstrap/logo.svg" },
};
// Only the logo in use, so a row shows no "Earlier" upload.
const ONE = { ...LIB, assets: LIB.assets.slice(0, 1) };
const EMPTY = { ...LIB, assets: [] };

// The tiles a row draws, as "label" or "label ✓".
function tiles(row) {
  return row.control.kids.map((t) => {
    const name = t.kids[1].kids;
    return t.attrs["aria-checked"] == "true" ? name + " ✓" : name;
  });
}

test("Outline: the stock logo and favicon are the picture in the stock accent", () => {
  for (const f of ["logo.svg", "favicon.svg"])
    assert.equal(
      readFileSync(join(root, ".dev/public/outline/images", f), "utf8"),
      routericon.svg(routericon.DEFAULT),
      f,
    );
  assert.equal(routericon.DEFAULT, presets.VERCEL.dark.accent);
});

test("Outline: one SVG carries both looks and no background", () => {
  const svg = routericon.svg("#10a37f");
  assert.match(svg, /@media \(prefers-color-scheme: light\)\{\.g0\{/);
  assert.doesNotMatch(svg, /id="tile"/);
  assert.match(svg, /fill="#10a37f"/);
});

test("Outline: a baked App icon is one SVG favicon, no rasters", async () => {
  const { uci, rpc } = stubs({});
  const { p, brand } = page(uci, rpc, "#10a37f", "#10a37f");
  const b = brand.create(
    LIB,
    () => {},
    (v) => p.iconAccent(v),
  );
  const sent = [];
  b.send = (slot, file) => {
    sent.push([slot, file.name, file.type]);
    return Promise.resolve(slot + "-1.svg");
  };
  assert.deepEqual(await b.iconFiles(), { favicon: "favicon-1.svg" });
  assert.deepEqual(sent, [["favicon", "favicon.svg", "image/svg+xml"]]);
});

test("Outline: the stock accent uploads nothing", async () => {
  const { uci, rpc } = stubs({});
  const { p, brand } = page(uci, rpc);
  const b = brand.create(
    LIB,
    () => {},
    (v) => p.iconAccent(v),
  );
  for (const mode of ["light", "dark"]) {
    p.mode = mode;
    assert.equal(b.accent().stock, true, mode);
    assert.equal(await b.iconFiles(), null, mode);
    assert.deepEqual(await b.logoFile(), { name: "", key: "" }, mode);
  }
});

test("Outline: switching modes after a bake bakes nothing again", () => {
  const { uci, rpc } = stubs({
    icon_router: routericon.REV + "/dark:#10a37f",
    logo: "logo-2.svg",
    logo_router: routericon.REV + "/dark:#10a37f",
  });
  const { p, brand } = page(uci, rpc, "#10a37f", "#10a37f");
  const b = brand.create(
    LIB,
    () => {},
    (v) => p.iconAccent(v),
  );
  assert.equal(b.state.logo, "", "a baked logo is still the Outline choice");
  for (const mode of ["light", "dark"]) {
    p.mode = mode;
    assert.equal(b.iconKey(b.state), b.iconKey(b.saved), mode);
    assert.equal(b.logoKey(b.state), b.logoKey(b.saved), mode);
  }
});

test("Outline: an accent edit changes the key and the drawn colour", () => {
  const { uci, rpc } = stubs({});
  const { p, brand } = page(uci, rpc);
  const b = brand.create(
    LIB,
    () => {},
    (v) => p.iconAccent(v),
  );
  p.state.light = { ...p.state.light, accent: "#10a37f" };
  assert.deepEqual(b.accent(), {
    key: "light:#10a37f",
    hex: "#10a37f",
    stock: false,
  });
  assert.notEqual(b.iconKey(b.state), b.iconKey(b.saved));
  assert.notEqual(b.logoKey(b.state), b.logoKey(b.saved));
});

test("Outline: a named accent counts by its id and is drawn dark", () => {
  const { uci, rpc } = stubs({});
  const { p } = page(uci, rpc);
  const named = presets.ACCENTS[0];
  p.state.dark = {
    ...p.state.dark,
    accent_name: named.id,
    accent: presets.accentHex(named.id, "dark"),
  };
  p.mode = "dark";
  assert.deepEqual(p.iconAccent(), {
    key: "dark:" + named.id,
    hex: presets.accentHex(named.id, "dark"),
    stock: false,
  });
});

test("Tiles: OpenWrt, Outline, Custom in both rows", () => {
  const { uci, rpc } = stubs({ logo: "logo-1.png", icon: "logo" });
  const { p, brand } = page(uci, rpc);
  globalThis.URL.createObjectURL = () => "blob:x";
  const b = brand.create(
    ONE,
    () => {},
    (v) => p.iconAccent(v),
  );
  assert.deepEqual(tiles(b.logoRow()), [
    "OpenWrt",
    "Outline",
    "Custom ✓",
    "Upload",
  ]);
  assert.deepEqual(tiles(b.iconRow()), [
    "OpenWrt",
    "Outline",
    "Custom ✓",
    "Upload",
  ]);
});

test("Tiles: an icon that follows OpenWrt's logo is the OpenWrt tile", () => {
  const { uci, rpc } = stubs({ logo: "openwrt", icon: "logo" });
  const { p, brand } = page(uci, rpc);
  globalThis.URL.createObjectURL = () => "blob:x";
  const b = brand.create(
    EMPTY,
    () => {},
    (v) => p.iconAccent(v),
  );
  assert.deepEqual(tiles(b.iconRow()), ["OpenWrt ✓", "Outline", "Upload"]);
  assert.deepEqual(tiles(b.logoRow()), ["OpenWrt ✓", "Outline", "Upload"]);
});

test("Tiles: nothing stored is Outline in both rows", () => {
  const { uci, rpc } = stubs({});
  const { p, brand } = page(uci, rpc);
  globalThis.URL.createObjectURL = () => "blob:x";
  const b = brand.create(
    EMPTY,
    () => {},
    (v) => p.iconAccent(v),
  );
  assert.deepEqual(tiles(b.logoRow()), ["OpenWrt", "Outline ✓", "Upload"]);
  assert.deepEqual(tiles(b.iconRow()), ["OpenWrt", "Outline ✓", "Upload"]);
});

test("Outline: files baked from an earlier drawing are stale", () => {
  const { uci, rpc } = stubs({
    icon_router: "dark:#10a37f",
    logo: "logo-2.svg",
    logo_router: "dark:#10a37f",
  });
  const { p, brand } = page(uci, rpc, "#10a37f", "#10a37f");
  const b = brand.create(
    LIB,
    () => {},
    (v) => p.iconAccent(v),
  );
  assert.equal(b.state.logo, "");
  assert.equal(b.accent().key, "dark:#10a37f", "keeps the stored variant");
  assert.equal(b.stale(), true);
});

test("Outline: nothing is stale on a stock install", () => {
  const { uci, rpc } = stubs({});
  const { p, brand } = page(uci, rpc);
  const b = brand.create(
    LIB,
    () => {},
    (v) => p.iconAccent(v),
  );
  assert.equal(b.stale(), false);
});

test("Save: another App icon picture still fills all five icon slots", async () => {
  const { conf, uci, rpc } = stubs({ icon: "openwrt" });
  const made = [];
  const icons = {
    generate: (url, opts) => {
      made.push([url, opts]);
      const f = (name, type) => new File(["x"], name, { type });
      return Promise.resolve({
        favicon: f("favicon.svg", "image/svg+xml"),
        favicon_ico: f("favicon.ico", "image/x-icon"),
        apple_touch: f("apple-touch-icon.png", "image/png"),
        pwa_192: f("app-192.png", "image/png"),
        pwa_512: f("app-512.png", "image/png"),
      });
    },
  };
  const { p, brand } = page(uci, rpc, "#006aff", "#006efe", icons);
  const b = brand.create(
    LIB,
    () => {},
    (v) => p.iconAccent(v),
  );
  const sent = [];
  b.send = (slot, file) => {
    sent.push(slot);
    return Promise.resolve(slot + "-1." + file.name.split(".").pop());
  };
  await b.stage();
  assert.equal(made.length, 1);
  assert.equal(made[0][0], "/luci-static/bootstrap/logo.svg");
  assert.deepEqual(sent, [
    "favicon",
    "favicon_ico",
    "apple_touch",
    "pwa_192",
    "pwa_512",
  ]);
  for (const s of [
    "favicon",
    "favicon_ico",
    "apple_touch",
    "pwa_192",
    "pwa_512",
  ])
    assert.ok(conf.branding[s], s);
  assert.equal(conf.branding.icon, "openwrt");
  assert.equal(conf.branding.icon_router, undefined);
  assert.equal(conf.branding.logo, undefined, "stock accent: no logo upload");
});
