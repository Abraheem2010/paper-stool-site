const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const smoothBehavior = prefersReducedMotion ? "auto" : "smooth";

const themeToggle = document.getElementById("theme-toggle");
const themeColorMeta = document.getElementById("theme-color-meta");
const savedTheme = localStorage.getItem("paperStoolTheme");
const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle?.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", theme === "dark" ? "#151d1f" : "#f6f1e8");
  }
}

function getInitialTheme() {
  if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
  return systemThemeQuery.matches ? "dark" : "light";
}

applyTheme(getInitialTheme());

themeToggle?.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem("paperStoolTheme", next);
});

systemThemeQuery.addEventListener("change", (event) => {
  const stored = localStorage.getItem("paperStoolTheme");
  if (stored === "dark" || stored === "light") return;
  applyTheme(event.matches ? "dark" : "light");
});

const revealItems = Array.from(document.querySelectorAll(".reveal"));
if (prefersReducedMotion) {
  revealItems.forEach((item) => item.classList.add("visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 48, 220)}ms`;
    revealObserver.observe(item);
  });
}

const sectionHeads = Array.from(document.querySelectorAll(".section-head"));
if (prefersReducedMotion) {
  sectionHeads.forEach((head) => head.classList.add("title-in"));
} else {
  const titleObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("title-in");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.3, rootMargin: "0px 0px -10% 0px" }
  );

  sectionHeads.forEach((head) => {
    head.classList.add("title-track");
    titleObserver.observe(head);
  });
}

const skeletonBlocks = Array.from(document.querySelectorAll("[data-skeleton]"));
skeletonBlocks.forEach((block) => {
  const img = block.querySelector("img");
  if (!img) return;

  const complete = img.complete && img.naturalWidth > 0;
  if (complete) {
    block.classList.remove("is-loading");
    return;
  }

  block.classList.add("is-loading");
  const clear = () => block.classList.remove("is-loading");
  img.addEventListener("load", clear, { once: true });
  img.addEventListener("error", clear, { once: true });
});

const scrollProgressFill = document.getElementById("scroll-progress-fill");
const toTopButton = document.getElementById("to-top");
const mobileStickyCta = document.getElementById("mobile-sticky-cta");

function updateScrollUI() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = Math.min(100, (scrollTop / docHeight) * 100);

  if (scrollProgressFill) {
    scrollProgressFill.style.width = `${progress.toFixed(2)}%`;
  }

  if (toTopButton) {
    toTopButton.classList.toggle("visible", scrollTop > 420);
  }

  if (mobileStickyCta) {
    const mobileView = window.innerWidth <= 760;
    mobileStickyCta.classList.toggle("visible", mobileView && progress > 20);
  }
}

window.addEventListener("scroll", updateScrollUI, { passive: true });
window.addEventListener("resize", updateScrollUI);
updateScrollUI();

toTopButton?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: smoothBehavior });
});

const navLinks = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));
const siteNav = document.getElementById("site-nav");
const menuToggle = document.getElementById("menu-toggle");
const navSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href") || ""))
  .filter(Boolean);

function setActiveNav(hash) {
  navLinks.forEach((link) => {
    const active = link.getAttribute("href") === hash;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function closeMobileMenu() {
  if (!siteNav || !menuToggle) return;
  siteNav.classList.remove("open");
  menuToggle.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open menu");
}

menuToggle?.addEventListener("click", () => {
  if (!siteNav) return;
  const isOpen = siteNav.classList.toggle("open");
  menuToggle.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

document.addEventListener("click", (event) => {
  if (!siteNav?.classList.contains("open") || !menuToggle) return;
  const target = event.target;
  if (!(target instanceof Node)) return;
  if (siteNav.contains(target) || menuToggle.contains(target)) return;
  closeMobileMenu();
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 760) closeMobileMenu();
});

function focusSectionHeading(section) {
  const heading = section.querySelector("h1, h2, h3");
  if (!(heading instanceof HTMLElement)) return;
  heading.setAttribute("tabindex", "-1");
  heading.focus({ preventScroll: true });
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const hash = link.getAttribute("href");
    if (!hash) return;

    const section = document.querySelector(hash);
    if (!section) return;

    event.preventDefault();
    setActiveNav(hash);
    section.scrollIntoView({ behavior: smoothBehavior, block: "start" });

    window.setTimeout(() => {
      focusSectionHeading(section);
    }, prefersReducedMotion ? 0 : 320);

    if (window.innerWidth <= 760) closeMobileMenu();
  });
});

const navObserver = new IntersectionObserver(
  (entries) => {
    const visibleEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visibleEntry || !visibleEntry.target.id) return;
    setActiveNav(`#${visibleEntry.target.id}`);
  },
  { rootMargin: "-45% 0px -45% 0px", threshold: [0.05, 0.2, 0.4, 0.6] }
);

