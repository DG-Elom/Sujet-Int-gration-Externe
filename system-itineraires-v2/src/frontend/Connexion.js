import React, { useState } from 'react';
import "./style.css";

export default function Connexion() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [response, setResponse] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        const data = {
            identifiant: email,
            motdepasse: password
        };

        try {
            const res = await fetch('http://localhost:2999/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const jsonRes = await res.json();
            setResponse(jsonRes);
            console.log(jsonRes.statut);
            if (jsonRes.statut === 'Succès') {
                alert('Connexion réussie !');
            } else {
                alert('Erreur de connexion : ' + jsonRes.message);
            }

        } catch (error) {
            console.error('Erreur lors de la connexion : ', error);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center full-height">
            <div className="p-5 bg-light border">
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label>Identifiants :</label>
                        <input type="TEXT" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <label>Mot de passe :</label>
                        <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" class="btn btn-primary">Se connecter</button>
                </form>
                <button class="btn btn-primary">Inscription</button>
            </div>
        </div>
    );
}
