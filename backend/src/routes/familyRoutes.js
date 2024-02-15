const express = require("express");
const router = express.Router();
const familyController = require("../controllers/familyController");
const { validateFamilyMember } = require("../utils/validators");

router.get("/", familyController.getAllFamilyMembers);
router.get("/:id", familyController.getFamilyMemberById);
router.post("/", validateFamilyMember, familyController.createFamilyMember);
router.put("/:id", validateFamilyMember, familyController.updateFamilyMember);
router.delete("/:id", familyController.deleteFamilyMember);
router.post("/:id/add-spouse/:spouseId", familyController.addSpouse);
router.post("/:parentId/add-child/:childId", familyController.addChild);

 

module.exports = router;
