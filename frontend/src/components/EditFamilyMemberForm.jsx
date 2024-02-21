import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";

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
        age: member.age.toString(),
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
      age: parseInt(formData.age),
    });
  };

  const memoizedFamilyMembers = useMemo(() => {
    return familyMembers.map((member) => (
      <option key={member.id} value={member.id}>
        {member.name}
      </option>
    ));
  }, [familyMembers]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="main_form"
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
        >
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
              </select>
            </div>
            <div className="form-group">
              <select
                name="parentId"
                value={formData.parentId}
                onChange={handleChange}
              >
                <option value="">Parent</option>
                {memoizedFamilyMembers}
              </select>
            </div>
            <div className="form-group">
              <select
                name="spouseId"
                value={formData.spouseId}
                onChange={handleChange}
              >
                <option value="">Spouse</option>
                {memoizedFamilyMembers}
              </select>
            </div>
            <div className="button-group">
              <button type="submit">Update</button>
              <button type="button" onClick={onCancel}>
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

EditFamilyMemberForm.propTypes = {
  member: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  familyMembers: PropTypes.array.isRequired,
};

export default EditFamilyMemberForm;
