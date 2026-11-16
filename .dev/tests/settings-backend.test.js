import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { root } from "./settings-load.js";

// `ucode -c` compiles a call to an undefined function without complaint; it
// only fails when that line runs. So every call in the rpcd backend must name
// a function defined in the file, an imported one, a local arrow helper, or a
// ucode builtin.
const BUILTINS = new Set(
  (
    "match replace lc uc trim ltrim rtrim substr length push pop shift unshift keys values " +
    "index rindex join split sprintf printf print json type int hex ord chr time system sort filter map exists " +
    "regexp die warn exit include require call uniq reverse slice splice min max wildcard b64enc b64dec"
  ).split(" "),
);
const KEYWORDS = new Set(
  "if for while switch function return catch typeof".split(" "),
);

test("SVG branding validation accepts pictures and rejects active content", () => {
  const src = readFileSync(
    join(root, "root/usr/share/rpcd/ucode/luci.outline"),
    "utf8",
  ).match(/function svg_safe\(data\) \{[\s\S]*?\n\}/)[0];
  // ucode uses POSIX regexes; musl treats JS shorthands such as \s as
  // literal letters. Translate only POSIX whitespace for this JS harness.
  assert.doesNotMatch(src, /\\[sSdDwWbB]/);
  const safe = new Function(
    "match",
    src.replaceAll("[:space:]", "\\s") + "; return svg_safe;",
  )((data, pattern) => data.match(pattern));

  for (const svg of [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M0 0"/></svg>',
    "<svg\nviewBox='0 0 100 100'></svg>",
    "<svg\tviewBox='0 0 100 100'></svg>",
    '<svg><use href="#icon"/></svg>',
    readFileSync(join(root, ".dev/public/outline/images/favicon.svg"), "utf8"),
  ])
    assert.equal(safe(svg), true, svg);

  for (const svg of [
    "<html></html>",
    '<svg onload="alert(1)"></svg>',
    '<svg\nonload = "alert(1)"></svg>',
    '<svg><path onclick\t= "alert(1)"/></svg>',
    "<svg><script>alert(1)</script></svg>",
    "<svg><foreignObject/></svg>",
    "<svg><iframe/></svg>",
    "<svg><embed/></svg>",
    "<svg><object/></svg>",
    '<!ENTITY x "test"><svg></svg>',
    '<svg><use href="https://example.com/icon.svg"/></svg>',
    '<svg><use xlink:href\n=\t" https://example.com/icon.svg"/></svg>',
    '<svg><use href="//example.com/icon.svg"/></svg>',
    '<svg><use href="data:text/html,test"/></svg>',
    '<svg><use href="javascript:alert(1)"/></svg>',
  ])
    assert.equal(safe(svg), false, svg);
});

test("the rpcd backend calls only functions that exist", () => {
  const src = readFileSync(
    join(root, "root/usr/share/rpcd/ucode/luci.outline"),
    "utf8",
  )
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "")
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/`(?:[^`\\]|\\.)*`/g, "``");
  const defined = new Set([
    ...[...src.matchAll(/\bfunction\s+([A-Za-z_]\w*)/g)].map((m) => m[1]),
    ...[...src.matchAll(/\bconst\s+([A-Za-z_]\w*)\s*=\s*\(/g)].map((m) => m[1]),
    ...[...src.matchAll(/^import\s*\{([^}]*)\}/gm)].flatMap((m) =>
      m[1].split(",").map((x) => x.trim()),
    ),
  ]);
  const missing = new Set();
  for (const m of src.matchAll(/(^|[^.\w])([A-Za-z_]\w*)\s*\(/g)) {
    const name = m[2];
    if (!KEYWORDS.has(name) && !BUILTINS.has(name) && !defined.has(name))
      missing.add(name);
  }
  assert.deepEqual([...missing], []);
});
