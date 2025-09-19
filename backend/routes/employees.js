import express from 'express';
import { body, validationResult, param, query } from 'express-validator';
import Employee from '../models/Employee.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

const employeeValidationRules = [
  body('employeeId')
    .matches(/^EMP\d{4}$/)
    .withMessage('Employee ID must be in format EMP0001'),
  body('firstName')
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name must be 2-50 characters and contain only letters'),
  body('lastName')
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name must be 2-50 characters and contain only letters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('phone')
    .matches(/^\+?[\d\s\-\(\)]{10,15}$/)
    .withMessage('Please enter a valid phone number'),
  body('department')
    .isIn(['HR', 'IT', 'Finance', 'Marketing', 'Operations', 'Sales', 'Engineering', 'Design'])
    .withMessage('Please select a valid department'),
  body('position')
    .isLength({ min: 2, max: 100 })
    .withMessage('Position must be 2-100 characters'),
  body('salary')
    .isNumeric()
    .isFloat({ min: 0, max: 10000000 })
    .withMessage('Salary must be a valid number between 0 and 10,000,000'),
  body('hireDate')
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (value > new Date()) {
        throw new Error('Hire date cannot be in the future');
      }
      return true;
    }),
  body('status')
    .optional()
    .isIn(['Active', 'Inactive', 'Terminated'])
    .withMessage('Status must be Active, Inactive, or Terminated'),
  body('address.street')
    .isLength({ min: 1, max: 200 })
    .withMessage('Street address is required and cannot exceed 200 characters'),
  body('address.city')
    .matches(/^[a-zA-Z\s]+$/)
    .isLength({ min: 1, max: 50 })
    .withMessage('City must contain only letters and spaces, max 50 characters'),
  body('address.state')
    .matches(/^[a-zA-Z\s]+$/)
    .isLength({ min: 1, max: 50 })
    .withMessage('State must contain only letters and spaces, max 50 characters'),
  body('address.zipCode')
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Please enter a valid ZIP code'),
  body('address.country')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Country cannot exceed 50 characters'),
  body('emergencyContact.name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Emergency contact name is required, max 100 characters'),
  body('emergencyContact.relationship')
    .isLength({ min: 1, max: 50 })
    .withMessage('Emergency contact relationship is required, max 50 characters'),
  body('emergencyContact.phone')
    .matches(/^\+?[\d\s\-\(\)]{10,15}$/)
    .withMessage('Please enter a valid emergency contact phone number')
];


router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('department').optional().isIn(['HR', 'IT', 'Finance', 'Marketing', 'Operations', 'Sales', 'Engineering', 'Design']),
  query('status').optional().isIn(['Active', 'Inactive', 'Terminated']),
  query('search').optional().isLength({ max: 100 }).withMessage('Search term cannot exceed 100 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    let filter = {};
    
    if (req.query.department) {
      filter.department = req.query.department;
    }
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { employeeId: searchRegex },
        { position: searchRegex }
      ];
    }

    // Get employees with pagination
    const employees = await Employee.find(filter)
      .populate('createdBy', 'username')
      .populate('updatedBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Employee.countDocuments(filter);

    res.json({
      success: true,
      data: {
        employees,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching employees'
    });
  }
});

router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid employee ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const employee = await Employee.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: { employee }
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching employee'
    });
  }
});

router.post('/', employeeValidationRules, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const existingEmployee = await Employee.findOne({
      $or: [
        { employeeId: req.body.employeeId },
        { email: req.body.email }
      ]
    });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this ID or email already exists'
      });
    }

    const employeeData = {
      ...req.body,
      createdBy: req.admin._id
    };

    const employee = await Employee.create(employeeData);

    await employee.populate('createdBy', 'username email');

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: { employee }
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating employee'
    });
  }
});

router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid employee ID'),
  ...employeeValidationRules
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const existingEmployee = await Employee.findOne({
      $or: [
        { employeeId: req.body.employeeId },
        { email: req.body.email }
      ],
      _id: { $ne: req.params.id }
    });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this ID or email already exists'
      });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.admin._id
    };

    employee = await Employee.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy updatedBy', 'username email');

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: { employee }
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating employee'
    });
  }
});


router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid employee ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    await Employee.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Employee deleted successfully',
      data: { deletedEmployee: employee }
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting employee'
    });
  }
});

// @desc    Get employee statistics
// @route   GET /api/employees/stats/overview
// @access  Private
router.get('/stats/overview', async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'Active' });
    const inactiveEmployees = await Employee.countDocuments({ status: 'Inactive' });
    const terminatedEmployees = await Employee.countDocuments({ status: 'Terminated' });

    const departmentStats = await Employee.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          avgSalary: { $avg: '$salary' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          total: totalEmployees,
          active: activeEmployees,
          inactive: inactiveEmployees,
          terminated: terminatedEmployees
        },
        departments: departmentStats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
});

export default router;