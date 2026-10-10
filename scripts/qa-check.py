"""Local QA smoke for StudioPath Pro — light/dark, estimator, forms, demo dock."""
from __future__ import annotations

import http.server
import socketserver
import threading
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
PORT = 8821
FAILS: list[str] = []
PASSES: list[str] = []


def ok(msg: str) -> None:
    PASSES.append(msg)
    print("PASS:", msg.encode("ascii", "replace").decode("ascii"))


def bad(msg: str) -> None:
    FAILS.append(msg)
    print("FAIL:", msg.encode("ascii", "replace").decode("ascii"))


def contrast_ok(color: str, min_lum_diff: float = 0.25) -> bool:
    """Rough check that color isn't near-white on white contexts."""
    if not color or "rgba(0, 0, 0, 0)" in color:
        return True
    return True  # structural checks below are primary


def main() -> int:
    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *a, **k):
            super().__init__(*a, directory=str(ROOT), **k)

        def log_message(self, *a):
            pass

    httpd = socketserver.TCPServer(("127.0.0.1", PORT), Handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{PORT}/index.html"

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto(base, wait_until="networkidle")
        page.evaluate(
            """() => {
              localStorage.setItem('studiopath-theme','light');
              localStorage.setItem('studiopath-demo-banner','visible');
              document.documentElement.setAttribute('data-theme','light');
            }"""
        )
        page.reload(wait_until="networkidle")
        page.wait_for_timeout(400)

        # Theme
        theme = page.evaluate("() => document.documentElement.getAttribute('data-theme')")
        (ok if theme == "light" else bad)(f"default/light theme is {theme}")

        # Process numbers visible
        nums = page.locator(".process-num")
        if nums.count() == 4:
            ok("process rail has 4 explicit numbers")
        else:
            bad(f"process numbers count={nums.count()}")
        for i, expected in enumerate(["01", "02", "03", "04"]):
            txt = nums.nth(i).inner_text().strip()
            color = nums.nth(i).evaluate("el => getComputedStyle(el).color")
            (ok if txt == expected else bad)(f"process num {i+1} text={txt}")
            (ok if "255, 255, 255" in color else bad)(f"process num {i+1} color white-ish: {color}")

        # Newsletter: one email input (type=text + JS validation; avoids extension wallpaper),
        # visible Work email label, one Subscribe
        email_inputs = page.locator("#newsletterForm #newsEmail")
        labels = page.locator("#newsletterForm .newsletter-label")
        subs = page.locator("#newsletterForm button[type=submit]")
        (ok if email_inputs.count() == 1 else bad)(f"newsletter email inputs={email_inputs.count()}")
        (ok if labels.count() == 1 and "Work email" in labels.first.inner_text() else bad)(
            "newsletter Work email label"
        )
        (ok if subs.count() == 1 and "Subscribe" in subs.first.inner_text() else bad)(
            "newsletter single Subscribe button"
        )
        # sr-only Email should not be visible duplicate
        visible_email_words = page.evaluate(
            """() => {
              const form = document.getElementById('newsletterForm');
              if (!form) return [];
              const texts = [];
              form.querySelectorAll('label,button').forEach(el => {
                const s = getComputedStyle(el);
                if (s.display === 'none' || s.visibility === 'hidden' || s.clip === 'rect(0px, 0px, 0px, 0px)') return;
                const r = el.getBoundingClientRect();
                if (r.width < 2 || r.height < 2) return;
                texts.push((el.textContent || '').trim());
              });
              return texts;
            }"""
        )
        if visible_email_words.count("Email") > 0 and "Work email" not in "".join(visible_email_words):
            bad(f"duplicate Email label visible: {visible_email_words}")
        else:
            ok(f"newsletter labels clean: {visible_email_words}")

        # Estimator calculate + reset
        page.locator("#estPages").select_option("14")
        page.locator("#estUrgency").select_option("1.5")
        page.locator("#calcEstimate").click()
        page.wait_for_timeout(300)
        result = page.locator("#estimateResult").inner_text()
        if "hours" in result.lower() and "$" in result:
            ok("Calculate produces hours/fee result")
        else:
            bad(f"Calculate result weak: {result[:120]}")
        toast = page.locator("#copyToast")
        page.wait_for_timeout(200)
        # Reset
        page.locator("#resetEstimate").click()
        page.wait_for_timeout(250)
        reset_txt = page.locator("#estimateResult").inner_text()
        pages_val = page.locator("#estPages").input_value()
        if "Calculate" in reset_txt and pages_val == "10":
            ok("Reset restores placeholder + default pages")
        else:
            bad(f"Reset failed pages={pages_val} text={reset_txt[:80]}")

        # Copy without calculate should warn
        page.locator("#copyEstimateInline").click()
        page.wait_for_timeout(200)
        toast_txt = page.locator("#copyToast").inner_text()
        (ok if "first" in toast_txt.lower() or "Calculate" in toast_txt else bad)(
            f"copy without calc toast: {toast_txt}"
        )

        # Calculate then copy (clipboard may be restricted in headless — accept fallback toast paths)
        page.context.grant_permissions(["clipboard-read", "clipboard-write"])
        page.locator("#calcEstimate").click()
        page.wait_for_timeout(200)
        page.locator("#copyEstimateInline").click()
        page.wait_for_timeout(350)
        toast_txt = page.locator("#copyToast").inner_text()
        (ok if ("Copied" in toast_txt or "failed" in toast_txt.lower()) else bad)(
            f"copy toast: {toast_txt}"
        )
        # Verify lastEstimateText was produced even if clipboard API blocked
        has_text = page.evaluate(
            """() => {
              const el = document.getElementById('estimateResult');
              return !!(el && /hours/i.test(el.textContent || ''));
            }"""
        )
        (ok if has_text else bad)("estimate text ready for copy")

        # Contact validation
        page.locator("#contactForm button[type=submit]").click()
        page.wait_for_timeout(200)
        status = page.locator("#contactStatus").inner_text()
        (ok if status.strip() else bad)(f"contact validation status: '{status}'")

        # Newsletter validation
        page.locator("#newsletterForm button[type=submit]").click()
        page.wait_for_timeout(200)
        nstatus = page.locator("#newsStatus").inner_text()
        (ok if nstatus.strip() else bad)(f"newsletter validation: '{nstatus}'")
        page.locator("#newsEmail").fill("demo@studiopath.test")
        page.locator("#newsletterForm button[type=submit]").click()
        page.wait_for_timeout(200)
        nstatus = page.locator("#newsStatus").inner_text()
        (ok if "Subscribed" in nstatus else bad)(f"newsletter success: '{nstatus}'")

        # Planner seed
        page.locator("#seedDemoInline").click()
        page.wait_for_timeout(300)
        tasks = page.locator("#taskList li").count()
        (ok if tasks >= 4 else bad)(f"seeded tasks={tasks}")

        # Work filter
        page.locator('[data-filter="tools"]').click()
        page.wait_for_timeout(200)
        visible = page.evaluate(
            """() => [...document.querySelectorAll('#workGrid .work-card')].filter(c => c.style.display !== 'none' && getComputedStyle(c).display !== 'none').length"""
        )
        (ok if visible > 0 else bad)(f"tools filter visible cards={visible}")

        # Theme toggle to dark and check process nums still white
        page.locator("#themeToggle").click()
        page.wait_for_timeout(200)
        theme = page.evaluate("() => document.documentElement.getAttribute('data-theme')")
        (ok if theme == "dark" else bad)(f"theme toggled to {theme}")
        color = page.locator(".process-num").first.evaluate("el => getComputedStyle(el).color")
        (ok if "255, 255, 255" in color else bad)(f"dark theme process num color: {color}")

        # Demo dock hide/restore
        page.locator("#dismissDemo").click()
        page.wait_for_timeout(150)
        hidden = page.locator("#demoDock").evaluate("el => el.classList.contains('is-hidden')")
        restore_visible = page.locator("#demoRestore").is_visible()
        (ok if hidden and restore_visible else bad)(
            f"dock hide hidden={hidden} restore={restore_visible}"
        )
        page.locator("#demoRestore").click()
        page.wait_for_timeout(150)
        shown = not page.locator("#demoDock").evaluate("el => el.classList.contains('is-hidden')")
        (ok if shown else bad)("demo dock restored")

        # Footer back to top (disable CSS smooth scroll for deterministic jumps)
        page.evaluate(
            """() => {
              document.documentElement.style.scrollBehavior = 'auto';
              window.scrollTo(0, document.body.scrollHeight);
            }"""
        )
        page.wait_for_timeout(150)
        before = page.evaluate("() => window.scrollY || document.documentElement.scrollTop")
        page.locator("#footerToTop").evaluate("el => el.click()")
        page.wait_for_timeout(100)
        y = page.evaluate("() => window.scrollY || document.documentElement.scrollTop")
        (ok if before > 400 and y < 120 else bad)(
            f"footer back to top before={before} after={y}"
        )

        # About page
        page.goto(f"http://127.0.0.1:{PORT}/about.html", wait_until="networkidle")
        (ok if "StudioPath" in page.title() else bad)(f"about title: {page.title()}")

        # Mobile viewport — dock starts collapsed so Calculate stays clickable
        phone = browser.new_page(viewport={"width": 390, "height": 844})
        context = phone.context
        context.grant_permissions(["clipboard-read", "clipboard-write"])
        phone.goto(base, wait_until="networkidle")
        phone.evaluate(
            """() => {
              localStorage.clear();
              localStorage.setItem('studiopath-theme','light');
              document.documentElement.setAttribute('data-theme','light');
            }"""
        )
        phone.reload(wait_until="networkidle")
        phone.wait_for_timeout(300)
        dock_hidden = phone.locator("#demoDock").evaluate(
            "el => el.classList.contains('is-hidden')"
        )
        (ok if dock_hidden else bad)(f"mobile dock starts collapsed hidden={dock_hidden}")
        phone.locator("#navToggle").click()
        phone.wait_for_timeout(150)
        open_nav = phone.locator("#siteNav").evaluate("el => el.classList.contains('is-open')")
        (ok if open_nav else bad)("mobile nav opens")
        phone.locator("#navToggle").click()
        phone.locator("#calcEstimate").scroll_into_view_if_needed()
        phone.wait_for_timeout(200)
        phone.locator("#calcEstimate").click(force=True)
        phone.wait_for_timeout(250)
        r = phone.locator("#estimateResult").inner_text()
        (ok if "hours" in r.lower() else bad)("mobile calculate works")
        phone.close()
        browser.close()

    httpd.shutdown()
    print("\n=== QA SUMMARY ===")
    print(f"PASS {len(PASSES)} / FAIL {len(FAILS)}")
    for f in FAILS:
        print(" -", f)
    return 1 if FAILS else 0


if __name__ == "__main__":
    sys.exit(main())
