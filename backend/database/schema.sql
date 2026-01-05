-- Create database schema for leave management system

-- Users table (faculty and approvers)
CREATE TABLE users (
    uid SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL, -- 'faculty', 'hod', 'dean', 'registrar', etc.
    level INTEGER NOT NULL, -- 1=faculty, 2=hod, 3=dean, 4=registrar, etc.
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leave applications table
CREATE TABLE leave_applications (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER REFERENCES users(uid) ON DELETE CASCADE,
    voice_blob_name VARCHAR(500) NOT NULL, -- URL or filename of voice message
    leave_type VARCHAR(100) DEFAULT 'general', -- sick, casual, emergency, etc.
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    current_level INTEGER NOT NULL, -- Current approval level
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leave approvals table (tracks approval history)
CREATE TABLE leave_approvals (
    id SERIAL PRIMARY KEY,
    leave_id INTEGER REFERENCES leave_applications(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL, -- Role of the approver
    decision VARCHAR(50) NOT NULL, -- APPROVED, REJECTED
    remarks TEXT,
    approved_by INTEGER REFERENCES users(uid) ON DELETE SET NULL,
    approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_leave_applications_faculty_id ON leave_applications(faculty_id);
CREATE INDEX idx_leave_applications_status ON leave_applications(status);
CREATE INDEX idx_leave_applications_current_level ON leave_applications(current_level);
CREATE INDEX idx_leave_approvals_leave_id ON leave_approvals(leave_id);

-- Sample data for testing
INSERT INTO users (name, email, password_hash, role, level, department) VALUES
('Dr. John Faculty', 'john.faculty@university.edu', '$2a$10$example_hash', 'faculty', 1, 'Computer Science'),
('Prof. Jane HOD', 'jane.hod@university.edu', '$2a$10$example_hash', 'hod', 2, 'Computer Science'),
('Dr. Bob Dean', 'bob.dean@university.edu', '$2a$10$example_hash', 'dean', 3, 'Engineering'),
('Ms. Alice Registrar', 'alice.registrar@university.edu', '$2a$10$example_hash', 'registrar', 4, 'Administration');