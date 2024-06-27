import React, { useState } from 'react';
import "./style.css";
import HeaderLogin from './components/HeaderLogin';
import caller_auth from '../_services/caller_auth';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function Inscription() {
    const [identifiant, setIdentifiant] = useState('');
    const [password, setPassword] = useState('');
    const [response, setResponse] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const data = {
            identifiant: identifiant,
            motdepasse: password
        };

        try {
            const res = await fetch(`${caller_auth.API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const jsonRes = await res.json();
            setResponse(jsonRes);

            if (jsonRes.statut === 'Succès') {
                toast.success('Connexion réussie !');
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
            <HeaderLogin />
            <h1 className='d-flex justify-content-center align-items-center full-height mt-4'>Inscription</h1>
            <div className="d-flex justify-content-center align-items-center full-height mt-4">
                <div className="p-5 bg-light border">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label>Identifiant :</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                value={identifiant} 
                                onChange={(e) => setIdentifiant(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="mb-3">
                            <label>Mot de passe :</label>
                            <input 
                                type="password" 
                                className="form-control" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">S'inscrire</button>
                    </form>
                    <div className="mt-3">
                        <p>Vous avez déjà un compte ? <a href="/login">Connectez-vous</a></p>
                    </div>
                </div>
            </div>
        </>
    );
}
