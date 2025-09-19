import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true,
    match: [/^EMP\d{4}$/, 'Employee ID must be in format EMP0001']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters'],
    match: [/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name cannot exceed 50 characters'],
    match: [/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\+?[\d\s\-\(\)]{10,15}$/, 'Please enter a valid phone number']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    enum: {
      values: ['HR', 'IT', 'Finance', 'Marketing', 'Operations', 'Sales', 'Engineering', 'Design'],
      message: 'Please select a valid department'
    }
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true,
    minlength: [2, 'Position must be at least 2 characters'],
    maxlength: [100, 'Position cannot exceed 100 characters']
  },
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
    min: [0, 'Salary cannot be negative'],
    max: [10000000, 'Salary seems too high']
  },
  hireDate: {
    type: Date,
    required: [true, 'Hire date is required'],
    validate: {
      validator: function(value) {
        return value <= new Date();
      },
      message: 'Hire date cannot be in the future'
    }
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['Active', 'Inactive', 'Terminated'],
      message: 'Status must be Active, Inactive, or Terminated'
    },
    default: 'Active'
  },
  // Authentication fields
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false 
  },
  hasAccount: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  accountCreatedAt: {
    type: Date
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
      maxlength: [200, 'Street address cannot exceed 200 characters']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [50, 'City cannot exceed 50 characters'],
      match: [/^[a-zA-Z\s]+$/, 'City can only contain letters and spaces']
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      maxlength: [50, 'State cannot exceed 50 characters'],
      match: [/^[a-zA-Z\s]+$/, 'State can only contain letters and spaces']
    },
    zipCode: {
      type: String,
      required: [true, 'ZIP code is required'],
      trim: true,
      match: [/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code']
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      default: 'United States',
      maxlength: [50, 'Country cannot exceed 50 characters']
    }
  },
  emergencyContact: {
    name: {
      type: String,
      required: [true, 'Emergency contact name is required'],
      trim: true,
      maxlength: [100, 'Emergency contact name cannot exceed 100 characters']
    },
    relationship: {
      type: String,
      required: [true, 'Emergency contact relationship is required'],
      trim: true,
      maxlength: [50, 'Relationship cannot exceed 50 characters']
    },
    phone: {
      type: String,
      required: [true, 'Emergency contact phone is required'],
      trim: true,
      match: [/^\+?[\d\s\-\(\)]{10,15}$/, 'Please enter a valid emergency contact phone']
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

employeeSchema.set('toJSON', { virtuals: true });
employeeSchema.set('toObject', { virtuals: true });

employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ email: 1 });
employeeSchema.index({ firstName: 1, lastName: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ status: 1 });

employeeSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

employeeSchema.methods.comparePassword = async function(enteredPassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

employeeSchema.methods.generateToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      employeeId: this.employeeId,
      role: 'employee'
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export default mongoose.model('Employee', employeeSchema);
