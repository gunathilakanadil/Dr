import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Home() {
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const result = await axios.get("http://localhost:8080/api/drivers");
      setDrivers(result.data);
    } catch (error) {
      console.error("Error loading drivers", error);
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
    
    <div className="container py-5">
    
      <h2 className="text-center mb-4">Driver Management</h2>
      <div className="table-responsive shadow-sm rounded">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
               
              <th scope="col">Name</th>
              <th scope="col">License Number</th>
              <th scope="col">Phone Number</th>
              <th scope="col" className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver, index) => (
              <tr key={index}>
                
                <td>{driver.name}</td>
                <td>{driver.licenseNumber}</td>
                <td>{driver.phoneNumber}</td>
                <td className="text-center">
                  <Link className="btn btn-primary btn-sm mx-1" to={`/viewdriver/${driver.id}`}>View</Link>
                  {/* <Link className="btn btn-warning btn-sm mx-1" to={`/edituser/${driver.id}`}>Edit</Link>
                  <button className="btn btn-danger btn-sm mx-1" onClick={() => deleteDriver(driver.id)}>Delete</button> */}
                  <Link className="btn btn-info btn-sm mx-1" to={`/map/${driver.phoneNumber}`}>Map</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-center mt-4">
        <Link className="btn btn-dark" to="/adduser">Add New Driver</Link>
      </div>
    </div>
  );
}
