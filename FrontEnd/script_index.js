//fonction permettant de vérifier si l'utilisateur est un administrateur
function isAdmin() {
    return !!sessionStorage.getItem("token");
}

//Fonction permettant de récupérer l'array du serveur dans "works"
async function getWorks() {
    return fetch("http://localhost:5678/api/works")
    .then(function(res) {
        if (res.ok) {
            return res.json();
        }
    })
}

//Fonction permettant de récupérer l'array du serveur dans "categories"
async function getCategories() {
    return fetch("http://localhost:5678/api/categories")
    .then(function(res) {
        if (res.ok) {
            return res.json();
        }
    })
}

//Fonction permettant la création d'une carte d'oeuvre
function createCard(work, location) {
    let newFigure = document.createElement("figure");
    let newImg = document.createElement("img");
    let newFigcaption = document.createElement("figcaption");
    
    newFigure.appendChild(newImg);
    newFigure.appendChild(newFigcaption);

    newFigure.setAttribute("category", work.categoryId);

    newImg.setAttribute("crossorigin", "anonymous");
    newImg.setAttribute("src", work.imageUrl);
    newImg.setAttribute("alt", work.title);

    if (location === document.querySelector("#modal .gallery")) {
        newFigcaption.innerText = "éditer";

        let iconContainer = document.createElement("button");
        let icon = document.createElement("i");

        iconContainer.setAttribute("class", "icon_container");
        iconContainer.setAttribute("workid", work.id);
        icon.setAttribute("class", "fa-solid fa-trash-can");

        //Création de l'évènement de suppression d'un work lors du clic sur l'icône poubelle
        iconContainer.addEventListener("click", async function(e) {
            e.preventDefault();

            if (window.confirm("Voulez-vous vraiment supprimer ce travail ?")) {
                await deleteWorks(work.id);
                window.location.reload();
            }
        })

        newFigure.appendChild(iconContainer);
        iconContainer.appendChild(icon);
    }
    else {
        newFigcaption.innerText = work.title;
    }

    return newFigure;
}

//Fonction permettant de générer la galerie
async function createGallery(location) {
    const items = await getWorks();
    let gallery = location;

    for (i in items) {
        gallery.appendChild(this.createCard(items[i], location));
    }
}

//Fonction permettant d'afficher ou non un élément de la gallerie en fonction de l'id de sa catégorie
function displayNoneOnWork(categoryId) {
    document.querySelectorAll(".gallery figure").forEach(work => {
        const figureCategory = work.getAttribute("category");

        if (parseInt(figureCategory) === categoryId) {
            work.removeAttribute("class", "invisible");
        }
        else {
            work.setAttribute("class", "invisible");
        }
    })
}

//Fonction permettant de créer des boutons en fonction des catégories de l'API (lors de l'ajout d'une catégorie, le bouton se rajoute automatiquement)
async function createFilterBox() {
    const categories = await getCategories();
    let filterBox = document.querySelector("#portfolio #filter_box");
    let selectCategory = document.querySelector("#category");

    //Création du bouton "Tous"
    filterBox.appendChild(createFilterButton({id: 0, name: 'Tous'}));

    categories.forEach(category => filterBox.appendChild(this.createFilterButton(category)));
    categories.forEach(category => selectCategory.appendChild(this.createSelectOption(category)));
}

//Fontion permettant de créer un bouton qui filtre les résultats en comparant son id à celui des oeuvres
function createFilterButton(category) {
    let newButton = document.createElement("button");

    newButton.setAttribute("class", "filter");
    newButton.setAttribute("category", category.id);

    newButton.textContent = category.name;
    
    if (category.id === 0) {
        newButton.addEventListener("click", function(event) {
            event.preventDefault();
            document
                .querySelectorAll(".gallery figure")
                .forEach(work => work.removeAttribute("class", "invisible"));
        })
    } else {
        newButton.addEventListener("click", function(event) {
            event.preventDefault();
            displayNoneOnWork(category.id);
        });
    }

    return newButton;
}

//Fonction permettant de générer les catégories dans le champ select de la modale
function createSelectOption(category) {
    let newOption = document.createElement("option");

    newOption.setAttribute("category", category.id);

    newOption.innerText = category.name;

    return newOption;
}

//Fonction permettant de générer le code HTML correspondant aux options d'administrateur
function showAdminOptions() {
    //Génération du bandeau d'option noir
    let ribbonLocation = document.getElementById("ribbon_location");

    let editionRibbon = document.createElement("div");
    editionRibbon.setAttribute("id", "edition_ribbon");

    let newParagraph = document.createElement("p");

    let newButton = document.createElement("input");
    newButton.setAttribute("type", "submit");
    newButton.setAttribute("id", "publicate_button");
    newButton.setAttribute("value", "Publier les changements");

    ribbonLocation.appendChild(editionRibbon);
    editionRibbon.appendChild(newParagraph);
    editionRibbon.appendChild(newButton);
    newParagraph.innerHTML = "<i class='fa-solid fa-pen-to-square'></i>Mode édition";

    //Fonction permettant de générer un bouton "Modifier"
    function createModifyingButton(button) {
        button = document.createElement("button");
        button.setAttribute("class", "edit");
        button.innerHTML = "<i class='fa-solid fa-pen-to-square'></i>Modifier"
        return button;
    }

    //Génération du premier bouton "Modifier"
    document
        .getElementById("image_edit_location")
        .appendChild(createModifyingButton());

    //Génération du deuxième bouton "Modifier"
    document
        .getElementById("project_edit_location")
        .appendChild(createModifyingButton());
    
    //On rajoute au deuxième bouton la classe permettant d'ouvrir la modale
    document
        .querySelector("#project_edit_location button")
        .setAttribute("class", "edit js_modal");
}

