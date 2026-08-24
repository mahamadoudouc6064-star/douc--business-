const express = require("express");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();

const PORT = process.env.PORT || 3000;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    console.error("❌ Variables Supabase manquantes dans Render.");
    process.exit(1);
}

const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_SECRET_KEY
);

app.use(express.json());
app.use(express.static(path.join(__dirname)));


// =====================================================
// PRODUITS
// =====================================================

app.get("/api/products", async (req, res) => {

    try {

        const { data, error } = await supabase
            .from("products")
            .select(`
                *,
                categories (
                    id,
                    name
                )
            `)
            .eq("is_active", true)
            .order("created_at", {
                ascending: false
            });

        if (error) {

            console.error("Supabase products error:", error);

            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        res.json({
            success: true,
            products: data || []
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            error: "Erreur serveur"
        });
    }
});


// =====================================================
// CATEGORIES
// =====================================================

app.get("/api/categories", async (req, res) => {

    try {

        const { data, error } = await supabase
            .from("categories")
            .select("id,name,is_active")
            .eq("is_active", true)
            .order("id", {
                ascending: true
            });

        if (error) {

            console.error("Supabase categories error:", error);

            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        res.json({
            success: true,
            categories: data || []
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            error: "Erreur serveur"
        });
    }
});


// =====================================================
// PAGE D'ACCUEIL
// =====================================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "index.html")
    );

});


// =====================================================
// ADMINISTRATION
// =====================================================

app.get("/admin", (req, res) => {

    res.sendFile(
        path.join(__dirname, "admin.html")
    );

});


// =====================================================
// DEMARRAGE
// =====================================================

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `🚀 DOUC Business fonctionne sur le port ${PORT}`
    );

});
