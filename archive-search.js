/* Progressive-enhancement search for public project and research archives. */
(() => {
  "use strict";
  const input = document.querySelector("[data-archive-search]");
  if (!input) return;
  const controls = document.querySelector("[data-archive-controls]");
  const buttons = controls ? [...controls.querySelectorAll("[data-archive-filter]")] : [];
  const cards = [...document.querySelectorAll("[data-archive-item]")];
  if (!cards.length) return;
  const empty = document.querySelector(".archive-filter-empty");
  const count = document.querySelector("[data-archive-result-count]");
  const clear = document.querySelector("[data-archive-clear]");
  const allLabel = count?.dataset.allLabel || "results";
  const norm = value => String(value || "").normalize("NFKC").toLocaleLowerCase().trim();
  const validGroups = buttons.map(button => button.dataset.archiveFilter);
  const state = { category: "all", q: "" };
  function refresh(writeUrl = true) {
    let shown = 0;
    const needle = norm(state.q);
    for (const card of cards) {
      const groupOK = state.category === "all" || card.dataset.archiveGroup === state.category;
      const searchOK = !needle || norm(card.dataset.archiveSearch).includes(needle);
      card.hidden = !(groupOK && searchOK);
      if (!card.hidden) shown++;
    }
    for (const button of buttons)
      button.setAttribute("aria-pressed", String(button.dataset.archiveFilter === state.category));
    if (empty) empty.hidden = shown !== 0;
    if (count) count.textContent = shown + " " + allLabel;
    if (clear) clear.hidden = state.q.length === 0;
    if (writeUrl && window.history?.replaceState) {
      const next = new URL(window.location.href);
      if (state.category === "all") next.searchParams.delete("category");
      else next.searchParams.set("category", state.category);
      if (!state.q.trim()) next.searchParams.delete("q");
      else next.searchParams.set("q", state.q.trim());
      window.history.replaceState(null, "", next.pathname + next.search + next.hash);
    }
  }
  function restore() {
    const params = new URL(window.location.href).searchParams;
    const requested = params.get("category") || "all";
    state.category = validGroups.includes(requested) ? requested : "all";
    state.q = (params.get("q") || "").slice(0, 160);
    input.value = state.q;
    refresh(false);
  }
  input.closest("[data-archive-search-controls]").hidden = false;
  if (controls) controls.hidden = false;
  input.addEventListener("input", () => {
    state.q = input.value.slice(0, 160);
    refresh();
  });
  if (clear) clear.addEventListener("click", () => {
    state.q = "";
    input.value = "";
    refresh();
    input.focus();
  });
  for (const button of buttons)
    button.addEventListener("click", () => {
      state.category = button.dataset.archiveFilter;
      refresh();
    });
  window.addEventListener("popstate", restore);
  restore();
})();
