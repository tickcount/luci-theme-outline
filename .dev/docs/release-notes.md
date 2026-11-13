# Release notes: how the list of changes is collected

A release's `- ` points ([build.md › Releases](build.md#releases)) and any list of «what changed» asked for along the way are collected the same way. The owner set it on 2026-11-12 (for Dawnline, and asked for the same here), after a list made from commit messages came out long, mixed trivia with what matters and missed whole features: «в будущем мне нужно чтобы ты так всегда логи собирал».

## The rule

- **From the code, against production.** Production is the last release: the tip of `origin/master`, the last tag `vX.Y.Z`. Go through the difference itself (`git diff vX.Y.Z..HEAD`), not only the commits' titles and bodies: the theme's sources (`.dev/src/media`, `.dev/src/resource`), the templates (`ucode/template/themes/outline`), the settings pages and their rpcd backend (`root/`), the page patches, the build and the package (`Makefile`, `.dev/vite.config.ts`). The commit messages are where to start, never the source: a list made from them alone misses what a large commit did «and the rest».
- **Key changes only.** What somebody who runs LuCI with Outline wants to know: what was rebuilt, what is faster or lighter and by how much, what the theme can do now that it could not (a layout, a setting, a page it styles), what is gone, what behaves differently. One short line each, the thing first.
- **Not the trivia.** A unit, a label, a screenshot in the README, a move of code nobody sees: left out. The owner's word for such a line was «юзелесс».
- **A rework is told whole.** What it was, what it is now, and what happens to what people had set before the update. One line is not enough for something rebuilt.
- **A number says where it is from.** Measured for this list, or taken from the docs or a commit's message. Nothing is called checked that was only read in the code.
- **In English.** The points are English whatever language they were asked for in: what the owner writes in Russian is what he means, not how to write it («то что я пишу на русском это то что я имею ввиду а не как написать»). The talk around the list stays in his language.

## How

1. Find production: `git fetch`, then the default branch's tip and its tag.
2. Size the difference by area (`git diff --numstat`), then read each area for what came, went and changed: names that exist on one side only are the quickest lead (settings, template hooks, files added and deleted), and each lead is checked in the code before it is written down, since a thing drawn again is not a thing added.
3. Read the commits' bodies for the reasons and the measurements.
4. Write the short list; expand the reworks.
