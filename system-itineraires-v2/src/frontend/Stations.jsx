import React, { useState, useEffect } from 'react';

export default function Stations() {
  const [stations, setStations] = useState([]);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch('https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/velib-disponibilite-en-temps-reel/records?limit=100&refine=nom_arrondissement_communes%3A%22Paris%22');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          setStations(data.results);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchStations();
  }, []);

  return (
    <div>
      <h1>Stations Velib à Paris</h1>
      <ul>
        {stations.map(station => (
          <li key={station.stationcode}>
            <strong>Nom de la station :</strong> {station.name}<br />
            <strong>Bornes disponibles :</strong> {station.numdocksavailable}<br />
            <strong>Vélos disponibles :</strong> {station.numbikesavailable}<br />
            <br />
          </li>
        ))}
      </ul>
    </div>
  );
};