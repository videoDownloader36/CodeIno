(() => {
  "use strict";

  const nav = document.getElementById("siteNav");
  const yearEl = document.getElementById("year");
  const form = document.getElementById("contactForm");
  const navCollapse = document.getElementById("navMenu");

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* Navbar scroll state */
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 40);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Active nav link on scroll */
  const sections = document.querySelectorAll("section[id], header[id]");
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

  const setActiveLink = () => {
    let current = "";
    const offset = 120;
    sections.forEach((sec) => {
      const top = sec.offsetTop - offset;
      if (window.scrollY >= top) {
        current = sec.getAttribute("id") || "";
      }
    });
    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      link.classList.toggle("active", href === `#${current}`);
    });
  };
  window.addEventListener("scroll", setActiveLink, { passive: true });
  setActiveLink();

  /* Close mobile menu on link click */
  if (navCollapse) {
    navCollapse.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        const instance = bootstrap.Collapse.getInstance(navCollapse);
        if (instance && window.innerWidth < 992) {
          instance.hide();
        }
      });
    });
  }

  /* Reveal on scroll */
  const revealEls = document.querySelectorAll(".reveal-left, .reveal-right, .reveal-up");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = Number(el.getAttribute("data-delay") || 0);
          window.setTimeout(() => {
            el.classList.add("is-visible");
          }, delay);
          revealObserver.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* Counter animation */
  const counters = document.querySelectorAll(".counter-num");
  let countersDone = false;

  const animateCounters = () => {
    if (countersDone) return;
    countersDone = true;
    counters.forEach((el) => {
      const target = Number(el.getAttribute("data-target") || 0);
      const duration = 1600;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = String(Math.floor(eased * target));
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = String(target);
        }
      };
      requestAnimationFrame(tick);
    });
  };

  const counterSection = document.getElementById("counters");
  if (counterSection && "IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounters();
            counterObserver.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    counterObserver.observe(counterSection);
  } else {
    animateCounters();
  }

  /* Contact form — FormSubmit AJAX */
  if (form) {
    const successEl = document.getElementById("formSuccess");
    const errorEl = document.getElementById("formError");
    const submitBtn = document.getElementById("submitBtn");
    const btnText = submitBtn?.querySelector(".btn-text");
    const btnLoading = submitBtn?.querySelector(".btn-loading");

    const setLoading = (loading) => {
      if (!submitBtn || !btnText || !btnLoading) return;
      submitBtn.disabled = loading;
      btnText.classList.toggle("d-none", loading);
      btnLoading.classList.toggle("d-none", !loading);
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      successEl?.classList.add("d-none");
      errorEl?.classList.add("d-none");

      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        Array.from(form.elements).forEach((field) => {
          if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
            field.classList.toggle("is-invalid", !field.checkValidity() && field.required);
          }
        });
        return;
      }

      form.classList.remove("was-validated");
      Array.from(form.querySelectorAll(".is-invalid")).forEach((el) => el.classList.remove("is-invalid"));

      setLoading(true);

      try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          form.reset();
          successEl?.classList.remove("d-none");
        } else {
          errorEl?.classList.remove("d-none");
        }
      } catch {
        /* Fallback: open mailto if FormSubmit is blocked */
        const name = /** @type {HTMLInputElement} */ (form.elements.namedItem("name"))?.value || "";
        const email = /** @type {HTMLInputElement} */ (form.elements.namedItem("email"))?.value || "";
        const phone = /** @type {HTMLInputElement} */ (form.elements.namedItem("phone"))?.value || "";
        const service = /** @type {HTMLSelectElement} */ (form.elements.namedItem("service"))?.value || "";
        const message = /** @type {HTMLTextAreaElement} */ (form.elements.namedItem("message"))?.value || "";
        const subject = encodeURIComponent("New inquiry from Codeino website");
        const body = encodeURIComponent(
          `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\n\nMessage:\n${message}`
        );
        window.location.href = `mailto:info@codeino.com?subject=${subject}&body=${body}`;
        successEl?.classList.remove("d-none");
        form.reset();
      } finally {
        setLoading(false);
      }
    });

    form.addEventListener("input", (e) => {
      const target = e.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
        if (target.checkValidity()) {
          target.classList.remove("is-invalid");
        }
      }
    });
  }
})();
