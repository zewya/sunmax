// ===== Accordion toggle (global for onclick) =====
function toggleCategory(card) {
  const modal = document.getElementById('categoryModal');
  const title = card.querySelector('.category-info h3')?.textContent || '';
  const icon = card.querySelector('.category-icon')?.cloneNode(true);
  const body = card.querySelector('.category-body')?.cloneNode(true);

  document.getElementById('modalTitle').textContent = title;
  const iconSlot = document.getElementById('modalIcon');
  iconSlot.innerHTML = '';
  if (icon) iconSlot.appendChild(icon);
  const bodySlot = document.getElementById('modalBody');
  bodySlot.innerHTML = '';
  if (body) bodySlot.appendChild(body);

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCategoryModal(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById('categoryModal').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.getElementById('categoryModal').classList.contains('open')) {
    closeCategoryModal();
  }
});

document.addEventListener('DOMContentLoaded', () => {

  // ===== Navbar scroll =====
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const current = window.pageYOffset;
    if (current > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = current;
  });

  // ===== Mobile menu =====
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  // ===== Fade-in animations =====
  const fadeEls = document.querySelectorAll('.fade-in');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  fadeEls.forEach(el => observer.observe(el));

  // ===== Leaflet map =====
  try {
    const map = L.map('map', {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([42.844301, 74.598122], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    const markerHtml = `
      <div style="
        width: 48px; height: 48px;
        background: linear-gradient(135deg, #d4a5a5, #c9a96c);
        border: 3px solid white;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      ">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      </div>
    `;

    const marker = L.marker([42.844301, 74.598122], {
      icon: L.divIcon({ html: markerHtml, iconSize: [48, 48], iconAnchor: [24, 48], popupAnchor: [0, -48] })
    }).addTo(map);

    marker.bindPopup(`
      <div style="font-family: 'Inter', sans-serif; text-align: center;">
        <strong style="font-size: 1.1rem;">Sun Max</strong><br>
        <span style="color: #666;">ул. Исы Ахунбаева, 127/2</span>
      </div>
    `);

    map.on('mouseover', () => map.scrollWheelZoom.enable());
    map.on('mouseout', () => map.scrollWheelZoom.disable());
  } catch (e) {
    document.getElementById('map').innerHTML = '<div class="map-fallback">Карта недоступна</div>';
  }

  // ===== Booking form =====
  const form = document.getElementById('bookingForm');
  const submitBtn = document.getElementById('formSubmit');
  const submitText = document.getElementById('formSubmitText');
  const spinner = document.getElementById('formSubmitSpinner');
  const formSuccess = document.getElementById('formSuccess');

  function showToast(message, type) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} show`;
    const iconSvg = type === 'success'
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#27ae60" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    toast.innerHTML = `<span class="toast-icon">${iconSvg}</span> ${message}`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('formName').value.trim();
    const phone = document.getElementById('formPhone').value.trim();
    const message = document.getElementById('formMessage').value.trim();

    if (!name || name.length < 2) {
      showToast('Пожалуйста, введите имя', 'error');
      return;
    }

    if (!phone || phone.length < 5) {
      showToast('Пожалуйста, введите номер телефона', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitText.textContent = 'Отправка...';
    spinner.classList.remove('hidden');

    try {
      const res = await fetch('/api/send-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, message })
      });

      const data = await res.json();

      if (data.ok) {
        form.reset();
        form.classList.add('hidden');
        formSuccess.classList.remove('hidden');
        showToast('Заявка отправлена! Мы скоро свяжемся с вами.', 'success');
      } else {
        showToast(data.error || 'Ошибка отправки. Попробуйте ещё раз.', 'error');
      }
    } catch (err) {
      showToast('Ошибка сети. Проверьте подключение.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitText.textContent = 'Отправить заявку';
      spinner.classList.add('hidden');
    }
  });

  // ===== Reviews Carousel =====
  const track = document.getElementById('reviewsTrack');
  const dotsWrap = document.getElementById('reviewsDots');
  const slides = track?.querySelectorAll('.review-slide');
  let currentSlide = 0;
  let autoTimer;
  if (slides?.length) {

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Отзыв ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    function goTo(index) {
      currentSlide = index;
      track.style.transform = `translateX(-${index * 100}%)`;
      dotsWrap.querySelectorAll('button').forEach((d, i) => {
        d.classList.toggle('active', i === index);
      });
      resetAuto();
    }

    function nextSlide() {
      goTo((currentSlide + 1) % slides.length);
    }

    function prevSlide() {
      goTo((currentSlide - 1 + slides.length) % slides.length);
    }

    function resetAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(nextSlide, 3000);
    }

    goTo(0);

    document.querySelector('.review-arrow-prev')?.addEventListener('click', prevSlide);
    document.querySelector('.review-arrow-next')?.addEventListener('click', nextSlide);
  }

});
