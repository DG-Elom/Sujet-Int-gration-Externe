import React, { useState, useEffect } from 'react';
import Header from './components/Header';

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
    <>
      <Header />
      <div className="container mt-5" style={{ maxWidth: '1250px', margin: '0 auto' }}>
        <h1 className='d-flex justify-content-center align-items-center full-height mt-4 mb-4'>Stations Vélib' à Paris</h1>
        <div className="row">
          {stations.map((station) => (
            <div className="col-md-4 mb-4" key={station.stationcode}>
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">
                    <strong>Nom de la station :</strong> {station.name}
                  </h5>
                  <p className="card-text">
                    <strong>Bornes disponibles :</strong> {station.numdocksavailable}<br />
                    <strong>Vélos disponibles :</strong> {station.numbikesavailable}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};