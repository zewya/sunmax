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
        font-size: 20px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      ">✨</div>
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
    toast.innerHTML = `<span class="toast-icon">${type === 'success' ? '✅' : '❌'}</span> ${message}`;
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

});
