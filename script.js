document.addEventListener("DOMContentLoaded", () => {
    const productContainer = document.getElementById("product-container");
    const filterButtons = document.querySelectorAll(".filter-buttons button");
    const priceFilter = document.getElementById("price-filter");
    const navbar = document.querySelector(".navbar");
    let products = [];
    let currentCategory = "all";
    let revealObserver;

    const getNumericPrice = price => Number(String(price).replace(/[^\d]/g, ""));

    function activateReveal(items) {
        if (!("IntersectionObserver" in window)) {
            items.forEach(item => item.classList.add("show"));
            return;
        }

        if (!revealObserver) {
            revealObserver = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("show");
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15 });
        }

        items.forEach(item => revealObserver.observe(item));
    }

    function renderProducts(list) {
        if (!productContainer) return;

        if (!list.length) {
            productContainer.innerHTML = '<div class="error-box"><h3>Produk tidak ditemukan</h3></div>';
            return;
        }

        const fragment = document.createDocumentFragment();
        const productsByPrice = [...list].sort(
            (firstProduct, secondProduct) =>
                getNumericPrice(firstProduct.price) - getNumericPrice(secondProduct.price)
        );

        productsByPrice.forEach(product => {
            const card = document.createElement("article");
            card.className = "product-card reveal";
            card.innerHTML = `
                <img src="${product.image}" alt="${product.name}" loading="lazy" decoding="async">
                <div class="product-content">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="price">${product.price}</div>
                    <div class="product-actions">
                        <a class="btn-primary" href="${product.link}" target="_blank" rel="noopener noreferrer">🛒 Shopee</a>
                        <a class="btn-secondary" href="https://wa.me/?text=${encodeURIComponent("Halo, saya tertarik dengan produk: " + product.name)}" target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
                    </div>
                </div>`;
            fragment.appendChild(card);
        });

        productContainer.replaceChildren(fragment);
        activateReveal(productContainer.querySelectorAll(".reveal"));
    }

    function filterProducts() {
        const range = priceFilter?.value || "all";
        const filtered = products.filter(product => {
            if (currentCategory !== "all" && product.category !== currentCategory) return false;
            const price = getNumericPrice(product.price);
            if (range === "0-100000") return price < 100000;
            if (range === "100000-200000") return price >= 100000 && price < 200000;
            if (range === "200000-300000") return price >= 200000 && price < 300000;
            if (range === "300000-500000") return price >= 300000 && price < 500000;
            return range !== "500000+" || price >= 500000;
        });
        renderProducts(filtered);
    }

    async function loadProducts() {
        try {
            const response = await fetch("products.json");
            if (!response.ok) throw new Error("Produk tidak dapat dimuat.");
            products = await response.json();
            renderProducts(products);
        } catch (error) {
            if (productContainer) {
                productContainer.innerHTML = `<div class="error-box"><h3>Produk gagal dimuat</h3><p>${error.message}</p></div>`;
            }
        }
    }

    priceFilter?.addEventListener("change", filterProducts);
    filterButtons.forEach(button => button.addEventListener("click", () => {
        filterButtons.forEach(item => item.classList.remove("active"));
        button.classList.add("active");
        currentCategory = button.dataset.category;
        filterProducts();
    }));

    if (navbar) {
        let pending = false;
        const updateNavbar = () => {
            navbar.classList.toggle("navbar-scroll", window.scrollY > 20);
            pending = false;
        };
        window.addEventListener("scroll", () => {
            if (!pending) {
                pending = true;
                requestAnimationFrame(updateNavbar);
            }
        }, { passive: true });
        updateNavbar();
    }

    if ("serviceWorker" in navigator && !["localhost", "127.0.0.1"].includes(location.hostname)) {
        window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js"));
    }

    loadProducts();
});
