const { validationResult } = require('express-validator');
const { BadRequestError, NotFoundError } = require('../utils/customErrors');
const { createFamilyMemberRules, updateFamilyMemberRules } = require('../utils/validators');

let familyMembers = [
  { id: 1, name: "John Doe", age: 40, gender: "male", spouseId: 2, childrenIds: [3, 4], parentId: 4 },
  { id: 2, name: "Jane Doe", age: 35, gender: "female", spouseId: 1, childrenIds: [3, 4], parentId: null },
  { id: 3, name: "Alice Doe", age: 10, gender: "female", parentId: 1, spouseId: null },
  { id: 4, name: "Bob Doe", age: 8, gender: "male", parentId: 1, spouseId: null },
];

const familyController = {
  getAllFamilyMembers: async (req, res, next) => {
    try {
      res.json(familyMembers);
    } catch (error) {
      next(error);
    }
  },


  getFamilyMemberById: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const familyMember = familyMembers.find(member => member.id === id);
      if (!familyMember) {
        throw new NotFoundError(`Family member with ID ${id} not found`);
      } else {
        res.json(familyMember);
      }
    } catch (error) {
      next(error);
    }
  },

  createFamilyMember: [
    createFamilyMemberRules,

    async (req, res, next) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          throw new BadRequestError(errors.array().map(error => error.msg).join(', '));
        }

        const newMember = req.body;
        newMember.id = familyMembers.length > 0 ? Math.max(...familyMembers.map(member => member.id)) + 1 : 1;

        const existingMember = familyMembers.find(member => member.id === newMember.id);
        if (existingMember) {
          throw new BadRequestError(`Family member with ID ${newMember.id} already exists`);
        }

        familyMembers.push(newMember);
        res.status(201).json(newMember);
      } catch (error) {
        next(error);
      }
    }
  ],

  updateFamilyMember: [
    updateFamilyMemberRules,

    async (req, res, next) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          throw new BadRequestError(errors.array().map(error => error.msg).join(', '));
        }

        const id = parseInt(req.params.id);
        const updatedMemberIndex = familyMembers.findIndex(member => member.id === id);
        if (updatedMemberIndex === -1) {
          throw new NotFoundError(`Family member with ID ${id} not found`);
        }
        familyMembers[updatedMemberIndex] = { ...familyMembers[updatedMemberIndex], ...req.body };
        res.json(familyMembers[updatedMemberIndex]);
      } catch (error) {
        next(error);
      }
    }
  ],

  deleteFamilyMember: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const deletedIndex = familyMembers.findIndex(member => member.id === id);
      if (deletedIndex === -1) {
        throw new NotFoundError(`Family member with ID ${id} not found`);
      } else {
        const deletedMember = familyMembers.splice(deletedIndex, 1)[0];
        res.json({ message: `Family member with ID ${id} deleted successfully`, deletedMember });
      }
    } catch (error) {
      next(error);
    }
  },

  addSpouse: async (req, res, next) => {
    try {
      const { memberId, spouseId } = req.body;

      const member = familyMembers.find(member => member.id === memberId);
      const spouse = familyMembers.find(member => member.id === spouseId);
      if (!member || !spouse || member.spouseId || spouse.spouseId === memberId) {
        throw new BadRequestError('Invalid spouse relationship');
      }

      member.spouseId = spouseId;
      spouse.spouseId = memberId;
      res.json(member);
    } catch (error) {
      next(error);
    }
  },

  addChild: async (req, res, next) => {
    try {
      const { parentId, childId } = req.body;

      const parent = familyMembers.find(member => member.id === parentId);
      const child = familyMembers.find(member => member.id === childId);
      if (!parent || !child || parent.childrenIds.includes(childId)) {
        throw new BadRequestError('Invalid child relationship');
      }

      parent.childrenIds.push(childId);
      child.parentId = parentId;
      res.json(parent);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = familyController;