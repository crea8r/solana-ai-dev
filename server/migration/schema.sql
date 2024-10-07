-- Drop existing triggers
DROP TRIGGER IF EXISTS update_solana_project_last_updated ON SolanaProject;
DROP TRIGGER IF EXISTS update_project_file_last_updated ON ProjectFile;

-- Drop existing function
DROP FUNCTION IF EXISTS update_last_updated_column();

-- Drop existing tables
DROP TABLE IF EXISTS Task;
DROP TABLE IF EXISTS ProjectFile;
DROP TABLE IF EXISTS SolanaProject;
DROP TABLE IF EXISTS Creator;
DROP TABLE IF EXISTS Organisation;

-- Create Organisation table
CREATE TABLE Organisation (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on Organisation name
CREATE INDEX idx_organisation_name ON Organisation(name);

-- Create Creator table
CREATE TABLE Creator (
    id UUID PRIMARY KEY,
    username TEXT NOT NULL,
    profile JSONB,
    password TEXT NOT NULL,
    org_id UUID REFERENCES Organisation(id),
    role TEXT CHECK (role IN ('member', 'admin'))
);

-- Create indexes on Creator username and org_id
CREATE INDEX idx_creator_username ON Creator(username);
CREATE INDEX idx_creator_org_id ON Creator(org_id);

-- Create SolanaProject table
CREATE TABLE SolanaProject (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    org_id UUID REFERENCES Organisation(id),
    root_path TEXT,
    details JSONB,
    last_updated TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- log all AI requests
CREATE TABLE AIRequestLog (
    id UUID PRIMARY KEY,
    request TEXT,
    response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes on SolanaProject name and org_id
CREATE INDEX idx_solana_project_name ON SolanaProject(name);
CREATE INDEX idx_solana_project_org_id ON SolanaProject(org_id);

-- Create ProjectFile table
CREATE TABLE ProjectFile (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    file_hash TEXT,
    last_updated TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes on ProjectFile name and file_path
CREATE INDEX idx_project_file_name ON ProjectFile(name);
CREATE INDEX idx_project_file_path ON ProjectFile(file_path);

-- Create Task table
CREATE TABLE Task (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creator_id UUID REFERENCES Creator(id),
    result TEXT,
    last_updated TIMESTAMP,
    project_id UUID REFERENCES SolanaProject(id),
    status VARCHAR(50) CHECK (status IN ('queued', 'doing', 'finished', 'succeed', 'failed'))
);

-- Create indexes on Task creator_id and status
CREATE INDEX idx_task_creator_id ON Task(creator_id);
CREATE INDEX idx_task_status ON Task(status);

-- Create function to update last_updated column
CREATE OR REPLACE FUNCTION update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.last_updated = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for SolanaProject table
CREATE TRIGGER update_solana_project_last_updated
BEFORE UPDATE ON SolanaProject
FOR EACH ROW
EXECUTE FUNCTION update_last_updated_column();

-- Create trigger for ProjectFile table
CREATE TRIGGER update_project_file_last_updated
BEFORE UPDATE ON ProjectFile
FOR EACH ROW
EXECUTE FUNCTION update_last_updated_column();

-- Create a trigger for Task table
CREATE TRIGGER update_task_last_updated
BEFORE UPDATE ON Task
FOR EACH ROW
EXECUTE FUNCTION update_last_updated_column();