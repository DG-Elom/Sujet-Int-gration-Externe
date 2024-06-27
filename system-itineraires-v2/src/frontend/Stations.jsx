import React, { useEffect, useState } from "react";

export default function Stations() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/velib-disponibilite-en-temps-reel/records?limit=100&refine=nom_arrondissement_communes%3A%22Paris%22');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                if (data && data.records) {
                    setItems(data.records);
                } else {
                    console.error('No records found in API response.');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <h3>Liste :</h3>
            {items.length > 0 ? (
                items.map(item => (
                    <div key={item.recordid}>
                        <h1>{item.fields.name}</h1>
                        <p>Capacité: {item.fields.capacity}</p>
                    </div>
                ))
            ) : (
                <p>Aucune donnée disponible.</p>
            )}
        </div>
    );
};
