import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AddUsers() {
  const [formData, setFormData] = useState({
    name: "",
    licenseNumber: "",
    phoneNumber: "",
    liveLocation: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If the field being updated is phoneNumber, prepend +94 automatically
    if (name === "phoneNumber") {
      // Only prepend +94 if it does not already start with it
      if (!value.startsWith("+94")) {
        setFormData((prevState) => ({
          ...prevState,
          phoneNumber: `+94${value.replace(/^(\+94)?/, "")}`,
        }));
      } else {
        setFormData((prevState) => ({
          ...prevState,
          phoneNumber: value,
        }));
      }
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/api/drivers", formData);
      console.log("User added successfully:", response.data);
      setFormData({ name: "", licenseNumber: "", phoneNumber: "", liveLocation: "" });
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card shadow-lg border-0 rounded-4 p-4" style={{ maxWidth: "450px", width: "100%" }}>
        <div className="card-body text-center">
          <h3 className="fw-bold text-dark mb-3">Add User</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                className="form-control rounded-pill p-2"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control rounded-pill p-2"
                name="licenseNumber"
                placeholder="License Number"
                value={formData.licenseNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="tel"
                className="form-control rounded-pill p-2"
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control rounded-pill p-2"
                name="liveLocation"
                placeholder="Live Location"
                value={formData.liveLocation}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-dark w-100 rounded-pill py-2 fw-bold">
              Add User
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