navSections.forEach((section) => navObserver.observe(section));
if (window.location.hash) setActiveNav(window.location.hash);

const toggleAdvancedButton = document.getElementById("toggle-advanced");
const optionalSections = Array.from(document.querySelectorAll(".optional-section"));
const storySection = document.getElementById("story");
const toggleStoryButton = document.getElementById("toggle-story");

toggleAdvancedButton?.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("show-advanced");
  toggleAdvancedButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
  toggleAdvancedButton.textContent = isOpen ? "Hide Advanced Insights" : "Show Advanced Insights";

  if (isOpen) {
    optionalSections.forEach((section) => section.classList.add("visible"));
    optionalSections[0]?.scrollIntoView({ behavior: smoothBehavior, block: "start" });
  }
});

toggleStoryButton?.addEventListener("click", () => {
  if (!storySection) return;
  const isOpen = storySection.classList.toggle("show-full-story");
  toggleStoryButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
  toggleStoryButton.textContent = isOpen ? "Show Short Story" : "Show Full 6-Step Story";

  if (isOpen) {
    storySection.querySelectorAll(".extra-story").forEach((card) => card.classList.add("visible"));
  }
});

const countElements = Array.from(document.querySelectorAll(".count-up"));
const animatedNumbers = new WeakSet();

function formatValue(value, decimals) {
  return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
}

function setCountText(el, value) {
  const decimals = Number(el.dataset.decimals || (Number.isInteger(value) ? 0 : 1));
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  el.textContent = `${prefix}${formatValue(value, decimals)}${suffix}`;
}

function animateCount(el) {
  if (animatedNumbers.has(el)) return;
  animatedNumbers.add(el);

  const target = Number(el.dataset.count || "0");
  const startAttr = Number(el.dataset.start);
  const startValue = Number.isFinite(startAttr) ? startAttr : target * 0.7;

  if (prefersReducedMotion) {
    setCountText(el, target);
    return;
  }

  const duration = 920;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min(1, (now - startTime) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = startValue + (target - startValue) * eased;
    setCountText(el, current);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function inViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.96 && rect.bottom > 0;
}

if (prefersReducedMotion) {
  countElements.forEach((el) => {
    const target = Number(el.dataset.count || "0");
    setCountText(el, target);
  });
} else {
  const countObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
  );

  countElements.forEach((el) => {
    if (inViewport(el)) {
      animateCount(el);
      return;
    }
    countObserver.observe(el);
  });
}

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const galleryButtons = Array.from(document.querySelectorAll(".gallery-item"));
let currentGalleryIndex = -1;

function openLightbox(index) {
  const button = galleryButtons[index];
  if (!button || !lightbox || !lightboxImage) return;
  const img = button.querySelector("img");
  lightboxImage.src = button.dataset.full || img?.src || "";
  lightboxImage.alt = img?.alt || "Gallery image";
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  currentGalleryIndex = index;
}

function closeLightbox() {
  if (!lightbox || !lightboxImage) return;
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
  lightboxImage.alt = "";
  currentGalleryIndex = -1;
}

function stepLightbox(direction) {
  if (currentGalleryIndex < 0 || !galleryButtons.length) return;
  let nextIndex = currentGalleryIndex + direction;
  if (nextIndex >= galleryButtons.length) nextIndex = 0;
  if (nextIndex < 0) nextIndex = galleryButtons.length - 1;
  openLightbox(nextIndex);
}

galleryButtons.forEach((btn, index) => {
  btn.addEventListener("click", () => openLightbox(index));
});

lightbox?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.dataset.close === "true") closeLightbox();
});

document.addEventListener("keydown", (event) => {
  const lightboxOpen = Boolean(lightbox?.classList.contains("open"));
  if (event.key === "Escape") {
    if (lightboxOpen) closeLightbox();
    closeMobileMenu();
    return;
  }
  if (!lightboxOpen) return;
  if (event.key === "ArrowRight") stepLightbox(1);
  if (event.key === "ArrowLeft") stepLightbox(-1);
});