//Fonction permettant de créer une oeuvre sur l'API
async function postWork(image, title, category) {
    let data = new FormData();
    data.append("image", image);
    data.append("title", title);
    data.append("category", category);

    return await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + sessionStorage.getItem("token")
        },
        body: data
    })
}

//Fonction permettant de supprimer une oeuvre de l'API
async function deleteWorks(id) {
    return fetch(`http://localhost:5678/api/works/${id}`, {
        method: "DELETE",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer " + sessionStorage.getItem("token")
        }
    });
}

//Création du container des boutons filtre
createFilterBox();

//Création des galeries
createGallery(document.querySelector("#portfolio .gallery"));
createGallery(document.querySelector("#modal .gallery"));

//Affichage des options d'administrateur si le token est présent
if (isAdmin()) {
    showAdminOptions();
}


//============ FENÊTRE MODALE ============

//initialisation de la variable qui stockera le chemin vers l'élément "modal"
let openedModal = null;

//Constante contenant une fonction permettant d'ouvir la modale
const openModal = function(event) {
    event.preventDefault();

    //Remise à zéro de la boîte modale
    document.getElementById("photo_gallery_page").removeAttribute("style", "display: none;");
    document.getElementById("add_photo_page").setAttribute("style", "display: none;");
    document.getElementById("js_modal_return").setAttribute("style", "display: none;");

    //Remise à zéro des champs de "add_photo_page"
    document.getElementById("photo_visualizer_text").removeAttribute("style", "display: none;");
    document.getElementById("photo_visualizer_img").setAttribute("style", "display: none;");
    document.getElementById("title").value = "";
    document.getElementById("category").value = "Objets";

    const modal = document.getElementById("modal");

    //Affichage de la boîte modale
    modal.style.display = null;

    modal.setAttribute("class", "opened");

    //Au clic en dehors de la modale ou sur le bouton "js_modal_close", la modale se ferme
    openedModal = modal;
    openedModal.addEventListener("click", closeModal);
    document.getElementById("js_modal_close").addEventListener("click", closeModal);
    document.querySelector(".js_modal_stop").addEventListener("click", stopPropagation);
}

//Constante contenant une fonction permettant de fermer la modale
const closeModal = function(event) {
    //Si la modal n'existe pas on s'arrête ici
    if (openedModal === null) return;

    event.preventDefault();

    //Fermeture de la boîte modale avec un décalage correspondant à la durée de l'animation CSS puis remise à zéro de la variable "openedModal"
    window.setTimeout(function() {
        openedModal.style.display = "none";
        openedModal = null;
    }, 500);

    modal.setAttribute("class", "closed");

    //Supression des évènements au clic
    openedModal.removeEventListener("click", closeModal);
    document.getElementById("js_modal_close").removeEventListener("click", closeModal);
    document.querySelector(".js_modal_stop").removeEventListener("click", stopPropagation);
}

//Constante contenant une fonction permettant de ne pas fermer la modale lors d'un clic à l'intérieur
const stopPropagation = function(event) {
    event.stopPropagation();
}

//On rajoute un évènement permettant d'exécuter la fonction contenue dans "openModal" à tous les éléments possédant la classe "js_modal"
document.querySelectorAll(".js_modal").forEach(button => {
    button.addEventListener("click", openModal)
});

//Fermeture de la modale lors de l'appui sur la touche "Echap"
window.addEventListener("keydown", function(event) {
    if (event.key === "Escape" || event.key === "Esc") {
        closeModal(event);
    }
})

//Au clic sur "Ajouter une photo", on cache la page actuelle et on affiche la suivante
document.getElementById("to_add_photo_page").addEventListener("click", function(event) {
    event.preventDefault();

    document.getElementById("photo_gallery_page").setAttribute("style", "display: none;");
    document.getElementById("add_photo_page").removeAttribute("style", "display: none;");
    document.getElementById("js_modal_return").removeAttribute("style", "display: none;");

    //Remise à zéro des champs de "add_photo_page"
    document.getElementById("photo_visualizer_text").removeAttribute("style", "display: none;");
    document.getElementById("photo_visualizer_img").setAttribute("style", "display: none;");
    document.getElementById("title").value = "";
    document.getElementById("category").value = "Objets";

});

//Au clic sur la flèche de retour, on cache la page actuelle et on affiche la précédente
document.getElementById("js_modal_return").addEventListener("click", function(event) {
    event.preventDefault();

    document.getElementById("photo_gallery_page").removeAttribute("style", "display: none;");
    document.getElementById("add_photo_page").setAttribute("style", "display: none;");
    document.getElementById("js_modal_return").setAttribute("style", "display: none;");
});

//Code gérant l'affichage des éléments et de la prévisualisation de la photo dans "photo_visualizer"
let addPhotoButton = document.getElementById("add_photo_button");
let chosenImage = document.getElementById("chosen_image");

addPhotoButton.onchange = () => {
    let reader = new FileReader();
    reader.readAsDataURL(addPhotoButton.files[0]);
    reader.onload = () => {
        document.getElementById("photo_visualizer_text").setAttribute("style", "display: none;");
        document.getElementById("photo_visualizer_img").removeAttribute("style", "display: none;");
        chosenImage.setAttribute("src", reader.result);
    }
}

//Au clic sur le bouton valider, appel à la fonction "postWork()" pour envoyer les informations rentrées au serveur
document.getElementById("validate_post_work").addEventListener("click", async function(event) {
    event.preventDefault();

    //Await sinon la page se reload avant d'avoir pu faire la requête
    await postWork(
        addPhotoButton.files[0],
        document.getElementById("title").value,
        document.getElementById("category").options[document.getElementById("category").selectedIndex].getAttribute("category")
    );
        
    window.location.reload();
});