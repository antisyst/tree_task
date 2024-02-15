import { useState } from "react";
import PropTypes from "prop-types";
import familyService from "../services/familyService";

const AddFamilyMemberForm = ({ onAdd, onCancel, familyMembers }) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    parentId: "",
    spouseId: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.age || isNaN(formData.age) || parseInt(formData.age) <= 0) {
      newErrors.age = "Age must be a positive number";
    }
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      const serializedData = {
        name: formData.name.trim(),
        age: parseInt(formData.age),
        gender: formData.gender,
        parentId: formData.parentId ? parseInt(formData.parentId) : null,
        spouseId: formData.spouseId ? parseInt(formData.spouseId) : null,
      };
      await familyService.addFamilyMember(serializedData);
      onAdd(serializedData);
    } catch (error) {
      console.error("Failed to add family member:", error.message);
      alert("Failed to add family member. Please try again.");
    }
  };

  return (
    <div className="main_form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            name="name"
            value={formData.name}
            placeholder="Name"
            onChange={handleChange}
            required
          />
          {errors.name && <div className="error">{errors.name}</div>}
        </div>
        <div className="form-group">
          <input
            type="number"
            name="age"
            value={formData.age}
            placeholder="Age"
            onChange={handleChange}
            required
            min="0"
            max="100"
          />
          {errors.age && <div className="error">{errors.age}</div>}
        </div>
        <div className="form-group">
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {errors.gender && <div className="error">{errors.gender}</div>}
        </div>
        <div className="form-group">
          <select
            name="parentId"
            value={formData.parentId}
            onChange={handleChange}
          >
            <option value="">Parent</option>
            {familyMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <select
            name="spouseId"
            value={formData.spouseId}
            onChange={handleChange}
          >
            <option value="">Spouse</option>
            {familyMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
        <div className="button-group">
          <button type="submit">Add</button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

AddFamilyMemberForm.propTypes = {
  onAdd: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  familyMembers: PropTypes.array.isRequired,
};

export default AddFamilyMemberForm;
