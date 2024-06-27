import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Maps from './Maps';
import Historique from './Historique';
import Stations from './Stations';

export default function Dashboard() {
    return (
        <div className='d-flex'>
            <div className='main-navbar bg-dark vh-100'>
                <nav className="nav flex-column">
                    <h3 class="text-center text-light">Projet Velibb</h3>
                    <a className="nav-link" href="/historique">Liste des itinéraires enregistrer</a>
                    <a className="nav-link" href="/maps">Nouveau itinéraires</a>
                    <a className="nav-link" href="/stations">Liste des stations</a>
                    <a className="nav-link" href="/deconnexion">Se déconnecter</a>
                </nav>
            </div>
            <div className='content flex-fill p-4'>
                <BrowserRouter>
                    <Routes>
                        <Route path="/maps" element={<Maps />} />
                        <Route path="/stations" element={<Stations />} />
                        <Route path="/historique" element={<Historique />} />
                    </Routes>
                </BrowserRouter>
            </div>
        </div>
    );
};