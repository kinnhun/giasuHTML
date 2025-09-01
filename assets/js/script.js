

(() => {
  'use strict';

  const CONFIG = Object.freeze({
    REFRESH_MS: 120_000, 
    SHEETS: {
      CLASS_LIST: 'https://opensheet.elk.sh/1h9qiy1UYF6niv1MNrj4v7frYfa7yanFcJjOEtS-8OTQ/L%E1%BB%9Bp%20m%E1%BB%9Bi',
      FEEDBACK:   'https://opensheet.elk.sh/1h9qiy1UYF6niv1MNrj4v7frYfa7yanFcJjOEtS-8OTQ/Feedback',
      CTA_LINK:   'https://opensheet.elk.sh/1h9qiy1UYF6niv1MNrj4v7frYfa7yanFcJjOEtS-8OTQ/Link%20nh%E1%BA%ADn%20l%E1%BB%9Bp',
      INBOX_NOW:  'https://opensheet.elk.sh/1h9qiy1UYF6niv1MNrj4v7frYfa7yanFcJjOEtS-8OTQ/Inbox%20ngay',
      MSG_CENTER: 'https://opensheet.elk.sh/1h9qiy1UYF6niv1MNrj4v7frYfa7yanFcJjOEtS-8OTQ/Nh%E1%BA%AFn%20tin%20v%E1%BB%9Bi%20trung%20t%C3%A2m',
      RULES:      'https://opensheet.elk.sh/1h9qiy1UYF6niv1MNrj4v7frYfa7yanFcJjOEtS-8OTQ/N%E1%BB%99i%20quy%20nh%E1%BA%ADn%20l%E1%BB%9Bp',
    },
    DOM: {
      HEADER: 'header',
      SECTION_1: 'section-1',
      SECTION_2: 'section-2',
      SECTION_3: 'section-3',
      SECTION_4: 'section-4',
      SECTION_5: 'section-5',
      FOOTER: 'footer',
      // Section-1
      CTA_CONTAINER: 'ctaContainer',
      // Section-2
      MSG_CENTER_BTN: 'section-2nhantinvoitrungtam',
      RULES_CONTAINER: 'section-2-noiquynhanlop',
      // Header
      ZALO_BTN: 'thamgianhomzalo',
      // Section-4 (class list)
      CLASS_LIST: 'classListContainer',
      CLASS_SEARCH: 'classSearchInput',
      SUBJECT_FILTER: 'subjectFilter',
      SUBJECT_TABLE: 'subjectTableContainer',
      PAGINATION: 'paginationControls',
      // Section-5 (feedback)
      FEEDBACK_CONTAINER: 'feedbackContainer',
    }
  });

  const STATE = {
    classes: [],
    currentPage: 1,
    itemsPerPage: 6,
    feedbackSwiper: null,
  };


  const $id = (id) => document.getElementById(id);

  const escapeHtml = (str) => String(str ?? '').replace(/[&<>"']/g, (m) => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  })[m]);

  const debounce = (fn, ms = 200) => {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  };

  const convertDriveLinkToImage = (link) => {
    if (!link) return 'https://via.placeholder.com/300x200?text=No+Image';
    const m = link.match(/\/file\/d\/([^/]+)\//);
    const id = m?.[1];
    return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w400`
              : 'https://via.placeholder.com/300x200?text=No+Image';
  };

  async function fetchJSON(url, signal) {
    const res = await fetch(url, { cache: 'no-store', signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} @ ${url}`);
    return res.json();
  }


  function createPoller(name, fn, intervalMs = CONFIG.REFRESH_MS) {
    let timer = null;
    let controller = null;
    let stopped = false;

    const schedule = () => {
      if (stopped) return;
      timer = setTimeout(tick, intervalMs);
    };

    const tick = async () => {
      if (stopped) return;
      try {
        controller?.abort();
        controller = new AbortController();
        await fn(controller.signal);
      } catch (err) {
        console.warn(`[${name}]`, err?.message || err);
      } finally {
        schedule();
      }
    };

    const start = () => {
      if (stopped) {
        stopped = false;
      }
      clearTimeout(timer);
      tick(); 
    };

    const stop = () => {
      stopped = true;
      clearTimeout(timer);
      controller?.abort();
    };

    const onVisibility = () => {
      if (document.hidden) stop(); else start();
    };

    document.addEventListener('visibilitychange', onVisibility);

    return { start, stop, _onVisibility: onVisibility };
  }


  function loadComponent(id, path) {
    return fetch(path)
      .then(res => res.text())
      .then(html => {
        const container = $id(id);
        if (!container) return;

        container.innerHTML = html;

        container.querySelectorAll('script').forEach((oldScript) => {
          const s = document.createElement('script');
          if (oldScript.src) s.src = oldScript.src; else s.textContent = oldScript.textContent;
          oldScript.replaceWith(s);
        });
      });
  }


  function navbarActive() {
    const links = document.querySelectorAll('.navbar-nav .nav-link');
    const sync = () => {
      const current = window.location.hash;
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === current));
    };
    links.forEach((a) => a.addEventListener('click', () => setTimeout(sync, 100)));
    window.addEventListener('load', sync);
    window.addEventListener('hashchange', sync);
  }

  function enableSmartScroll() {
    const sections = Array.from(document.querySelectorAll('[id^="section-"]'));
    if (!sections.length) return;

    function scrollToHashSection() {
      const hash = window.location.hash;
      if (hash) {
        const target = document.querySelector(hash);
        if (target) {
          setTimeout(() => {
            target.scrollIntoView({ behavior: 'smooth' });
          }, 200);
        }
      }
    }

    window.addEventListener('hashchange', scrollToHashSection);
    window.addEventListener('load', scrollToHashSection);
  }

  function addSectionAnimations() {
    const section = document.querySelector('.section-1');
    if (!section) return;

    const heading = section.querySelector('.section-1__heading');
    const quote   = section.querySelector('.section-1__quote-box');
    const cta     = section.querySelector('.section-1__cta');

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          heading?.classList.add('animate-zoom-in');
          quote?.classList.add('animate-fade-in-up');
          cta?.classList.add('animate-pulse-loop');
          io.disconnect();
        }
      });
    }, { threshold: 0.5 });

    io.observe(section);
  }


  async function renderJoinZaloButton(signal) {
    const container = $id(CONFIG.DOM.ZALO_BTN);
    if (!container) return;
    const data = await fetchJSON(CONFIG.SHEETS.INBOX_NOW, signal);
    const link = data?.[0]?.['Link']?.trim();
    container.innerHTML = link ? `
      <a href="${link}" target="_blank" class="header-inbox-btn" style="display:inline-flex;align-items:center;gap:8px;width:100%">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Icon_of_Zalo.svg/512px-Icon_of_Zalo.svg.png" alt="Zalo icon" width="24" height="24" loading="lazy"/>
        <span>THAM GIA NHÓM ZALO NGAY <br/>ĐỂ NHẬN THÔNG BÁO MỚI NHẤT</span>
      </a>` : '';
  }

  async function renderCta(signal) {
    const container = $id(CONFIG.DOM.CTA_CONTAINER);
    if (!container) return;
    const data = await fetchJSON(CONFIG.SHEETS.CTA_LINK, signal);
    const firstLink = data?.[0]?.['Link nhận lớp']?.trim();
    if (!firstLink) return;
    container.innerHTML = `
      <a href="${firstLink}" target="_blank" class="btn btn-edumentor section-1__cta uniform-width cta-shake">
        INBOX FACEBOOK ĐỂ NHẬN LỚP
      </a>`;
  }

  async function renderSection2MessengerButton(signal) {
    const container = $id(CONFIG.DOM.MSG_CENTER_BTN);
    if (!container) return;
    const data = await fetchJSON(CONFIG.SHEETS.MSG_CENTER, signal);
    const link = data?.[0]?.['Link']?.trim();
    container.innerHTML = link ? `
      <div class="button-container">
        <a href="${link}" target="_blank" class="btn-edumentor" style="text-decoration:none;">NHẮN TIN VỚI TRUNG TÂM NGAY!</a>
      </div>` : '';
  }

  async function renderSection2Rules(signal) {
    const container = $id(CONFIG.DOM.RULES_CONTAINER);
    if (!container) return;
    const data = await fetchJSON(CONFIG.SHEETS.RULES, signal);
    const link = data?.[0]?.['Link']?.trim();
    container.innerHTML = link ? `
      <div class="text-center mt-4">
        <a href="${link}" class="btn btn-edumentor section-2__cta px-4 py-2">ĐỌC NỘI QUY NHẬN LỚP TẠI ĐÂY</a>
      </div>` : '<p class="text-danger">Không tìm thấy nội quy.</p>';
  }

  async function renderFeedback(signal) {
    const container = $id(CONFIG.DOM.FEEDBACK_CONTAINER);
    if (!container) return;

    const data = await fetchJSON(CONFIG.SHEETS.FEEDBACK, signal);
    container.innerHTML = '';

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = '<div class="swiper-slide"><p class="section-5__text-center">Không có feedback nào.</p></div>';
    } else {
      container.innerHTML = data.map((item) => {
        const imgSrc = convertDriveLinkToImage(item['Link feedback']);
        const teacher = escapeHtml(item['Tên giáo viên'] || 'Không rõ');
        const content = escapeHtml(item['Nội dung feedback'] || 'Không có nội dung');
        return `
          <div class="swiper-slide">
            <div class="section-5__card">
              <img src="${imgSrc}" class="section-5__feedback-img" alt="Feedback image" loading="lazy" />
              <div class="section-5__brand-box">
                <div class="section-5__logo"></div>
                <div class="section-5__brand">Edu Mentor</div>
                <div class="section-5__title">Feedback từ giáo viên</div>
                <ul class="section-5__features">
                  <li>${teacher}</li>
                  <li>${content}</li>
                </ul>
                <div class="section-5__quote">"Cảm ơn vì đã tin tưởng dịch vụ của chúng tôi!"</div>
              </div>
            </div>
          </div>`;
      }).join('');
    }

    try {
      if (STATE.feedbackSwiper && typeof STATE.feedbackSwiper.destroy === 'function') {
        STATE.feedbackSwiper.destroy(true, true);
      }
      STATE.feedbackSwiper = new Swiper('.feedback-swiper', {
        slidesPerView: 1,
        spaceBetween: 30,
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        loop: true,
        autoplay: { delay: 9000, disableOnInteraction: false },
      });
    } catch (e) {
      console.warn('Swiper init skipped:', e?.message || e);
    }
  }


  function bindClassFilters() {
    const search = $id(CONFIG.DOM.CLASS_SEARCH);
    const select = $id(CONFIG.DOM.SUBJECT_FILTER);
    if (search) search.addEventListener('input', debounce(() => applyFilters(), 200));
    if (select) select.addEventListener('change', () => applyFilters());
  }

  async function loadClassList(signal) {
    const data = await fetchJSON(CONFIG.SHEETS.CLASS_LIST, signal);
    if (!Array.isArray(data)) return;
    STATE.classes = data;
    populateSubjectOptions(data);
    applyFilters();
  }

  function populateSubjectOptions(data) {
    const sel = $id(CONFIG.DOM.SUBJECT_FILTER);
    const tableContainer = $id(CONFIG.DOM.SUBJECT_TABLE);
    if (!sel && !tableContainer) return;

    const grouped = {};
    (data || []).forEach((item) => {
      const loai = (item['Loại'] || 'Khác').trim();
      const mon  = (item['Môn']  || '').trim();
      if (!mon) return;
      (grouped[loai] ||= new Set()).add(mon);
    });

    const allSubjects = Array.from(new Set((data || []).map(i => (i['Môn'] || '').trim()).filter(Boolean)))
      .sort((a,b) => a.localeCompare(b, 'vi', { sensitivity: 'base' }));

    if (sel) {
      sel.innerHTML = '<option value="">Tất cả môn học</option>' +
        allSubjects.map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
    }

    if (tableContainer) renderSubjectTables(grouped);
  }

  function renderSubjectTables(grouped) {
    const container = $id(CONFIG.DOM.SUBJECT_TABLE);
    if (!container) return;

    container.innerHTML = '';
    Object.keys(grouped).sort().forEach((loai) => {
      const wrap = document.createElement('div');
      wrap.className = 'mb-4';
      wrap.innerHTML = `<h5 class="mb-2 text-brand-red">${escapeHtml(loai)}</h5>`;

      const grid = document.createElement('div');
      grid.className = 'subject-grid';
      grid.innerHTML = Array.from(grouped[loai]).map((s) => `
        <div class="subject-cell" data-subject="${escapeHtml(s)}">${escapeHtml(s)}</div>
      `).join('');

      grid.addEventListener('click', (ev) => {
        const cell = ev.target.closest('.subject-cell');
        if (!cell) return;
        grid.querySelectorAll('.subject-cell').forEach((c) => c.classList.remove('active'));
        cell.classList.add('active');
        const sel = $id(CONFIG.DOM.SUBJECT_FILTER);
        if (sel) sel.value = cell.dataset.subject;
        applyFilters();
      });

      wrap.appendChild(grid);
      container.appendChild(wrap);
    });
  }

  function applyFilters(resetPage = true) {
    const searchEl = $id(CONFIG.DOM.CLASS_SEARCH);
    const subjectEl = $id(CONFIG.DOM.SUBJECT_FILTER);
    const keyword = (searchEl?.value || '').replace(/\s+/g, ' ').trim().toLowerCase();
    const selectedSubject = (subjectEl?.value || '').trim();

    const filtered = STATE.classes.filter((item) => {
      const raw = `${item['Mã môn']} ${item['Môn']} ${item['Khu vực']} ${item['Lịch học']} ${item['Học phí']} ${item['Yêu cầu']} ${item['Hình thức học']}`.toLowerCase();
      const text = raw.replace(/\s+/g, ' ').trim();
      const subject = (item['Môn'] || '').trim();
      const matchKeyword = !keyword || text.includes(keyword);
      const matchSubject = !selectedSubject || subject === selectedSubject;
      return matchKeyword && matchSubject;
    });

    if (resetPage) {
      STATE.currentPage = 1;
    } else {
      const total = Math.ceil(filtered.length / STATE.itemsPerPage);
      if (STATE.currentPage > total) STATE.currentPage = total || 1;
    }

    renderClassCards(filtered);
    renderPagination(filtered);
  }

  function renderClassCards(data) {
    const container = $id(CONFIG.DOM.CLASS_LIST);
    if (!container) return;

    container.innerHTML = '';
    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = '<p class="text-center text-muted">Không tìm thấy lớp nào phù hợp.</p>';
      return;
    }

    const start = (STATE.currentPage - 1) * STATE.itemsPerPage;
    const items = data.slice(start, start + STATE.itemsPerPage);

    items.forEach((item) => {
      const mon = item['Môn']?.trim();
      const maMon = item['Mã môn']?.trim() || 'Không có';
      const hinhThucRaw = item['Hình thức học']?.trim() || 'Không rõ';
      const khuVuc = item['Khu vực']?.trim();
      const lichHoc = item['Lịch học']?.trim() || 'Đang cập nhật';
      const hocPhi = item['Học phí']?.trim() || 'Liên hệ';
      const yeuCau = item['Yêu cầu']?.trim() || 'Không yêu cầu cụ thể';
      const linkNhanLop = item['Link nhận lớp']?.trim();
      if (!mon || !khuVuc) return;

      const type = hinhThucRaw.toLowerCase();
      const badge = type === 'online' ? `<span class="badge bg-success">${escapeHtml(hinhThucRaw)}</span>`
                  : type === 'offline' ? `<span class="badge bg-warning text-dark">${escapeHtml(hinhThucRaw)}</span>`
                  : `<span class="badge bg-secondary">${escapeHtml(hinhThucRaw)}</span>`;

      const card = document.createElement('div');
      card.className = 'col-lg-4 col-md-6';
      card.innerHTML = `
        <div class="section-4__card h-100 d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="section-4__subject mb-0">${escapeHtml(mon)}</h5>
              <span class="badge bg-secondary">Mã: ${escapeHtml(maMon)}</span>
            </div>
            <ul class="section-4__info list-unstyled mb-3">
              <li><strong>Hình thức học:</strong> ${badge}</li>
              <li><strong>Khu vực:</strong> ${escapeHtml(khuVuc)}</li>
              <li><strong>Lịch học:</strong> ${escapeHtml(lichHoc)}</li>
              <li><strong>Học phí:</strong> ${escapeHtml(hocPhi)}</li>
              <li><strong>Yêu cầu:</strong> ${escapeHtml(yeuCau)}</li>
            </ul>
          </div>
          <button class="btn-edumentor w-100 mt-auto" ${linkNhanLop ? `data-href="${escapeHtml(linkNhanLop)}"` : 'disabled'}>
            Nhận lớp ngay
          </button>
        </div>`;

      const btn = card.querySelector('button.btn-edumentor');
      if (btn && linkNhanLop) btn.addEventListener('click', () => window.open(linkNhanLop, '_blank'));

      container.appendChild(card);
    });
  }

  function renderPagination(data) {
    const container = document.querySelector('.section-4 .container');
    if (!container) return;
    let box = $id(CONFIG.DOM.PAGINATION);

    if (!box) {
      box = document.createElement('div');
      box.id = CONFIG.DOM.PAGINATION;
      box.className = 'd-flex justify-content-center mt-4 flex-wrap gap-2';
      container.appendChild(box);
    }

    const totalPages = Math.ceil(data.length / STATE.itemsPerPage);
    box.innerHTML = '';
    if (totalPages <= 1) return;

    const makeBtn = (text, page, isActive = false, disabled = false) => {
      const b = document.createElement('button');
      b.className = `btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline-primary'}`;
      b.disabled = disabled; b.textContent = text;
      b.addEventListener('click', () => {
        STATE.currentPage = page;
        renderClassCards(data);
        renderPagination(data);
        const target = $id(CONFIG.DOM.CLASS_LIST);
        if (target) {
          const offset = 90;
          const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
      return b;
    };

    box.appendChild(makeBtn('«', STATE.currentPage - 1, false, STATE.currentPage === 1));
    for (let i = 1; i <= totalPages; i++) box.appendChild(makeBtn(String(i), i, i === STATE.currentPage));
    box.appendChild(makeBtn('»', STATE.currentPage + 1, false, STATE.currentPage === totalPages));
  }


  const pollers = {
    headerZalo: createPoller('headerZalo', renderJoinZaloButton),
    heroCta:    createPoller('heroCta', renderCta),
    sec2Msg:    createPoller('sec2Msg', renderSection2MessengerButton),
    sec2Rules:  createPoller('sec2Rules', renderSection2Rules),
    classes:    createPoller('classes', loadClassList),
    feedback:   createPoller('feedback', renderFeedback),
  };

  async function init() {
    await Promise.all([
      loadComponent(CONFIG.DOM.HEADER, 'components/header.html'),
      loadComponent(CONFIG.DOM.SECTION_1, 'components/section-1.html'),
      loadComponent(CONFIG.DOM.SECTION_2, 'components/section-2.html'),
      loadComponent(CONFIG.DOM.SECTION_3, 'components/section-3.html'),
      loadComponent(CONFIG.DOM.SECTION_4, 'components/section-4.html'),
      loadComponent(CONFIG.DOM.SECTION_5, 'components/section-5.html'),
      loadComponent(CONFIG.DOM.FOOTER, 'components/footer.html'),
    ]);

    navbarActive();
    enableSmartScroll();
    setTimeout(addSectionAnimations, 400);

    bindClassFilters();

    pollers.headerZalo.start();
    pollers.heroCta.start();
    pollers.sec2Msg.start();
    pollers.sec2Rules.start();
    pollers.classes.start();
    pollers.feedback.start();
  }

  window.addEventListener('load', init, { once: true });

})();
