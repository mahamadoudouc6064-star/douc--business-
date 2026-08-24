// =====================================================
// DOUC BUSINESS 3.0
// ADMINISTRATION
// =====================================================


// =====================================================
// SUPABASE
// =====================================================

const SUPABASE_URL =
    "https://xkhavjhoeqtwpmolavdq.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_fYJOpPXAQcQOkVXmuGpoYw_fnt3WqVi";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// =====================================================
// ELEMENTS
// =====================================================

const form =
    document.getElementById("productForm");

const productId =
    document.getElementById("productId");

const productName =
    document.getElementById("productName");

const productDescription =
    document.getElementById("productDescription");

const productPrice =
    document.getElementById("productPrice");

const productOldPrice =
    document.getElementById("productOldPrice");

const productCategory =
    document.getElementById("productCategory");

const productStock =
    document.getElementById("productStock");

const productImage =
    document.getElementById("productImage");

const productFeatured =
    document.getElementById("productFeatured");

const productsList =
    document.getElementById("productsList");

const searchProducts =
    document.getElementById("searchProducts");

const cancelEdit =
    document.getElementById("cancelEdit");

const formTitle =
    document.getElementById("formTitle");


// =====================================================
// VARIABLES
// =====================================================

let allProducts = [];


// =====================================================
// INITIALISATION
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "DOUC BUSINESS 3.0 - ADMINISTRATION"
        );

        await loadCategories();

        await loadProducts();

        await loadOrdersCount();

    }
);


// =====================================================
// CATEGORIES
// =====================================================

async function loadCategories() {

    console.log(
        "Chargement des catégories..."
    );


    productCategory.innerHTML = `
        <option value="">
            Chargement des catégories...
        </option>
    `;


    const { data, error } =
        await supabaseClient
            .from("categories")
            .select(
                "id,name,is_active"
            )
            .eq(
                "is_active",
                true
            )
            .order(
                "id",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "ERREUR CATEGORIES :",
            error
        );


        productCategory.innerHTML = `
            <option value="">
                Erreur de chargement
            </option>
        `;


        showToast(
            "Erreur catégories : " +
            error.message
        );


        return;
    }


    console.log(
        "CATEGORIES RECUES :",
        data
    );


    productCategory.innerHTML = `
        <option value="">
            Sélectionner une catégorie
        </option>
    `;


    if (
        !data ||
        data.length === 0
    ) {

        productCategory.innerHTML += `
            <option value="">
                Aucune catégorie disponible
            </option>
        `;

        return;
    }


    data.forEach(
        function (category) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                String(
                    category.id
                );


            option.textContent =
                category.name;


            productCategory.appendChild(
                option
            );

        }
    );

}


// =====================================================
// CHARGER LES PRODUITS
// =====================================================

async function loadProducts() {

    console.log(
        "Chargement des produits..."
    );


    productsList.innerHTML = `
        <div class="loading">
            Chargement des produits...
        </div>
    `;


    const { data, error } =
        await supabaseClient
            .from("products")
            .select(`
                *,
                categories (
                    id,
                    name
                )
            `)
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "ERREUR PRODUITS :",
            error
        );


        productsList.innerHTML = `
            <div class="empty">
                Impossible de charger les produits.
                <br><br>
                ${escapeHTML(
                    error.message
                )}
            </div>
        `;


        showToast(
            "Erreur produits : " +
            error.message
        );


        return;
    }


    allProducts =
        data || [];


    console.log(
        "PRODUITS RECUS :",
        allProducts
    );


    renderProducts(
        allProducts
    );


    updateStats(
        allProducts
    );

}


// =====================================================
// AFFICHER LES PRODUITS
// =====================================================

