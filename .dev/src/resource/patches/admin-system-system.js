"use strict";
/* System › System › Language and Style: the Outline theme's own settings
   under the tab's card while the Design field says Outline -- picked there,
   they are right there: the package first, as the "Outline" section --
   updates, automatic updates, removal (outline/package.js) -- then
   Appearance (outline/appearance.js). The theme has no menu entry of its
   own.

   It stands after the System form, not inside it: the form draws itself
   anew on every save, which would take the page with it. It shows only
   while the Language and Style tab is the open one.

   Saving rides the page's own footer (the package's actions run at once,
   as they always did). LuCI's view saves (and resets) every
   .cbi-map in #maincontent through its bound instance, so the embed is one:
   Save stages the appearance next to the System form's changes, Save &
   Apply applies them all, Reset drops the previews. Design switched away
   from Outline drops them too, and nothing is staged for Outline then. */
(function () {
  const STEM = "admin-system-system";
  const MEDIA = "/luci-static/outline";

  let wrap = null;
  let page = null;
  let observer = null;
  let loading = false;
  let wasOutline = true;

  const field = () =>
    document.querySelector(
      '#view .cbi-value[data-name="_mediaurlbase"] select',
    );

  const outlinePicked = () => {
    const sel = field();
    return !sel || sel.value == MEDIA;
  };

  const tabOpen = () => {
    const pane = document.querySelector(
      '#view [data-tab="language"][data-tab-active]',
    );
    return !!pane && pane.getAttribute("data-tab-active") == "true";
  };

  function update() {
    if (!wrap) return;
    const outline = outlinePicked();
    if (!outline && wasOutline && page) page.handleReset();
    wasOutline = outline;
    wrap.style.display = outline && tabOpen() ? "flex" : "none";
  }

  function embed() {
    const sel = field();
    const map = sel && sel.closest(".cbi-map");
    if (!map || wrap || loading) return;
    loading = true;
    Promise.all([L.require("outline.appearance"), L.require("outline.package")])
      .then(([appearance, pkg]) =>
        Promise.all([appearance.load(), pkg.load()]).then(([data, pdata]) => {
          loading = false;
          if (!observer || !map.isConnected) return;
          page = appearance.create();
          wrap = E(
            "div",
            {
              class: "cbi-map ot-embed",
              /* The two pages' sections, 40px apart like their own. */
              style:
                "display:none;margin-top:32px;flex-direction:column;gap:40px",
            },
            [pkg.create().render(pdata), page.render(data)],
          );
          /* LuCI only binds instances of its own classes. */
          const Map = L.Class.extend({
            /* Only what was changed: the page's own Save would restage
               every option, and a hostname edit is not a theme edit. */
            save: () =>
              outlinePicked() && page.dirty()
                ? page.handleSave()
                : Promise.resolve(),
            reset: () => page.handleReset(),
          });
          L.dom.bindClassInstance(wrap, new Map());
          map.after(wrap);
          update();
        }),
      )
      .catch((err) => {
        loading = false;
        L.error(err);
      });
  }

  function onChange(ev) {
    if (ev.target.closest?.('.cbi-value[data-name="_mediaurlbase"]')) update();
  }

  function mount() {
    if (observer) return;
    /* The System form arrives after this script, and re-renders on save;
       a tab switch flips data-tab-active. */
    observer = new MutationObserver(() => {
      if (!wrap) embed();
      update();
    });
    observer.observe(document.getElementById("maincontent"), {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-tab-active"],
    });
    document.addEventListener("change", onChange, true);
    embed();
  }

  function unmount() {
    observer?.disconnect();
    observer = null;
    document.removeEventListener("change", onChange, true);
    /* Taken out of the document, the page drops its own preview. */
    wrap?.remove();
    wrap = page = null;
    loading = false;
    wasOutline = true;
  }

  (window.luciPatches = window.luciPatches || {})[STEM] = { mount, unmount };
  mount();
})();
