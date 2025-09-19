import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import './EmployeeForm.css';

const employeeSchema = yup.object({
  employeeId: yup
    .string()
    .required('Employee ID is required')
    .matches(/^EMP\d{4}$/, 'Employee ID must be in format EMP0001'),
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^\+?[\d\s\-\(\)]{10,15}$/, 'Please enter a valid phone number'),
  department: yup
    .string()
    .required('Department is required')
    .oneOf(['HR', 'IT', 'Finance', 'Marketing', 'Operations', 'Sales', 'Engineering', 'Design']),
  position: yup
    .string()
    .required('Position is required')
    .min(2, 'Position must be at least 2 characters')
    .max(100, 'Position cannot exceed 100 characters'),
  salary: yup
    .number()
    .required('Salary is required')
    .positive('Salary must be positive')
    .max(10000000, 'Salary seems too high'),
  hireDate: yup
    .date()
    .required('Hire date is required')
    .max(new Date(), 'Hire date cannot be in the future'),
  status: yup
    .string()
    .oneOf(['Active', 'Inactive', 'Terminated'], 'Invalid status'),
  address: yup.object({
    street: yup
      .string()
      .required('Street address is required')
      .max(200, 'Street address cannot exceed 200 characters'),
    city: yup
      .string()
      .required('City is required')
      .max(50, 'City cannot exceed 50 characters')
      .matches(/^[a-zA-Z\s]+$/, 'City can only contain letters and spaces'),
    state: yup
      .string()
      .required('State is required')
      .max(50, 'State cannot exceed 50 characters')
      .matches(/^[a-zA-Z\s]+$/, 'State can only contain letters and spaces'),
    zipCode: yup
      .string()
      .required('ZIP code is required')
      .matches(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code'),
    country: yup
      .string()
      .max(50, 'Country cannot exceed 50 characters')
  }),
  emergencyContact: yup.object({
    name: yup
      .string()
      .required('Emergency contact name is required')
      .max(100, 'Name cannot exceed 100 characters'),
    relationship: yup
      .string()
      .required('Relationship is required')
      .max(50, 'Relationship cannot exceed 50 characters'),
    phone: yup
      .string()
      .required('Emergency contact phone is required')
      .matches(/^\+?[\d\s\-\(\)]{10,15}$/, 'Please enter a valid phone number')
  })
});

