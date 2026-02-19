const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const smoothBehavior = prefersReducedMotion ? "auto" : "smooth";

const themeToggle = document.getElementById("theme-toggle");
const themeColorMeta = document.getElementById("theme-color-meta");
const themeStorageKey = "theme";
const legacyThemeStorageKey = "paperStoolTheme";

function normalizeTheme(rawTheme) {
  return rawTheme === "light" || rawTheme === "dark" ? rawTheme : null;
}

function applyTheme(theme) {
  const safeTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = safeTheme;
  const isDark = safeTheme === "dark";
  const nextLabel = isDark ? "Switch to light theme" : "Switch to dark theme";

  themeToggle?.setAttribute("aria-pressed", isDark ? "true" : "false");
  themeToggle?.setAttribute("aria-label", nextLabel);
  themeToggle?.setAttribute("title", nextLabel);

  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", isDark ? "#0f1f3a" : "#eaf4ff");
  }
}

const savedTheme =
  normalizeTheme(localStorage.getItem(themeStorageKey)) ||
  normalizeTheme(localStorage.getItem(legacyThemeStorageKey));

applyTheme(savedTheme ?? "light");

if (savedTheme) {
  localStorage.setItem(themeStorageKey, savedTheme);
}
if (localStorage.getItem(legacyThemeStorageKey) !== null) {
  localStorage.removeItem(legacyThemeStorageKey);
}

themeToggle?.addEventListener("click", () => {
  const current = document.documentElement.dataset.theme || "light";
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem(themeStorageKey, next);
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
  const media = block.querySelector("video, img");
  if (!media) return;

  block.classList.add("is-loading");
  const clear = () => block.classList.remove("is-loading");

  if (media instanceof HTMLImageElement) {
    const complete = media.complete && media.naturalWidth > 0;
    if (complete) {
      clear();
      return;
    }
    media.addEventListener("load", clear, { once: true });
    media.addEventListener("error", clear, { once: true });
    return;
  }

  if (media instanceof HTMLVideoElement) {
    if (media.readyState >= 2) {
      clear();
      return;
    }
    media.addEventListener("loadeddata", clear, { once: true });
    media.addEventListener("error", clear, { once: true });
  }
});

const scrollProgressFill = document.getElementById("scroll-progress-fill");
const toTopButton = document.getElementById("to-top");
const mobileStickyCta = document.getElementById("mobile-sticky-cta");
const siteHeader = document.querySelector(".site-header");

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

  if (siteHeader instanceof HTMLElement) {
    siteHeader.classList.toggle("is-scrolled", scrollTop > 16);
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

const trainStoryTrack = document.getElementById("train-story-track");
const trainStoryline = document.querySelector(".train-storyline");
const trainSlides = Array.from(document.querySelectorAll(".train-slide"));
const trainStepCurrent = document.getElementById("train-step-current");
const trainDots = Array.from(document.querySelectorAll(".train-story-dot"));
const trainPrev = document.getElementById("train-story-prev");
const trainNext = document.getElementById("train-story-next");

let activeTrainStep = 0;
let snapTimer = null;
let isWheeling = false;
let isProgrammaticScroll = false;
let programmaticTimer = null;
let settleRaf = null;
let settleLastLeft = 0;
let settleStableFrames = 0;
let draggingWithMouse = false;
let dragMoved = false;
let dragPointerId = null;
let dragStartX = 0;
let dragStartScrollLeft = 0;
let suppressMediaClick = false;
const mouseDragThreshold = 7;
const trainSnapDelay = prefersReducedMotion ? 0 : 450;

function normalizeTrainStep(index) {
  const max = Math.max(0, trainSlides.length - 1);
  return Math.min(max, Math.max(0, index));
}

function loopTrainStep(index) {
  if (!trainSlides.length) return 0;
  return (index + trainSlides.length) % trainSlides.length;
}

function isCompareInteractionTarget(target) {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      ".compare, .compare-handle, .compare-track, .train-compare-wrap, #train-compare, #train-compare-overlay, #train-compare-divider, #train-compare-range"
    )
  );
}

function focusTrainSlideHeading(index) {
  const heading = trainSlides[index]?.querySelector(".train-slide-copy h3");
  if (!(heading instanceof HTMLElement)) return;
  heading.setAttribute("tabindex", "-1");
  heading.focus({ preventScroll: true });
}

