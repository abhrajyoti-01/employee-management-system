import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import Employee from '../models/Employee.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id, role: 'employee' }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// @desc    Register employee account (requires valid employee ID)
// @route   POST /api/employee-auth/register
// @access  Public
router.post('/register', [
  body('employeeId')
    .matches(/^EMP\d{4}$/)
    .withMessage('Employee ID must be in format EMP0001'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { employeeId, password } = req.body;

    // Check if employee exists in the system
    const employee = await Employee.findOne({ 
      employeeId,
      status: 'Active'
    });

    if (!employee) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID or employee is not active'
      });
    }

    // Check if employee already has an account
    if (employee.hasAccount) {
      return res.status(400).json({
        success: false,
        message: 'Employee account already exists. Please login instead.'
      });
    }

    // Create employee account
    employee.password = password;
    employee.hasAccount = true;
    employee.accountCreatedAt = new Date();
    await employee.save();

    // Generate token
    const token = generateToken(employee._id);

    res.status(201).json({
      success: true,
      message: 'Employee account created successfully',
      data: {
        employee: {
          id: employee._id,
          employeeId: employee.employeeId,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          department: employee.department,
          position: employee.position
        },
        token
      }
    });
  } catch (error) {
    console.error('Employee register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @desc    Login employee
// @route   POST /api/employee-auth/login
// @access  Public
router.post('/login', [
  body('employeeId')
    .notEmpty()
    .withMessage('Employee ID is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { employeeId, password } = req.body;

    // Check if employee exists and has an account
    const employee = await Employee.findOne({
      employeeId,
      hasAccount: true,
      status: 'Active'
    }).select('+password');

    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or no account exists'
      });
    }

    // Check password
    const isPasswordValid = await employee.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    employee.lastLogin = new Date();
    await employee.save();

    // Generate token
    const token = generateToken(employee._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        employee: {
          id: employee._id,
          employeeId: employee.employeeId,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          department: employee.department,
          position: employee.position,
          lastLogin: employee.lastLogin
        },
        token
      }
    });
  } catch (error) {
    console.error('Employee login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @desc    Get current employee
// @route   GET /api/employee-auth/me
// @access  Private (Employee)
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ensure it's an employee token
    if (decoded.role !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Employee account required.'
      });
    }

    const employee = await Employee.findById(decoded.id).select('-password');

    if (!employee || !employee.hasAccount) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found or account not active'
      });
    }

    res.json({
      success: true,
      data: {
        employee: {
          id: employee._id,
          employeeId: employee.employeeId,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          department: employee.department,
          position: employee.position,
          lastLogin: employee.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Get employee me error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

export default router;