const EmployeeForm = ({ employee, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const isEditMode = !!employee;

  const defaultValues = employee ? {
    employeeId: employee.employeeId,
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    phone: employee.phone,
    department: employee.department,
    position: employee.position,
    salary: employee.salary,
    hireDate: new Date(employee.hireDate).toISOString().split('T')[0],
    status: employee.status || 'Active',
    address: {
      street: employee.address?.street || '',
      city: employee.address?.city || '',
      state: employee.address?.state || '',
      zipCode: employee.address?.zipCode || '',
      country: employee.address?.country || 'United States'
    },
    emergencyContact: {
      name: employee.emergencyContact?.name || '',
      relationship: employee.emergencyContact?.relationship || '',
      phone: employee.emergencyContact?.phone || ''
    }
  } : {
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    salary: '',
    hireDate: '',
    status: 'Active',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(employeeSchema),
    defaultValues
  });

  const handleFormSubmit = async (data) => {
    try {
      setLoading(true);
      setSubmitError(null);
      
      // Convert salary to number
      const formattedData = {
        ...data,
        salary: parseFloat(data.salary)
      };
      
      await onSubmit(formattedData);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save employee';
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  const departments = ['HR', 'IT', 'Finance', 'Marketing', 'Operations', 'Sales', 'Engineering', 'Design'];
  const statuses = ['Active', 'Inactive', 'Terminated'];

  return (
    <div className="form-overlay">
      <div className="employee-form-container">
        <div className="form-header">
          <h2>{isEditMode ? 'Edit Employee' : 'Add New Employee'}</h2>
          <button className="close-btn" onClick={onCancel}>✕</button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="employee-form">
          {submitError && (
            <div className="error-message">
              {submitError}
            </div>
          )}

          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="employeeId">Employee ID *</label>
                <input
                  type="text"
                  id="employeeId"
                  {...register('employeeId')}
                  className={errors.employeeId ? 'error' : ''}
                  placeholder="EMP0001"
                />
                {errors.employeeId && (
                  <span className="field-error">{errors.employeeId.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  {...register('status')}
                  className={errors.status ? 'error' : ''}
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                {errors.status && (
                  <span className="field-error">{errors.status.message}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  {...register('firstName')}
                  className={errors.firstName ? 'error' : ''}
                  placeholder="John"
                />
                {errors.firstName && (
                  <span className="field-error">{errors.firstName.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  {...register('lastName')}
                  className={errors.lastName ? 'error' : ''}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <span className="field-error">{errors.lastName.message}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  {...register('email')}
                  className={errors.email ? 'error' : ''}
                  placeholder="john.doe@company.com"
                />
                {errors.email && (
                  <span className="field-error">{errors.email.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  {...register('phone')}
                  className={errors.phone ? 'error' : ''}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && (
                  <span className="field-error">{errors.phone.message}</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Employment Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="department">Department *</label>
                <select
                  id="department"
                  {...register('department')}
                  className={errors.department ? 'error' : ''}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {errors.department && (
                  <span className="field-error">{errors.department.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="position">Position *</label>
                <input
                  type="text"
                  id="position"
                  {...register('position')}
                  className={errors.position ? 'error' : ''}
                  placeholder="Software Engineer"
                />
                {errors.position && (
                  <span className="field-error">{errors.position.message}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="salary">Annual Salary *</label>
                <input
                  type="number"
                  id="salary"
                  {...register('salary')}
                  className={errors.salary ? 'error' : ''}
                  placeholder="75000"
                  min="0"
                  step="1000"
                />
                {errors.salary && (
                  <span className="field-error">{errors.salary.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="hireDate">Hire Date *</label>
                <input
                  type="date"
                  id="hireDate"
                  {...register('hireDate')}
                  className={errors.hireDate ? 'error' : ''}
                />
                {errors.hireDate && (
                  <span className="field-error">{errors.hireDate.message}</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Address Information</h3>
            <div className="form-group">
              <label htmlFor="address.street">Street Address *</label>
              <input
                type="text"
                id="address.street"
                {...register('address.street')}
                className={errors.address?.street ? 'error' : ''}
                placeholder="123 Main Street"
              />
              {errors.address?.street && (
                <span className="field-error">{errors.address.street.message}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address.city">City *</label>
                <input
                  type="text"
                  id="address.city"
                  {...register('address.city')}
                  className={errors.address?.city ? 'error' : ''}
                  placeholder="New York"
                />
                {errors.address?.city && (
                  <span className="field-error">{errors.address.city.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="address.state">State *</label>
                <input
                  type="text"
                  id="address.state"
                  {...register('address.state')}
                  className={errors.address?.state ? 'error' : ''}
                  placeholder="New York"
                />
                {errors.address?.state && (
                  <span className="field-error">{errors.address.state.message}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address.zipCode">ZIP Code *</label>
                <input
                  type="text"
                  id="address.zipCode"
                  {...register('address.zipCode')}
                  className={errors.address?.zipCode ? 'error' : ''}
                  placeholder="10001"
                />
                {errors.address?.zipCode && (
                  <span className="field-error">{errors.address.zipCode.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="address.country">Country</label>
                <input
                  type="text"
                  id="address.country"
                  {...register('address.country')}
                  className={errors.address?.country ? 'error' : ''}
                  placeholder="United States"
                />
                {errors.address?.country && (
                  <span className="field-error">{errors.address.country.message}</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Emergency Contact</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="emergencyContact.name">Contact Name *</label>
                <input
                  type="text"
                  id="emergencyContact.name"
                  {...register('emergencyContact.name')}
                  className={errors.emergencyContact?.name ? 'error' : ''}
                  placeholder="Jane Doe"
                />
                {errors.emergencyContact?.name && (
                  <span className="field-error">{errors.emergencyContact.name.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="emergencyContact.relationship">Relationship *</label>
                <input
                  type="text"
                  id="emergencyContact.relationship"
                  {...register('emergencyContact.relationship')}
                  className={errors.emergencyContact?.relationship ? 'error' : ''}
                  placeholder="Spouse"
                />
                {errors.emergencyContact?.relationship && (
                  <span className="field-error">{errors.emergencyContact.relationship.message}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="emergencyContact.phone">Contact Phone *</label>
              <input
                type="tel"
                id="emergencyContact.phone"
                {...register('emergencyContact.phone')}
                className={errors.emergencyContact?.phone ? 'error' : ''}
                placeholder="+1 (555) 987-6543"
              />
              {errors.emergencyContact?.phone && (
                <span className="field-error">{errors.emergencyContact.phone.message}</span>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEditMode ? 'Update Employee' : 'Create Employee')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;