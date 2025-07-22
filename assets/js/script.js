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
        fetch("https://opensheet.elk.sh/1h9qiy1UYF6niv1MNrj4v7frYfa7yanFcJjOEtS-8OTQ/L%E1%BB%9Bp%20m%E1%BB%9Bi")
            .then(res => res.json())
            .then(data => {
                allClassData = data;
                applyFilters(false);
            });
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
let currentPage = 1;
const itemsPerPage = 6;

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

function applyFilters(resetPage = true) {
    const keyword = document.getElementById("classSearchInput").value.replace(/\s+/g, ' ').trim().toLowerCase();

    const filtered = allClassData.filter(item => {
        const rawText = `${item["Mã môn"]} ${item["Môn"]} ${item["Khu vực"]} ${item["Lịch học"]} ${item["Học phí"]} ${item["Yêu cầu"]}`;
        const text = rawText.replace(/\s+/g, ' ').trim().toLowerCase();

        return text.includes(keyword);
    });

    if (resetPage) {
        currentPage = 1;
    } else {
        // Nếu currentPage lớn hơn tổng số trang sau khi cập nhật dữ liệu mới → quay lại trang cuối cùng
        const totalPages = Math.ceil(filtered.length / itemsPerPage);
        if (currentPage > totalPages) currentPage = totalPages || 1;
    }

    renderClassCards(filtered);
    renderPagination(filtered);
}


function renderClassCards(data) {
    const container = document.getElementById("classListContainer");
    if (!container) return;

    container.innerHTML = "";

    if (data.length === 0) {
        container.innerHTML = `<p class="text-center text-muted">Không tìm thấy lớp nào phù hợp.</p>`;
        return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = data.slice(startIndex, endIndex);

    currentItems.forEach(item => {
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

function renderPagination(data) {
    const paginationContainerId = "paginationControls";
    let paginationContainer = document.getElementById(paginationContainerId);

    if (!paginationContainer) {
        paginationContainer = document.createElement("div");
        paginationContainer.id = paginationContainerId;
        paginationContainer.className = "d-flex justify-content-center mt-4 flex-wrap gap-2";
        document.querySelector(".section-4 .container").appendChild(paginationContainer);
    }

    paginationContainer.innerHTML = "";

    const totalPages = Math.ceil(data.length / itemsPerPage);

    if (totalPages <= 1) return;

    const createBtn = (text, page, isActive = false, disabled = false) => {
        const btn = document.createElement("button");
        btn.className = `btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline-primary'}`;
        btn.disabled = disabled;
        btn.textContent = text;
        btn.addEventListener("click", () => {
            currentPage = page;
            renderClassCards(data);
            renderPagination(data);
        });
        return btn;
    };

    paginationContainer.appendChild(createBtn("«", currentPage - 1, false, currentPage === 1));

    for (let i = 1; i <= totalPages; i++) {
        paginationContainer.appendChild(createBtn(i, i, i === currentPage));
    }

    paginationContainer.appendChild(createBtn("»", currentPage + 1, false, currentPage === totalPages));
}

// Gắn sự kiện
document.getElementById("classSearchInput").addEventListener("input", applyFilters);

// Load lần đầu
loadClassListFromSheet();
setInterval(loadClassListFromSheet, 3 * 60 * 1000);
