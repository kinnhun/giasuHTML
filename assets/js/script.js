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
loadComponent("footer", "components/footer.html");
