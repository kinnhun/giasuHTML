function loadComponent(id, path) {
    fetch(path)
        .then(res => res.text())
        .then(html => {
            document.getElementById(id).innerHTML = html;
        });
}

loadComponent("header", "components/header.html");
loadComponent("section-1", "components/section-1.html");
loadComponent("section-2", "components/sestion-2.html");
loadComponent("section-3", "components/sestion-3.html");
loadComponent("section-4", "components/sestion-4.html");
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
