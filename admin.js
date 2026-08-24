// =====================================================
// DOUC BUSINESS 3.0
// ADMINISTRATION
// =====================================================

const SUPABASE_URL =
    "https://xkhavjhoeqtwpmolavdq.supabase.co";

// Mets ici ta clé Publishable/Anon Supabase
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

const form = document.getElementById("productForm");

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
// INITIALISATION
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await loadCategories();

        await loadProducts();

        await loadOrdersCount();

    }
);


// =====================================================
// CATEGORIES
// =====================================================

async function loadCategories() {

    const { data, error } =
        await supabaseClient
            .from("categories")
            .select("id,name")
            .eq("is_active", true)
            .order("name");

    if (error) {

        console.error(error);

        showToast(
            "Erreur chargement catégories"
        );

        return;
    }

    productCategory.innerHTML = `
        <option value="">
            Sélectionner une catégorie
        </option>
    `;

    data.forEach(category => {

        const option =
            document.createElement("option");

        option.value = category.id;

        option.textContent = category.name;

        productCategory.appendChild(option);

    });
}


// =====================================================
// CHARGER PRODUITS
// =====================================================

let allProducts = [];

async function loadProducts() {

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
                    name
                )
            `)
            .order("created_at", {
                ascending: false
            });

    if (error) {

        console.error(error);

        productsList.innerHTML = `
            <div class="empty">
                Impossible de charger les produits.
            </div>
        `;

        showToast(error.message);

        return;
    }

    allProducts = data || [];

    renderProducts(allProducts);

    updateStats(allProducts);
}


// =====================================================
// AFFICHER PRODUITS
// =====================================================

function renderProducts(products) {

    if (!products.length) {

        productsList.innerHTML = `
            <div class="empty">
                Aucun produit trouvé.
            </div>
        `;

        return;
    }

    productsList.innerHTML = "";

    products.forEach(product => {

        const card =
            document.createElement("div");

        card.className = "product-card";

        const image =
            product.image_url ||
            "https://placehold.co/300x300?text=DOUC";

        const category =
            product.categories?.name ||
            "Sans catégorie";

        card.innerHTML = `

            <img
                src="${escapeHTML(image)}"
                alt="${escapeHTML(product.name)}"
            >

            <div class="product-info">

                <h3>
                    ${escapeHTML(product.name)}
                </h3>

                <p>
                    ${escapeHTML(category)}
                </p>

                <div class="price">
                    ${formatPrice(product.price)} FCFA
                </div>

                <div class="stock">
                    Stock : ${product.stock}
                </div>

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

        productsList.appendChild(card);

    });
}


// =====================================================
// AJOUT / MODIFICATION
// =====================================================

form.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        const id =
            productId.value;

        const product = {

            name:
                productName.value.trim(),

            description:
                productDescription.value.trim(),

            price:
                Number(productPrice.value),

            old_price:
                productOldPrice.value
                    ? Number(productOldPrice.value)
                    : null,

            category_id:
                productCategory.value
                    ? Number(productCategory.value)
                    : null,

            stock:
                Number(productStock.value),

            image_url:
                productImage.value.trim(),

            featured:
                productFeatured.checked,

            is_active:
                true

        };


        if (!product.name) {

            showToast(
                "Le nom du produit est obligatoire."
            );

            return;
        }


        if (product.price < 0) {

            showToast(
                "Le prix est invalide."
            );

            return;
        }


        if (product.stock < 0) {

            showToast(
                "Le stock est invalide."
            );

            return;
        }


        let result;


        if (id) {

            result =
                await supabaseClient
                    .from("products")
                    .update(product)
                    .eq("id", Number(id));

        } else {

            result =
                await supabaseClient
                    .from("products")
                    .insert([product]);

        }


        if (result.error) {

            console.error(
                result.error
            );

            showToast(
                result.error.message
            );

            return;
        }


        showToast(
            id
                ? "Produit modifié ✅"
                : "Produit ajouté ✅"
        );


        resetForm();

        await loadProducts();

    }
);


// =====================================================
// MODIFIER
// =====================================================

window.editProduct =
    async function(id) {

        const product =
            allProducts.find(
                item =>
                    Number(item.id) === Number(id)
            );

        if (!product) return;


        productId.value =
            product.id;

        productName.value =
            product.name || "";

        productDescription.value =
            product.description || "";

        productPrice.value =
            product.price || "";

        productOldPrice.value =
            product.old_price || "";

        productCategory.value =
            product.category_id || "";

        productStock.value =
            product.stock || 0;

        productImage.value =
            product.image_url || "";

        productFeatured.checked =
            Boolean(product.featured);


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
// SUPPRIMER
// =====================================================

window.deleteProduct =
    async function(id) {

        const confirmed =
            confirm(
                "Voulez-vous vraiment supprimer ce produit ?"
            );

        if (!confirmed) return;


        const { error } =
            await supabaseClient
                .from("products")
                .delete()
                .eq("id", Number(id));


        if (error) {

            console.error(error);

            showToast(
                error.message
            );

            return;
        }


        showToast(
            "Produit supprimé ✅"
        );


        await loadProducts();

    };


// =====================================================
// ANNULER MODIFICATION
// =====================================================

cancelEdit.addEventListener(
    "click",
    resetForm
);


function resetForm() {

    form.reset();

    productId.value = "";

    productStock.value = 0;

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
    event => {

        const query =
            event.target.value
                .toLowerCase()
                .trim();


        const filtered =
            allProducts.filter(product => {

                return (
                    product.name
                        ?.toLowerCase()
                        .includes(query)
                    ||
                    product.description
                        ?.toLowerCase()
                        .includes(query)
                );

            });


        renderProducts(filtered);

    }
);


// =====================================================
// STATISTIQUES
// =====================================================

function updateStats(products) {

    const total =
        products.length;

    const stock =
        products.reduce(
            (sum, product) =>
                sum + Number(product.stock || 0),
            0
        );

    const featured =
        products.filter(
            product =>
                product.featured === true
        ).length;


    document.getElementById(
        "totalProducts"
    ).textContent = total;


    document.getElementById(
        "totalStock"
    ).textContent = stock;


    document.getElementById(
        "totalFeatured"
    ).textContent = featured;

}


// =====================================================
// COMMANDES
// =====================================================

async function loadOrdersCount() {

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

        console.error(error);

        return;
    }


    document.getElementById(
        "totalOrders"
    ).textContent =
        count || 0;

}


// =====================================================
// UTILITAIRES
// =====================================================

function formatPrice(price) {

    return Number(price || 0)
        .toLocaleString("fr-FR");

}


function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.textContent =
        message;

    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 3000);

}
