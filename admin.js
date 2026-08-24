async function loadCategories() {

    console.log("Chargement des catégories...");

    // Catégories de secours
    const defaultCategories = [
        { id: 1, name: "Mode" },
        { id: 2, name: "Électronique" },
        { id: 3, name: "Maison" },
        { id: 4, name: "Beauté" },
        { id: 5, name: "Autres" }
    ];

    // Affichage immédiat
    productCategory.innerHTML = `
        <option value="">
            Sélectionner une catégorie
        </option>
    `;

    defaultCategories.forEach(category => {

        const option =
            document.createElement("option");

        option.value =
            String(category.id);

        option.textContent =
            category.name;

        productCategory.appendChild(option);

    });


    // Vérification de Supabase
    try {

        const { data, error } =
            await supabaseClient
                .from("categories")
                .select("id,name,is_active")
                .eq("is_active", true)
                .order("id", {
                    ascending: true
                });


        if (error) {

            console.warn(
                "Supabase catégories inaccessible :",
                error.message
            );

            // Les catégories de secours restent affichées.
            return;
        }


        if (data && data.length > 0) {

            productCategory.innerHTML = `
                <option value="">
                    Sélectionner une catégorie
                </option>
            `;

            data.forEach(category => {

                const option =
                    document.createElement("option");

                option.value =
                    String(category.id);

                option.textContent =
                    category.name;

                productCategory.appendChild(option);

            });

        }

        console.log(
            "Catégories chargées :",
            data
        );

    } catch (error) {

        console.error(
            "Erreur catégories :",
            error
        );

        // Les catégories par défaut restent disponibles.
    }
}
