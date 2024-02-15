import { useContext, useState } from "react";
import { Tree } from "react-d3-tree";
import FamilyMember from "./FamilyMember";
import AddFamilyMemberForm from "./AddFamilyMemberForm";
import EditFamilyMemberForm from "./EditFamilyMemberForm";
import { FamilyContext } from "../context/FamilyContext";
import { IoAdd } from "react-icons/io5";

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
        <Tree
          data={treeData}
          translate={translate}
          zoomable={true}
          zoom={1}
          orientation="vertical"
          collapsible={true}
          separation={{ siblings: 1.5, nonSiblings: 2 }}
          zoomAndPan={{
            scaleExtent: [0.1, 5],
            translateExtent: { x: [-1000, 500], y: [-500, 500] },
            onZoom: onZoom,
          }}
        />
      </div>
      <div className="members">
        <h2>Family Member List</h2>
        <div className="main_container">
          <div className="family-members">
            {familyMembers.map((member) => (
              <FamilyMember
                key={member.id}
                member={{ ...member, age: parseInt(member.age) }}
                onDelete={() => handleDeleteMember(member.id)}
                onEdit={() => handleEditMember(member)}
              />
            ))}
          </div>
          <div className="add-member-section">
            {!showAddForm ? (
              <button onClick={() => setShowAddForm(true)} className="add">
                <IoAdd /> <p>Add Member</p>
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
