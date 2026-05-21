// ===== Build fake QR pattern (uses unique seed per element) =====
function buildQR(targetId, seed = 7) {
  const grid = document.getElementById(targetId);
  if (!grid) return;
  const size = 21;
  const isCorner = (r, c) =>
    (r < 7 && c < 7) ||
    (r < 7 && c >= size - 7) ||
    (r >= size - 7 && c < 7);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cell = document.createElement('div');
      cell.className = 'qr-cell';
      let on = false;
      if (isCorner(r, c)) {
        const blockR = r < 7 ? r : r - (size - 7);
        const blockC = c < 7 ? c : c - (size - 7);
        on = (blockR === 0 || blockR === 6 || blockC === 0 || blockC === 6 ||
              (blockR >= 2 && blockR <= 4 && blockC >= 2 && blockC <= 4));
      } else {
        on = ((r * seed + c * 13 + r * c) % 3 === 0);
      }
      if (!on) cell.classList.add('off');
      grid.appendChild(cell);
    }
  }
}

// ===== Build QR by class (for multiple QR codes on same page) =====
function buildQRByClass(className, seed = 7) {
  document.querySelectorAll('.' + className).forEach((grid, i) => {
    const size = 21;
    const isCorner = (r, c) =>
      (r < 7 && c < 7) ||
      (r < 7 && c >= size - 7) ||
      (r >= size - 7 && c < 7);
    grid.innerHTML = '';
    const effectiveSeed = seed + i;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = document.createElement('div');
        cell.className = 'qr-cell';
        let on = false;
        if (isCorner(r, c)) {
          const blockR = r < 7 ? r : r - (size - 7);
          const blockC = c < 7 ? c : c - (size - 7);
          on = (blockR === 0 || blockR === 6 || blockC === 0 || blockC === 6 ||
                (blockR >= 2 && blockR <= 4 && blockC >= 2 && blockC <= 4));
        } else {
          on = ((r * effectiveSeed + c * 13 + r * c) % 3 === 0);
        }
        if (!on) cell.classList.add('off');
        grid.appendChild(cell);
      }
    }
  });
}

// ===== Staff Scanner: mode toggle (Redeem vs Event) =====
function initScannerModes() {
  const buttons = document.querySelectorAll('.s-mode-toggle button');
  if (!buttons.length) return;
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.mode;
      document.querySelectorAll('.mode-view').forEach(view => {
        view.style.display = view.dataset.mode === mode ? '' : 'none';
      });
    });
  });
}

// ===== Staff Scanner: redeem item selection =====
function initRedeemSelect() {
  const items = document.querySelectorAll('.redeem-item');
  if (!items.length) return;
  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
    });
  });
}

// ===== Member: Show My QR Modal =====
function initQrModal() {
  const openBtn = document.getElementById('openQrBtn');
  const closeBtn = document.getElementById('closeQrBtn');
  const modal = document.getElementById('showQrModal');
  if (!openBtn || !modal) return;

  const open = () => {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Build the large QR once
    if (!modal.dataset.qrBuilt) {
      buildQR('showqrBig', 7);
      modal.dataset.qrBuilt = '1';
    }
  };
  const close = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  openBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });
}

// ===== Member: Payment Request Modal (passive — comes from merchant scan) =====
function initPayReqModal() {
  const modal = document.getElementById('payReqModal');
  if (!modal) return;

  const openBtn = document.getElementById('openPayReqBtn'); // optional (legacy)
  const closeBtn = document.getElementById('closePayReqBtn');
  const step1 = document.getElementById('payreqStep1');
  const step2 = document.getElementById('payreqStep2');
  const approveBtn = document.getElementById('payReqApprove');
  const declineBtn = document.getElementById('payReqDecline');
  const closeSuccessBtn = document.getElementById('closePayReqSuccess');

  const open = () => {
    modal.classList.add('open');
    if (step1 && step2) {
      step1.classList.add('active');
      step2.classList.remove('active');
    }
    if (approveBtn) {
      approveBtn.textContent = 'Pay Rp 85,000';
      approveBtn.disabled = false;
    }
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (openBtn) openBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (declineBtn) declineBtn.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });

  // Payment method selection (both regular and Artha Graha)
  const updatePts = (isAG) => {
    const ptsInfo = document.getElementById('payreqPtsInfo');
    if (!ptsInfo) return;
    if (isAG) {
      ptsInfo.innerHTML = '+ 16 pts <span style="color: var(--gold); font-style: italic;">(2× with Artha Graha)</span>';
    } else {
      ptsInfo.textContent = '+ 8 pts will be credited';
    }
  };

  const clearAllMethods = () => {
    document.querySelectorAll('.payreq-method, .payreq-bank-method').forEach(p => p.classList.remove('selected'));
  };

  document.querySelectorAll('.payreq-method').forEach(m => {
    m.addEventListener('click', () => {
      clearAllMethods();
      m.classList.add('selected');
      updatePts(false);
    });
  });
  document.querySelectorAll('.payreq-bank-method').forEach(m => {
    m.addEventListener('click', () => {
      clearAllMethods();
      m.classList.add('selected');
      updatePts(true);
    });
  });

  if (approveBtn) {
    approveBtn.addEventListener('click', () => {
      approveBtn.textContent = 'Processing payment…';
      approveBtn.disabled = true;
      setTimeout(() => {
        step1.classList.remove('active');
        step2.classList.add('active');
      }, 1300);
    });
  }

  if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', close);
}

