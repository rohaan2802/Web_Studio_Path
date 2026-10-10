"""Full demo-readiness audit for StudioPath Pro."""
from __future__ import annotations

import http.server
import socketserver
import threading
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
PORT = 8833
FAILS: list[str] = []
PASSES: list[str] = []
WARNS: list[str] = []


def ok(msg: str) -> None:
    PASSES.append(msg)
    print("PASS:", msg)


def bad(msg: str) -> None:
    FAILS.append(msg)
    print("FAIL:", msg)


def warn(msg: str) -> None:
    WARNS.append(msg)
    print("WARN:", msg)


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
        console_errors: list[str] = []
        page.on(
            "pageerror",
            lambda err: console_errors.append(str(err)),
        )
        page.on(
            "console",
            lambda msg: console_errors.append(msg.text)
            if msg.type == "error"
            else None,
        )

        page.goto(base, wait_until="networkidle")
        page.evaluate(
            """() => {
              localStorage.clear();
              localStorage.setItem('studiopath-theme','light');
              localStorage.setItem('studiopath-demo-banner','visible');
              document.documentElement.setAttribute('data-theme','light');
            }"""
        )
        page.reload(wait_until="networkidle")
        page.wait_for_timeout(500)

        # --- Assets ---
        broken = page.evaluate(
            """() => {
              const bad = [];
              document.querySelectorAll('img').forEach(img => {
                if (!img.complete || img.naturalWidth === 0) {
                  bad.push(img.getAttribute('src') || '(no src)');
                }
              });
              return bad;
            }"""
        )
        (ok if not broken else bad)(
            f"images load ({len(broken)} broken: {broken[:5]})"
            if broken
            else "all images loaded"
        )

        # --- No fetch/XHR backend calls on load ---
        reqs = []
        page.on("request", lambda r: reqs.append(r.url) if r.resource_type in ("xhr", "fetch") else None)
        page.reload(wait_until="networkidle")
        page.wait_for_timeout(400)
        xhr = [u for u in reqs if "127.0.0.1" in u and ("api" in u.lower() or "submit" in u.lower())]
        (ok if not xhr else bad)(f"no backend XHR on load ({len(xhr)})")

        # --- Theme ---
        theme = page.evaluate("() => document.documentElement.getAttribute('data-theme')")
        (ok if theme == "light" else bad)(f"light theme active: {theme}")
        page.locator("#themeToggle").click()
        page.wait_for_timeout(200)
        theme = page.evaluate("() => document.documentElement.getAttribute('data-theme')")
        (ok if theme == "dark" else bad)(f"dark toggle: {theme}")
        page.locator("#themeToggle").click()
        page.wait_for_timeout(200)

        # --- Estimator ---
        page.locator("#calcEstimate").scroll_into_view_if_needed()
        page.locator("#estPages").select_option("14")
        page.locator("#estUrgency").select_option("1.5")
        page.locator("#calcEstimate").click()
        page.wait_for_timeout(250)
        result = page.locator("#estimateResult").inner_text()
        (ok if "hours" in result.lower() and "$" in result else bad)(
            f"estimate calc: {result[:90]}"
        )
        page.locator("#resetEstimate").click()
        page.wait_for_timeout(200)
        (ok if page.locator("#estPages").input_value() == "10" else bad)("estimate reset pages")

        # --- Newsletter: client-only success, no network ---
        page.locator("#newsEmail").fill("not-an-email")
        page.locator("#newsletterForm button[type=submit]").click()
        page.wait_for_timeout(200)
        nbad = page.locator("#newsStatus").inner_text()
        (ok if nbad.strip() and "Subscribed" not in nbad else bad)(f"newsletter reject: {nbad}")
        page.locator("#newsEmail").fill("demo@studiopath.test")
        page.locator("#newsletterForm button[type=submit]").click()
        page.wait_for_timeout(200)
        nok = page.locator("#newsStatus").inner_text()
        (ok if "Subscribed" in nok else bad)(f"newsletter accept: {nok}")

        # --- Contact: email mode rejects phone ---
        page.locator("#cName").fill("Demo User")
        page.locator('input[name="channel"][value="email"]').check()
        page.wait_for_timeout(100)
        label = page.locator("#cContactLabel").inner_text().strip()
        (ok if label == "Email" else bad)(f"email label: {label}")
        page.locator("#cContact").fill("03001234567")
        page.locator("#cType").select_option("landing")
        page.locator("#cPass").fill("secret12")
        page.locator("#cPass2").fill("secret12")
        page.locator("#cTerms").check()
        page.locator("#contactForm button[type=submit]").click()
        page.wait_for_timeout(200)
        st = page.locator("#contactStatus").inner_text()
        (ok if "email" in st.lower() and "phone" in st.lower() else bad)(
            f"email mode rejects phone: {st}"
        )

        # --- Contact: phone mode rejects email ---
        page.locator('input[name="channel"][value="phone"]').check()
        page.wait_for_timeout(150)
        label = page.locator("#cContactLabel").inner_text().strip()
        ph = page.locator("#cContact").get_attribute("placeholder") or ""
        (ok if label == "Phone" and "+92" in ph else bad)(
            f"phone mode UI label={label} placeholder={ph}"
        )
        page.locator("#cContact").fill("demo@studiopath.test")
        page.locator("#cName").fill("Demo User")
        page.locator("#cType").select_option("landing")
        page.locator("#cPass").fill("secret12")
        page.locator("#cPass2").fill("secret12")
        page.locator("#cTerms").check()
        page.locator("#contactForm button[type=submit]").click()
        page.wait_for_timeout(200)
        st = page.locator("#contactStatus").inner_text()
        (ok if "phone" in st.lower() and "email" in st.lower() else bad)(
            f"phone mode rejects email: {st}"
        )

        # --- Contact: valid Pakistani phone succeeds (client-only) ---
        page.locator("#cContact").fill("+92 300 1234567")
        page.locator("#cName").fill("Demo User")
        page.locator("#cType").select_option("portfolio")
        page.locator("#cPass").fill("secret12")
        page.locator("#cPass2").fill("secret12")
        page.locator("#cTerms").check()
        page.locator("#contactForm button[type=submit]").click()
        page.wait_for_timeout(250)
        st = page.locator("#contactStatus").inner_text()
        (ok if "validated" in st.lower() and "uploaded" in st.lower() else bad)(
            f"phone submit client-only: {st}"
        )
        # Field should reset to email mode after reset+sync
        page.wait_for_timeout(100)
        label = page.locator("#cContactLabel").inner_text().strip()
        (ok if label == "Email" else warn)(f"after reset label back to Email: {label}")

        # --- Contact: valid email succeeds ---
        page.locator("#cName").fill("Demo User")
        page.locator('input[name="channel"][value="email"]').check()
        page.locator("#cContact").fill("ok@studiopath.test")
        page.locator("#cType").select_option("platform")
        page.locator("#cPass").fill("secret12")
        page.locator("#cPass2").fill("secret99")
        page.locator("#cTerms").check()
        page.locator("#contactForm button[type=submit]").click()
        page.wait_for_timeout(200)
        st = page.locator("#contactStatus").inner_text()
        (ok if "match" in st.lower() else bad)(f"password mismatch: {st}")
        page.locator("#cPass2").fill("secret12")
        page.locator("#contactForm button[type=submit]").click()
        page.wait_for_timeout(250)
        st = page.locator("#contactStatus").inner_text()
        (ok if "validated" in st.lower() else bad)(f"email submit ok: {st}")

        # --- Planner ---
        page.locator("#seedDemoInline").click()
        page.wait_for_timeout(300)
        tasks = page.locator("#taskList li").count()
        (ok if tasks >= 4 else bad)(f"planner seed tasks={tasks}")
        page.locator("#taskTitle").fill("QA mobile row")
        page.locator("#taskForm button[type=submit]").click()
        page.wait_for_timeout(200)
        (ok if page.locator("#taskList li").count() >= tasks + 1 else bad)("planner add task")

        # --- Work filters ---
        page.locator('[data-filter="all"]').click()
        total = page.locator("#workGrid .work-card").count()
        page.locator('[data-filter="motion"]').click()
        page.wait_for_timeout(150)
        vis = page.evaluate(
            """() => [...document.querySelectorAll('#workGrid .work-card')]
              .filter(c => getComputedStyle(c).display !== 'none').length"""
        )
        (ok if 0 < vis <= total else bad)(f"motion filter {vis}/{total}")

        # --- Demo dock ---
        page.locator("#dismissDemo").click()
        page.wait_for_timeout(150)
        hidden = page.locator("#demoDock").evaluate("el => el.classList.contains('is-hidden')")
        restore = page.locator("#demoRestore").is_visible()
        (ok if hidden and restore else bad)(f"dock hide restore={restore} hidden={hidden}")
        page.locator("#demoRestore").click()
        page.wait_for_timeout(150)
        shown = not page.locator("#demoDock").evaluate("el => el.classList.contains('is-hidden')")
        (ok if shown else bad)("dock restore")

        # --- Copy claims: no live backend messaging present ---
        body = page.locator("body").inner_text().lower()
        for phrase in ("nothing was uploaded", "no live backend", "without a backend", "no spam backend"):
            if phrase in body or phrase.replace(" ", "") in body.replace(" ", ""):
                ok(f"honesty copy present-ish: {phrase}")
                break
        else:
            warn("could not find explicit no-backend copy in body text")

        # --- Mobile ---
        phone = browser.new_page(viewport={"width": 390, "height": 844})
        phone.goto(base, wait_until="networkidle")
        phone.evaluate(
            """() => {
              localStorage.clear();
              localStorage.setItem('studiopath-theme','light');
              document.documentElement.setAttribute('data-theme','light');
            }"""
        )
        phone.reload(wait_until="networkidle")
        phone.wait_for_timeout(400)
        overflow = phone.evaluate(
            "() => document.documentElement.scrollWidth - document.documentElement.clientWidth"
        )
        (ok if overflow <= 1 else bad)(f"mobile overflow={overflow}")
        dock_hidden = phone.locator("#demoDock").evaluate(
            "el => el.classList.contains('is-hidden')"
        )
        (ok if dock_hidden else bad)(f"mobile dock collapsed={dock_hidden}")
        # restore chip intentionally hidden on mobile — nav has Demo tools
        restore_disp = phone.locator("#demoRestore").evaluate(
            "el => getComputedStyle(el).display"
        )
        (ok if restore_disp == "none" else warn)(
            f"mobile restore chip display={restore_disp} (expect none)"
        )
        phone.locator("#calcEstimate").scroll_into_view_if_needed()
        phone.locator("#calcEstimate").click(force=True)
        phone.wait_for_timeout(250)
        r = phone.locator("#estimateResult").inner_text()
        (ok if "hours" in r.lower() else bad)("mobile estimate works")

        # planner task actions stay inside card
        phone.locator("#seedDemoInline").scroll_into_view_if_needed()
        phone.locator("#seedDemoInline").click(force=True)
        phone.wait_for_timeout(300)
        task_overflow = phone.evaluate(
            """() => {
              const vw = document.documentElement.clientWidth;
              const planner = document.querySelector('.planner');
              const pr = planner.getBoundingClientRect();
              return [...document.querySelectorAll('#taskList li')].some(li => {
                const r = li.getBoundingClientRect();
                return r.right > pr.right + 2 || r.right > vw + 2;
              });
            }"""
        )
        (ok if not task_overflow else bad)(f"mobile planner rows in card overflow={task_overflow}")
        phone.close()

        # --- About ---
        about = browser.new_page()
        about.goto(f"http://127.0.0.1:{PORT}/about.html", wait_until="networkidle")
        (ok if "StudioPath" in about.title() else bad)(f"about: {about.title()}")
        about.close()

        if console_errors:
            # filter noisy font/extension noise
            real = [e for e in console_errors if "favicon" not in e.lower()]
            if real:
                warn(f"console errors ({len(real)}): {real[:3]}")
            else:
                ok("no real console errors")
        else:
            ok("no console errors")

        browser.close()

    httpd.shutdown()
    print("\n=== DEMO AUDIT ===")
    print(f"PASS {len(PASSES)} | FAIL {len(FAILS)} | WARN {len(WARNS)}")
    for f in FAILS:
        print(" FAIL -", f)
    for w in WARNS:
        print(" WARN -", w)
    return 1 if FAILS else 0


if __name__ == "__main__":
    sys.exit(main())
