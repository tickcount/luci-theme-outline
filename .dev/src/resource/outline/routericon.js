"use strict";
"require baseclass";

/*
 * Outline's brand picture -- the theme's logo and app icon: a white ceramic
 * router under a glass lens (the signal) that refracts it, no background.
 * Built here so it can wear the user's accent: the lit LED, the light behind
 * the lens and the colour the router turns inside it all come from one hex.
 * Every colour is written out as a literal (no var() or color-mix()), so it
 * renders the same on a canvas, as a favicon and on the sign-in page, and
 * passes rpcd's SVG check (svg_safe).
 *
 * It has a dark and a light look in one file (the light one gives the white
 * body a hairline, a deeper side and a denser shadow, so it holds on a light
 * page): the light one under
 * `@media (prefers-color-scheme: light)`, which in an <img> follows the
 * page's `color-scheme` -- the theme sets it from its own mode -- and in a
 * favicon the browser's. It is SVG only: no raster is ever made of it.
 *
 * The theme's stock logo.svg and favicon.svg (.dev/public/outline/images)
 * are svg(DEFAULT), DEFAULT being the stock dark accent.
 */

const DEFAULT = "#006efe";
/* The drawing's revision: bump it when the picture changes, so files baked
   from an earlier drawing count as stale and the next Save bakes them anew. */
const REV = 3;
/* Optically centred: halfway between the drawing's box centre (513, 513)
   and its centre of mass (520, 537) -- the lens is heavy and high. */
const VIEW = "182 190 670 670";

function rgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
  const n = parseInt(m ? m[1] : DEFAULT.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/* p % of a over b, as #rrggbb. */
function mix(a, b, p) {
  const x = rgb(a),
    y = rgb(b);
  return (
    "#" +
    x
      .map((c, i) =>
        Math.round((c * p + y[i] * (100 - p)) / 100)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

function normal(hex) {
  return /^#[0-9a-f]{6}$/i.test(hex || "") ? hex.toLowerCase() : DEFAULT;
}

const ROUTER =
  '<rect x="-28" y="-210" width="56" height="230" rx="28" transform="translate(300 530) rotate(-9)"/>' +
  '<rect x="-28" y="-250" width="56" height="270" rx="28" transform="translate(572 530) rotate(10)"/>' +
  '<rect x="196" y="520" width="480" height="240" rx="104"/>';
const LEDS =
  '<rect x="344" y="626" width="44" height="28" rx="14"/>' +
  '<rect x="412" y="626" width="44" height="28" rx="14"/>';
const LED_ON = '<rect x="276" y="626" width="44" height="28" rx="14"/>';
const CX = 612,
  CY = 430,
  R = 200;

/* The light look, as CSS over the dark one's presentation attributes. */
/* On a light page the white router and a frosted lens would melt into the
   background, so the lens stays smoked (a shade lighter) and the body gets
   a hairline, a deeper side and a denser shadow. */
const LIGHT =
  ".g0{stop-color:#5c5f66}" +
  ".g1{stop-color:#3a3c42}" +
  ".g2{stop-color:#26272c}" +
  ".rs{opacity:.42}" +
  ".ls{opacity:.35}" +
  ".s0{stop-color:#959aa3}" +
  ".s1{stop-color:#575c64}" +
  ".f2{stop-color:#bcc1c9}" +
  ".bo{stroke-opacity:.16}" +
  ".ro{stroke-opacity:.45}";

function svg(accent) {
  const a = normal(accent);
  const c = {
    a: a,
    a12w: mix(a, "#ffffff", 12),
    a45w: mix(a, "#ffffff", 45),
    a50w: mix(a, "#ffffff", 50),
    a85w: mix(a, "#ffffff", 85),
    a80k: mix(a, "#000000", 80),
  };
  const style = `<style>@media (prefers-color-scheme: light){${LIGHT}}</style>`;
  const zoom = `translate(${CX} ${CY}) scale(1.07) translate(${-CX} ${-CY}) translate(-4 -6)`;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEW}" width="1024" height="1024">` +
    style +
    "<defs>" +
    `<g id="r">${ROUTER}</g>` +
    `<clipPath id="lc"><circle cx="${CX}" cy="${CY}" r="${R}"/></clipPath>` +
    '<linearGradient id="face" gradientUnits="userSpaceOnUse" x1="200" y1="290" x2="560" y2="780"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#e9ebef"/><stop class="f2" offset="1" stop-color="#c6cad1"/></linearGradient>' +
    '<linearGradient id="side" x1="0" y1="0" x2="0" y2="1"><stop class="s0" offset="0" stop-color="#a9adb5"/><stop class="s1" offset="1" stop-color="#6c7179"/></linearGradient>' +
    `<linearGradient id="refr" gradientUnits="userSpaceOnUse" x1="540" y1="250" x2="700" y2="640"><stop offset="0" stop-color="#fffaf3"/><stop offset=".4" stop-color="${c.a12w}"/><stop offset=".65" stop-color="${c.a45w}"/><stop offset=".85" stop-color="${c.a}"/><stop offset="1" stop-color="${c.a80k}"/></linearGradient>` +
    '<radialGradient id="glass" cx=".35" cy=".25" r=".9"><stop class="g0" offset="0" stop-color="#4a4a4e" stop-opacity=".92"/><stop class="g1" offset=".6" stop-color="#2a2a2e" stop-opacity=".9"/><stop class="g2" offset="1" stop-color="#1b1b1f" stop-opacity=".92"/></radialGradient>' +
    `<linearGradient id="rim" x1=".2" y1="0" x2=".8" y2="1"><stop class="lr" offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset=".45" stop-color="#fff" stop-opacity=".12"/><stop offset=".8" stop-color="${c.a50w}" stop-opacity=".4"/><stop offset="1" stop-color="#fff" stop-opacity=".55"/></linearGradient>` +
    '<linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1"><stop class="sh" offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
    '<filter id="drop" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="22"/></filter>' +
    '<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter>' +
    '<filter id="glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="12"/></filter>' +
    '<filter id="haze" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="32"/></filter>' +
    "</defs>" +
    '<g transform="translate(9 9)">' +
    // ceramic router: shadow, extruded side, face, LEDs
    '<use class="rs" href="#r" fill="#000" opacity=".75" filter="url(#drop)" transform="translate(10 34)"/>' +
    '<use href="#r" fill="url(#side)" transform="translate(0 16)"/>' +
    // the light look's hairline: under the face, so only its outer half shows
    '<use class="bo" href="#r" fill="none" stroke="#000" stroke-opacity="0" stroke-width="7"/>' +
    '<use href="#r" fill="url(#face)"/>' +
    `<g fill="#b9bec6">${LEDS}</g>` +
    `<g fill="${c.a}" opacity=".7" filter="url(#glow)">${LED_ON}</g>` +
    `<g fill="${c.a}">${LED_ON}</g>` +
    // glass lens
    `<circle class="ls" cx="${CX}" cy="${CY}" r="${R}" fill="#000" opacity=".55" filter="url(#drop)" transform="translate(0 26)"/>` +
    `<circle cx="${CX}" cy="${CY}" r="${R}" fill="url(#glass)"/>` +
    '<g clip-path="url(#lc)">' +
    `<ellipse cx="${CX + 70}" cy="${CY + 110}" rx="150" ry="110" fill="${c.a}" opacity=".42" filter="url(#haze)"/>` +
    `<ellipse class="wh" cx="${CX - 40}" cy="${CY - 100}" rx="170" ry="90" fill="#8a6a5a" opacity=".22" filter="url(#haze)"/>` +
    `<g transform="${zoom}" filter="url(#soft)"><use href="#r" fill="url(#refr)"/></g>` +
    // dispersion where the router enters the glass
    '<ellipse cx="438" cy="512" rx="30" ry="15" fill="#ff5a0a" opacity=".95" filter="url(#glow)"/>' +
    '<ellipse cx="444" cy="516" rx="14" ry="7" fill="#ffd36b" filter="url(#soft)"/>' +
    `<path d="M${CX - 60} ${CY + R - 6}a${R} ${R} 0 0 0 190 -70" fill="none" stroke="${c.a85w}" stroke-width="22" stroke-linecap="round" opacity=".8" filter="url(#glow)"/>` +
    `<ellipse cx="${CX - 20}" cy="${CY - 150}" rx="190" ry="96" fill="url(#sheen)"/>` +
    "</g>" +
    `<circle cx="${CX}" cy="${CY}" r="${R - 1.5}" fill="none" stroke="url(#rim)" stroke-width="3"/>` +
    `<circle class="ro" cx="${CX}" cy="${CY}" r="${R + 1.5}" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="2"/>` +
    "</g></svg>"
  );
}

return baseclass.extend({
  DEFAULT: DEFAULT,
  REV: REV,
  svg: svg,
  mix: mix,
});
