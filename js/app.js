(function () {
  "use strict";

  var STORAGE_KEY = "studiopath-tasks-v1";
  var THEME_KEY = "studiopath-theme";
  var DEMO_KEY = "studiopath-demo-banner";
  var lastEstimateText = "";

  var nav = document.getElementById("siteNav");
  var navToggle = document.getElementById("navToggle");
  var themeToggle = document.getElementById("themeToggle");
  var progress = document.getElementById("progress");
  var toTop = document.getElementById("toTop");
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  var demoDock = document.getElementById("demoDock");
  var demoRestore = document.getElementById("demoRestore");
  var demoToggle = document.getElementById("demoToggle");
  var dismissDemo = document.getElementById("dismissDemo");

  function setDemoVisible(visible) {
    if (!demoDock) return;
    demoDock.classList.toggle("is-hidden", !visible);
    demoDock.setAttribute("aria-hidden", visible ? "false" : "true");
    document.body.classList.toggle("has-demo-dock", visible);
    if (demoRestore) {
      demoRestore.classList.toggle("is-hidden", visible);
      demoRestore.hidden = visible;
      demoRestore.setAttribute("aria-expanded", visible ? "false" : "true");
    }
    if (demoToggle) {
      demoToggle.setAttribute("aria-expanded", visible ? "true" : "false");
      demoToggle.classList.toggle("is-active", visible);
    }
    try {
      localStorage.setItem(DEMO_KEY, visible ? "visible" : "hidden");
    } catch (e) {}
  }

  function isDemoHidden() {
    try {
      var saved = localStorage.getItem(DEMO_KEY);
      if (saved === "hidden") return true;
      if (saved === "visible") return false;
      // First visit on small screens: keep dock collapsed so forms stay clickable
      if (window.matchMedia && window.matchMedia("(max-width: 760px)").matches) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  setDemoVisible(!isDemoHidden());

  if (dismissDemo) {
    dismissDemo.addEventListener("click", function () {
      setDemoVisible(false);
    });
  }
  if (demoDock && !demoDock.hasAttribute("tabindex")) {
    demoDock.setAttribute("tabindex", "-1");
  }
  if (demoRestore) {
    demoRestore.addEventListener("click", function () {
      setDemoVisible(true);
      if (demoDock && demoDock.focus) demoDock.focus({ preventScroll: true });
    });
  }
  if (demoToggle) {
    demoToggle.addEventListener("click", function () {
      setDemoVisible(demoDock.classList.contains("is-hidden"));
      if (nav && navToggle) {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "light"
      ? "light"
      : "dark";
  }

  function syncThemeLabel() {
    if (!themeToggle) return;
    themeToggle.textContent =
      currentTheme() === "dark" ? "Light theme" : "Dark theme";
  }
  syncThemeLabel();

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {}
      syncThemeLabel();
    });
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var ratio = max > 0 ? doc.scrollTop / max : 0;
    if (progress) progress.style.width = (ratio * 100).toFixed(2) + "%";
    if (toTop) toTop.hidden = doc.scrollTop < 420;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  function scrollPageTop(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    var root = document.documentElement;
    var prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    root.scrollTop = 0;
    document.body.scrollTop = 0;
    root.style.scrollBehavior = prev || "";
  }
  if (toTop) {
    toTop.addEventListener("click", scrollPageTop);
  }
  var footerToTop = document.getElementById("footerToTop");
  if (footerToTop) {
    footerToTop.addEventListener("click", scrollPageTop);
  }

  /* Animated counters */
  var stats = document.querySelectorAll("#heroStats [data-count]");
  if (stats.length) {
    var started = false;
    function runCounters() {
      if (started) return;
      started = true;
      stats.forEach(function (el) {
        var target = Number(el.getAttribute("data-count")) || 0;
        var now = 0;
        var step = Math.max(1, Math.round(target / 28));
        var timer = setInterval(function () {
          now += step;
          if (now >= target) {
            now = target;
            clearInterval(timer);
          }
          el.textContent = String(now);
        }, 30);
      });
    }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) runCounters();
          });
        },
        { threshold: 0.4 }
      );
      var host = document.getElementById("heroStats");
      if (host) io.observe(host);
    } else {
      runCounters();
    }
  }

  /* Portfolio filters */
  var chips = Array.prototype.slice.call(document.querySelectorAll("#work .chip"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".work-card"));
  var filterStatus = document.getElementById("filterStatus");

  function applyFilter(filter) {
    var visible = 0;
    cards.forEach(function (card) {
      var show = filter === "all" || card.getAttribute("data-category") === filter;
      card.classList.toggle("is-hidden", !show);
      if (show) visible += 1;
    });
    if (filterStatus) {
      filterStatus.textContent =
        filter === "all"
          ? "Showing all " + cards.length + " projects"
          : "Showing " + visible + " of " + cards.length + " projects";
    }
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      applyFilter(chip.getAttribute("data-filter") || "all");
    });
  });

  /* Lightbox */
  var lightbox = document.getElementById("lightbox");
  var lightboxImage = document.getElementById("lightboxImage");
  var lightboxCaption = document.getElementById("lightboxCaption");
  var lightboxClose = document.getElementById("lightboxClose");
  document.querySelectorAll("[data-lightbox]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      if (!lightbox || !lightboxImage) return;
      lightboxImage.src = link.getAttribute("href");
      lightboxImage.alt = link.querySelector("img")
        ? link.querySelector("img").alt
        : "";
      if (lightboxCaption) {
        lightboxCaption.textContent = link.getAttribute("data-caption") || "";
      }
      if (typeof lightbox.showModal === "function") lightbox.showModal();
    });
  });
  if (lightboxClose && lightbox) {
    lightboxClose.addEventListener("click", function () {
      lightbox.close();
    });
  }
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) lightbox.close();
    });
  }

  /* Keep email fields clean — some browser extensions inject tiled wallpapers */
  function scrubEmailFieldStyles() {
    document.querySelectorAll(".email-field, #newsEmail, #cContact").forEach(function (el) {
      el.style.setProperty("background-image", "none", "important");
      el.style.setProperty("background-color", "#ffffff", "important");
      el.style.setProperty("background-repeat", "no-repeat", "important");
    });
  }
  scrubEmailFieldStyles();
  setInterval(scrubEmailFieldStyles, 800);
  if (window.MutationObserver) {
    var emailMo = new MutationObserver(scrubEmailFieldStyles);
    emailMo.observe(document.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: ["style", "class"],
    });
  }

  function looksLikeEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(String(value || "").trim());
  }

  /* Pakistani mobile: 03XXXXXXXXX, +92 3XX XXXXXXX, 92XXXXXXXXXX */
  function looksLikePakPhone(value) {
    var digits = String(value || "").replace(/[\s\-().]/g, "");
    if (digits.indexOf("+92") === 0) digits = digits.slice(3);
    else if (digits.indexOf("92") === 0 && digits.length >= 12) digits = digits.slice(2);
    if (digits.charAt(0) === "0") digits = digits.slice(1);
    return /^3\d{9}$/.test(digits);
  }

  /* Newsletter */
  var newsForm = document.getElementById("newsletterForm");
  var newsStatus = document.getElementById("newsStatus");
  if (newsForm) {
    newsForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("newsEmail");
      if (!email || !looksLikeEmail(email.value)) {
        if (newsStatus) newsStatus.textContent = "Enter a valid email address.";
        if (email) email.focus();
        return;
      }
      if (newsStatus) newsStatus.textContent = "Subscribed locally. No email was sent.";
      newsForm.reset();
      scrubEmailFieldStyles();
    });
  }

  /* Estimator — functions, objects, arrays, conditionals */
  var ADDONS = {
    filters: { label: "Portfolio filters", hours: 6, fee: 90 },
    planner: { label: "Task planner", hours: 8, fee: 120 },
    video: { label: "Media embed", hours: 3, fee: 45 },
    studio: { label: "Multi-page about", hours: 5, fee: 75 },
  };

  function baseHours(pages) {
    if (pages >= 14) return 40;
    if (pages >= 10) return 28;
    return 18;
  }

  function baseFee(pages) {
    if (pages >= 14) return 650;
    if (pages >= 10) return 480;
    return 320;
  }

  var estimateForm = document.getElementById("estimateForm");
  var estimateResult = document.getElementById("estimateResult");
  var estimateHint = document.getElementById("estimateHint");
  var copyToast = document.getElementById("copyToast");
  var toastTimer = null;

  function urgencyLabel(urgency) {
    if (urgency >= 1.5) return "Rush (×1.5)";
    if (urgency >= 1.25) return "Faster (×1.25)";
    return "Standard (×1.0)";
  }

  function showCopyToast(message) {
    if (!copyToast) return;
    copyToast.hidden = false;
    copyToast.textContent = message;
    copyToast.classList.add("is-on");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      copyToast.classList.remove("is-on");
      setTimeout(function () {
        copyToast.hidden = true;
      }, 220);
    }, 2200);
  }

  function runEstimate(fromButton) {
    if (!estimateForm || !estimateResult) return false;
    var pagesEl = document.getElementById("estPages");
    var urgencyEl = document.getElementById("estUrgency");
    if (!pagesEl || !urgencyEl) return false;

    var pages = Number(pagesEl.value) || 10;
    var urgency = Number(urgencyEl.value) || 1;
    var checked = Array.prototype.slice.call(
      estimateForm.querySelectorAll('input[name="addon"]:checked')
    );
    var baseH = baseHours(pages);
    var baseF = baseFee(pages);
    var hours = baseH;
    var fee = baseF;
    var labels = [];
    var addonLines = [];
    checked.forEach(function (box) {
      var item = ADDONS[box.value];
      if (!item) return;
      hours += item.hours;
      fee += item.fee;
      labels.push(item.label);
      addonLines.push(
        item.label + " (+" + item.hours + "h / +$" + item.fee + ")"
      );
    });
    var subHours = hours;
    var subFee = fee;
    hours = Math.round(hours * urgency);
    fee = Math.round(fee * urgency);
    var rushNote =
      urgency > 1
        ? " Urgency " + urgencyLabel(urgency) + " applied to subtotal."
        : " No urgency uplift.";
    lastEstimateText =
      "StudioPath Pro estimate: " +
      hours +
      " hours, about $" +
      fee +
      ". Sections: " +
      pages +
      " (base " +
      baseH +
      "h / $" +
      baseF +
      "). Add-ons: " +
      (labels.length ? labels.join(", ") : "none") +
      ". Urgency: " +
      urgencyLabel(urgency) +
      ". (demo math only)";
    if (estimateHint) {
      estimateHint.textContent =
        "Calculated: (base " +
        baseH +
        "h / $" +
        baseF +
        " + add-ons) × " +
        urgency +
        " = " +
        hours +
        "h / $" +
        fee +
        ".";
    }
    estimateResult.innerHTML =
      '<p class="est-total"><strong>' +
      hours +
      " hours</strong> · ballpark <strong>$" +
      fee +
      "</strong></p>" +
      '<ul class="est-breakdown">' +
      "<li>Base for " +
      pages +
      " sections: " +
      baseH +
      "h / $" +
      baseF +
      "</li>" +
      "<li>Add-ons: " +
      (addonLines.length ? addonLines.join("; ") : "none") +
      "</li>" +
      "<li>Subtotal before urgency: " +
      subHours +
      "h / $" +
      subFee +
      "</li>" +
      "<li>Urgency: " +
      urgencyLabel(urgency) +
      "</li>" +
      "</ul>" +
      '<p class="est-note">' +
      rushNote +
      " Demo math only — not an invoice.</p>";

    estimateResult.classList.remove("is-flash");
    void estimateResult.offsetWidth;
    estimateResult.classList.add("is-flash");
    if (fromButton) {
      showCopyToast("Estimate calculated");
      try {
        estimateResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } catch (err) {}
    }
    return true;
  }

  var ESTIMATE_PLACEHOLDER =
    'Choose options, then click <strong>Calculate</strong> to see hours, fee, and breakdown.';
  var ESTIMATE_HINT_DEFAULT =
    "Pick options, then click Calculate — formula: (base + add-ons) × urgency.";

  function resetEstimateForm() {
    if (!estimateForm) return;
    var pagesEl = document.getElementById("estPages");
    var urgencyEl = document.getElementById("estUrgency");
    if (pagesEl) pagesEl.value = "10";
    if (urgencyEl) urgencyEl.value = "1";
    estimateForm.querySelectorAll('input[name="addon"]').forEach(function (box) {
      box.checked = box.value === "filters" || box.value === "planner";
    });
    lastEstimateText = "";
    if (estimateHint) estimateHint.textContent = ESTIMATE_HINT_DEFAULT;
    if (estimateResult) {
      estimateResult.innerHTML = ESTIMATE_PLACEHOLDER;
      estimateResult.classList.remove("is-flash");
    }
    showCopyToast("Estimate reset");
  }

  var calcEstimate = document.getElementById("calcEstimate");
  if (calcEstimate) {
    calcEstimate.addEventListener("click", function (e) {
      e.preventDefault();
      runEstimate(true);
    });
  }
  var resetEstimateBtn = document.getElementById("resetEstimate");
  if (resetEstimateBtn) {
    resetEstimateBtn.addEventListener("click", function (e) {
      e.preventDefault();
      resetEstimateForm();
    });
  }
  if (estimateForm) {
    estimateForm.addEventListener("submit", function (e) {
      e.preventDefault();
      runEstimate(true);
    });
  }

  function fallbackCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "0";
    area.style.left = "0";
    area.style.width = "1px";
    area.style.height = "1px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.focus();
    area.select();
    area.setSelectionRange(0, text.length);
    var worked = false;
    try {
      worked = document.execCommand("copy");
    } catch (err) {
      worked = false;
    }
    document.body.removeChild(area);
    return worked;
  }

  function copyText(text) {
    if (!text) {
      showCopyToast("Calculate an estimate first");
      return;
    }
    function ok() {
      showCopyToast("Copied to clipboard");
    }
    function fail() {
      showCopyToast("Copy failed - try again");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok, function () {
        if (fallbackCopy(text)) ok();
        else fail();
      });
    } else if (fallbackCopy(text)) {
      ok();
    } else {
      fail();
    }
  }

  var copyEstimate = document.getElementById("copyEstimate");
  var copyEstimateInline = document.getElementById("copyEstimateInline");
  if (copyEstimate) {
    copyEstimate.addEventListener("click", function () {
      copyText(lastEstimateText);
    });
  }
  if (copyEstimateInline) {
    copyEstimateInline.addEventListener("click", function () {
      copyText(lastEstimateText);
    });
  }

  /* DOM lab panel */
  var labStage = document.getElementById("labStage");
  var labText = document.getElementById("labText");
  var labStatus = document.getElementById("labStatus");
  var originalLab = labText ? labText.textContent : "";
  function setLabStatus(msg) {
    if (labStatus) labStatus.textContent = msg;
  }
  var labAccent = document.getElementById("labAccent");
  if (labAccent && labStage) {
    labAccent.addEventListener("click", function () {
      labStage.classList.toggle("is-accent");
      setLabStatus(
        labStage.classList.contains("is-accent")
          ? "Accent class added via classList.toggle."
          : "Accent class removed."
      );
    });
  }
  var labShake = document.getElementById("labShake");
  if (labShake && labStage) {
    labShake.addEventListener("click", function () {
      labStage.classList.remove("is-pulse");
      void labStage.offsetWidth;
      labStage.classList.add("is-pulse");
      setLabStatus("Pulse animation triggered once.");
    });
  }
  var labRewrite = document.getElementById("labRewrite");
  if (labRewrite && labText) {
    labRewrite.addEventListener("click", function () {
      labText.textContent =
        "Text rewritten with textContent — classic DOM assignment move.";
      setLabStatus("Inner text updated.");
    });
  }
  var labReset = document.getElementById("labReset");
  if (labReset && labStage && labText) {
    labReset.addEventListener("click", function () {
      labStage.classList.remove("is-accent", "is-pulse");
      labText.textContent = originalLab;
      setLabStatus("Lab reset.");
    });
  }

  /* Contact validation — email vs Pakistani phone by preferred channel */
  var contactForm = document.getElementById("contactForm");
  var contactStatus = document.getElementById("contactStatus");
  var contactField = document.getElementById("cContact");
  var contactLabel = document.getElementById("cContactLabel");

  function preferredChannel() {
    var picked = contactForm && contactForm.querySelector('input[name="channel"]:checked');
    return picked ? picked.value : "email";
  }

  function syncContactChannel() {
    if (!contactField || !contactLabel) return;
    var channel = preferredChannel();
    var keepValue = contactField.value;
    if (channel === "phone") {
      contactLabel.textContent = "Phone";
      contactField.classList.remove("email-field");
      contactField.setAttribute("inputmode", "tel");
      contactField.setAttribute("autocomplete", "tel");
      contactField.setAttribute("placeholder", "+92 300 1234567");
      contactField.setAttribute(
        "pattern",
        "(\\+92\\s?|0)?3\\d{2}[\\s-]?\\d{7}"
      );
      contactField.setAttribute("aria-label", "Pakistani phone number");
      if (looksLikeEmail(keepValue)) contactField.value = "";
    } else {
      contactLabel.textContent = "Email";
      contactField.classList.add("email-field");
      contactField.setAttribute("inputmode", "email");
      contactField.setAttribute("autocomplete", "email");
      contactField.setAttribute("placeholder", "name@company.com");
      contactField.setAttribute(
        "pattern",
        "[A-Za-z0-9._%+\\-]+@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,}"
      );
      contactField.setAttribute("aria-label", "Email address");
      if (looksLikePakPhone(keepValue) && !looksLikeEmail(keepValue)) {
        contactField.value = "";
      }
    }
    scrubEmailFieldStyles();
  }

  if (contactForm) {
    contactForm.querySelectorAll('input[name="channel"]').forEach(function (radio) {
      radio.addEventListener("change", syncContactChannel);
    });
    syncContactChannel();

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("cName");
      var contact = document.getElementById("cContact");
      var type = document.getElementById("cType");
      var pass = document.getElementById("cPass");
      var pass2 = document.getElementById("cPass2");
      var terms = document.getElementById("cTerms");
      var channel = preferredChannel();
      if (!name.value.trim()) {
        contactStatus.textContent = "Name is required.";
        name.focus();
        return;
      }
      if (channel === "phone") {
        if (looksLikeEmail(contact.value)) {
          contactStatus.textContent = "Phone selected — enter a Pakistani mobile number, not an email.";
          contact.focus();
          return;
        }
        if (!looksLikePakPhone(contact.value)) {
          contactStatus.textContent = "Use a Pakistani mobile like +92 300 1234567 or 0300 1234567.";
          contact.focus();
          return;
        }
      } else {
        if (looksLikePakPhone(contact.value) && !looksLikeEmail(contact.value)) {
          contactStatus.textContent = "Email selected — enter an email address, not a phone number.";
          contact.focus();
          return;
        }
        if (!looksLikeEmail(contact.value)) {
          contactStatus.textContent = "Use a valid email.";
          contact.focus();
          return;
        }
      }
      if (!type.value) {
        contactStatus.textContent = "Choose a project type.";
        type.focus();
        return;
      }
      if (pass.value.length < 6) {
        contactStatus.textContent = "Password needs at least 6 characters.";
        pass.focus();
        return;
      }
      if (pass.value !== pass2.value) {
        contactStatus.textContent = "Passwords do not match.";
        pass2.focus();
        return;
      }
      if (!terms.checked) {
        contactStatus.textContent = "Accept the demo notice to continue.";
        terms.focus();
        return;
      }
      contactStatus.textContent =
        "Brief validated on this device. Nothing was uploaded.";
      contactForm.reset();
      syncContactChannel();
    });
  }

  /* Task planner */
  var taskForm = document.getElementById("taskForm");
  var taskList = document.getElementById("taskList");
  var taskSearch = document.getElementById("taskSearch");
  var taskFilter = document.getElementById("taskFilter");
  var taskCounts = document.getElementById("taskCounts");
  var clearDone = document.getElementById("clearDone");
  var tasks = [];

  function loadTasks() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      tasks = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(tasks)) tasks = [];
    } catch (e) {
      tasks = [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {}
  }

  function renderTasks() {
    if (!taskList) return;
    var q = (taskSearch && taskSearch.value ? taskSearch.value : "")
      .trim()
      .toLowerCase();
    var mode = taskFilter ? taskFilter.value : "all";
    taskList.innerHTML = "";
    var open = 0;
    var done = 0;
    tasks.forEach(function (task) {
      if (task.done) done += 1;
      else open += 1;
      if (q && task.title.toLowerCase().indexOf(q) === -1) return;
      if (mode === "open" && task.done) return;
      if (mode === "done" && !task.done) return;
      if (mode === "high" && task.priority !== "high") return;
      var li = document.createElement("li");
      if (task.done) li.className = "is-done";
      li.innerHTML =
        '<div class="task-main">' +
        '<span class="badge ' +
        task.priority +
        '">' +
        task.priority +
        "</span>" +
        '<span class="task-title"></span></div>' +
        '<div class="task-actions">' +
        '<button type="button" data-act="toggle">Toggle</button>' +
        '<button type="button" data-act="delete">Delete</button></div>';
      li.querySelector(".task-title").textContent = task.title;
      li.querySelector('[data-act="toggle"]').addEventListener("click", function () {
        task.done = !task.done;
        saveTasks();
        renderTasks();
      });
      li.querySelector('[data-act="delete"]').addEventListener("click", function () {
        tasks = tasks.filter(function (t) {
          return t.id !== task.id;
        });
        saveTasks();
        renderTasks();
      });
      taskList.appendChild(li);
    });
    if (taskCounts) taskCounts.textContent = open + " open · " + done + " done";
  }

  if (taskForm) {
    loadTasks();
    renderTasks();
    taskForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var titleEl = document.getElementById("taskTitle");
      var priorityEl = document.getElementById("taskPriority");
      var title = titleEl.value.trim();
      if (!title) return;
      tasks.unshift({
        id: String(Date.now()),
        title: title,
        priority: priorityEl.value === "high" ? "high" : "low",
        done: false,
      });
      titleEl.value = "";
      saveTasks();
      renderTasks();
    });
  }
  if (taskSearch) taskSearch.addEventListener("input", renderTasks);
  if (taskFilter) taskFilter.addEventListener("change", renderTasks);
  if (clearDone) {
    clearDone.addEventListener("click", function () {
      tasks = tasks.filter(function (t) {
        return !t.done;
      });
      saveTasks();
      renderTasks();
    });
  }

  function seedDemoTasks() {
    tasks = [
      {
        id: "demo-1",
        title: "Approve hero + brand tokens",
        priority: "high",
        done: false,
      },
      {
        id: "demo-2",
        title: "Walkthrough: filters → lightbox",
        priority: "high",
        done: false,
      },
      {
        id: "demo-3",
        title: "Run estimator on projector",
        priority: "low",
        done: false,
      },
      {
        id: "demo-4",
        title: "Capture client feedback notes",
        priority: "low",
        done: true,
      },
    ];
    saveTasks();
    renderTasks();
    var planner = document.getElementById("planner");
    if (planner) planner.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  var seedDemo = document.getElementById("seedDemo");
  var seedDemoInline = document.getElementById("seedDemoInline");
  if (seedDemo) seedDemo.addEventListener("click", seedDemoTasks);
  if (seedDemoInline) seedDemoInline.addEventListener("click", seedDemoTasks);

  window.addEventListener("keydown", function (e) {
    if (e.key === "d" || e.key === "D") {
      var tag = (e.target && e.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      seedDemoTasks();
    }
  });
})();
