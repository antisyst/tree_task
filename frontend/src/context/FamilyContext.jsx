import { createContext, useState, useEffect } from 'react';
import familyService from '../services/familyService';
import PropTypes from 'prop-types';

export const FamilyContext = createContext();

export const FamilyProvider = ({ children }) => {
  const [familyMembers, setFamilyMembers] = useState([]);

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      try {
        const members = await familyService.getAllFamilyMembers();
        setFamilyMembers(members);
      } catch (error) {
        console.error('Failed to fetch family members:', error);
      }
    };
    fetchFamilyMembers();
  }, []);

  const addFamilyMember = async (formData) => {
    try {
      const addedMember = await familyService.addFamilyMember(formData);
      setFamilyMembers([...familyMembers, addedMember]);
    } catch (error) {
      console.error('Failed to add family member:', error);
      throw error;
    }
  };

  const updateFamilyMember = async (id, formData) => {
    try {
      const updatedMember = await familyService.updateFamilyMember(id, formData);
      setFamilyMembers(familyMembers.map(member => member.id === id ? updatedMember : member));
    } catch (error) {
      console.error('Failed to update family member:', error);
      throw error;
    }
  };

  const deleteFamilyMember = async (id) => {
    try {
      await familyService.deleteFamilyMember(id);
      setFamilyMembers(familyMembers.filter(member => member.id !== id));
    } catch (error) {
      console.error('Failed to delete family member:', error);
      throw error;
    }
  };

  return (
    <FamilyContext.Provider value={{ familyMembers, addFamilyMember, updateFamilyMember, deleteFamilyMember }}>
      {children}
    </FamilyContext.Provider>
  );
};

FamilyProvider.propTypes = {
    children: PropTypes.node.isRequired,
};