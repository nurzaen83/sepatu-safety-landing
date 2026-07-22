/* ============================================
   ANAK-PROYEK Premium 2026 v2
   Final Script
============================================ */

document.addEventListener("DOMContentLoaded", () => {

    const productContainer = document.getElementById("product-container");
    const filterButtons = document.querySelectorAll(".filter-buttons button");
    const priceFilter = document.getElementById("price-filter");
    let products = [];
    let currentCategory = "all";

    //==============================
    // LOAD PRODUCTS
    //==============================

    async function loadProducts() {

        try {

            const response = await fetch("data/products.json");

            if (!response.ok)
                throw new Error("products.json tidak ditemukan");

            products = await response.json();

            renderProducts(products);

        } catch (err) {

            console.error(err);

            if (productContainer) {

                productContainer.innerHTML = `
                <div class="error-box">
                    <h3>Produk gagal dimuat</h3>
                    <p>${err.message}</p>
                </div>`;
            }

        }

    }

    //==============================
    // RENDER PRODUCT
    //==============================

    function renderProducts(list) {

        if (!productContainer) return;

        productContainer.innerHTML = "";

        if (list.length === 0) {

            productContainer.innerHTML = `
            <div class="error-box">
                <h3>Produk tidak ditemukan</h3>
            </div>`;

            return;

        }

        list.forEach(product => {

            const card = document.createElement("div");

            card.className = "product-card reveal";

            card.innerHTML = `

                <img
                    src="${product.image}"
                    alt="${product.name}"
                    loading="lazy">

                <div class="product-content">

                    <h3>${product.name}</h3>

                    <p>${product.description}</p>

                    <div class="price">
                        ${product.price}
                    </div>

                    <div class="product-actions">

                        <a
                            class="btn-primary"
                            href="${product.link}"
                            target="_blank"
                            rel="noopener">

                            🛒 Shopee

                        </a>

                        <a
                            class="btn-secondary"
                            href="https://wa.me/?text=${encodeURIComponent(
                                "Halo, saya tertarik dengan produk: " + product.name
                            )}"
                            target="_blank">

                            💬 WhatsApp

                        </a>

                    </div>

                </div>

            `;

            productContainer.appendChild(card);

        });

        activateReveal();

    }

  //==============================
// FILTER PRODUK
//==============================


function getNumericPrice(price) {
    if (typeof price === "number") return price;

    return Number(
        price.toString().replace(/[^\d]/g, "")
    );
}

function filterProducts() {

    let filtered = [...products];

    // Filter kategori
    if (currentCategory !== "all") {
        filtered = filtered.filter(product =>
            product.category === currentCategory
        );
    }

    // Filter harga
    if (priceFilter && priceFilter.value !== "all") {

        filtered = filtered.filter(product => {

            const price = getNumericPrice(product.price);

            switch (priceFilter.value) {

                case "0-100000":
                    return price < 100000;

                case "100000-200000":
                    return price >= 100000 && price < 200000;

                case "200000-300000":
                    return price >= 200000 && price < 300000;

                case "300000-500000":
                    return price >= 300000 && price < 500000;

                case "500000+":
                    return price >= 500000;

                default:
                    return true;
            }
        });
    }

    renderProducts(filtered);
}

if (priceFilter) {
    priceFilter.addEventListener("change", filterProducts);
}
    
    //==============================
    // BUTTON FILTER
    //==============================

   filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        currentCategory = button.dataset.category;

        filterProducts();

    });

});

    //==============================
    // SEARCH
    //==============================

   
    //==============================
    // SCROLL REVEAL
    //==============================

    function activateReveal() {

        const items = document.querySelectorAll(".reveal");

        const observer = new IntersectionObserver(entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("show");

                }

            });

        }, {

            threshold: 0.15

        });

        items.forEach(item => observer.observe(item));

    }

    //==============================
    // NAVBAR SHADOW
    //==============================

    const navbar = document.querySelector(".navbar");

    window.addEventListener("scroll", () => {

        if (!navbar) return;

        if (window.scrollY > 20) {

            navbar.classList.add("navbar-scroll");

        } else {

            navbar.classList.remove("navbar-scroll");

        }

    });

    //==============================
    // SERVICE WORKER
    //==============================

    if ("serviceWorker" in navigator) {

        window.addEventListener("load", () => {

            navigator.serviceWorker
                .register("service-worker.js")
                .then(() => {

                    console.log("PWA Ready");

                })
                .catch(err => {

                    console.log(err);

                });

        });

    }

    //==============================
    // START
    //==============================

    loadProducts();

});