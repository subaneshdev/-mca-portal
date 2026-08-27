/**
 * Future MCA — Vanilla JavaScript interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  // Navigation elements
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileOverlay = document.getElementById('mobileOverlay');

  // Modals
  const mcpModal = document.getElementById('mcpModal');
  const productModal = document.getElementById('productModal');
  const professionalsModal = document.getElementById('professionalsModal');
  const allModals = [mcpModal, productModal, professionalsModal];

  // Triggers
  const exploreMcpBtn = document.getElementById('exploreMcpBtn');
  const footerMcpTrigger = document.getElementById('footerMcpTrigger');

  // Close buttons
  const closeMcpModal = document.getElementById('closeMcpModal');
  const closeProductModal = document.getElementById('closeProductModal');
  const closeProfessionalsModal = document.getElementById('closeProfessionalsModal');

  // Helper: Open Modal
  function openModal(modal) {
    if (!modal) return;
    closeAllModals();
    closeMobileMenu();
    modal.classList.add('active');
  }

  // Helper: Close All Modals
  function closeAllModals() {
    allModals.forEach((m) => {
      if (m) m.classList.remove('active');
    });
  }

  // Helper: Mobile Menu
  function toggleMobileMenu() {
    if (!mobileMenuBtn || !mobileOverlay) return;
    const isOpen = mobileMenuBtn.classList.toggle('open');
    mobileOverlay.classList.toggle('open', isOpen);
    mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
  }

  function closeMobileMenu() {
    if (!mobileMenuBtn || !mobileOverlay) return;
    mobileMenuBtn.classList.remove('open');
    mobileOverlay.classList.remove('open');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
  }

  // Mobile menu button click
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });
  }

  // Mobile overlay click to close
  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', (e) => {
      if (e.target === mobileOverlay) {
        closeMobileMenu();
      }
    });
  }

  // Navigation Links click handler
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = link.getAttribute('data-nav');
      
      // Update active styling
      navLinks.forEach((l) => l.classList.remove('active'));
      document.querySelectorAll(`[data-nav="${target}"]`).forEach((l) => l.classList.add('active'));

      if (target === 'mcp') {
        e.preventDefault();
        openModal(mcpModal);
      } else if (target === 'product') {
        e.preventDefault();
        openModal(productModal);
      } else if (target === 'professionals') {
        e.preventDefault();
        openModal(professionalsModal);
      } else if (target === 'home') {
        closeAllModals();
      }

      closeMobileMenu();
    });
  });

  // Explore MCP button click
  if (exploreMcpBtn) {
    exploreMcpBtn.addEventListener('click', () => {
      openModal(mcpModal);
    });
  }

  // Footer MCP trigger
  if (footerMcpTrigger) {
    footerMcpTrigger.addEventListener('click', () => {
      openModal(mcpModal);
    });
  }

  // Close modal button events
  if (closeMcpModal) closeMcpModal.addEventListener('click', closeAllModals);
  if (closeProductModal) closeProductModal.addEventListener('click', closeAllModals);
  if (closeProfessionalsModal) closeProfessionalsModal.addEventListener('click', closeAllModals);

  // Overlay click to close
  allModals.forEach((modal) => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeAllModals();
        }
      });
    }
  });

  // Global Escape Key Listener
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
      closeMobileMenu();
    }
  });

  // Resize listener: close mobile menu if resized > 720px
  window.addEventListener('resize', () => {
    if (window.innerWidth > 720) {
      closeMobileMenu();
    }
  });
});