const tiltElement = document.getElementById("hero-tilt");
if (tiltElement && !prefersReducedMotion) {
  tiltElement.addEventListener("mousemove", (event) => {
    const rect = tiltElement.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 7;
    const rotateX = (0.5 - y) * 6;
    tiltElement.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  tiltElement.addEventListener("mouseleave", () => {
    tiltElement.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  });
}

const parallaxImages = Array.from(document.querySelectorAll("[data-parallax]"));
if (!prefersReducedMotion && parallaxImages.length) {
  let ticking = false;

  const runParallax = () => {
    const viewportCenter = window.innerHeight / 2;
    parallaxImages.forEach((img) => {
      const rect = img.getBoundingClientRect();
      const imageCenter = rect.top + rect.height / 2;
      const delta = imageCenter - viewportCenter;
      const shift = Math.max(-12, Math.min(12, delta * -0.02));
      img.style.setProperty("--parallax-y", `${shift}px`);
    });
    ticking = false;
  };

  const onParallaxScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(runParallax);
  };

  window.addEventListener("scroll", onParallaxScroll, { passive: true });
  window.addEventListener("resize", onParallaxScroll);
  onParallaxScroll();
}

const simPeople = document.getElementById("sim-people");
const simPeopleValue = document.getElementById("sim-people-value");
const simStaticCount = document.getElementById("sim-static-count");
const simStoolCount = document.getElementById("sim-stool-count");
const simAdded = document.getElementById("sim-added");
const simCoverage = document.getElementById("sim-coverage");
const simStaticFill = document.getElementById("sim-static-fill");
const simStoolFill = document.getElementById("sim-stool-fill");
const simExplainer = document.getElementById("sim-explainer");
const simMapStatic = document.getElementById("sim-map-static");
const simMapStool = document.getElementById("sim-map-stool");

function renderSeatMap(container, seated, people, label) {
  if (!container) return;

  const dotCap = 24;
  const dots = Math.min(dotCap, people);
  const seatedDots = Math.round((seated / people) * dots);

  const fragment = document.createDocumentFragment();
  for (let i = 0; i < dots; i += 1) {
    const dot = document.createElement("span");
    dot.className = `seat-dot ${i < seatedDots ? "seated" : "standing"}`;
    dot.style.transitionDelay = `${Math.min(i * 12, 160)}ms`;
    fragment.appendChild(dot);
  }

  container.innerHTML = "";
  container.appendChild(fragment);
  container.setAttribute("aria-label", `${label}: ${seated} seated out of ${people}`);
}

function updateSimulator() {
  if (!simPeople) return;

  const people = Number(simPeople.value);
  const staticSeats = Math.max(2, Math.round(people * 0.34));
  const stoolSeats = Math.min(people, Math.round(people * 0.79));
  const addedSeats = Math.max(0, stoolSeats - staticSeats);
  const coverage = Math.round((stoolSeats / people) * 100);

  if (simPeopleValue) simPeopleValue.textContent = String(people);
  if (simStaticCount) simStaticCount.textContent = `${staticSeats} seats`;
  if (simStoolCount) simStoolCount.textContent = `${stoolSeats} seats`;
  if (simAdded) simAdded.textContent = `+${addedSeats}`;
  if (simCoverage) simCoverage.textContent = `${coverage}%`;
  if (simStaticFill) simStaticFill.style.width = `${Math.round((staticSeats / people) * 100)}%`;
  if (simStoolFill) simStoolFill.style.width = `${Math.round((stoolSeats / people) * 100)}%`;

  if (simExplainer) {
    simExplainer.textContent = `Fixed benches: ${staticSeats} seats | With Paper Stool: ${stoolSeats} seats`;
  }

  renderSeatMap(simMapStatic, staticSeats, people, "Baseline");
  renderSeatMap(simMapStool, stoolSeats, people, "With PaperStool");
}

simPeople?.addEventListener("input", updateSimulator);
updateSimulator();

const orderForm = document.getElementById("order-form");
const formMessage = document.getElementById("form-message");
const submitButton = document.getElementById("reserve-submit");
const toast = document.getElementById("toast");
const packButtons = Array.from(document.querySelectorAll(".reserve-pack"));
const quantityInput = orderForm?.querySelector('select[name="quantity"]');
const selectedPackInput = document.getElementById("selected-pack");
const formFields = orderForm
  ? {
      fullname: orderForm.querySelector('input[name="fullname"]'),
      phone: orderForm.querySelector('input[name="phone"]'),
      email: orderForm.querySelector('input[name="email"]'),
      city: orderForm.querySelector('input[name="city"]')
    }
  : {};

const draftKey = "paperStoolFormDraft";
const lastSubmissionKey = "paperStoolLastSubmission";

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function getFieldErrorNode(name) {
  return document.querySelector(`[data-field-error="${name}"]`);
}

function validateField(name) {
  const input = formFields[name];
  if (!(input instanceof HTMLInputElement)) return true;

  const value = input.value.trim();
  let error = "";

  if (name === "fullname" && value.length < 2) {
    error = "Please enter your full name.";
  } else if (name === "phone" && !/^05\d{8}$/.test(value)) {
    error = "Phone format should be 05XXXXXXXX.";
  } else if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    error = "Please enter a valid email address.";
  } else if (name === "city" && value.length < 2) {
    error = "Please enter your city.";
  }

  input.setAttribute("aria-invalid", error ? "true" : "false");
  const errorNode = getFieldErrorNode(name);
  if (errorNode) errorNode.textContent = error;
  return !error;
}