function getNearestTrainStep() {
  if (!trainStoryTrack || !trainSlides.length) return 0;

  const viewportCenter = trainStoryTrack.scrollLeft + trainStoryTrack.clientWidth / 2;
  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  trainSlides.forEach((slide, index) => {
    const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
    const distance = Math.abs(slideCenter - viewportCenter);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  return nearestIndex;
}

function getTrainStepOffset(index) {
  if (!trainStoryTrack || !trainSlides.length) return 0;
  const safeIndex = normalizeTrainStep(index);
  const slide = trainSlides[safeIndex];
  if (!(slide instanceof HTMLElement)) return 0;

  const centeredOffset = slide.offsetLeft - (trainStoryTrack.clientWidth - slide.offsetWidth) / 2;
  const maxScroll = Math.max(0, trainStoryTrack.scrollWidth - trainStoryTrack.clientWidth);
  return Math.max(0, Math.min(maxScroll, centeredOffset));
}

function updateTrackSnapState() {
  if (!trainStoryTrack) return;
  trainStoryTrack.classList.toggle("no-snap", isWheeling || draggingWithMouse || isProgrammaticScroll);
}

function clearProgrammaticScrollGuard() {
  if (programmaticTimer) {
    clearTimeout(programmaticTimer);
    programmaticTimer = null;
  }
  isProgrammaticScroll = false;
  updateTrackSnapState();
}

function armProgrammaticScrollGuard(duration = 500) {
  if (prefersReducedMotion) {
    clearProgrammaticScrollGuard();
    return;
  }

  isProgrammaticScroll = true;
  updateTrackSnapState();

  if (programmaticTimer) {
    clearTimeout(programmaticTimer);
  }
  programmaticTimer = window.setTimeout(() => {
    isProgrammaticScroll = false;
    updateTrackSnapState();
  }, duration);
}

function stopSettleWatcher() {
  if (settleRaf) cancelAnimationFrame(settleRaf);
  settleRaf = null;
  settleStableFrames = 0;
}

function ensureSettleWatcherRunning() {
  if (!trainStoryTrack) return;
  if (settleRaf) return;

  settleLastLeft = trainStoryTrack.scrollLeft;
  settleStableFrames = 0;

  const tick = () => {
    if (!trainStoryTrack) {
      stopSettleWatcher();
      return;
    }

    if (draggingWithMouse || isProgrammaticScroll) {
      stopSettleWatcher();
      return;
    }

    const nowLeft = trainStoryTrack.scrollLeft;

    if (Math.abs(nowLeft - settleLastLeft) < 0.5) {
      settleStableFrames += 1;
    } else {
      settleStableFrames = 0;
    }

    settleLastLeft = nowLeft;

    if (settleStableFrames >= 10) {
      isWheeling = false;
      updateTrackSnapState();
      stopSettleWatcher();
      snapTrainToNearestSmooth({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        moveFocus: false
      });
      return;
    }

    settleRaf = requestAnimationFrame(tick);
  };

  settleRaf = requestAnimationFrame(tick);
}

function snapTrainToNearestSmooth(options = {}) {
  if (!trainStoryTrack) return;
  const nearest = getNearestTrainStep();
  const targetLeft = getTrainStepOffset(nearest);
  const currentLeft = trainStoryTrack.scrollLeft;
  const behavior = options.behavior || (prefersReducedMotion ? "auto" : "smooth");

  if (Math.abs(currentLeft - targetLeft) > 1.5) {
    if (behavior === "smooth") {
      armProgrammaticScrollGuard(520);
    }
    trainStoryTrack.scrollTo({ left: targetLeft, behavior });
  }
  setTrainStepState(nearest, { moveFocus: Boolean(options.moveFocus) });
}

function scheduleTrainSnap() {
  if (snapTimer) {
    clearTimeout(snapTimer);
  }

  snapTimer = window.setTimeout(() => {
    if (draggingWithMouse || isWheeling || isProgrammaticScroll) return;
    snapTrainToNearestSmooth({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      moveFocus: false
    });
  }, trainSnapDelay);
}

function setTrainStepState(index, options = {}) {
  const { moveFocus = false } = options;
  const safeIndex = normalizeTrainStep(index);
  activeTrainStep = safeIndex;

  if (trainStoryTrack) {
    trainStoryTrack.setAttribute("aria-label", `Train storyline carousel, step ${safeIndex + 1} of ${trainSlides.length}`);
  }

  if (trainStepCurrent) {
    trainStepCurrent.textContent = String(safeIndex + 1).padStart(2, "0");
  }

  trainSlides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === safeIndex;
    slide.classList.toggle("is-active", isActive);
    slide.setAttribute("aria-hidden", isActive ? "false" : "true");
    if (isActive) slide.setAttribute("aria-current", "true");
    else slide.removeAttribute("aria-current");
    if ("inert" in slide) slide.inert = !isActive;
  });

  trainDots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === safeIndex;
    dot.classList.toggle("is-active", isActive);
    dot.setAttribute("aria-selected", isActive ? "true" : "false");
    dot.tabIndex = isActive ? 0 : -1;
    if (isActive) dot.setAttribute("aria-current", "true");
    else dot.removeAttribute("aria-current");
  });

  if (trainPrev) trainPrev.disabled = false;
  if (trainNext) trainNext.disabled = false;

  if (moveFocus) {
    window.setTimeout(() => {
      focusTrainSlideHeading(safeIndex);
    }, prefersReducedMotion ? 0 : 260);
  }
}