function renderProducts(
    products
) {

    if (
        !products ||
        products.length === 0
    ) {

        productsList.innerHTML = `
            <div class="empty">
                Aucun produit trouvé.
            </div>
        `;

        return;
    }


    productsList.innerHTML = "";


    products.forEach(
        function (product) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "product-card";


            const image =
                product.image_url ||
                "https://placehold.co/300x300?text=DOUC";


            const category =
                product.categories?.name ||
                "Sans catégorie";


            card.innerHTML = `

                <img
                    src="${escapeHTML(
                        image
                    )}"
                    alt="${escapeHTML(
                        product.name
                    )}"
                >


                <div class="product-info">

                    <h3>
                        ${escapeHTML(
                            product.name
                        )}
                    </h3>


                    <p>
                        ${escapeHTML(
                            category
                        )}
                    </p>


                    <div class="price">

                        ${formatPrice(
                            product.price
                        )}

                        FCFA

                    </div>


                    ${
                        product.old_price
                        ? `
                            <div class="old-price">

                                Ancien prix :

                                ${formatPrice(
                                    product.old_price
                                )}

                                FCFA

                            </div>
                        `
                        : ""
                    }


                    <div class="stock">

                        Stock :

                        ${Number(
                            product.stock || 0
                        )}

                    </div>


                    ${
                        product.featured
                        ? `
                            <div class="featured">
                                ⭐ Produit vedette
                            </div>
                        `
                        : ""
                    }

                </div>


                <div class="actions">

                    <button
                        class="edit-btn"
                        onclick="editProduct(${product.id})"
                    >
                        ✏️ Modifier
                    </button>


                    <button
                        class="delete-btn"
                        onclick="deleteProduct(${product.id})"
                    >
                        🗑️ Supprimer
                    </button>

                </div>

            `;


            productsList.appendChild(
                card
            );

        }
    );

}


// =====================================================
// AJOUTER / MODIFIER UN PRODUIT
// =====================================================

form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const id =
            productId.value;


        const name =
            productName.value.trim();


        const description =
            productDescription.value.trim();


        const price =
            Number(
                productPrice.value
            );


        const oldPrice =
            productOldPrice.value
                ? Number(
                    productOldPrice.value
                )
                : null;


        const categoryId =
            productCategory.value
                ? Number(
                    productCategory.value
                )
                : null;


        const stock =
            Number(
                productStock.value
            );


        const image =
            productImage.value.trim();


        const featured =
            productFeatured.checked;


        // =================================================
        // VALIDATION
        // =================================================

        if (!name) {

            showToast(
                "Le nom du produit est obligatoire."
            );

            return;
        }


        if (
            Number.isNaN(price) ||
            price < 0
        ) {

            showToast(
                "Le prix est invalide."
            );

            return;
        }


        if (
            Number.isNaN(stock) ||
            stock < 0
        ) {

            showToast(
                "Le stock est invalide."
            );

            return;
        }


        if (!categoryId) {

            showToast(
                "Veuillez sélectionner une catégorie."
            );

            return;
        }


        // =================================================
        // DONNEES PRODUIT
        // =================================================

        const product = {

            name:
                name,

            description:
                description || null,

            price:
                price,

            old_price:
                oldPrice,

            category_id:
                categoryId,

            stock:
                stock,

            image_url:
                image || null,

            featured:
                featured,

            is_active:
                true

        };


        console.log(
            "PRODUIT A ENREGISTRER :",
            product
        );


        let result;


        // =================================================
        // MODIFICATION
        // =================================================

        if (id) {

            result =
                await supabaseClient
                    .from("products")
                    .update(
                        product
                    )
                    .eq(
                        "id",
                        Number(id)
                    );

        }


        // =================================================
        // AJOUT
        // =================================================

        else {

            result =
                await supabaseClient
                    .from("products")
                    .insert([
                        product
                    ]);

        }


        // =================================================
        // ERREUR
        // =================================================

        if (result.error) {

            console.error(
                "ERREUR SUPABASE :",
                result.error
            );


            showToast(
                "Erreur : " +
                result.error.message
            );


            return;
        }


        // =================================================
        // SUCCES
        // =================================================

        showToast(
            id
                ? "Produit modifié avec succès ✅"
                : "Produit ajouté avec succès ✅"
        );


        resetForm();


        await loadProducts();

    }
);


// =====================================================
// MODIFIER UN PRODUIT
// =====================================================

