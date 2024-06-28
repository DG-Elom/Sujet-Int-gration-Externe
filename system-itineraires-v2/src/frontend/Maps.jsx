import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import L from 'leaflet';
import 'leaflet-routing-machine';
import html2canvas from 'html2canvas';
import Header from './components/Header';
import caller_auth from '../_services/caller_auth';

const DirectionsBox = ({ station, address, directions, mapImage, onClose, onSave, onDownload }) => {
    const handleSave = () => {
        onSave(station, address, directions, mapImage);
    };

    const handleDownloadPDF = () => {
        onDownload(station, address, directions, mapImage);
    };

    return (
        <div className="directions-box">
            <h2>{station.name}</h2>
            <p>Adresse de départ : {address}</p>
            <div>
                <button onClick={handleSave}>Sauvegarder</button>
                <button onClick={handleDownloadPDF}>Télécharger PDF</button>
                <button onClick={onClose}>Fermer</button>
            </div>
        </div>
    );
};

const Maps = () => {
    const [stations, setStations] = useState([]);
    const [directions, setDirections] = useState('');
    const [address, setAddress] = useState('');
    const [showDirectionsMap, setShowDirectionsMap] = useState(false);
    const [startPosition, setStartPosition] = useState(null);
    const [endPosition, setEndPosition] = useState(null);
    const [selectedStation, setSelectedStation] = useState(null);
    const [mapImage, setMapImage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/velib-disponibilite-en-temps-reel/records?limit=100');
                const data = await response.json();
                setStations(data.results);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleGetDirections = async (station) => {
        try {
            const geocodeResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
            const geocodeData = await geocodeResponse.json();
            if (geocodeData.length === 0) {
                alert('Adresse introuvable.');
                return;
            }
    
            const { lat, lon } = geocodeData[0];
            setStartPosition([parseFloat(lat), parseFloat(lon)]);
            setEndPosition([parseFloat(station.coordonnees_geo.lat), parseFloat(station.coordonnees_geo.lon)]);
            setSelectedStation(station);
            setShowDirectionsMap(true);
        } catch (error) {
            console.error('Error getting directions:', error);
        }
    };

    const handleCloseDirections = () => {
        setShowDirectionsMap(false);
        setSelectedStation(null);
    };

    const handleSaveDirections = async (station, startAddress, directions, mapImage) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${caller_auth.API_URL}/save-directions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    station,
                    address: startAddress,
                    directions: directions,
                    map_image: mapImage
                    // Remove numbikesavailable and numdocksavailable from the payload
                }),
            });
            if (!response.ok) {
                throw new Error('Error saving directions');
            }
            alert('Itinéraire sauvegardé avec succès');
        } catch (error) {
            console.error('Error saving directions:', error);
            alert('Erreur lors de la sauvegarde de l\'itinéraire');
        }
    };

    const handleDownloadPDF = async (station, address, directions, mapImage) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${caller_auth.API_URL}/itinerary`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    itinerary: 1,
                    name: 'Mon itinéraire',
                    points: [{ lat: startPosition[0], lon: startPosition[1] }, { lat: endPosition[0], lon: endPosition[1] }],
                    directions: directions,
                    map_image: mapImage
                }),
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'itinerary.pdf';
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                throw new Error('Error downloading PDF');
            }
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Erreur lors du téléchargement du PDF');
        }
    };

    useEffect(() => {
        if (showDirectionsMap && startPosition && endPosition) {
            const map = L.map('directions-map').setView(startPosition, 12);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            const control = L.Routing.control({
                waypoints: [
                    L.latLng(startPosition),
                    L.latLng(endPosition)
                ],
                routeWhileDragging: true
            }).addTo(map);

            control.on('routesfound', (e) => {
                const routes = e.routes;
                if (routes.length > 0) {
                    const route = routes[0];
                    const instructions = route.instructions.map(instr => `${instr.text} (${instr.distance} m)`);
                    setDirections(instructions.join('\n'));

                    html2canvas(document.querySelector('#directions-map')).then(canvas => {
                        setMapImage(canvas.toDataURL());
                    });
                }
            });
        }
    }, [showDirectionsMap, startPosition, endPosition]);

    return (
        <>
            <Header />
            <div className="map-container">
                <MapContainer center={[48.864716, 2.349014]} zoom={12} style={{ height: "90vh" }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {stations.map(station => (
                        <Marker
                            key={station.stationcode}
                            position={[
                                parseFloat(station.coordonnees_geo.lat),
                                parseFloat(station.coordonnees_geo.lon)
                            ]}
                        >
                            <Popup>
                                <div>
                                    <h2>{station.name}</h2>
                                    <input
                                        type="text"
                                        placeholder="Adresse de départ"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
                                    <button onClick={() => handleGetDirections(station)}>Itinéraire</button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
                {showDirectionsMap && (
                    <div className="directions-container">
                        <div id="directions-map" style={{ height: "70vh" }}></div>
                        <DirectionsBox
                            station={selectedStation}
                            address={address}
                            directions={directions}
                            mapImage={mapImage}
                            onClose={handleCloseDirections}
                            onSave={handleSaveDirections}
                            onDownload={handleDownloadPDF}
                        />
                    </div>
                )}
            </div>
        </>
    );
};

export default Maps;
