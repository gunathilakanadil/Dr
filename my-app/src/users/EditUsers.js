import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const UpdateForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    licenseNumber: "",
    phoneNumber: "",
    liveLocation: "",
  });

  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/drivers/${id}`)
      .then((response) => setFormData(response.data))
      .catch((error) => console.error("Error fetching data!", error));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .put(`http://localhost:8080/api/drivers/${id}`, formData)
      .then(() => {
        alert("Updated successfully!");
        navigate("/");
      })
      .catch((error) => console.error("Error updating data!", error));
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card shadow-lg border-0 rounded-4 p-4" style={{ maxWidth: "450px", width: "100%" }}>
        <div className="card-body text-center">
          <h3 className="fw-bold text-dark mb-3">Update User</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input type="text" className="form-control rounded-pill p-2" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <input type="text" className="form-control rounded-pill p-2" name="licenseNumber" placeholder="License Number" value={formData.licenseNumber} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <input type="tel" className="form-control rounded-pill p-2" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <input type="text" className="form-control rounded-pill p-2" name="liveLocation" placeholder="Live Location" value={formData.liveLocation} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn btn-dark w-100 rounded-pill py-2 fw-bold">Update</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateForm;