function validateForm() {
  const names = Object.keys(formFields);
  return names.every((name) => validateField(name));
}

function saveDraft() {
  if (!orderForm) return;
  const data = new FormData(orderForm);
  const draft = {
    fullname: String(data.get("fullname") || ""),
    phone: String(data.get("phone") || ""),
    email: String(data.get("email") || ""),
    city: String(data.get("city") || ""),
    quantity: String(data.get("quantity") || "1"),
    pack: String(data.get("pack") || "")
  };
  localStorage.setItem(draftKey, JSON.stringify(draft));
}

function loadDraft() {
  if (!orderForm) return;
  const raw = localStorage.getItem(draftKey);
  if (!raw) return;

  try {
    const draft = JSON.parse(raw);
    Object.entries(draft).forEach(([key, value]) => {
      const field = orderForm.elements.namedItem(key);
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) {
        field.value = String(value || "");
      }
    });
  } catch {
    localStorage.removeItem(draftKey);
  }
}

function loadLastSubmission() {
  const raw = localStorage.getItem(lastSubmissionKey);
  if (!raw || !formMessage) return;

  try {
    const data = JSON.parse(raw);
    if (data?.time) {
      formMessage.textContent = "You're on the list. Last reservation saved on this device.";
      formMessage.style.color = "#0f9687";
    }
  } catch {
    localStorage.removeItem(lastSubmissionKey);
  }
}

loadDraft();
loadLastSubmission();

Object.entries(formFields).forEach(([name, input]) => {
  if (!(input instanceof HTMLInputElement)) return;
  input.addEventListener("blur", () => {
    validateField(name);
  });
  input.addEventListener("input", () => {
    validateField(name);
    saveDraft();
  });
});

quantityInput?.addEventListener("change", saveDraft);

packButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const quantity = button.getAttribute("data-quantity") || "1";
    const pack = button.getAttribute("data-pack") || "";

    if (quantityInput) quantityInput.value = quantity;
    if (selectedPackInput) selectedPackInput.value = pack;

    saveDraft();
    document.querySelector("#order")?.scrollIntoView({ behavior: smoothBehavior, block: "start" });
    const firstInput = orderForm?.querySelector('input[name="fullname"]');
    if (firstInput instanceof HTMLInputElement) {
      window.setTimeout(() => firstInput.focus(), prefersReducedMotion ? 0 : 320);
    }
    showToast(`Pack selected: ${pack}`);
  });
});

orderForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const valid = validateForm();
  if (!valid) {
    if (formMessage) {
      formMessage.textContent = "Please fix the highlighted fields and try again.";
      formMessage.style.color = "#c94723";
    }
    return;
  }

  if (!submitButton) return;
  const original = submitButton.textContent || "Reserve Early Access";
  submitButton.disabled = true;
  submitButton.textContent = "Sending...";
  orderForm.classList.add("is-submitting");

  window.setTimeout(() => {
    submitButton.disabled = false;
    submitButton.textContent = original;
    orderForm.classList.remove("is-submitting");

    if (formMessage) {
      formMessage.textContent = "Reservation received. We will contact you within 24 hours via WhatsApp or phone.";
      formMessage.style.color = "#0f9687";
    }

    const data = new FormData(orderForm);
    localStorage.setItem(
      lastSubmissionKey,
      JSON.stringify({
        fullname: String(data.get("fullname") || ""),
        email: String(data.get("email") || ""),
        quantity: String(data.get("quantity") || ""),
        pack: String(data.get("pack") || ""),
        time: new Date().toISOString()
      })
    );

    localStorage.removeItem(draftKey);
    orderForm.reset();
    if (selectedPackInput) selectedPackInput.value = "";
    Object.keys(formFields).forEach((name) => {
      const node = getFieldErrorNode(name);
      if (node) node.textContent = "";
      const input = formFields[name];
      if (input instanceof HTMLInputElement) input.setAttribute("aria-invalid", "false");
    });

    showToast("You're on the list. Early access reserved.");
  }, 950);
});
