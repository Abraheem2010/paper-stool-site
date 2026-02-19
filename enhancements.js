(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const trainAutoplayToggle = document.getElementById("train-autoplay-toggle");
  const trainNext = document.getElementById("train-story-next");
  const trainPrev = document.getElementById("train-story-prev");
  const trainDots = Array.from(document.querySelectorAll(".train-story-dot"));
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
    if (prefersReducedMotion || !trainNext) return;
    stopTrainAutoplay();
    setAutoplayUi(true);
    trainAutoplayTimer = window.setInterval(() => {
      if (trainNext.disabled) {
        trainDots[0]?.click();
      } else {
        trainNext.click();
      }
    }, 3800);
  }

  if (trainAutoplayToggle) {
    if (prefersReducedMotion) {
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

      [trainPrev, trainNext, ...trainDots].forEach((node) => {
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
      if (!prefersReducedMotion) {
        productVideo.play().catch(() => {});
      }
    });
  });

  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxNavButtons = Array.from(document.querySelectorAll(".lightbox-nav"));
  const galleryButtons = Array.from(document.querySelectorAll(".gallery-item"));

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
    if (!(lightboxImage instanceof HTMLImageElement)) return;
    const current = sourceFingerprint(lightboxImage.src);
    const found = galleryButtons.findIndex((button) => {
      return sourceFingerprint(getGallerySource(button)) === current;
    });
    if (found >= 0) currentGalleryIndex = found;
  }

  function updateLightboxCaption() {
    if (!lightboxCaption) return;
    syncCurrentIndexFromImage();
    const button = galleryButtons[currentGalleryIndex];
    const img = button?.querySelector("img");
    const text = button?.querySelector("span")?.textContent?.trim() || img?.alt || "Gallery item";
    lightboxCaption.textContent = text;
  }

  function preloadGalleryItem(index) {
    if (!galleryButtons.length) return;
    const safe = ((index % galleryButtons.length) + galleryButtons.length) % galleryButtons.length;
    const src = getGallerySource(galleryButtons[safe]);
    if (!src) return;
    const preloaded = new Image();
    preloaded.src = src;
  }

  function openGalleryIndex(index) {
    const safe = ((index % galleryButtons.length) + galleryButtons.length) % galleryButtons.length;
    const button = galleryButtons[safe];
    if (!button) return;
    button.click();
    currentGalleryIndex = safe;
    window.setTimeout(() => {
      updateLightboxCaption();
      preloadGalleryItem(safe + 1);
      preloadGalleryItem(safe - 1);
    }, 10);
  }

  galleryButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      currentGalleryIndex = index;
      window.setTimeout(() => {
        updateLightboxCaption();
        preloadGalleryItem(index + 1);
        preloadGalleryItem(index - 1);
      }, 10);
    });
  });

  lightboxNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const step = Number(button.dataset.step || "0");
      if (!step || !galleryButtons.length) return;
      openGalleryIndex(currentGalleryIndex + step);
    });
  });

  lightbox?.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.touches[0];
      lightboxTouchStartX = touch?.clientX ?? null;
      lightboxTouchStartY = touch?.clientY ?? null;
    },
    { passive: true }
  );

  lightbox?.addEventListener(
    "touchend",
    (event) => {
      if (lightboxTouchStartX === null || lightboxTouchStartY === null) return;
      const touch = event.changedTouches[0];
      const dx = (touch?.clientX ?? lightboxTouchStartX) - lightboxTouchStartX;
      const dy = (touch?.clientY ?? lightboxTouchStartY) - lightboxTouchStartY;
      lightboxTouchStartX = null;
      lightboxTouchStartY = null;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
      if (!galleryButtons.length) return;
      if (dx < 0) openGalleryIndex(currentGalleryIndex + 1);
      else openGalleryIndex(currentGalleryIndex - 1);
    },
    { passive: true }
  );

  if (lightboxImage) {
    const observer = new MutationObserver(() => {
      updateLightboxCaption();
      preloadGalleryItem(currentGalleryIndex + 1);
      preloadGalleryItem(currentGalleryIndex - 1);
    });
    observer.observe(lightboxImage, { attributes: true, attributeFilter: ["src"] });
  }

  const orderForm = document.getElementById("order-form");
  const reserveSubmit = document.getElementById("reserve-submit");

  function isValidField(name, value) {
    const text = value.trim();
    if (name === "fullname") return text.length >= 2;
    if (name === "phone") return /^05\d{8}$/.test(text);
    if (name === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
    if (name === "city") return text.length >= 2;
    return true;
  }

  function updateReserveButtonState() {
    if (!(orderForm instanceof HTMLFormElement) || !(reserveSubmit instanceof HTMLButtonElement)) return;
    const fields = ["fullname", "phone", "email", "city"];
    const valid = fields.every((name) => {
      const field = orderForm.elements.namedItem(name);
      if (!(field instanceof HTMLInputElement)) return false;
      return isValidField(name, field.value || "");
    });
    reserveSubmit.disabled = !valid;
  }

  orderForm?.addEventListener("input", updateReserveButtonState);
  orderForm?.addEventListener("change", updateReserveButtonState);
  updateReserveButtonState();
})();
