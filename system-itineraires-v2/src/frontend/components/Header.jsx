import React from 'react';

const Header = () => {
    return (
        <div>
            <nav class="navbar navbar-expand-lg navbar-light bg-light px-3">
                <a class="navbar-brand" href="#">Projet Velibb</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav mx-auto">
                        <li class="nav-item mx-3">
                            <a class="nav-link" href="/historique">Liste des itinéraires enregistrer</a>
                        </li>
                        <li class="nav-item mx-3">
                            <a class="nav-link" href="/maps">Nouveau Itinéraire</a>
                        </li>
                        <li class="nav-item mx-3">
                            <a class="nav-link" href="/stations">Liste des stations</a>
                        </li>
                    </ul>
                    <ul class="navbar-nav">
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Nom de l'utilisateur
                            </a>
                            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                                <li><a class="dropdown-item" href="#">Se déconnecter</a></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </nav>
        </div>
    );
};

export default Header;