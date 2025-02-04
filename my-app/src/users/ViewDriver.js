import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function ViewDriver() {
  const [driver, setDriver] = useState({});
  const { id } = useParams();
const [drivers, setDrivers] = useState([]);
  useEffect(() => {
    loadDriver();
  }, []);

  const loadDriver = async () => {
    try {
      const result = await axios.get(`http://localhost:8080/api/drivers/${id}`);
      setDriver(result.data);
    } catch (error) {
      console.error("Error loading driver details", error);
    }
  };
  const deleteDriver = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/drivers/${id}`);
      setDrivers(drivers.filter((driver) => driver.id !== id)); // Update state after deletion
    } catch (error) {
      console.error("Error deleting driver", error);
    }
  };

  return (
    <div className="container py-4 d-flex justify-content-center align-items-center min-vh-100">
      <style>
        {`
          .driver-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.18);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
            padding: 30px;
            max-width: 500px;
            width: 100%;
          }

          .profile-img {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            object-fit: cover;
            display: block;
            margin: 0 auto 20px;
          }

          .back-button {
            background: linear-gradient(145deg, #007AFF, #0063D1);
            border: none;
            border-radius: 12px;
            padding: 10px 20px;
            color: white;
            font-weight: 500;
            transition: all 0.3s ease;
            display: block;
            text-align: center;
            margin-top: 20px;
          }
          .back-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 122, 255, 0.2);
          }
        `}
      </style>

      <div className="driver-card text-center">
        <h2 className="mb-4">Driver Details</h2>
        <img 
          src={driver.profileImage || "https://i.ibb.co/VW0Hjrkw/labour-day.png"} 
          alt="Driver Profile" 
          className="profile-img"
        />
        <ul className="list-group text-start">
          <li className="list-group-item"><strong>Name:</strong> {driver.name}</li>
          <li className="list-group-item"><strong>License Number:</strong> {driver.licenseNumber}</li>
          <li className="list-group-item"><strong>Phone Number:</strong> {driver.phoneNumber}</li>
          <li className="list-group-item">
          <Link className="btn btn-warning btn-sm mx-1" to={`/edituser/${driver.id}`}>Edit</Link>
          <button className="btn btn-danger btn-sm mx-1" onClick={() => deleteDriver(driver.id)}>Delete</button>  
            <strong>Live Location:</strong> 
            {driver.liveLocation ? (
              <a href={driver.liveLocation} target="_blank" rel="noopener noreferrer">View Location</a>
            ) : "Not Available"}
          </li>
         
        </ul>
         
        <Link className="back-button" to="/">Back to Home</Link>
        
      </div>
    </div>
  );
}
