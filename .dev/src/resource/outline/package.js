"use strict";
"require baseclass";
"require rpc";
"require ui";
"require outline.ui as w";

/*
 * The theme's package, under its Appearance settings in System › System ›
 * Language and Style (patches/admin-system-system.js): check for and
 * install updates of this theme, have them installed on a schedule, and
 * remove it with everything it stored, without SSH. Switching LuCI to or
 * away from it is that tab's own Design field. First installation is
 * install.sh in the repository: a package cannot install itself.
 *
 * Long work runs as a detached job on the router (/usr/libexec/outline/job):
 * rpcd starts it and returns at once, the page polls its status file. That
 * keeps opkg/apk out of rpcd's call timeout, and lets the job outlive the rpcd
 * reload an install triggers -- or the removal of the package serving this
 * very page.
 */

const callState = rpc.declare({ object: "luci.outline", method: "get_state" });
const callJobStart = rpc.declare({
  object: "luci.outline",
  method: "job_start",
  params: ["action"],
});
const callJobStatus = rpc.declare({
  object: "luci.outline",
  method: "job_status",
});
const callSetAuto = rpc.declare({
  object: "luci.outline",
  method: "set_auto_update",
  params: ["enable", "interval"],
});

/* When cron runs the automatic check, in words. Router-local time; cron's
   weekday 0 is Sunday, as is Date's. */
function scheduleText(a) {
  const pad = (n) => String(n).padStart(2, "0");
  const time = pad(a.hour) + ":" + pad(a.minute);
  if (a.interval == "daily") return _("Checks every day at %s").format(time);
  if (a.interval == "monthly")
    return _("Checks on day %d of every month at %s").format(a.monthday, time);
  const day = new Date(2024, 0, 7 + a.weekday).toLocaleDateString(undefined, {
    weekday: "long",
  });
  return _("Checks every %s at %s").format(day, time);
}

/* Numeric field-by-field compare: 1.0.10-r20261101 > 1.0.9-r20261231. */
function cmpVersion(a, b) {
  const pa = String(a || "")
    .split(/[^0-9]+/)
    .filter(Boolean)
    .map(Number);
  const pb = String(b || "")
    .split(/[^0-9]+/)
    .filter(Boolean)
    .map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d > 0 ? 1 : -1;
  }
  return 0;
}

const STEPS = {
  resolve: _("Looking up the latest release…"),
  download: _("Downloading the package…"),
  install: _("Installing…"),
  activate: _("Switching LuCI to Outline…"),
  deactivate: _("Switching LuCI back to Bootstrap…"),
  remove: _("Removing the package…"),
  cleanup: _("Deleting leftover files…"),
  done: _("Done"),
};

const ERRORS = {
  busy: _("Another operation is still running."),
  no_pkg_manager: _("Neither opkg nor apk was found on this router."),
  no_release: _(
    "No release was found. Check the internet connection of the router and try again.",
  ),
  no_asset: _(
    "The latest release has no package for this router’s package manager.",
  ),
  bad_url: _(
    "The release points at an unexpected download address; nothing was installed.",
  ),
  download: _("The package could not be downloaded."),
  checksum: _(
    "The downloaded package did not match its checksum; nothing was installed.",
  ),
  install: _(
    "The package manager could not install the package. See the log below.",
  ),
  remove: _(
    "The package manager could not remove the package. See the log below.",
  ),
};

