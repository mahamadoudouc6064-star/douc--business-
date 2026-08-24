const SUPABASE_URL =
    "https://xkhavjhoeqtwpmolavdq.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_fYJOpPXAQcQOkVXmuGpoYw_fnt3WqVi";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

async function testSupabase() {

    console.log("SUPABASE TEST");

    // TEST CATEGORIES
    const categories =
        await supabaseClient
            .from("categories")
            .select("id,name")
            .limit(10);

    console.log(
        "CATEGORIES :",
        categories
    );

    // TEST PRODUCTS
    const products =
        await supabaseClient
            .from("products")
            .select("id,name,price,stock")
            .limit(10);

    console.log(
        "PRODUCTS :",
        products
    );

    const box =
        document.getElementById("productsList");

    if (products.error) {

        box.innerHTML = `
            <div class="empty">
                ❌ Erreur produit
                <br><br>
                ${products.error.message}
            </div>
        `;

        return;
    }

    box.innerHTML = `
        <div class="empty">
            ✅ Connexion réussie
            <br><br>
            Produits trouvés :
            ${products.data.length}
        </div>
    `;
}

document.addEventListener(
    "DOMContentLoaded",
    testSupabase
);