function scrollTrainToStep(index, options = {}) {
  const { moveFocus = false } = options;
  const behavior = options.behavior || (prefersReducedMotion ? "auto" : "smooth");
  const safeIndex = normalizeTrainStep(index);
  const slide = trainSlides[safeIndex];
  if (!(slide instanceof HTMLElement) || !trainStoryTrack) return;

  if (behavior === "smooth") {
    armProgrammaticScrollGuard(520);
  }
  trainStoryTrack.scrollTo({
    left: getTrainStepOffset(safeIndex),
    behavior
  });

  setTrainStepState(safeIndex, { moveFocus });
}

function goNextTrainStep(options = {}) {
  scrollTrainToStep(loopTrainStep(activeTrainStep + 1), options);
}

function goPrevTrainStep(options = {}) {
  scrollTrainToStep(loopTrainStep(activeTrainStep - 1), options);
}

if (trainSlides.length) {
  trainSlides.forEach((slide) => {
    slide.querySelectorAll("img").forEach((img) => {
      img.setAttribute("draggable", "false");
    });
  });

  setTrainStepState(0);
  requestAnimationFrame(() => {
    scrollTrainToStep(0, { behavior: "auto" });
  });

  trainDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const target = Number(dot.dataset.storyTarget || "0");
      scrollTrainToStep(target, { moveFocus: true });
    });
  });

  trainPrev?.addEventListener("click", () => {
    goPrevTrainStep({ moveFocus: true });
  });

  trainNext?.addEventListener("click", () => {
    goNextTrainStep({ moveFocus: true });
  });

  trainSlides.forEach((slide) => {
    const media = slide.querySelector(".train-slide-media, .train-compare-wrap");
    if (!(media instanceof HTMLElement)) return;
    media.addEventListener("click", (event) => {
      if (suppressMediaClick) return;
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const target = event.target;
      if (target instanceof Element) {
        if (isCompareInteractionTarget(target)) return;
      }
      if (target instanceof HTMLElement) {
        const interactive = target.closest(
          'button, a, input, select, textarea, label, [role="button"], [contenteditable="true"]'
        );
        if (interactive) return;
      }
      goNextTrainStep({ moveFocus: true });
    });
  });

  const onTrainArrowKeydown = (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goNextTrainStep({ moveFocus: true });
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrevTrainStep({ moveFocus: true });
    }
  };

  trainStoryTrack?.addEventListener("keydown", onTrainArrowKeydown);
  trainStoryline?.addEventListener("keydown", onTrainArrowKeydown);

  trainStoryTrack?.addEventListener(
    "scroll",
    () => {
      if (draggingWithMouse || isProgrammaticScroll) return;
      if (isWheeling) {
        ensureSettleWatcherRunning();
        return;
      }
      scheduleTrainSnap();
    },
    { passive: true }
  );

  trainStoryTrack?.addEventListener(
    "wheel",
    (event) => {
      if (!trainStoryTrack) return;
      if (isCompareInteractionTarget(event.target)) return;

      clearProgrammaticScrollGuard();
      isWheeling = true;
      updateTrackSnapState();
      stopSettleWatcher();

      if (snapTimer) {
        clearTimeout(snapTimer);
        snapTimer = null;
      }

      const deltaX = Number(event.deltaX || 0);
      const deltaY = Number(event.deltaY || 0);
      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) > 0.5) {
        trainStoryTrack.scrollLeft += deltaY;
        if (event.cancelable) event.preventDefault();
      }

      ensureSettleWatcherRunning();
    },
    { passive: false }
  );

  trainStoryTrack?.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0 || !trainStoryTrack) return;
    if (isCompareInteractionTarget(event.target)) return;
    if (event.target instanceof Element) {
      if (event.target.closest(".train-story-controls, .train-story-nav, .train-story-dot, #train-autoplay-toggle")) {
        return;
      }
    }
    draggingWithMouse = true;
    dragMoved = false;
    dragPointerId = event.pointerId;
    dragStartX = event.clientX;
    dragStartScrollLeft = trainStoryTrack.scrollLeft;
    suppressMediaClick = false;
    stopSettleWatcher();
    isWheeling = false;
    clearProgrammaticScrollGuard();
    trainStoryTrack.classList.add("is-dragging");
    updateTrackSnapState();
    trainStoryTrack.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  });

  trainStoryTrack?.addEventListener("pointermove", (event) => {
    if (!draggingWithMouse || event.pointerId !== dragPointerId || !trainStoryTrack) return;

    const dx = event.clientX - dragStartX;
    if (Math.abs(dx) > mouseDragThreshold) {
      dragMoved = true;
      suppressMediaClick = true;
    }

    trainStoryTrack.scrollLeft = dragStartScrollLeft - dx;
  });

  const finishPointerDrag = (event) => {
    if (!draggingWithMouse || event.pointerId !== dragPointerId || !trainStoryTrack) return;

    draggingWithMouse = false;
    trainStoryTrack.classList.remove("is-dragging");
    updateTrackSnapState();
    trainStoryTrack.releasePointerCapture?.(event.pointerId);
    dragPointerId = null;

    if (dragMoved) {
      window.setTimeout(() => {
        suppressMediaClick = false;
      }, 240);
      snapTrainToNearestSmooth({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        moveFocus: false
      });
      return;
    }

    scheduleTrainSnap();
  };

  trainStoryTrack?.addEventListener("pointerup", finishPointerDrag);
  trainStoryTrack?.addEventListener("pointercancel", finishPointerDrag);
  window.addEventListener("pointerup", finishPointerDrag);
  window.addEventListener("pointercancel", finishPointerDrag);

  window.addEventListener("blur", () => {
    if (!draggingWithMouse || !trainStoryTrack) return;
    draggingWithMouse = false;
    trainStoryTrack.classList.remove("is-dragging");
    updateTrackSnapState();
    stopSettleWatcher();
    dragPointerId = null;
    scheduleTrainSnap();
  });

  if ("onscrollend" in window) {
    trainStoryTrack?.addEventListener("scrollend", () => {
      if (isWheeling || draggingWithMouse) return;
      clearProgrammaticScrollGuard();
      setTrainStepState(getNearestTrainStep());
    });
  }

  const isEditableTarget = (target) => {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName.toLowerCase();
    return target.isContentEditable || tag === "input" || tag === "textarea" || tag === "select";
  };

  const isStoryVisible = () => {
    if (!(trainStoryline instanceof HTMLElement)) return false;
    const rect = trainStoryline.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.78 && rect.bottom > window.innerHeight * 0.18;
  };

  document.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    if (!isStoryVisible()) return;
    if (isEditableTarget(event.target)) return;
    if (lightbox?.classList.contains("open")) return;
    onTrainArrowKeydown(event);
  });

  window.addEventListener("resize", () => {
    stopSettleWatcher();
    scrollTrainToStep(getNearestTrainStep(), { behavior: "auto" });
  });
}

