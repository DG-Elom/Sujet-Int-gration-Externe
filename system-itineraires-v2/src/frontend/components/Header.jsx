import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import caller_auth from '../../_services/caller_auth';

const Header = () => {
    const navigate = useNavigate();

    const logout = async (event) => {
        event.preventDefault();

        const token = localStorage.getItem('token')
        console.log(token);
        try {
            const res = await fetch(`${caller_auth.API_URL}/logout`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            const jsonRes = await res.json();
            
            if (jsonRes.statut === 'Succès') {
                toast.success('Vous venez de vous déconnecter !');
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                toast.error('Votre token n\'existe pas, veuillez réessayer');
                localStorage.removeItem('token');
            }

        } catch (error) {
            toast.error('Erreur lors de la déconnexion avec le serveur, veuillez réessayer plus tard');
        }
    };

    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
                <a className="navbar-brand" href="#">Projet Velibb</a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav mx-auto">
                        <li className="nav-item mx-3">
                            <a className="nav-link" href="/historique">Liste des itinéraires enregistrer</a>
                        </li>
                        <li className="nav-item mx-3">
                            <a className="nav-link" href="/maps">Nouveau Itinéraire</a>
                        </li>
                        <li className="nav-item mx-3">
                            <a className="nav-link" href="/stations">Liste des stations</a>
                        </li>
                    </ul>
                    <ul className="navbar-nav">
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Nom de l'utilisateur
                            </a>
                            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                                <li><a className="dropdown-item" href="#" onClick={logout}>Se déconnecter</a></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </nav>
        </div>
    );
};

export default Header;