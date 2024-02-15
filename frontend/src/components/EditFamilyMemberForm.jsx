import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";

const EditFamilyMemberForm = ({
  member,
  onUpdate,
  onCancel,
  familyMembers,
}) => {
  const initialFormData = useMemo(
    () => ({
      name: "",
      age: "",
      gender: "",
      parentId: null,
      spouseId: null,
    }),
    []
  );

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (member) {
      setFormData({
        ...member,
        age: member.age.toString(), // Convert age to string for input field
      });
    } else {
      setFormData(initialFormData);
    }
  }, [member, initialFormData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({
      ...formData,
      age: parseInt(formData.age), // Convert age to number before updating
    });
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
        </div>
        <div className="form-group">
          <input
            type="number"
            name="age"
            value={formData.age}
            placeholder="Age"
            onChange={handleChange}
            required
          />
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
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <select
            name="parentId"
            value={formData.parentId || ""}
            onChange={handleChange}
          >
            <option value="">None</option>
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
            value={formData.spouseId || ""}
            onChange={handleChange}
          >
            <option value="">None</option>
            {familyMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
        <div className="button-group">
          <button type="submit">Update</button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

EditFamilyMemberForm.propTypes = {
  member: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    age: PropTypes.number.isRequired,
    gender: PropTypes.string.isRequired,
    parentId: PropTypes.number,
    spouseId: PropTypes.number,
  }),
  onUpdate: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  familyMembers: PropTypes.array.isRequired,
};

export default EditFamilyMemberForm;
