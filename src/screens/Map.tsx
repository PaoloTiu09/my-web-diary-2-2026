import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
import 'leaflet/dist/leaflet.css';
import { useParams } from "react-router";

function Map() {
    const { loc } = useParams()
    const parts = loc ? loc.split(',') : []
    
    // Changed to parseFloat to support decimal coordinates
    const lat = parts.length > 0 ? parseFloat(parts[0]) : 14.6111512
    const lng = parts.length > 1 ? parseFloat(parts[1]) : 120.9749947
    const zoom = parts.length > 2 ? parseInt(parts[2]) : 19
    
    const position = { lat: lat, lng: lng }
    
    return (
        <MapContainer 
            center={position} 
            zoom={zoom} 
            scrollWheelZoom={false}
            style={{ width: '100%', height: 'calc(100vh - 80px)'}}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={position}>
                <Popup>
                    Location: {lat.toFixed(4)}, {lng.toFixed(4)}
                </Popup>
            </Marker>
        </MapContainer>
    )
}

export default Map