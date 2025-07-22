function loadComponent(id, path) {
    return fetch(path)
        .then(res => res.text())
        .then(html => {
            const container = document.getElementById(id);
            if (!container) return;

            container.innerHTML = html;

            // Kích hoạt lại các <script>
            const scripts = container.querySelectorAll("script");
            scripts.forEach(oldScript => {
                const newScript = document.createElement("script");
                if (oldScript.src) {
                    newScript.src = oldScript.src;
                } else {
                    newScript.textContent = oldScript.textContent;
                }
                oldScript.replaceWith(newScript);
            });
        });
}


loadComponent("header", "components/header.html");
loadComponent("section-1", "components/section-1.html");
loadComponent("section-2", "components/sestion-2.html");
loadComponent("section-3", "components/sestion-3.html");
loadComponent("section-4", "components/sestion-4.html").then(() => {
    loadClassListFromSheet();

    setInterval(() => {
        loadClassListFromSheet();
    }, 1000);

});

loadComponent("footer", "components/footer.html");



function enableSmartScroll() {
    const sections = Array.from(document.querySelectorAll('[id^="section-"]'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                const currentSection = entry.target;
                const nextSection = getNextSection(currentSection.id);
                if (nextSection) {
                    // Delay nhỏ để tránh giật
                    setTimeout(() => {
                        nextSection.scrollIntoView({ behavior: 'smooth' });
                    }, 200);
                }
            }
        });
    }, {
        threshold: 0.5
    });

    sections.forEach((section) => observer.observe(section));

    function getNextSection(currentId) {
        const index = sections.findIndex(sec => sec.id === currentId);
        return sections[index + 1] || null;
    }
}

function enableSmartScroll() {
    const sections = Array.from(document.querySelectorAll('[id^="section-"]'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                const currentSection = entry.target;
                const nextSection = getNextSection(currentSection.id);
                if (nextSection) {
                    // Delay nhỏ để tránh giật
                    setTimeout(() => {
                        nextSection.scrollIntoView({ behavior: 'smooth' });
                    }, 200);
                }
            }
        });
    }, {
        threshold: 0.5
    });

    sections.forEach((section) => observer.observe(section));

    function getNextSection(currentId) {
        const index = sections.findIndex(sec => sec.id === currentId);
        return sections[index + 1] || null;
    }
}





function addSectionAnimations() {
    const section = document.querySelector('.section-1');
    const heading = section.querySelector('.section-1__heading');
    const quoteBox = section.querySelector('.section-1__quote-box');
    const cta = section.querySelector('.section-1__cta');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                heading.classList.add('animate-zoom-in');
                quoteBox.classList.add('animate-fade-in-up');
                cta.classList.add('animate-pulse-loop');

                // Ngừng theo dõi để không trigger lại
                observer.unobserve(section);
            }
        });
    }, {
        threshold: 0.5
    });

    observer.observe(section);
}

window.addEventListener('load', () => {
    setTimeout(addSectionAnimations, 400);
});









let allClassData = [];

function loadClassListFromSheet() {
    const sheetURL = "https://opensheet.elk.sh/1h9qiy1UYF6niv1MNrj4v7frYfa7yanFcJjOEtS-8OTQ/L%E1%BB%9Bp%20m%E1%BB%9Bi";

    fetch(sheetURL)
        .then(res => res.json())
        .then(data => {
            allClassData = data;
            applyFilters();
        })
        .catch(err => {
            document.getElementById("classListContainer").innerHTML =
                `<p class="text-danger text-center">Không thể tải dữ liệu lớp học.</p>`;
            console.error(err);
        });
}

function populateAreaFilter(data) {
    const select = document.getElementById("areaFilter");
    if (!select) return;

    select.innerHTML = `<option value="">Tất cả khu vực</option>`;

    const areas = [...new Set(data.map(d => d["Khu vực"]?.trim()).filter(Boolean))].sort();
    areas.forEach(area => {
        const option = document.createElement("option");
        option.value = area.trim(); // KHÔNG dùng toLowerCase
        option.textContent = area.trim();
        select.appendChild(option);
    });
}

function applyFilters() {
    const keyword = document.getElementById("classSearchInput").value.replace(/\s+/g, ' ').trim().toLowerCase();
    const selectedArea = document.getElementById("areaFilter").value.trim();

    const filtered = allClassData.filter(item => {
        const rawText = `${item["Mã môn"]} ${item["Môn"]} ${item["Khu vực"]} ${item["Lịch học"]} ${item["Học phí"]} ${item["Yêu cầu"]}`;
        const text = rawText.replace(/\s+/g, ' ').trim().toLowerCase();

        const matchesKeyword = text.includes(keyword);
        const matchesArea = !selectedArea || item["Khu vực"]?.replace(/\s+/g, ' ').trim() === selectedArea;

        return matchesKeyword && matchesArea;
    });

    renderClassCards(filtered);
}

function renderClassCards(data) {
    const container = document.getElementById("classListContainer");
    if (!container) return;

    container.innerHTML = "";

    if (data.length === 0) {
        container.innerHTML = `<p class="text-center text-muted">Không tìm thấy lớp nào phù hợp.</p>`;
        return;
    }

    data.forEach(item => {
        if (!item["Môn"] || !item["Khu vực"]) return;

        const card = document.createElement("div");
        card.className = "col-lg-4 col-md-6";
        card.innerHTML = `
      <div class="section-4__card">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h5 class="section-4__subject mb-0">${item["Môn"].trim()}</h5>
          <span class="badge bg-secondary">Mã: ${item["Mã môn"]?.trim() || "Không có"}</span>
        </div>
        <ul class="section-4__info list-unstyled mb-3">
          <li><strong>Khu vực:</strong> ${item["Khu vực"].trim()}</li>
          <li><strong>Lịch học:</strong> ${item["Lịch học"]?.trim() || "Đang cập nhật"}</li>
          <li><strong>Học phí:</strong> ${item["Học phí"]?.trim() || "Liên hệ"}</li>
          <li><strong>Yêu cầu:</strong> ${item["Yêu cầu"]?.trim() || "Không yêu cầu cụ thể"}</li>
        </ul>
        <button class="btn-edumentor w-100">Nhận lớp ngay</button>
      </div>
    `;
        container.appendChild(card);
    });
}

// Gắn sự kiện
document.getElementById("classSearchInput").addEventListener("input", applyFilters);
document.getElementById("areaFilter").addEventListener("change", applyFilters);

// Gọi khi load trang
loadClassListFromSheet();

// Cập nhật mỗi 3 phút
setInterval(loadClassListFromSheet, 3 * 60 * 1000);

