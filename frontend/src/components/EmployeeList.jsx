"use client"

import { useState } from "react"
import "./EmployeeList.css"

const EmployeeList = ({
  employees,
  loading,
  error,
  pagination,
  filters,
  onFilterChange,
  onPageChange,
  onEdit,
  onDelete,
  onAddNew,
  onRetry,
}) => {
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [viewMode, setViewMode] = useState("grid") // grid or table

  const departments = ["HR", "IT", "Finance", "Marketing", "Operations", "Sales", "Engineering", "Design"]
  const statuses = ["Active", "Inactive", "Terminated"]

  const handleSearchChange = (e) => {
    onFilterChange({ search: e.target.value })
  }

  const handleDepartmentChange = (e) => {
    onFilterChange({ department: e.target.value })
  }

  const handleStatusChange = (e) => {
    onFilterChange({ status: e.target.value })
  }

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId) ? prev.filter((id) => id !== employeeId) : [...prev, employeeId],
    )
  }

  const handleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([])
    } else {
      setSelectedEmployees(employees.map((emp) => emp._id))
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getStatusBadge = (status) => {
    const statusClasses = {
      Active: "status-active",
      Inactive: "status-inactive",
      Terminated: "status-terminated",
    }
    return `status-badge ${statusClasses[status] || ""}`
  }

  const renderPagination = () => {
    if (!pagination || pagination.pages <= 1) return null

    const pages = []
    const { current, pages: totalPages } = pagination

    // Previous button
    pages.push(
      <button key="prev" onClick={() => onPageChange(current - 1)} disabled={current === 1} className="pagination-btn">
        ← Previous
      </button>,
    )

    // Page numbers
    for (let i = Math.max(1, current - 2); i <= Math.min(totalPages, current + 2); i++) {
      pages.push(
        <button key={i} onClick={() => onPageChange(i)} className={`pagination-btn ${i === current ? "active" : ""}`}>
          {i}
        </button>,
      )
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => onPageChange(current + 1)}
        disabled={current === totalPages}
        className="pagination-btn"
      >
        Next →
      </button>,
    )

    return <div className="pagination">{pages}</div>
  }

  return (
    <div className="employee-list-container">
      <div className="list-header">
        <div className="header-content">
          <div>
            <h1 className="content-title">Employee Dashboard</h1>
            <p className="content-subtitle">Manage and track your organization's workforce</p>
          </div>
          <div className="header-stats">
            <div className="stat-mini">
              <span className="stat-number">{employees.filter((e) => e.status === "Active").length}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-mini">
              <span className="stat-number">{pagination?.total || employees.length}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-mini">
              <span className="stat-number">{departments.length}</span>
              <span className="stat-label">Departments</span>
            </div>
          </div>
        </div>
        <button className="add-employee-btn" onClick={onAddNew}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Employee
        </button>
      </div>

      <div className="filters-section">
        <div className="filters-top-row">
          <div className="search-container">
            <div className="search-input-wrapper">
              <svg
                className="search-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search employees by name, email, position or ID..."
                value={filters.search || ""}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>
          </div>

          <div className="view-controls">
            <div className="display-options">
              <span className="display-label">View as:</span>
              <div className="view-toggle">
                <button
                  className={`view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
                  onClick={() => setViewMode("grid")}
                  title="Card View"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                  </svg>
                </button>
                <button
                  className={`view-toggle-btn ${viewMode === "table" ? "active" : ""}`}
                  onClick={() => setViewMode("table")}
                  title="Table View"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="filters-bottom-row">
          <div className="filter-tabs">
            <div className="filter-group">
              <label className="filter-label">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                Department
              </label>
              <select value={filters.department || ""} onChange={handleDepartmentChange} className="filter-select">
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
                Status
              </label>
              <select value={filters.status || ""} onChange={handleStatusChange} className="filter-select">
                <option value="">All Statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Records per page
              </label>
              <select
                value={filters.limit || 10}
                onChange={(e) => onFilterChange({ limit: Number.parseInt(e.target.value) })}
                className="filter-select"
              >
                <option value={5}>5 records</option>
                <option value={10}>10 records</option>
                <option value={25}>25 records</option>
                <option value={50}>50 records</option>
              </select>
            </div>
          </div>

          {Object.values(filters).some((val) => val && val !== 10 && val !== "") && (
            <button
              className="clear-filters-btn"
              onClick={() =>
                onFilterChange({
                  search: "",
                  department: "",
                  status: "",
                  limit: 10,
                  page: 1,
                })
              }
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <div className="error-content">
            <svg
              className="error-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
            {onRetry && (
              <button onClick={onRetry} className="retry-btn">
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-grid">
          {[...Array(viewMode === "grid" ? 6 : 3)].map((_, index) => (
            <div key={index} className={`${viewMode === "grid" ? "employee-card" : "employee-row"} skeleton`}>
              <div className="skeleton-avatar"></div>
              <div className="skeleton-content">
                <div className="skeleton-line skeleton-line-long"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line skeleton-line-short"></div>
              </div>
            </div>
          ))}
        </div>
      ) : employees.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <h3>No employees found</h3>
          <p>
            {filters.search || filters.department || filters.status
              ? "Try adjusting your search criteria or filters above."
              : "Get started by adding your first employee using the button above."}
          </p>
          {!filters.search && !filters.department && !filters.status && (
            <button className="add-employee-btn empty-cta" onClick={onAddNew}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Your First Employee
            </button>
          )}
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <>
              <div className={`employees-grid ${selectedEmployees.length > 0 ? "selection-mode" : ""}`}>
                {employees.map((employee) => (
                  <div
                    key={employee._id}
                    className={`employee-card ${selectedEmployees.includes(employee._id) ? "selected" : ""}`}
                    onClick={() => selectedEmployees.length === 0 && onEdit?.(employee)}
                  >
                    <div className="card-header">
                      <div className="selection-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(employee._id)}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleSelectEmployee(employee._id)
                          }}
                        />
                      </div>

                      <div className="employee-avatar">
                        {employee.firstName?.charAt(0)}
                        {employee.lastName?.charAt(0)}
                      </div>

                      <div className="employee-primary">
                        <h3 className="employee-name">
                          {employee.fullName || `${employee.firstName} ${employee.lastName}`}
                        </h3>
                        <span className="employee-id">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ marginRight: "4px", opacity: 0.5 }}
                          >
                            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                          </svg>
                          {employee.employeeId}
                        </span>
                      </div>

                      <div className="card-actions">
                        <button
                          className="action-btn quick-edit"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit?.(employee)
                          }}
                          title="Edit Employee"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          className="action-btn quick-delete"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete?.(employee._id)
                          }}
                          title="Remove Employee"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="card-body">
                      <div className="employee-details-grid">
                        <div className="detail-item">
                          <span className="detail-label">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="detail-icon"
                            >
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                              <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            Email
                          </span>
                          <span className="detail-value">{employee.email}</span>
                        </div>

                        <div className="detail-item">
                          <span className="detail-label">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="detail-icon"
                            >
                              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                            </svg>
                            Department
                          </span>
                          <span className="detail-value detail-badge">{employee.department}</span>
                        </div>

                        <div className="detail-item">
                          <span className="detail-label">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="detail-icon"
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            Position
                          </span>
                          <span className="detail-value">{employee.position}</span>
                        </div>

                        <div className="detail-item">
                          <span className="detail-label">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="detail-icon"
                            >
                              <line x1="12" y1="1" x2="12" y2="23"></line>
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                            Salary
                          </span>
                          <span className="detail-value detail-salary">{formatCurrency(employee.salary)}</span>
                        </div>

                        <div className="detail-item status-item">
                          <span className="detail-label">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="detail-icon"
                            >
                              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                            </svg>
                            Status
                          </span>
                          <span className={`status-badge ${getStatusBadge(employee.status)}`}>{employee.status}</span>
                        </div>

                        <div className="detail-item">
                          <span className="detail-label">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="detail-icon"
                            >
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            Hire Date
                          </span>
                          <span className="detail-value">{formatDate(employee.hireDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="card-footer">
                      <div className="employee-meta">
                        <span className="meta-item">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="meta-icon"
                          >
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
                          </svg>
                          {employee.phone || "No phone"}
                        </span>
                      </div>
                      <div className="action-bar">
                        <button
                          className="action-btn edit-primary"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit?.(employee)
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ marginRight: "4px" }}
                          >
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="list-footer">
                <div className="footer-left">
                  <div className="results-info">
                    Showing <strong>{employees.length}</strong> of <strong>{pagination?.total || 0}</strong> employees
                    {selectedEmployees.length > 0 && (
                      <span className="selection-info">
                        • <strong>{selectedEmployees.length}</strong> selected
                        <button
                          className="bulk-action-btn"
                          onClick={() => {
                            // Handle bulk actions
                            console.log("Bulk action for:", selectedEmployees)
                          }}
                        >
                          Bulk Actions{" "}
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </button>
                      </span>
                    )}
                  </div>
                </div>

                <div className="pagination-container">{renderPagination()}</div>
              </div>
            </>
          ) : (
            <>
              <div className="employees-table-wrapper">
                <table className="employees-table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={selectedEmployees.length === employees.length && employees.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Position</th>
                      <th>Salary</th>
                      <th>Status</th>
                      <th>Hire Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee._id} className={selectedEmployees.includes(employee._id) ? "selected" : ""}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedEmployees.includes(employee._id)}
                            onChange={(e) => handleSelectEmployee(employee._id)}
                          />
                        </td>
                        <td className="employee-cell">
                          <div className="employee-cell-content">
                            <div className="employee-avatar table-avatar">
                              {employee.firstName?.charAt(0)}
                              {employee.lastName?.charAt(0)}
                            </div>
                            <div className="employee-info">
                              <div className="employee-name">
                                {employee.fullName || `${employee.firstName} ${employee.lastName}`}
                              </div>
                              <div className="employee-email">{employee.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>{employee.department}</td>
                        <td>{employee.position}</td>
                        <td>{formatCurrency(employee.salary)}</td>
                        <td>
                          <span className={`status-badge ${getStatusBadge(employee.status)}`}>{employee.status}</span>
                        </td>
                        <td>{formatDate(employee.hireDate)}</td>
                        <td>
                          <div className="table-actions">
                            <button className="action-btn" onClick={() => onEdit?.(employee)} title="Edit">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>
                            <button className="action-btn" onClick={() => onDelete?.(employee._id)} title="Delete">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="list-footer">
                <div className="footer-left">
                  <div className="results-info">
                    Showing <strong>{employees.length}</strong> of <strong>{pagination?.total || 0}</strong> employees
                    {selectedEmployees.length > 0 && (
                      <span className="selection-info">
                        • <strong>{selectedEmployees.length}</strong> selected
                        <button
                          className="bulk-action-btn"
                          onClick={() => {
                            // Handle bulk actions
                            console.log("Bulk action for:", selectedEmployees)
                          }}
                        >
                          Bulk Actions{" "}
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </button>
                      </span>
                    )}
                  </div>
                </div>

                <div className="pagination-container">{renderPagination()}</div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default EmployeeList