// ===== Admin: Sidebar view switcher =====
function initAdminNav() {
  const navLinks = document.querySelectorAll('.nav-link[data-view]');
  const views = document.querySelectorAll('.admin-view[data-view]');
  if (!navLinks.length || !views.length) return;

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const target = link.dataset.view;
      navLinks.forEach(l => l.classList.toggle('active', l.dataset.view === target));
      views.forEach(v => v.classList.toggle('active', v.dataset.view === target));
      // Scroll main area back to top when switching views
      const mainArea = document.querySelector('.main-area');
      if (mainArea) mainArea.scrollTop = 0;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  buildQR('qrVisual', 7);            // landing big QR
  buildQR('myQrMini', 7);            // member dashboard QR
  buildQR('qrisMini', 31);           // qris preview (if exists)
  buildQRByClass('tqc-qr', 17);      // tenant page QR(s)
  initScannerModes();
  initRedeemSelect();
  initPayReqModal();
  initQrModal();
  initAdminNav();
  initVenueZoom();
});

// ===========================================
// VENUE MAP — ZOOM & PAN
// (works on landing + member dashboard)
// ===========================================
function initVenueZoom() {
  const viewports = document.querySelectorAll('.venue-image-viewport');
  if (!viewports.length) return;

  viewports.forEach(viewport => {
    const img = viewport.querySelector('.venue-image-static');
    const wrap = viewport.closest('.venue-image-wrap');
    if (!img || !wrap) return;

    const zoomInBtn = wrap.querySelector('.venue-zoom-btn[id*="ZoomIn"], #venueZoomIn');
    const zoomOutBtn = wrap.querySelector('.venue-zoom-btn[id*="ZoomOut"], #venueZoomOut');
    const resetBtn = wrap.querySelector('.venue-zoom-btn[id*="Reset"], #venueZoomReset');
    const levelDisplay = wrap.querySelector('.venue-zoom-level');
    const hint = wrap.querySelector('.venue-zoom-hint');

    const MIN_SCALE = 1;
    const MAX_SCALE = 5;
    const SCALE_STEP = 0.5;

    let scale = 1;
    let tx = 0;
    let ty = 0;
    let isPanning = false;
    let startX = 0, startY = 0;
    let startTx = 0, startTy = 0;
    let hintFaded = false;

    // Touch state
    let pinchStartDist = 0;
    let pinchStartScale = 1;
    let pinchCenter = { x: 0, y: 0 };

    function applyTransform(animate) {
      // Clamp translation so image doesnt fly out of viewport
      const vRect = viewport.getBoundingClientRect();
      const imgW = img.offsetWidth * scale;
      const imgH = img.offsetHeight * scale;
      const maxTx = 0;
      const minTx = Math.min(0, vRect.width - imgW);
      const maxTy = 0;
      const minTy = Math.min(0, vRect.height - imgH);
      tx = Math.max(minTx, Math.min(maxTx, tx));
      ty = Math.max(minTy, Math.min(maxTy, ty));

      if (animate) viewport.classList.add('animating');
      else viewport.classList.remove('animating');

      img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
      updateUI();

      if (animate) {
        setTimeout(() => viewport.classList.remove('animating'), 350);
      }
    }

    function updateUI() {
      if (levelDisplay) {
        levelDisplay.textContent = Math.round(scale * 100) + '%';
        levelDisplay.classList.toggle('show', scale !== 1);
      }
      if (zoomInBtn) zoomInBtn.disabled = scale >= MAX_SCALE;
      if (zoomOutBtn) zoomOutBtn.disabled = scale <= MIN_SCALE;
    }

    function fadeHint() {
      if (hintFaded || !hint) return;
      hintFaded = true;
      hint.classList.add('faded');
    }

    function zoomAt(focusX, focusY, newScale, animate) {
      newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
      if (newScale === scale) return;

      // focusX/focusY are coordinates in viewport space
      // Compute the point in image-space that is currently at the focus
      const imgX = (focusX - tx) / scale;
      const imgY = (focusY - ty) / scale;

      scale = newScale;
      tx = focusX - imgX * scale;
      ty = focusY - imgY * scale;

      applyTransform(animate);
      fadeHint();
    }

    function getViewportCenter() {
      const r = viewport.getBoundingClientRect();
      return { x: r.width / 2, y: r.height / 2 };
    }

    // ===== Button controls =====
    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => {
        const c = getViewportCenter();
        zoomAt(c.x, c.y, scale + SCALE_STEP, true);
      });
    }
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => {
        const c = getViewportCenter();
        zoomAt(c.x, c.y, scale - SCALE_STEP, true);
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        scale = 1;
        tx = 0;
        ty = 0;
        applyTransform(true);
      });
    }

    // ===== Mouse wheel zoom =====
    viewport.addEventListener('wheel', e => {
      e.preventDefault();
      const rect = viewport.getBoundingClientRect();
      const focusX = e.clientX - rect.left;
      const focusY = e.clientY - rect.top;
      const delta = e.deltaY < 0 ? SCALE_STEP : -SCALE_STEP;
      zoomAt(focusX, focusY, scale + delta, false);
    }, { passive: false });

    // ===== Mouse drag pan =====
    viewport.addEventListener('mousedown', e => {
      if (scale === 1) return; // No need to pan when not zoomed
      isPanning = true;
      viewport.classList.add('grabbing');
      startX = e.clientX;
      startY = e.clientY;
      startTx = tx;
      startTy = ty;
      fadeHint();
      e.preventDefault();
    });

    window.addEventListener('mousemove', e => {
      if (!isPanning) return;
      tx = startTx + (e.clientX - startX);
      ty = startTy + (e.clientY - startY);
      applyTransform(false);
    });

    window.addEventListener('mouseup', () => {
      if (isPanning) {
        isPanning = false;
        viewport.classList.remove('grabbing');
      }
    });

    // ===== Touch: pinch to zoom + drag to pan =====
    function getTouchDist(touches) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }
    function getTouchCenter(touches) {
      const rect = viewport.getBoundingClientRect();
      return {
        x: (touches[0].clientX + touches[1].clientX) / 2 - rect.left,
        y: (touches[0].clientY + touches[1].clientY) / 2 - rect.top
      };
    }

    viewport.addEventListener('touchstart', e => {
      if (e.touches.length === 2) {
        pinchStartDist = getTouchDist(e.touches);
        pinchStartScale = scale;
        pinchCenter = getTouchCenter(e.touches);
        e.preventDefault();
      } else if (e.touches.length === 1 && scale > 1) {
        isPanning = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTx = tx;
        startTy = ty;
        fadeHint();
      }
    }, { passive: false });

    viewport.addEventListener('touchmove', e => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dist = getTouchDist(e.touches);
        const newScale = pinchStartScale * (dist / pinchStartDist);
        zoomAt(pinchCenter.x, pinchCenter.y, newScale, false);
      } else if (e.touches.length === 1 && isPanning) {
        e.preventDefault();
        tx = startTx + (e.touches[0].clientX - startX);
        ty = startTy + (e.touches[0].clientY - startY);
        applyTransform(false);
      }
    }, { passive: false });

    viewport.addEventListener('touchend', () => {
      isPanning = false;
    });

    // ===== Double-click to zoom in =====
    viewport.addEventListener('dblclick', e => {
      const rect = viewport.getBoundingClientRect();
      const focusX = e.clientX - rect.left;
      const focusY = e.clientY - rect.top;
      const target = scale < 2.5 ? scale + 1 : 1;
      if (target === 1) {
        scale = 1; tx = 0; ty = 0;
        applyTransform(true);
      } else {
        zoomAt(focusX, focusY, target, true);
      }
    });

    // Initialize UI state
    updateUI();
  });
}

