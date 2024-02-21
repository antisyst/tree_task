import { useContext, useState } from "react";
import AddFamilyMemberForm from "./AddFamilyMemberForm";
import EditFamilyMemberForm from "./EditFamilyMemberForm";
import { FamilyContext } from "../context/FamilyContext";
import FamilyMemberList from "./FamilyMemberList";
import { IoAdd } from "react-icons/io5";
import { Tooltip } from "react-tooltip";
import FamilyTreeDisplay from "./FamilyTreeDisplay";

const FamilyTree = () => {
  const {
    familyMembers,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
  } = useContext(FamilyContext);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editMember, setEditMember] = useState(null);

  const handleAddMember = async (newMember) => {
    try {
      await addFamilyMember(newMember);
      setShowAddForm(false);
    } catch (error) {
      console.error("Failed to add family member:", error);
    }
  };

  const handleDeleteMember = async (id) => {
    try {
      await deleteFamilyMember(id);
    } catch (error) {
      console.error("Failed to delete family member:", error);
    }
  };

  const handleEditMember = (member) => {
    setEditMember(member);
  };

  const handleUpdateMember = async (updatedMember) => {
    try {
      await updateFamilyMember(updatedMember.id, updatedMember);
      setEditMember(null);
    } catch (error) {
      console.error("Failed to update family member:", error);
    }
  };

  const getMemberNameById = (id) => {
    const member = familyMembers.find((member) => member.id === id);
    return member ? member.name : "";
  };

  const formatTreeData = () => {
    return {
      name: "Family Tree",
      children: familyMembers.map((member) => ({
        name: member.name,
        attributes: {
          Age: parseInt(member.age),
          Gender: member.gender,
          "Spouse Name": getMemberNameById(member.spouseId),
          "Parent Name": getMemberNameById(member.parentId),
        },
      })),
    };
  };

  const treeData = formatTreeData();

  const initialTranslate = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 6,
  };

  const [translate, setTranslate] = useState(initialTranslate);

  const onZoom = (event) => {
    setTranslate({ x: event.transform.x, y: event.transform.y });
  };

  return (
    <div className="family-tree-container">
      <div className="tree-container">
        <FamilyTreeDisplay
          treeData={treeData}
          translate={translate}
          onZoom={onZoom}
        />
      </div>
      <div className="members">
        <h2>Family Member List</h2>
        <div className="main_container">
          <FamilyMemberList
            familyMembers={familyMembers}
            onDelete={handleDeleteMember}
            onEdit={handleEditMember}
          />
          <div className="add-member-section">
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="add"
                data-tooltip-id="add-tooltip"
                data-tooltip-content="Add Member"
              >
                <Tooltip id="add-tooltip" />
                <IoAdd />
              </button>
            ) : (
              <AddFamilyMemberForm
                onAdd={handleAddMember}
                onCancel={() => setShowAddForm(false)}
                familyMembers={familyMembers}
              />
            )}
          </div>
          {editMember && (
            <EditFamilyMemberForm
              member={editMember}
              onUpdate={handleUpdateMember}
              onCancel={() => setEditMember(null)}
              familyMembers={familyMembers}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilyTree;
