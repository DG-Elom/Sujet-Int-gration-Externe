import React from 'react';

const HeaderLogin = () => {
    return (
        <div>
            <nav class="navbar navbar-expand-lg navbar-light bg-light px-3">
                <a class="navbar-brand" href="#">Projet Velibb</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav mx-auto">

                    </ul>
                    <ul class="navbar-nav">
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Menu
                            </a>
                            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                                <li><a class="dropdown-item" href="/login">Se connecter</a></li>
                                <li><a class="dropdown-item" href="/register">S'inscire</a></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </nav>
        </div>
    );
};

export default HeaderLogin;