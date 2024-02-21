# BACKEND

# Technologies Used

- Node.js
- Express.js
- Winston (for logging)
- Express-validator (for input validation)

# Setting Up the Backend
- Dependencies Installation: Navigate to the backend/ directory and run npm install to install the required dependencies.
- Starting the Server: Run `npm start` to start the backend server. By default, it will run on port 3001.

# API Endpoints
- GET /family: Get all family members.
- GET /family/:id: Get a family member by ID.
- POST /family: Add a new family member.
- PUT /family/:id: Update a family member.
- DELETE /family/:id: Delete a family member.
- POST /family/:id/add-spouse/:spouseId: Add spouse to a family member.
- POST /family/:parentId/add-child/:childId: Add child to a family member.

# FRONTEND

# Technologies Used
- React.js
- React D3 Tree (for rendering the family tree)
- Axios (for making HTTP requests)
- PropTypes (for type checking)

# Setting Up the Frontend
- Dependencies Installation: Navigate to the frontend/ directory and run npm install to install the required dependencies.
- Starting the Development Server: Run `npm run dev` to start the frontend development server. It will open the application in your default web browser.

# Components Overview
- AddFamilyMemberForm: Form component for adding a new family member.
- EditFamilyMemberForm: Form component for editing an existing family member.
- FamilyMember: Component to display information about a family member.
- FamilyTree: Component for visualizing the family tree.