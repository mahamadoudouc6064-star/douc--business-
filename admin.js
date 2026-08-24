const SUPABASE_URL =
    "https://xkhavjhoeqtwpmolavdq.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_fYJOpPXAQcQOkVXmuGpoYw_fnt3WqVi";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

async function testProducts() {

    console.log("Test Supabase...");

    const { data, error } =
        await supabaseClient
            .from("products")
            .select("id,name,price,stock")
            .limit(10);

    if (error) {

        console.error("ERREUR SUPABASE :", error);

        document.getElementById("productsList").innerHTML = `
            <div class="empty">
                ❌ Erreur produit
                <br><br>
                ${error.message}
            </div>
        `;

        return;
    }

    console.log("Produits :", data);

    document.getElementById("productsList").innerHTML = `
        <div class="empty">
            ✅ Connexion Supabase réussie
            <br><br>
            ${data.length} produit(s) trouvé(s)
        </div>
    `;
}

document.addEventListener(
    "DOMContentLoaded",
    testProducts
);