const Page = {
  load() {
    return L.resolveDefault(callState(), null);
  },

  render(data) {
    this.data = data || {};
    this.root = E("div", { class: "ot" });
    this.paint();

    /* A job started from another tab (or before a reload) is picked up. */
    const job = this.data.job;
    if (job && job.state == "running") this.follow(job.action);

    return E("div", {}, [w.styleNode(), this.root]);
  },

  refresh() {
    return L.resolveDefault(callState(), null).then((data) => {
      if (data) this.data = data;
      this.paint();
    });
  },

  /* ── Jobs ── */

  start(action) {
    return callJobStart(action)
      .then((res) => {
        if (!res || res.error) {
          w.toast(
            ERRORS[res && res.error] ||
              _("The operation could not be started."),
            "danger",
          );
          return;
        }
        this.follow(action);
      })
      .catch((err) => w.toast(err.message || String(err), "danger"));
  },

  follow(action) {
    const quiet = action == "check";
    const step = E("p", { class: "ot-label" }, STEPS.resolve);
    const log = E("pre", { class: "ot-log" }, "");
    const close = E(
      "button",
      { type: "button", class: "ot-btn", disabled: "" },
      _("Close"),
    );

    if (quiet) {
      this.checking = true;
      this.paint();
    } else {
      const title =
        {
          update: _("Updating Outline"),
          uninstall: _("Uninstalling Outline"),
          purge: _("Removing Outline completely"),
        }[action] || _("Working…");
      ui.showModal(title, [
        E("div", { class: "ot" }, [
          step,
          log,
          E("div", { class: "ot-dialog-actions" }, [close]),
        ]),
      ]);
    }

    let misses = 0;
    const later = () => setTimeout(tick, 1000);
    const tick = () => {
      callJobStatus()
        .then((job) => {
          misses = 0;
          if (!job || !job.state) return later();
          if (!quiet) {
            step.textContent =
              job.state == "error"
                ? ERRORS[job.error] ||
                  _("The operation failed (%s).").format(job.error)
                : STEPS[job.step] || job.step || "";
            if (job.log != null) {
              log.textContent = job.log;
              log.scrollTop = log.scrollHeight;
            }
          }
          if (job.state == "running") return later();
          this.finish(action, job, close);
        })
        .catch(() => {
          /* rpcd reloads after a package install, and luci.outline is gone
				   for good once the theme is removed; give it a few beats. */
          if (action != "check" && ++misses > 3)
            return this.finish(action, { state: "done" }, close);
          later();
        });
    };
    later();
  },

  finish(action, job, close) {
    if (action == "check") {
      this.checking = false;
      if (job.state == "error")
        w.toast(
          ERRORS[job.error] || _("Checking for updates failed."),
          "warning",
        );
      return this.refresh();
    }

    close.disabled = false;
    /* LuCI keeps the menu tree in the browser and draws the tab bar from
		   it; after the package changed, the cached tree must go. */
    if (ui.menu && ui.menu.flushCache) ui.menu.flushCache();

    if (job.state != "done") {
      close.onclick = () => {
        ui.hideModal();
        this.refresh();
      };
      return;
    }

    if (action == "update") {
      close.textContent = _("Reload");
      close.onclick = () => location.reload();
      return;
    }

    /* Removed: this page is gone with the package. */
    if (action == "purge")
      try {
        Object.keys(localStorage).forEach((k) => {
          if (/^outline\./.test(k)) localStorage.removeItem(k);
        });
        sessionStorage.removeItem("outline.sidebar.cache");
      } catch (e) {}
    close.textContent = _("Continue");
    close.onclick = () => {
      location.href = L.url("admin/system/system");
    };
  },

  confirm(title, text, label, onYes) {
    ui.showModal(title, [
      E("div", { class: "ot" }, [
        E(
          "p",
          { class: "ot-desc", style: "font-size:var(--text-sm,14px)" },
          text,
        ),
        E("div", { class: "ot-dialog-actions" }, [
          E(
            "button",
            { type: "button", class: "ot-btn", click: ui.hideModal },
            _("Cancel"),
          ),
          E(
            "button",
            {
              type: "button",
              class: "ot-btn solid-danger",
              click: () => {
                ui.hideModal();
                onYes();
              },
            },
            label,
          ),
        ]),
      ]),
    ]);
  },

  /* Automatic updates apply at once, like the theme switch above them:
     a cron entry, not a staged setting. */
  setAuto(enable, interval) {
    return callSetAuto(enable, interval)
      .then((res) => {
        if (!res || res.error)
          throw new Error((res && res.error) || _("no answer from the router"));
        this.data.auto = res.auto;
      })
      .catch((err) =>
        w.toast(
          _("Automatic updates could not be changed: %s").format(
            err.message || err,
          ),
          "danger",
        ),
      )
      .then(() => this.paint());
  },

  /* ── Render ── */

  paint() {
    const d = this.data;
    const theme = d.theme || {};
    const upd = d.updates || {};
    const auto = d.auto || { enabled: false, interval: "weekly" };
    const rel = upd.theme || null;
    const busy = !!this.checking;
    const short = (v) => String(v || "").replace(/-r\d+$/, "");
    const newer =
      rel &&
      !rel.error &&
      theme.version &&
      cmpVersion(rel.version, theme.version) > 0;

    /* One line: where the theme stands, and when it was last asked. */
    const status = busy
      ? _("Checking…")
      : newer
        ? _("Version %s is available").format(short(rel.version))
        : !rel
          ? _("Not checked yet")
          : rel.error
            ? _("No release found")
            : _("Up to date");
    const checked =
      upd.checked && !busy
        ? _("checked %s").format(
            new Date(upd.checked * 1000).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            }),
          )
        : null;

    const card = w.card([
      w.row({
        label: theme.version
          ? _("Outline %s").format(short(theme.version))
          : _("Outline"),
        description: [status, checked].filter(Boolean).join(" · "),
        control: newer
          ? w.button(_("Update"), {
              kind: "primary",
              disabled: busy,
              onClick: () => this.start("update"),
            })
          : w.button(_("Check for updates"), {
              icon: "refresh",
              disabled: busy || !d.system,
              onClick: () => this.start("check"),
            }),
      }),
      w.row({
        label: _("Automatic updates"),
        description: auto.enabled
          ? scheduleText(auto) + " · " + _("installs newer releases")
          : _("Check for new releases on a schedule and install them"),
        control: w.toggle(
          !!auto.enabled,
          (on) => this.setAuto(on, auto.interval),
          _("Automatic updates"),
        ),
      }),
      auto.enabled
        ? w.row({
            label: _("Check"),
            control: w.segmented(
              [
                { value: "daily", label: _("Daily") },
                { value: "weekly", label: _("Weekly") },
                { value: "monthly", label: _("Monthly") },
              ],
              auto.interval,
              (v) => this.setAuto(true, v),
            ),
          })
        : null,
      w.row({
        label: _("Remove Outline completely"),
        description: _(
          "The theme, its settings and uploaded images; LuCI goes back to Bootstrap",
        ),
        control: w.button(_("Remove"), {
          kind: "danger",
          onClick: () =>
            this.confirm(
              _("Remove Outline completely?"),
              _(
                "The theme, its settings and every uploaded image are deleted. This cannot be undone.",
              ),
              _("Remove everything"),
              () => this.start("purge"),
            ),
        }),
      }),
    ]);

    this.root.replaceChildren(
      d.system
        ? ""
        : E(
            "div",
            { class: "ot-banner warn" },
            _(
              "The settings service did not answer. Reload the page; if it persists, restart rpcd.",
            ),
          ),
      E("div", { class: "ot-sections" }, [
        w.section(_("Outline"), null, [card]),
      ]),
    );
  },
};

return baseclass.extend({
  load() {
    return Page.load();
  },

  /* A page instance: render(data) builds it. Nothing here is a setting --
     every action runs at once -- so it has no part in the tab's Save. */
  create() {
    return Object.create(Page);
  },
});
