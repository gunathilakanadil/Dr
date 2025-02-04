import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
 

const GOOGLE_MAPS_API_KEY = 'AIzaSyBb760vN7Xd17NPIE8q_GhpXCLViUJtr8Q';

const RouteOptimizer = () => {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [locationCount, setLocationCount] = useState(2);
  const [searchBox, setSearchBox] = useState(null);
  const [routeResults, setRouteResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [databaseLocations, setDatabaseLocations] = useState([]);
  const [showLocationsList, setShowLocationsList] = useState(false);
  const mapRef = useRef(null);
  const searchInputRef = useRef(null);
  const { id } = useParams()
  useEffect(() => {
    
    // Get WhatsApp number from URL parameters
     const params = new URLSearchParams(window.location.search);
     const phoneNumber = id
    console.log(phoneNumber)
    if (phoneNumber) {
      setWhatsappNumber(phoneNumber);
    }
     
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Maps script loaded');
      setIsLoading(false);
      if (showMap) {
        initializeMap();
      }
    };

    script.onerror = () => {
      setError('Failed to load Google Maps');
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (showMap && !isLoading && !map && window.google) {
      initializeMap();
    }
  }, [showMap, isLoading, map]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    console.log('Initializing map');
    try {
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: 7.8731, lng: 80.7718 },
        zoom: 7,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true
      });

      const newDirectionsRenderer = new window.google.maps.DirectionsRenderer({
        map: newMap,
        suppressMarkers: true
      });

      setDirectionsRenderer(newDirectionsRenderer);

      newMap.addListener('click', (e) => {
        console.log('Map clicked:', e.latLng.lat(), e.latLng.lng());
        handleMapClick(e, newMap);
      });

      setMap(newMap);

      if (searchInputRef.current) {
        const newSearchBox = new window.google.maps.places.SearchBox(searchInputRef.current);
        newSearchBox.addListener('places_changed', () => handlePlacesChanged(newSearchBox, newMap));
        setSearchBox(newSearchBox);
        
        newMap.addListener('bounds_changed', () => {
          newSearchBox.setBounds(newMap.getBounds());
        });
      }

      console.log('Map initialized successfully');
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
    }
  };
  

  
  const handlePlacesChanged = (searchBox, map) => {
    const places = searchBox.getPlaces();
    if (places.length === 0) return;

    if (markers.length >= locationCount) {
      alert(`Maximum ${locationCount} locations allowed`);
      if (searchInputRef.current) {
        searchInputRef.current.value = '';
      }
      return;
    }

    const place = places[0];
    const location = place.geometry.location;
    
    let name = place.name;
    if (place.formatted_address && place.formatted_address !== place.name) {
      name = `${place.name} - ${place.formatted_address}`;
    }

    console.log('Adding place:', name, location.lat(), location.lng());
    addMarkerAndLocation(location.lat(), location.lng(), name, map);
    
    map.setCenter(location);
    map.setZoom(14);

    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  };

  const setupLocations = () => {
    if (!locationCount || locationCount < 2) {
      alert('Please enter at least 2 locations');
      return;
    }

    markers.forEach(marker => {
      if (marker.marker) {
        marker.marker.setMap(null);
      }
    });
    
    if (directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] });
    }
    
    setMarkers([]);
    setShowMap(true);
    setRouteResults(null);
  };

  const handleMapClick = (e, currentMap) => {
    if (markers.length >= locationCount) {
      alert(`Maximum ${locationCount} locations allowed`);
      return;
    }

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const name = results[0].formatted_address;
        addMarkerAndLocation(lat, lng, name, currentMap);
      } else {
        addMarkerAndLocation(lat, lng, `Location ${markers.length + 1}`, currentMap);
      }
    });
  };

  const updateMarkerPosition = (marker, lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const name = results[0].formatted_address;
        setMarkers(prev => prev.map(m => 
          m.marker === marker ? { ...m, lat, lng, name } : m
        ));
      } else {
        setMarkers(prev => prev.map(m => 
          m.marker === marker ? { ...m, lat, lng } : m
        ));
      }
    });
  };

  const addMarkerAndLocation = (lat, lng, name, currentMap) => {
    if (!window.google || !currentMap) {
      console.error('Google Maps not initialized');
      return;
    }

    if (markers.length >= locationCount) {
      alert(`Maximum ${locationCount} locations allowed`);
      return;
    }

    console.log('Adding marker:', lat, lng, name);
    const marker = new window.google.maps.Marker({
      position: { lat, lng },
      map: currentMap,
      draggable: true,
      label: `${markers.length + 1}`
    });

    marker.addListener('dragend', (dragEvent) => {
      const newLat = dragEvent.latLng.lat();
      const newLng = dragEvent.latLng.lng();
      updateMarkerPosition(marker, newLat, newLng);
    });

    setMarkers(prev => [...prev, { marker, name, lat, lng }]);
    
    if (markers.length + 1 >= locationCount) {
      alert('All locations marked!');
    }
  };

  const deleteLocation = (index) => {
    const newMarkers = [...markers];
    if (newMarkers[index].marker) {
      newMarkers[index].marker.setMap(null);
    }
    newMarkers.splice(index, 1);
    
    newMarkers.forEach((m, i) => {
      m.marker.setLabel(`${i + 1}`);
    });
    
    setMarkers(newMarkers);
    
    if (directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] });
    }
    setRouteResults(null);
  };

  const optimizeRoute = async () => {
    if (markers.length < 2) {
      alert('Please add at least 2 locations');
      return;
    }

    try {
      const locations = markers.map((m) => ({
        name: m.name,
        lat: m.marker.getPosition().lat(),
        lng: m.marker.getPosition().lng()
      }));

      console.log('Calculating route...');

      const directionsService = new window.google.maps.DirectionsService();
      
      const waypoints = locations.slice(1, -1).map(location => ({
        location: new window.google.maps.LatLng(location.lat, location.lng),
        stopover: true
      }));

      const request = {
        origin: new window.google.maps.LatLng(locations[0].lat, locations[0].lng),
        destination: new window.google.maps.LatLng(locations[locations.length - 1].lat, locations[locations.length - 1].lng),
        waypoints: waypoints,
        optimizeWaypoints: true,
        travelMode: 'DRIVING'
      };

      directionsService.route(request, (result, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);

          const totalDuration = result.routes[0].legs.reduce(
            (total, leg) => total + leg.duration.value,
            0
          );

          const waypointOrder = result.routes[0].waypoint_order;
          const optimizedRoute = [
            locations[0],
            ...waypointOrder.map(index => locations[index + 1]),
            locations[locations.length - 1]
          ];

          const googleMapsUrl = `https://www.google.com/maps/dir/${optimizedRoute
            .map(loc => `${loc.lat},${loc.lng}`)
            .join('/')}`;

          const routeResults = {
            totalDuration,
            optimizedRoute,
            googleMapsUrl,
            legs: result.routes[0].legs
          };

          setRouteResults(routeResults);

          markers.forEach(m => m.marker.setMap(null));
          const newMarkers = optimizedRoute.map((location, index) => {
            const marker = new window.google.maps.Marker({
              position: { lat: location.lat, lng: location.lng },
              map: map,
              label: `${index + 1}`
            });
            return { marker, name: location.name, lat: location.lat, lng: location.lng };
          });
          setMarkers(newMarkers);

          const bounds = new window.google.maps.LatLngBounds();
          newMarkers.forEach(m => bounds.extend(m.marker.getPosition()));
          map.fitBounds(bounds);
        } else {
          console.error('Directions request failed:', status);
          alert('Failed to calculate route');
        }
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to optimize route');
    }
  };

  const shareToWhatsApp = (phoneNumber, routeUrl) => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const message = encodeURIComponent(`Here's the optimized route: ${routeUrl}`);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  
  return (
    <div className="min-vh-100 bg-light">
      {/* Custom CSS for Apple-like styling */}
      <style>
        {`
          .apple-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.18);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
          }
          
          .apple-input {
            background: rgba(247, 248, 249, 0.95);
            border: 1px solid rgba(0, 0, 0, 0.08);
            border-radius: 12px;
            padding: 12px 16px;
            transition: all 0.3s ease;
          }
          
          .apple-input:focus {
            background: white;
            border-color: rgba(0, 0, 0, 0.2);
            box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
          }
          
          .apple-button {
            background: linear-gradient(145deg, #007AFF, #0063D1);
            border: none;
            border-radius: 12px;
            padding: 12px 24px;
            color: white;
            font-weight: 500;
            transition: all 0.3s ease;
          }
          
          .apple-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 122, 255, 0.2);
          }
          
          .apple-button:disabled {
            background: linear-gradient(145deg, #B8B8B8, #D1D1D1);
            transform: none;
          }
          
          .location-table {
            border-collapse: separate;
            border-spacing: 0 8px;
          }
          
          .location-row {
            background: rgba(247, 248, 249, 0.95);
            border-radius: 12px;
            transition: all 0.2s ease;
          }
          
          .location-row:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          }
          
          .apple-heading {
            font-weight: 600;
            background: linear-gradient(145deg, #000, #333);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        `}
      </style>

      <div className="container py-5">
        <div className="apple-card p-4 p-lg-5">
          <h1 className="apple-heading display-4 text-center mb-5">Route Optimizer</h1>

          {error && (
            <div className="alert border-0 rounded-3 bg-danger bg-opacity-10 text-danger mb-4">
              {error}
            </div>
          )}

          {!showMap ? (
            <div className="text-center py-5">
              <div className="mb-4">
                <label className="form-label fs-5 mb-3">How many locations do you want to optimize?</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={locationCount}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value >= 2 && value <= 10) {
                      setLocationCount(value);
                    }
                  }}
                  className="apple-input mx-auto d-block"
                  style={{ width: '120px' }}
                />
              </div>
              <button
                onClick={setupLocations}
                disabled={isLoading}
                className="apple-button"
              >
                {isLoading ? (
                  <span className="d-flex align-items-center">
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Loading Maps
                  </span>
                ) : (
                  'Start Planning Route'
                )}
              </button>
            </div>
          ) : (
            <div>
              <div className="row mb-4">
                <div className="col-lg-8">
                  <div className="position-relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search for a location"
                      className="apple-input w-100"
                    />
                    <span className="position-absolute end-0 top-50 translate-middle-y me-3 text-muted">
                      {markers.length} / {locationCount}
                    </span>
                  </div>
                </div>
              </div>
              
              <div 
                ref={mapRef} 
                className="rounded-4 overflow-hidden mb-4"
                style={{ height: '400px' }}
              />

              <div className="table-responsive">
                <table className="table location-table w-100">
                  <tbody>
                    {markers.map((location, index) => (
                      <tr key={index} className="location-row">
                        <td className="p-3">Location {index + 1}</td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={location.name}
                            onChange={(e) => {
                              const newMarkers = [...markers];
                              newMarkers[index].name = e.target.value;
                              setMarkers(newMarkers);
                            }}
                            className="apple-input w-100 border-0"
                            placeholder="Enter location name"
                          />
                        </td>
                        <td className="p-3 text-end">
                          <button
                            onClick={() => deleteLocation(index)}
                            className="btn btn-link text-danger text-decoration-none"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={optimizeRoute}
                disabled={markers.length < 2}
                className="apple-button w-100 mt-4"
              >
                Find Optimal Route
              </button>

              {routeResults && (
                <div className="mt-5">
                  <div className="apple-card p-4">
                    <h3 className="apple-heading h4 mb-4">Optimized Route</h3>
                    
                    <div className="d-flex align-items-center mb-4">
                      <div className="p-3 bg-primary bg-opacity-10 rounded-3 me-3">
                        <strong className="text-primary">
                          {Math.floor(routeResults.totalDuration / 3600)}h {Math.floor((routeResults.totalDuration % 3600) / 60)}m
                        </strong>
                      </div>
                      <span className="text-muted">Total travel time</span>
                    </div>

                    <a
                      href={routeResults.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="apple-button d-inline-block mb-4 text-decoration-none"
                    >
                      Open in Maps
                    </a>

                    <div className="apple-card bg-light p-4 mb-4">
                      <div className="input-group">
                        <input
                          type="text"
                          placeholder="Enter WhatsApp number (e.g., +1234567890)"
                          className="apple-input border-0"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                        />
                        <button
                          onClick={() => {
                            if (!whatsappNumber) {
                              alert('Please enter a phone number');
                              return;
                            }
                            shareToWhatsApp(whatsappNumber, routeResults.googleMapsUrl);
                          }}
                          className="apple-button"
                        >
                          Share Route
                        </button>
                      </div>
                    </div>

                    <h4 className="apple-heading h5 mb-3">Stop Order</h4>
                    <div className="apple-card bg-light">
                      {routeResults.optimizedRoute.map((loc, index) => (
                        <div 
                          key={index}
                          className="p-3 border-bottom"
                          style={{ 
                            borderBottom: index === routeResults.optimizedRoute.length - 1 ? 'none' : null 
                          }}
                        >
                          <div className="d-flex align-items-center">
                            <div className="me-3">
                              <span className="badge bg-primary rounded-pill">{index + 1}</span>
                            </div>
                            <div>{loc.name}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteOptimizer;