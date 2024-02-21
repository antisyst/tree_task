// backend/src/controllers/familyController.js:

const { validationResult } = require('express-validator');
const { BadRequestError, NotFoundError } = require('../utils/customErrors');
const { createFamilyMemberRules, updateFamilyMemberRules } = require('../utils/validators');

let familyMembers = [
  { id: 1, name: "John Doe", age: 40, gender: "male", spouseId: 2, childrenIds: [3, 4], parentId: null },
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

// backend/src/middlewares/errorHandler.js: 

const fs = require('fs');
const path = require('path');
const { createLogger, transports } = require('winston');
const { CustomError, NotFoundError } = require('../utils/customErrors');

const logsDirectory = path.join(__dirname, '..', 'logs');

const logger = createLogger({
  transports: [
    new transports.File({ filename: path.join(logsDirectory, 'error.log'), level: 'error' }),
  ],
});

if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory);
}

const errorHandler = (err, req, res, next) => {
  logger.error(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${err.stack}`);

  let statusCode = 500;
  let errorMessage = 'Internal Server Error';

  if (err instanceof CustomError) {
    statusCode = err.statusCode;
    errorMessage = err.message;
  } else if (err instanceof NotFoundError) {
    statusCode = 404;
    errorMessage = err.message;
  }

  res.status(statusCode).json({ error: errorMessage });
};

module.exports = errorHandler;

// backend/src/routes/familyRoutes.js: 

const express = require("express");
const router = express.Router();
const familyController = require("../controllers/familyController");
const { validateFamilyMember } = require("../utils/validators");
const { NotFoundError } = require("../utils/customErrors");

router.get("/", familyController.getAllFamilyMembers);
router.get("/:id", familyController.getFamilyMemberById);
router.post("/", validateFamilyMember, familyController.createFamilyMember);
router.put("/:id", validateFamilyMember, familyController.updateFamilyMember);
router.delete("/:id", familyController.deleteFamilyMember);
router.post("/:id/add-spouse/:spouseId", familyController.addSpouse);
router.post("/:parentId/add-child/:childId", familyController.addChild);

router.use((req, res, next) => {
  const error = new NotFoundError("Route not found");
  next(error);
});

module.exports = router;

// backend/src/utils/customErrors.js: 

class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode || 500;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends CustomError {
  constructor(message) {
    super(message, 400);
  }
}

class NotFoundError extends CustomError {
  constructor(message) {
    super(message, 404);
  }
}

module.exports = { CustomError, BadRequestError, NotFoundError };
  
  // backend/src/utils/validators.js: 

  const { body, validationResult } = require('express-validator');

const createFamilyMemberRules = [
  body('name').notEmpty().withMessage('Name is required'),
  body('age').isInt({ min: 1 }).withMessage('Age must be a positive integer'),
  body('gender').isIn(['male', 'female']).withMessage('Gender must be either "male" or "female"'),
];

const updateFamilyMemberRules = [
  body('name').optional().notEmpty().withMessage('Name is required'),
  body('age').optional().isInt({ min: 1 }).withMessage('Age must be a positive integer'),
  body('gender').optional().isIn(['male', 'female']).withMessage('Gender must be either "male" or "female"'),
];

const validateFamilyMember = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { createFamilyMemberRules, updateFamilyMemberRules, validateFamilyMember };

// backend/src/config.js: 

module.exports = {
    port: process.env.PORT || 3001,
  };
  
// backend/src/server.js: 

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");
const familyRoutes = require("./routes/familyRoutes");

const config = require("./config");

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the Family Tree API!");
});

app.use("/family", familyRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || config.port;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// frontend/src/components/AddFamilyMemberForm.jsx:

import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import familyService from "../services/familyService";

const AddFamilyMemberForm = ({ onAdd, onCancel, familyMembers }) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    parentId: "",
    spouseId: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.age || isNaN(formData.age) || parseInt(formData.age) <= 0) {
      newErrors.age = "Age must be a positive number";
    }
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      const serializedData = {
        name: formData.name.trim(),
        age: parseInt(formData.age),
        gender: formData.gender,
        parentId: formData.parentId ? parseInt(formData.parentId) : null,
        spouseId: formData.spouseId ? parseInt(formData.spouseId) : null,
      };
      await familyService.addFamilyMember(serializedData);
      onAdd(serializedData);
    } catch (error) {
      console.error("Failed to add family member:", error.message);
      alert("Failed to add family member. Please try again.");
    }
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
        transition={{ duration: 0.2 }}
        className="main_form"
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
            {errors.name && <div className="error">{errors.name}</div>}
          </div>
          <div className="form-group">
            <input
              type="number"
              name="age"
              value={formData.age}
              placeholder="Age"
              onChange={handleChange}
              required
              min="0"
              max="100"
            />
            {errors.age && <div className="error">{errors.age}</div>}
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
            {errors.gender && <div className="error">{errors.gender}</div>}
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
            <button type="submit">Add</button>
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  );
};

AddFamilyMemberForm.propTypes = {
  onAdd: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  familyMembers: PropTypes.array.isRequired,
};

export default AddFamilyMemberForm;

// frontend/src/components/EditFamilyMemberForm.jsx:

import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

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

// frontend/src/components/FamilyMember.jsx:

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

// frontend/src/components/FamilyMemberList.jsx:

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

// frontend/src/components/FamilyTree.jsx:

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

// frontend/src/components/SearchBar.jsx:

import PropTypes from 'prop-types';

const SearchBar = ({ searchTerm, onSearchChange }) => {
  return (
    <input
      type="text"
      placeholder="Search by name..."
      value={searchTerm}
      className="search_bar"
      onChange={(e) => onSearchChange(e.target.value)}
    />
  );
};

SearchBar.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
};

export default SearchBar;


// frontend/src/components/FamilyTreeDisplay.jsx:

import PropTypes from "prop-types";
import { Tree } from "react-d3-tree";

const FamilyTreeDisplay = ({ treeData, translate, onZoom }) => {
  return (
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
  );
};

FamilyTreeDisplay.propTypes = {
  treeData: PropTypes.object.isRequired,
  translate: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }).isRequired,
  onZoom: PropTypes.func.isRequired,
};

export default FamilyTreeDisplay;

// frontend/src/context/FamilyContext.jsx:

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

// frontend/src/services/familyService.jsx:

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

// frontend/src/utils/api.jsx:

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;

// frontend/src/utils/App.jsx:

import FamilyTree from "./components/FamilyTree";
import { FamilyProvider } from "./context/FamilyContext";

function App() {
  return (
    <FamilyProvider>
      <FamilyTree/>
    </FamilyProvider>
  );
}

export default App;