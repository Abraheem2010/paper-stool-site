const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    { threshold: 0.16 }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 55, 260)}ms`;
    revealObserver.observe(item);
  });
}

const scrollProgressFill = document.getElementById("scroll-progress-fill");
const toTopButton = document.getElementById("to-top");

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
}

window.addEventListener("scroll", updateScrollUI, { passive: true });
window.addEventListener("resize", updateScrollUI);
updateScrollUI();

toTopButton?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const navLinks = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));
const navSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const navObserver = new IntersectionObserver(
  (entries) => {
    const visibleEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visibleEntry || !visibleEntry.target.id) return;
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${visibleEntry.target.id}`;
      link.classList.toggle("active", isActive);
      if (isActive) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  },
  { rootMargin: "-35% 0px -55% 0px", threshold: [0.1, 0.25, 0.4, 0.6] }
);

navSections.forEach((section) => navObserver.observe(section));

const metricValues = Array.from(document.querySelectorAll(".metric-value, .impact-value"));
const animatedNumbers = new WeakSet();

function formatValue(value, decimals) {
  return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
}

function animateCount(el) {
  if (animatedNumbers.has(el)) return;
  animatedNumbers.add(el);

  const target = Number(el.dataset.count || "0");
  const suffix = el.dataset.suffix || "";
  const decimals = Number.isInteger(target) ? 0 : 1;
  const duration = 1000;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = target * eased;
    el.textContent = `${formatValue(current, decimals)}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

const countObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCount(entry.target);
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.4 }
);

metricValues.forEach((el) => countObserver.observe(el));

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
  if (!lightbox?.classList.contains("open")) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowRight") stepLightbox(1);
  if (event.key === "ArrowLeft") stepLightbox(-1);
});

const orderForm = document.getElementById("order-form");
const formMessage = document.getElementById("form-message");

orderForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(orderForm);
  const fullName = String(data.get("fullname") || "").trim();
  const phone = String(data.get("phone") || "").trim();
  const city = String(data.get("city") || "").trim();

  if (fullName.length < 2 || !/^05\d{8}$/.test(phone) || city.length < 2) {
    if (formMessage) {
      formMessage.textContent = "Please enter a valid name, phone, and city.";
      formMessage.style.color = "#c94723";
    }
    return;
  }

  if (formMessage) {
    formMessage.textContent = "Request sent successfully. We will contact you shortly.";
    formMessage.style.color = "#0f9687";
  }
  orderForm.reset();
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
}

simPeople?.addEventListener("input", updateSimulator);
updateSimulator();
