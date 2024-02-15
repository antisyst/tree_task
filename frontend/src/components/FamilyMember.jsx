import PropTypes from 'prop-types';

const FamilyMember = ({ member, onDelete, onEdit }) => {
  return (
    <div className="family-member">
      <div className="info">
        <div className="name">{member.name}</div>
        <div className="age">Age: {member.age}</div>
        <div className="gender">Gender: {member.gender}</div>
      </div>
      <div className="actions">
        <button className="edit-button" onClick={onEdit}>
          Edit
        </button>
        <button className="delete-button" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
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
