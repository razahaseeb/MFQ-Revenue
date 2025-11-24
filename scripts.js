// Basic interactions and GSAP animations for MFQ Revenue Pro site
document.addEventListener("DOMContentLoaded", () => {
  // set year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // mobile nav toggle (use class-based open state)
  const navToggle = document.querySelector(".nav-toggle");
  const mainNav = document.querySelector(".main-nav");
  navToggle?.addEventListener("click", () => {
    if (!mainNav) return;
    const isOpen = mainNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
  // NOTE: mobile menu close is handled after initiating smooth scroll
  // to avoid layout reflow delaying the scroll animation.

  // Accordion with GSAP-driven smooth open/close
  (function setupAccordion() {
    const items = Array.from(document.querySelectorAll(".acc-item"));

    function openItem(it) {
      const panel = it.querySelector(".acc-panel");
      if (!panel) return;
      // set open class first so CSS (padding/background) is applied during animation
      it.classList.add("open");
      const btn = it.querySelector(".acc-toggle");
      if (btn) btn.setAttribute("aria-expanded", "true");
      const che = it.querySelector(".acc-chevron");
      if (che)
        gsap.to(che, { duration: 0.42, rotate: 180, ease: "power3.out" });

      gsap.killTweensOf(panel);
      // measure content and animate height from 0 -> full, then set height:auto
      panel.style.display = "block";
      panel.style.overflow = "hidden";
      panel.removeAttribute("aria-hidden");
      // ensure starting at 0
      panel.style.height = "0px";
      panel.style.opacity = "0";
      // force layout so scrollHeight is correct
      const full = panel.scrollHeight;
      gsap.to(panel, {
        height: full,
        opacity: 1,
        duration: 0.42,
        ease: "power3.out",
        onStart() {
          panel.style.willChange = "height, opacity";
        },
        onComplete() {
          panel.style.height = "auto";
          panel.style.willChange = "";
        },
      });
    }

    function closeItem(it) {
      const panel = it.querySelector(".acc-panel");
      if (!panel) return;
      const btn = it.querySelector(".acc-toggle");
      const che = it.querySelector(".acc-chevron");
      if (che)
        gsap.to(che, { duration: 0.32, rotate: 0, ease: "power3.inOut" });

      gsap.killTweensOf(panel);
      // animate height -> 0 to collapse (keeps content visible during animation)
      const fromH = panel.scrollHeight;
      panel.style.height = fromH + "px"; // start from current height
      panel.style.overflow = "hidden";
      gsap.to(panel, {
        height: 0,
        opacity: 0,
        duration: 0.42,
        ease: "power3.inOut",
        onStart() {
          panel.style.willChange = "height, opacity";
        },
        onComplete() {
          panel.style.willChange = "";
          // remove open class after collapse to avoid instant style snap
          it.classList.remove("open");
          panel.setAttribute("aria-hidden", "true");
          if (btn) btn.setAttribute("aria-expanded", "false");
        },
      });
    }

    items.forEach((it) => {
      const btn = it.querySelector(".acc-toggle");
      const panel = it.querySelector(".acc-panel");
      if (btn) btn.setAttribute("aria-expanded", "false");
      if (panel) {
        // initialize collapsed state using height:0 so height animation works
        panel.style.height = "0px";
        panel.style.overflow = "hidden";
        panel.style.opacity = "0";
        panel.style.display = "block";
        panel.setAttribute("aria-hidden", "true");
      }
      btn?.addEventListener("click", () => {
        const isOpen = it.classList.contains("open");
        // close others
        items.forEach((other) => {
          if (other !== it) closeItem(other);
        });
        // toggle clicked
        if (!isOpen) openItem(it);
        else closeItem(it);
      });
    });
  })();

  // Contact form (sends to server endpoint)
  const contactForm = document.getElementById("contactForm");
  const formMsg = document.getElementById("formMsg");
  contactForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();
    if (!name || !email || !message) {
      formMsg.textContent = "Please complete all required fields.";
      return;
    }
    formMsg.textContent = "Sending…";

    // Development: send to localhost server; in production you can set this to '/api/contact'
    const endpoint =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
        ? "http://localhost:3000/api/contact"
        : "/api/contact";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        formMsg.textContent = "Thanks — your message has been sent.";
        contactForm.reset();
      } else {
        formMsg.textContent =
          data.error || "An error occurred. Please try again.";
      }
    } catch (err) {
      console.error("Contact submit error:", err);
      formMsg.textContent = "Network error. Please try again later.";
    }
  });

  // Testimonials slider using GSAP timeline (uses a track inside the slider)
  const slider = document.querySelector(".testimonial-slider");
  const track = slider ? slider.querySelector(".testimonial-track") : null;
  const dotsWrap = document.querySelector(".testimonial-dots");
  const slides = track
    ? Array.from(track.querySelectorAll(".testimonial"))
    : [];
  let current = 0;

  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = "";
    slides.forEach((s, i) => {
      const d = document.createElement("button");
      d.className = "dot" + (i === 0 ? " active" : "");
      d.dataset.index = i;
      d.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(d);
    });
  }

  function updateDots() {
    const dots = Array.from(document.querySelectorAll(".dot"));
    dots.forEach((d) =>
      d.classList.toggle("active", Number(d.dataset.index) === current)
    );
  }

  function showSlide(index) {
    if (!slider || !track) return;
    const w = slider.clientWidth;
    gsap.killTweensOf(track);
    gsap.to(track, {
      duration: 0.6,
      x: -index * w,
      ease: "power2.out",
      overwrite: true,
      // hint to GSAP/CSS plugin to keep this on GPU
      force3D: true,
      onStart() {
        if (track) track.style.willChange = "transform";
      },
      onComplete() {
        if (track) track.style.willChange = "auto";
      },
    });
  }

  function goTo(index) {
    if (slides.length === 0) return;
    current = (index + slides.length) % slides.length;
    updateDots();
    layoutSlides();
    showSlide(current);
  }

  function next() {
    goTo(current + 1);
  }
  function prev() {
    goTo(current - 1);
  }

  // layout slides to the slider viewport width
  function layoutSlides() {
    if (!slider || !track) return;
    const w = slider.clientWidth;
    slides.forEach((s) => (s.style.flex = "0 0 " + w + "px"));
    // ensure track offset reflects current — use GSAP.set for GPU-accelerated transform
    if (typeof gsap !== "undefined" && track)
      gsap.set(track, { x: -current * w });
  }

  buildDots();
  layoutSlides();
  window.addEventListener("resize", () => {
    layoutSlides();
    showSlide(current);
  });

  document.querySelector(".t-next")?.addEventListener("click", next);
  document.querySelector(".t-prev")?.addEventListener("click", prev);

  // auto-advance
  let auto = setInterval(next, 6000);
  [
    document.querySelector(".t-next"),
    document.querySelector(".t-prev"),
    dotsWrap,
  ].forEach((el) => {
    el?.addEventListener("mouseenter", () => clearInterval(auto));
    el?.addEventListener("mouseleave", () => (auto = setInterval(next, 6000)));
  });

  // GSAP animations & ScrollTrigger reveals
  // Run entrance animations after window 'load' so images/layout are settled to avoid shaky animation
  window.addEventListener("load", () => {
    // register ScrollTrigger and ScrollToPlugin (ScrollToPlugin loaded via CDN in index.html)
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // make GSAP ticker more forgiving of occasional frame drops on lower-end devices
    try {
      if (gsap && gsap.ticker && typeof gsap.ticker.lagSmoothing === "function")
        gsap.ticker.lagSmoothing(1000, 16);
    } catch (e) {}

    // sensible defaults
    gsap.defaults({ ease: "power3.inOut", overwrite: true });

    // Hero entrance
    gsap.from(".site-title", { y: 26, opacity: 0, duration: 0.9, delay: 0.18 });
    gsap.from(".tagline", { y: 16, opacity: 0, duration: 0.8, delay: 0.28 });
    gsap.from(".hero-image img", {
      scale: 0.998,
      opacity: 0,
      duration: 1.0,
      delay: 0.34,
    });

    // reveal sections (avoid animating all paragraphs which may cause reflow)
    gsap.utils.toArray(".section").forEach((section) => {
      const targets = section.querySelectorAll(
        "h2, .section-sub, .service-card, .about-images img, .testimonial, .contact-form"
      );
      if (!targets || targets.length === 0) return;
      gsap.from(targets, {
        scrollTrigger: { trigger: section, start: "top 80%" },
        y: 18,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        onStart() {
          targets.forEach((t) => (t.style.willChange = "transform, opacity"));
        },
        onComplete() {
          targets.forEach((t) => (t.style.willChange = "auto"));
        },
      });
    });

    // refresh ScrollTrigger after load
    ScrollTrigger.refresh();

    // animate counters on page load (smooth number count)
    function animateCounters() {
      const nodes = document.querySelectorAll(".count-number");
      if (!nodes || nodes.length === 0) return;
      nodes.forEach((el) => {
        const target = Math.max(0, Number(el.dataset.target) || 0);
        // dynamic duration: larger numbers take slightly longer but cap at 3s
        const duration = Math.min(3, 0.9 + target / 100);
        // proxy object for numeric tween
        const obj = { v: 0 };

        // subtle scale pulse to make the change feel smoother/organic
        gsap.fromTo(
          el,
          { scale: 1.06 },
          {
            scale: 1,
            duration: Math.min(0.9, duration * 0.6),
            ease: "power2.out",
          }
        );

        gsap.to(obj, {
          v: target,
          duration: duration,
          ease: "power1.out",
          onUpdate() {
            // round for display but avoid large jumps by flooring
            const display = Math.floor(obj.v);
            // update only when value changed to reduce layout churn
            if (el._lastDisplayed !== display) {
              el.textContent = display.toLocaleString();
              el._lastDisplayed = display;
            }
          },
          onComplete() {
            el.textContent = target.toLocaleString();
            el._lastDisplayed = target;
            // tiny settle pulse to finish
            gsap.fromTo(
              el,
              { scale: 1.03 },
              { scale: 1, duration: 0.25, ease: "power2.out" }
            );
          },
        });
      });
    }

    // run counters once after load
    try {
      animateCounters();
    } catch (e) {}
  });

  // service card hover micro-animation removed to avoid hover jank on slower devices

  // Register ScrollToPlugin early so anchor clicks can use it immediately
  try {
    if (typeof gsap !== "undefined" && typeof ScrollToPlugin !== "undefined") {
      gsap.registerPlugin(ScrollToPlugin);
    }
  } catch (e) {
    // ignore if plugin not available yet; we'll register on load as a fallback
  }

  // Smooth anchor scrolling using GSAP ScrollToPlugin for more control
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = anchor.getAttribute("href");
      // allow links without a real hash target to behave normally
      if (!href) return;
      const isHashOnly = href === "#";
      const target = isHashOnly
        ? document.documentElement
        : document.querySelector(href);
      if (!target) return;
      // prevent default navigation so we can animate
      e.preventDefault();
      // small header offset so section isn't under the header
      const headerOffset = 18;
      // push the hash to the URL without causing navigation/scroll
      try {
        if (history && history.pushState) history.pushState(null, "", href);
      } catch (e) {
        // ignore
      }
      // start animated scroll immediately
      gsap.to(window, {
        duration: 0.7,
        ease: "power3.inOut",
        scrollTo: { y: target, offsetY: headerOffset },
        onComplete() {
          // focus the target without scrolling (if supported)
          try {
            if (typeof target.focus === "function") {
              // preventScroll option is widely supported in modern browsers
              target.focus({ preventScroll: true });
            }
          } catch (err) {
            try {
              target.focus();
            } catch (e) {}
          }
        },
      });
      // close mobile menu AFTER initiating the scroll to avoid layout reflow delaying animation
      // run removal on the next animation frame so the scroll starts without being blocked by layout changes
      if (
        mainNav &&
        mainNav.classList.contains("open") &&
        window.innerWidth <= 700
      ) {
        requestAnimationFrame(() => {
          mainNav.classList.remove("open");
          navToggle?.setAttribute("aria-expanded", "false");
        });
      }
    });
  });
});

const faqItems = document.querySelectorAll(".faq-item");

function closeItem(item) {
  const button = item.querySelector(".faq-header");
  const body = item.querySelector(".faq-body");

  item.classList.remove("is-open");
  button.setAttribute("aria-expanded", "false");
  body.style.maxHeight = 0;
}

function openItem(item) {
  const button = item.querySelector(".faq-header");
  const body = item.querySelector(".faq-body");

  item.classList.add("is-open");
  button.setAttribute("aria-expanded", "true");
  body.style.maxHeight = body.scrollHeight + "px";
}

// Initialize open/closed state
faqItems.forEach((item) => {
  const body = item.querySelector(".faq-body");
  if (item.classList.contains("is-open")) {
    body.style.maxHeight = body.scrollHeight + "px";
  } else {
    body.style.maxHeight = 0;
  }
});

// Click behavior (only one open at a time)
faqItems.forEach((item) => {
  const button = item.querySelector(".faq-header");

  button.addEventListener("click", () => {
    const isOpen = item.classList.contains("is-open");

    faqItems.forEach((faq) => closeItem(faq));

    if (!isOpen) {
      openItem(item);
    }
  });
});
