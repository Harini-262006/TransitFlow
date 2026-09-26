const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getEmployees)
  .post(authorize('manager'), createEmployee);

router.route('/:id')
  .get(getEmployeeById)
  .patch(authorize('manager'), updateEmployee)
  .put(authorize('manager'), updateEmployee)
  .delete(authorize('manager'), deleteEmployee);

module.exports = router;
