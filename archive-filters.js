/* Progressive enhancement for the bilingual project archive. No CMS mutation. */
(() => {
  "use strict";
  const controls = document.querySelector("[data-archive-controls]");
  if (!controls) return;
  const buttons = [...controls.querySelectorAll("[data-archive-filter]")];
  const cards = [...document.querySelectorAll(".project-list-item[data-archive-group]")];
  if (!buttons.length || !cards.length) return;
  const empty = document.querySelector(".archive-filter-empty");
  function select(group, updateHash = true) {
    if (!buttons.some(button => button.dataset.archiveFilter === group)) group = "all";
    let shown = 0;
    for (const card of cards) {
      const visible = group === "all" || card.dataset.archiveGroup === group;
      card.hidden = !visible;
      if (visible) shown++;
    }
    for (const button of buttons) {
      button.setAttribute("aria-pressed", String(button.dataset.archiveFilter === group));
    }
    if (empty) empty.hidden = shown !== 0;
    if (updateHash && window.history && window.history.replaceState) {
      const next = new URL(window.location.href);
      if (group === "all") next.searchParams.delete("category");
      else next.searchParams.set("category", group);
      window.history.replaceState(null, "", next.pathname + next.search + next.hash);
    }
  }
  controls.hidden = false;
  buttons.forEach(button => button.addEventListener("click", () => select(button.dataset.archiveFilter)));
  const initial = new URL(window.location.href).searchParams.get("category") || "all";
  select(initial, false);
  window.addEventListener("popstate", () => {
    select(new URL(window.location.href).searchParams.get("category") || "all", false);
  });
})();