const trainCompare = document.getElementById("train-compare");
const trainCompareOverlay = document.getElementById("train-compare-overlay");
const trainCompareDivider = document.getElementById("train-compare-divider");
const trainCompareRange = document.getElementById("train-compare-range");

function stopComparePointerPropagation(event) {
  event.stopPropagation();
  const target = event.target;
  const isRangeInput = target instanceof HTMLInputElement && target.type === "range";
  if (!isRangeInput && event.cancelable) {
    event.preventDefault();
  }
}

[trainCompare, trainCompareOverlay, trainCompareDivider, trainCompareRange].forEach((node) => {
  if (!(node instanceof HTMLElement)) return;
  node.addEventListener("pointerdown", stopComparePointerPropagation);
  node.addEventListener("pointermove", stopComparePointerPropagation);
});

function updateTrainCompare(rawValue) {
  const value = Math.max(15, Math.min(85, rawValue));
  const position = `${value}%`;
  if (trainCompare) trainCompare.style.setProperty("--compare-position", position);
  if (trainCompareOverlay) trainCompareOverlay.style.width = position;
  if (trainCompareDivider) trainCompareDivider.style.left = position;
}

if (trainCompareRange) {
  if (prefersReducedMotion) {
    trainCompareRange.value = "50";
    trainCompareRange.disabled = true;
  }

  updateTrainCompare(Number(trainCompareRange.value || "52"));
  trainCompareRange.addEventListener("input", () => {
    updateTrainCompare(Number(trainCompareRange.value || "52"));
  });
}

