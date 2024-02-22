import api from "../utils/api";

const familyService = {
  getAllFamilyMembers: async () => {
    try {
      const response = await api.get("/family");
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch family members");
    }
  },

  getFamilyMemberById: async (id) => {
    try {
      const response = await api.get(`/family/${id}`);
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch family member");
    }
  },

  addFamilyMember: async (formData) => {
    try {
      const response = await api.post("/family", formData);
      return response.data;
    } catch (error) {
      throw new Error("Failed to add family member");
    }
  },

  updateFamilyMember: async (id, formData) => {
    try {
      const response = await api.put(`/family/${id}`, formData);
      return response.data;
    } catch (error) {
      throw new Error("Failed to update family member");
    }
  },

  deleteFamilyMember: async (id) => {
    try {
      await api.delete(`/family/${id}`);
    } catch (error) {
      throw new Error("Failed to delete family member");
    }
  },

  addSpouse: async (memberId, spouseId) => {
    try {
      const response = await api.post(`/family/add-spouse`, { memberId, spouseId });
      return response.data;
    } catch (error) {
      throw new Error("Failed to add spouse");
    }
  },

  addChild: async (parentId, childId) => {
    try {
      const response = await api.post(`/family/add-child`, { parentId, childId });
      return response.data;
    } catch (error) {
      throw new Error("Failed to add child");
    }
  }
};

export default familyService;
