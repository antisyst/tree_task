import PropTypes from "prop-types";
import { Tooltip } from "react-tooltip";
import { motion } from "framer-motion";

const FamilyMember = ({ member, onDelete, onEdit }) => {
  return (
    <motion.div
      key={member.id}
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: member.id * 0.1 }}
      className="family-member"
    >
      <div className="info">
        <div className="age">Name: {member.name}</div>
        <div className="age">Age: {member.age}</div>
        <div className="gender">Gender: {member.gender}</div>
      </div>
      <div className="actions">
        <button
          className="edit-button"
          onClick={onEdit}
          data-tooltip-id="edit-tooltip"
          data-tooltip-content="Edit"
        >
          Edit
        </button>
        <button
          className="delete-button"
          onClick={onDelete}
          data-tooltip-id="delete-tooltip"
          data-tooltip-content="Delete"
        >
          Delete
        </button>
        <Tooltip id="edit-tooltip" />
        <Tooltip id="delete-tooltip" />
      </div>
    </motion.div>
  );
};

FamilyMember.propTypes = {
  member: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    age: PropTypes.number.isRequired,
    gender: PropTypes.string.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default FamilyMember;
