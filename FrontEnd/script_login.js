//Fonction permettant de vérifier si l'utilisateur est un administrateur
function isAdmin() {
    return !!sessionStorage.getItem("token");
}

//Fonction permettant de faire une requête "POST" avec un tableau contenant des identifiants en paramètre
async function postLogin(user) {
    return await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    })
    .then(function(res) {
        if (res.ok) {
            return res.json();
        }
    })
}

//Fonction permettant de remplacer le formulaire de connexion en un bouton de deconnexion
function replaceFormByDecoButton() {
    //On fait disparaitre le formulaire et on remplace la phrase "Log In"
    document
        .getElementById("form_container")
        .setAttribute("style", "display: none;");

    decoSentence = document.createElement("h2")
    decoSentence.innerText = "Vous êtes déjà connecté";

    document.getElementById("deco_sentence").appendChild(decoSentence);

    //On affiche un bouton de déconnexion
    let decobuttonLocation = document.getElementById("deco_button");

    let decoButton = document.createElement("input");
    decoButton.setAttribute("type", "submit");
    decoButton.setAttribute("value", "Déconnexion");

    decobuttonLocation.appendChild(decoButton);
}

//Lors de l'appui sur le bouton "Envoyer", envoie l'email et le password saisis dans les champs du formulaire de la page login
document.getElementById("send_button").addEventListener("click", async function(event) {
    event.preventDefault();

    let user = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    }

    const authInformations = await postLogin(user);

    //Si la connexion s'est effectuée : stockage des informations de connexion dans le sessionStorage et redirection vers la page "index.thml"
    if (authInformations != undefined) {
        sessionStorage.setItem("token", authInformations.token);
        window.location.replace("index.html");
    }
    //Si la connexion ne s'est pas effectuée, indique un message d'erreur et vide les champs du formulaire
    else {
        alert("Les identifiants saisis sont incorrects. Veuillez réessayer.");
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";
    }
});

//Remplacement du formulaire de connexion par un bouton de deconnexion
if (isAdmin()) {
    replaceFormByDecoButton();

    //Au clic sur le bouton "Deconnexion", le sessionStorage se vide et la page se reload
    document.getElementById("deco_button").addEventListener("click", function(event) {
        sessionStorage.clear();
        window.location.reload();
    })
}