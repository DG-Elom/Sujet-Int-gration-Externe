import React, { useState } from 'react';
import "./style.css";

export default function Inscription() {
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [response, setResponse] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        const data = {
            nom: nom,
            prenom: prenom,
            email: email,
            motdepasse: password
        };

        try {
            const res = await fetch('', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const jsonRes = await res.json();
            setResponse(jsonRes); 
            if (jsonRes.statut === 'Succès') {
                alert('Inscription réussie !');
            } else {
                alert('Erreur lors de l\'inscription : ' + jsonRes.message);
            }

        } catch (error) {
            console.error('Erreur lors de l\'inscription : ', error);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center full-height">
            <div className="p-5 bg-light border">
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label>Nom :</label>
                        <input type="text" className="form-control" value={nom} onChange={(e) => setNom(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <label>Prénom :</label>
                        <input type="text" className="form-control" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <label>Email :</label>
                        <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <label>Mot de passe :</label>
                        <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary">Confirmer l'inscription</button>
                </form>
            </div>
        </div>
    );
}