trainCompare?.addEventListener("click", () => {
  if (!trainCompareRange || prefersReducedMotion) return;
  const current = Number(trainCompareRange.value || "52");
  const next = current >= 50 ? 32 : 68;
  trainCompareRange.value = String(next);
  updateTrainCompare(next);
});

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
  if (people <= 0) {
    container.innerHTML = "";
    container.setAttribute("aria-label", `${label}: 0 seated out of 0`);
    return;
  }

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

// Consolidated enhancements (previously in enhancements.js)
(() => {
  const motionReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const trainAutoplayToggle = document.getElementById("train-autoplay-toggle");
  const trainNextButton = document.getElementById("train-story-next");
  const trainPrevButton = document.getElementById("train-story-prev");
  const trainStoryDots = Array.from(document.querySelectorAll(".train-story-dot"));
  const trainTrack = document.getElementById("train-story-track");

  let trainAutoplayTimer = null;

  function setAutoplayUi(enabled) {
    if (!trainAutoplayToggle) return;
    trainAutoplayToggle.setAttribute("aria-pressed", enabled ? "true" : "false");
    trainAutoplayToggle.textContent = enabled ? "Auto-play: On" : "Auto-play: Off";
  }

  function stopTrainAutoplay() {
    if (trainAutoplayTimer) {
      window.clearInterval(trainAutoplayTimer);
      trainAutoplayTimer = null;
    }
    setAutoplayUi(false);
  }

  function startTrainAutoplay() {
    if (motionReduced || !trainNextButton) return;
    stopTrainAutoplay();
    setAutoplayUi(true);
    trainAutoplayTimer = window.setInterval(() => {
      trainNextButton.click();
    }, 3800);
  }

  if (trainAutoplayToggle) {
    if (motionReduced) {
      trainAutoplayToggle.disabled = true;
      trainAutoplayToggle.textContent = "Auto-play: Off";
    } else {
      trainAutoplayToggle.addEventListener("click", () => {
        if (trainAutoplayTimer) {
          stopTrainAutoplay();
        } else {
          startTrainAutoplay();
        }
      });

      [trainPrevButton, trainNextButton, ...trainStoryDots].forEach((node) => {
        node?.addEventListener("click", stopTrainAutoplay);
      });

      trainTrack?.addEventListener(
        "touchstart",
        () => {
          stopTrainAutoplay();
        },
        { passive: true }
      );
    }
  }

  const productVideo = document.getElementById("product-video");
  const timelineChips = Array.from(document.querySelectorAll(".timeline-chip"));

  timelineChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const seekTime = Number(chip.dataset.seek || "0");
      if (!(productVideo instanceof HTMLVideoElement)) return;
      productVideo.currentTime = seekTime;
      if (!motionReduced) {
        productVideo.play().catch(() => {});
      }
    });
  });

  const modal = document.getElementById("lightbox");
  const modalImage = document.getElementById("lightbox-image");
  const modalCaption = document.getElementById("lightbox-caption");
  const modalNavButtons = Array.from(document.querySelectorAll(".lightbox-nav"));
  const galleryItems = Array.from(document.querySelectorAll(".gallery-item"));

  let currentGalleryIndex = -1;
  let lightboxTouchStartX = null;
  let lightboxTouchStartY = null;

  function getGallerySource(button) {
    const img = button?.querySelector("img");
    return button?.dataset.full || img?.src || "";
  }

  function sourceFingerprint(src) {
    if (!src) return "";
    try {
      const url = new URL(src, window.location.href);
      return `${url.pathname}`;
    } catch {
      return src;
    }
  }

  function syncCurrentIndexFromImage() {
    if (!(modalImage instanceof HTMLImageElement)) return;
    const current = sourceFingerprint(modalImage.src);
    const found = galleryItems.findIndex((button) => {
      return sourceFingerprint(getGallerySource(button)) === current;
    });
    if (found >= 0) currentGalleryIndex = found;
  }

  function updateLightboxCaption() {
    if (!modalCaption) return;
    syncCurrentIndexFromImage();
    const button = galleryItems[currentGalleryIndex];
    const img = button?.querySelector("img");
    const text = button?.querySelector("span")?.textContent?.trim() || img?.alt || "Gallery item";
    modalCaption.textContent = text;
  }

  function preloadGalleryItem(index) {
    if (!galleryItems.length) return;
    const safe = ((index % galleryItems.length) + galleryItems.length) % galleryItems.length;
    const src = getGallerySource(galleryItems[safe]);
    if (!src) return;
    const preloaded = new Image();
    preloaded.src = src;
  }

  function openGalleryIndex(index) {
    const safe = ((index % galleryItems.length) + galleryItems.length) % galleryItems.length;
    const button = galleryItems[safe];
    if (!button) return;
    button.click();
    currentGalleryIndex = safe;
    window.setTimeout(() => {
      updateLightboxCaption();
      preloadGalleryItem(safe + 1);
      preloadGalleryItem(safe - 1);
    }, 10);
  }

  galleryItems.forEach((button, index) => {
    button.addEventListener("click", () => {
      currentGalleryIndex = index;
      window.setTimeout(() => {
        updateLightboxCaption();
        preloadGalleryItem(index + 1);
        preloadGalleryItem(index - 1);
      }, 10);
    });
  });

  modalNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const step = Number(button.dataset.step || "0");
      if (!step || !galleryItems.length) return;
      openGalleryIndex(currentGalleryIndex + step);
    });
  });

  modal?.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.touches[0];
      lightboxTouchStartX = touch?.clientX ?? null;
      lightboxTouchStartY = touch?.clientY ?? null;
    },
    { passive: true }
  );

  modal?.addEventListener(
    "touchend",
    (event) => {
      if (lightboxTouchStartX === null || lightboxTouchStartY === null) return;
      const touch = event.changedTouches[0];
      const dx = (touch?.clientX ?? lightboxTouchStartX) - lightboxTouchStartX;
      const dy = (touch?.clientY ?? lightboxTouchStartY) - lightboxTouchStartY;
      lightboxTouchStartX = null;
      lightboxTouchStartY = null;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
      if (!galleryItems.length) return;
      if (dx < 0) openGalleryIndex(currentGalleryIndex + 1);
      else openGalleryIndex(currentGalleryIndex - 1);
    },
    { passive: true }
  );

  if (modalImage) {
    const observer = new MutationObserver(() => {
      updateLightboxCaption();
      preloadGalleryItem(currentGalleryIndex + 1);
      preloadGalleryItem(currentGalleryIndex - 1);
    });
    observer.observe(modalImage, { attributes: true, attributeFilter: ["src"] });
  }

  const orderFormNode = document.getElementById("order-form");
  const reserveSubmitButton = document.getElementById("reserve-submit");

  function isValidField(name, value) {
    const text = value.trim();
    if (name === "fullname") return text.length >= 2;
    if (name === "phone") return /^05\d{8}$/.test(text);
    if (name === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
    if (name === "city") return text.length >= 2;
    return true;
  }

  function updateReserveButtonState() {
    if (!(orderFormNode instanceof HTMLFormElement) || !(reserveSubmitButton instanceof HTMLButtonElement)) return;
    const fields = ["fullname", "phone", "email", "city"];
    const valid = fields.every((name) => {
      const field = orderFormNode.elements.namedItem(name);
      if (!(field instanceof HTMLInputElement)) return false;
      return isValidField(name, field.value || "");
    });
    reserveSubmitButton.disabled = !valid;
  }

  orderFormNode?.addEventListener("input", updateReserveButtonState);
  orderFormNode?.addEventListener("change", updateReserveButtonState);
  updateReserveButtonState();
})();
