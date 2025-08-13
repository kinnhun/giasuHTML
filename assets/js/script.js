function loadComponent(id, path) {
    return fetch(path)
        .then(res => res.text())
        .then(html => {
            const container = document.getElementById(id);
            if (!container) return;

            container.innerHTML = html;
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


loadComponent("header", "components/header.html").then(() => {
    renderJoinZaloButton();
    navbarActive();
});
loadComponent("section-1", "components/section-1.html").then(() => {
    loadCtaContainer();
});

loadComponent("section-2", "components/section-2.html").then(() => {
    renderSection2MessengerButton();
    renderSection2NoiQuyNhanLop();
});
loadComponent("section-3", "components/section-3.html");
loadComponent("section-4", "components/section-4.html").then(() => {
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
loadComponent("section-5", "components/section-5.html").then(() => {

    loadFeedbackSection();

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
        const rawText = `${item["Mã môn"]} ${item["Môn"]} ${item["Khu vực"]} ${item["Lịch học"]} ${item["Học phí"]} ${item["Yêu cầu"]}  ${item["Hình thức học"]}`.toLowerCase();
        const text = rawText.replace(/\s+/g, ' ').trim().toLowerCase();

        return text.includes(keyword);
    });

    if (resetPage) {
        currentPage = 1;
    } else {
        const totalPages = Math.ceil(filtered.length / itemsPerPage);
        if (currentPage > totalPages) currentPage = totalPages || 1;
    }

    renderClassCards(filtered);
    renderPagination(filtered);
}


// function renderClassCards(data) {
//     const container = document.getElementById("classListContainer");
//     if (!container) return;

//     container.innerHTML = "";

//     if (data.length === 0) {
//         container.innerHTML = `<p class="text-center text-muted">Không tìm thấy lớp nào phù hợp.</p>`;
//         return;
//     }

//     const startIndex = (currentPage - 1) * itemsPerPage;
//     const endIndex = startIndex + itemsPerPage;
//     const currentItems = data.slice(startIndex, endIndex);

//     currentItems.forEach(item => {
//         if (!item["Môn"] || !item["Khu vực"]) return;

//         const card = document.createElement("div");
//         card.className = "col-lg-4 col-md-6";
//         card.innerHTML = `
//         <div class="section-4__card">
//             <div class="d-flex justify-content-between align-items-center mb-2">
//                 <h5 class="section-4__subject mb-0">${item["Môn"].trim()}</h5>
//                 <span class="badge bg-secondary">Mã: ${item["Mã môn"]?.trim() || "Không có"}</span>
//             </div>
//             <ul class="section-4__info list-unstyled mb-3">
//                 <li><strong>Khu vực:</strong> ${item["Khu vực"].trim()}</li>
//                 <li><strong>Lịch học:</strong> ${item["Lịch học"]?.trim() || "Đang cập nhật"}</li>
//                 <li><strong>Học phí:</strong> ${item["Học phí"]?.trim() || "Liên hệ"}</li>
//                 <li><strong>Yêu cầu:</strong> ${item["Yêu cầu"]?.trim() || "Không yêu cầu cụ thể"}</li>
//             </ul>
//             <button class="btn-edumentor w-100">Nhận lớp ngay</button>
//         </div>
//         `;
//         container.appendChild(card);
//     });
// }



function renderClassCards(data) {
    const container = document.getElementById("classListContainer");
    if (!container) return;

    container.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = `<p class="text-center text-muted">Không tìm thấy lớp nào phù hợp.</p>`;
        return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = data.slice(startIndex, endIndex);

    currentItems.forEach(item => {
        const mon = item["Môn"]?.trim();
        const maMon = item["Mã môn"]?.trim() || "Không có";
        const hinhThucRaw = item["Hình thức học"]?.trim() || "Không rõ";
        const khuVuc = item["Khu vực"]?.trim();
        const lichHoc = item["Lịch học"]?.trim() || "Đang cập nhật";
        const hocPhi = item["Học phí"]?.trim() || "Liên hệ";
        const yeuCau = item["Yêu cầu"]?.trim() || "Không yêu cầu cụ thể";
        const linkNhanLop = item["Link nhận lớp"]?.trim();

        if (!mon || !khuVuc) return;

        // Badge màu cho hình thức học
        const hinhThuc = hinhThucRaw.toLowerCase();
        let hinhThucHTML = "";
        if (hinhThuc === "online") {
            hinhThucHTML = `<span class="badge bg-success">${hinhThucRaw}</span>`;
        } else if (hinhThuc === "offline") {
            hinhThucHTML = `<span class="badge bg-warning text-dark">${hinhThucRaw}</span>`;
        } else {
            hinhThucHTML = `<span class="badge bg-secondary">${hinhThucRaw}</span>`;
        }

        const card = document.createElement("div");
        card.className = "col-lg-4 col-md-6";
        card.innerHTML = `
        <div class="section-4__card h-100 d-flex flex-column justify-content-between">
            <div>
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h5 class="section-4__subject mb-0">${mon}</h5>
                    <span class="badge bg-secondary">Mã: ${maMon}</span>
                </div>
                <ul class="section-4__info list-unstyled mb-3">
                    <li><strong>Hình thức học:</strong> ${hinhThucHTML}</li>
                    <li><strong>Khu vực:</strong> ${khuVuc}</li>
                    <li><strong>Lịch học:</strong> ${lichHoc}</li>
                    <li><strong>Học phí:</strong> ${hocPhi}</li>
                    <li><strong>Yêu cầu:</strong> ${yeuCau}</li>
                </ul>
            </div>
            <button class="btn-edumentor w-100 mt-auto" ${linkNhanLop ? `onclick="window.open('${linkNhanLop}', '_blank')"` : "disabled"}>
                Nhận lớp ngay
            </button>
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
            const target = document.getElementById("classListContainer");
            if (target) {
                const offset = 90;
                const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top, behavior: "smooth" });
            }

        });
        return btn;
    };

    paginationContainer.appendChild(createBtn("«", currentPage - 1, false, currentPage === 1));

    for (let i = 1; i <= totalPages; i++) {
        paginationContainer.appendChild(createBtn(i, i, i === currentPage));
    }

    paginationContainer.appendChild(createBtn("»", currentPage + 1, false, currentPage === totalPages));
}

document.getElementById("classSearchInput").addEventListener("input", applyFilters);

loadClassListFromSheet();
setInterval(loadClassListFromSheet, 3 * 60 * 1000);







function convertDriveLinkToImage(link) {
    if (!link) return "https://via.placeholder.com/300x200?text=No+Image";
    const fileMatch = link.match(/\/file\/d\/([^/]+)\//);
    const id = fileMatch?.[1];
    return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w400` : "https://via.placeholder.com/300x200?text=No+Image";
}

function loadFeedbackSection() {
    fetch("https://opensheet.elk.sh/1h9qiy1UYF6niv1MNrj4v7frYfa7yanFcJjOEtS-8OTQ/Feedback")
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById("feedbackContainer");
            container.innerHTML = "";

            if (!data || data.length === 0) {
                container.innerHTML = `<div class="swiper-slide"><p class="section-5__text-center">Không có feedback nào.</p></div>`;
                return;
            }

            data.forEach(item => {
                const imgSrc = convertDriveLinkToImage(item["Link feedback"]);
                const teacher = item["Tên giáo viên"] || "Không rõ";
                const role = item["Vai trò"] || "Không rõ";
                const content = item["Nội dung feedback"] || "Không có nội dung";

                container.innerHTML += `
            <div class="swiper-slide">
              <div class="section-5__card">
                <img src="${imgSrc}" class="section-5__feedback-img" alt="Feedback image" loading="lazy">
                <div class="section-5__brand-box">
                  <div class="section-5__logo">
                  </div>
                  <div class="section-5__brand">Edu Mentor</div>
                  <div class="section-5__title">Feedback từ giáo viên</div>
                  <ul class="section-5__features">
                    <li>${teacher}</li>
                    <li>${content}</li>
                  </ul>
                  <div class="section-5__quote">"Cảm ơn vì đã tin tưởng dịch vụ của chúng tôi!"</div>
                </div>
              </div>
            </div>
          `;
            });

            new Swiper(".feedback-swiper", {
                slidesPerView: 1,
                spaceBetween: 30,
                navigation: {
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                },
                loop: true,
                autoplay: {
                    delay: 9000,
                    disableOnInteraction: false,
                },
            });
        })
        .catch(err => {
            console.error("Fetch error:", err);
            document.getElementById("feedbackContainer").innerHTML = `
          <div class="swiper-slide"><p class="section-5__text-center">Không thể tải feedback: ${err.message}</p></div>
        `;
        });
}

document.addEventListener("DOMContentLoaded", loadFeedbackSection);










function loadCtaContainer() {
    const sheetURL = "https://opensheet.elk.sh/1h9qiy1UYF6niv1MNrj4v7frYfa7yanFcJjOEtS-8OTQ/Link%20nh%E1%BA%ADn%20l%E1%BB%9Bp";

    fetch(sheetURL)
        .then(res => res.json())
        .then(data => {
            const firstLink = data[0]?.["Link nhận lớp"]?.trim();
            const container = document.getElementById("ctaContainer");

            if (!firstLink) {
                console.warn("Không tìm thấy link hợp lệ từ Sheet.");
                return;
            }

            if (!container) {
                console.warn("Không tìm thấy phần tử có id='ctaContainer'.");
                return;
            }

            container.innerHTML = `
        <a href="${firstLink}" target="_blank"
           class="btn btn-edumentor section-1__cta uniform-width cta-shake">
          INBOX FACEBOOK ĐỂ NHẬN LỚP
        </a>
      `;
        })
        .catch(err => {
            console.error("Lỗi khi tải link nhận lớp:", err);
        });
}




function renderSection2MessengerButton() {
    const sheetURL = "https://opensheet.elk.sh/1h9qiy1UYF6niv1MNrj4v7frYfa7yanFcJjOEtS-8OTQ/Nh%E1%BA%AFn%20tin%20v%E1%BB%9Bi%20trung%20t%C3%A2m";

    fetch(sheetURL)
        .then(res => res.json())
        .then(data => {
            const link = data[0]?.["Link"]?.trim();
            const container = document.getElementById("section-2nhantinvoitrungtam");

            if (link && container) {
                container.innerHTML = `
          <div class="button-container">
            <a href="${link}" target="_blank" class="btn-edumentor" style="text-decoration: none;">
              NHẮN TIN VỚI TRUNG TÂM NGAY!
            </a>
          </div>
        `;
            } else {
                console.warn("Không tìm thấy link hoặc container để hiển thị.");
            }
        })
        .catch(err => {
            console.error("Lỗi khi fetch link Nhắn tin với trung tâm:", err);
        });
}




function renderSection2NoiQuyNhanLop() {
    const sheetURL = "https://opensheet.elk.sh/1h9qiy1UYF6niv1MNrj4v7frYfa7yanFcJjOEtS-8OTQ/N%E1%BB%99i%20quy%20nh%E1%BA%ADn%20l%E1%BB%9Bp";
    const container = document.getElementById("section-2-noiquynhanlop");

    fetch(sheetURL)
        .then(res => res.json())
        .then(data => {
            const link = data[0]?.["Link"]?.trim();

            if (link && container) {
                container.innerHTML = `
                 <div class="text-center mt-4">
                    <a href="${link}" class="btn btn-edumentor section-2__cta px-4 py-2">
                        ĐỌC NỘI QUY NHẬN LỚP TẠI ĐÂY
                    </a>
                </div>

                  
                `;
            } else {
                container.innerHTML = `<p class="text-danger">Không tìm thấy nội quy hoặc link nhắn tin.</p>`;
                console.warn("Không tìm thấy link hoặc container.");
            }
        })
        .catch(err => {
            console.error("Lỗi khi fetch nội quy nhận lớp:", err);
            if (container) {
                container.innerHTML = `<p class="text-danger">Lỗi khi tải nội quy. Vui lòng thử lại sau.</p>`;
            }
        });
}



function renderJoinZaloButton() {
    const sheetURL = "https://opensheet.elk.sh/1h9qiy1UYF6niv1MNrj4v7frYfa7yanFcJjOEtS-8OTQ/Inbox%20ngay";

    fetch(sheetURL)
        .then(res => res.json())
        .then(data => {
            const link = data[0]?.["Link"]?.trim();
            const container = document.getElementById("thamgianhomzalo");

            if (link && container) {
                container.innerHTML = `
          <a href="${link}" target="_blank" class="header-inbox-btn" style="display: inline-flex; align-items: center; gap: 8px; width: 100%;">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Icon_of_Zalo.svg/512px-Icon_of_Zalo.svg.png"
                 alt="Zalo icon" width="24" height="24" loading="lazy" style="vertical-align: middle;" />
            <span>
              THAM GIA NHÓM ZALO NGAY <br>ĐỂ NHẬN THÔNG BÁO MỚI NHẤT
            </span>
          </a>
        `;
            } else {
                console.warn("Không tìm thấy link hoặc phần tử #thamgianhomzalo.");
            }
        })
        .catch(err => {
            console.error("Lỗi khi fetch link Tham gia nhóm Zalo:", err);
        });
}



function navbarActive() {
    document.addEventListener("DOMContentLoaded", () => {
        const links = document.querySelectorAll(".navbar-nav .nav-link");

        function setActiveLinkFromHash() {
            const currentHash = window.location.hash;

            links.forEach(link => {
                if (link.getAttribute("href") === currentHash) {
                    link.classList.add("active");
                } else {
                    link.classList.remove("active");
                }
            });
        }

        links.forEach(link => {
            link.addEventListener("click", () => {
                // Delay để browser xử lý cuộn trước
                setTimeout(setActiveLinkFromHash, 100);
            });
        });

        window.addEventListener("load", setActiveLinkFromHash);
        window.addEventListener("hashchange", setActiveLinkFromHash);
    });
}

