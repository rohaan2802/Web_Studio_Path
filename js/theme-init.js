(function () {
  try {
    var saved = localStorage.getItem("studiopath-theme");
    // Default light for client demos / projector rooms; dark remains opt-in.
    var theme = saved === "light" || saved === "dark" ? saved : "light";
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "light");
  }
})();
