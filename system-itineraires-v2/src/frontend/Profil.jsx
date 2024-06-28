import React from 'react';
import { useState } from 'react';
import Header from './components/Header';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import caller_auth from '../_services/caller_auth';

const Profil = () => {
    const [identifiant, setIdentifiant] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const token = localStorage.getItem('token');

        const data = {
            identifiant: identifiant,
            newPassword: password,
            token: token
        };

        try {
            const res = await fetch(`${caller_auth.API_URL}/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const jsonRes = await res.json();

            if (jsonRes.statut === 'Succès') {
                toast.success('Connexion réussie !');
                localStorage.setItem('token', jsonRes.token)
                navigate('/')
            } else {
                toast.error('Votre identifiant n\'existe pas ou ne correspond pas avec le mot de passe, veuillez réessayer');
            }

        } catch (error) {
            toast.error('Erreur lors de la connexion avec le serveur, veuillez réessayer plus tard');
        }
    };
    return (
        <>
            <Header />
            <h1 className='d-flex justify-content-center align-items-center full-height mt-4'>Modifier mon profil</h1>
            <div className="d-flex justify-content-center align-items-center full-height mt-4">
                <div className="p-5 bg-light border">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label>Nouvel Identifiant :</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                value={identifiant} 
                                onChange={(e) => setIdentifiant(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="mb-3">
                            <label>Nouveau Mot de passe :</label>
                            <input 
                                type="password" 
                                className="form-control" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Modifier</button>
                    </form>
                    <div className="mt-3">
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profil;