window.editProduct =
    function (id) {

        const product =
            allProducts.find(
                function (item) {

                    return (
                        Number(
                            item.id
                        ) ===
                        Number(id)
                    );

                }
            );


        if (!product) {

            showToast(
                "Produit introuvable."
            );

            return;
        }


        productId.value =
            product.id;


        productName.value =
            product.name || "";


        productDescription.value =
            product.description || "";


        productPrice.value =
            product.price ?? "";


        productOldPrice.value =
            product.old_price ?? "";


        productCategory.value =
            product.category_id
                ? String(
                    product.category_id
                )
                : "";


        productStock.value =
            product.stock ?? 0;


        productImage.value =
            product.image_url || "";


        productFeatured.checked =
            Boolean(
                product.featured
            );


        formTitle.textContent =
            "Modifier le produit";


        cancelEdit.classList.remove(
            "hidden"
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    };


// =====================================================
// SUPPRIMER UN PRODUIT
// =====================================================

window.deleteProduct =
    async function (id) {

        const confirmation =
            confirm(
                "Voulez-vous vraiment supprimer ce produit ?"
            );


        if (!confirmation) {

            return;
        }


        const { error } =
            await supabaseClient
                .from("products")
                .delete()
                .eq(
                    "id",
                    Number(id)
                );


        if (error) {

            console.error(
                "ERREUR SUPPRESSION :",
                error
            );


            showToast(
                "Erreur : " +
                error.message
            );


            return;
        }


        showToast(
            "Produit supprimé avec succès ✅"
        );


        await loadProducts();

    };


// =====================================================
// ANNULER LA MODIFICATION
// =====================================================

cancelEdit.addEventListener(
    "click",
    resetForm
);


function resetForm() {

    form.reset();


    productId.value =
        "";


    productStock.value =
        0;


    formTitle.textContent =
        "Ajouter un produit";


    cancelEdit.classList.add(
        "hidden"
    );

}


// =====================================================
// RECHERCHE
// =====================================================

searchProducts.addEventListener(
    "input",
    function (event) {

        const query =
            event.target.value
                .toLowerCase()
                .trim();


        const filtered =
            allProducts.filter(
                function (product) {

                    const name =
                        (
                            product.name ||
                            ""
                        ).toLowerCase();


                    const description =
                        (
                            product.description ||
                            ""
                        ).toLowerCase();


                    const category =
                        (
                            product.categories?.name ||
                            ""
                        ).toLowerCase();


                    return (

                        name.includes(
                            query
                        )

                        ||

                        description.includes(
                            query
                        )

                        ||

                        category.includes(
                            query
                        )

                    );

                }
            );


        renderProducts(
            filtered
        );

    }
);


// =====================================================
// STATISTIQUES
// =====================================================

function updateStats(
    products
) {

    const total =
        products.length;


    const stock =
        products.reduce(
            function (
                sum,
                product
            ) {

                return (
                    sum +
                    Number(
                        product.stock || 0
                    )
                );

            },
            0
        );


    const featured =
        products.filter(
            function (
                product
            ) {

                return (
                    product.featured === true
                );

            }
        ).length;


    const totalProducts =
        document.getElementById(
            "totalProducts"
        );


    const totalStock =
        document.getElementById(
            "totalStock"
        );


    const totalFeatured =
        document.getElementById(
            "totalFeatured"
        );


    if (totalProducts) {

        totalProducts.textContent =
            total;

    }


    if (totalStock) {

        totalStock.textContent =
            stock;

    }


    if (totalFeatured) {

        totalFeatured.textContent =
            featured;

    }

}


// =====================================================
// COMMANDES
// =====================================================

async function loadOrdersCount() {

    const element =
        document.getElementById(
            "totalOrders"
        );


    if (!element) {

        return;
    }


    const { count, error } =
        await supabaseClient
            .from("orders")
            .select(
                "id",
                {
                    count: "exact",
                    head: true
                }
            );


    if (error) {

        console.error(
            "ERREUR COMMANDES :",
            error
        );


        element.textContent =
            "0";


        return;
    }


    element.textContent =
        count || 0;

}


// =====================================================
// FORMAT PRIX
// =====================================================

function formatPrice(
    price
) {

    return Number(
        price || 0
    ).toLocaleString(
        "fr-FR"
    );

}


// =====================================================
// SECURITE HTML
// =====================================================

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
    .replaceAll(
        "&",
        "&amp;"
    )
    .replaceAll(
        "<",
        "&lt;"
    )
    .replaceAll(
        ">",
        "&gt;"
    )
    .replaceAll(
        '"',
        "&quot;"
    )
    .replaceAll(
        "'",
        "&#039;"
    );

}


// =====================================================
// MESSAGE TOAST
// =====================================================

function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {

        alert(message);

        return;
    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        function () {

            toast.classList.remove(
                "show"
            );

        },
        3000
    );

}
