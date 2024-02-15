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
