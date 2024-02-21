import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import FamilyMember from "./FamilyMember";

const FamilyMemberList = ({ familyMembers, onDelete, onEdit }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMembers, setFilteredMembers] = useState([]);

  useEffect(() => {
    setFilteredMembers(
      familyMembers.filter((member) =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [familyMembers, searchTerm]);

  const handleDeleteClick = (id) => {
    setSelectedMemberId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    onDelete(selectedMemberId);
    setShowDeleteModal(false);
  };

  const handleCancelDelete = () => {
    setSelectedMemberId(null);
    setShowDeleteModal(false);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="members_layout">
      <input
        type="text"
        placeholder="Search by name..."
        value={searchTerm}
        className="search_bar"
        onChange={handleSearch}
      />
      <div className="family-members">
        {filteredMembers.map((member) => (
          <div key={member.id}>
            <FamilyMember
              member={{ ...member, age: parseInt(member.age) }}
              onDelete={() => handleDeleteClick(member.id)}
              onEdit={() => onEdit(member)}
            />
            <AnimatePresence>
              {showDeleteModal && selectedMemberId === member.id && (
                <motion.div
                  className="modal"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="modal-content"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                  >
                    <p>
                      Are you sure you want to delete <span>{member.name}</span>?
                    </p>
                    <div className="modal-buttons">
                      <button onClick={handleConfirmDelete}>Delete</button>
                      <button onClick={handleCancelDelete}>Cancel</button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

FamilyMemberList.propTypes = {
  familyMembers: PropTypes.array.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default FamilyMemberList;
