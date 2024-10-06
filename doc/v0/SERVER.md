# Overview

This server is an REST server which return json for each route. This server is written in nodejs lang. Every request support CORS. The server use one middleware: Permission, to make sure some routes are protected and only users from the same organisation can access its resources.

## Technology

The server is using expressjs and pg package. All listing api should come with pagination.

## Middleware

Once user login, he will get a jwt to keep his id, org_id, name, org_name. All controller can use the data from the middleware to decide if users are accessing correct resource or not.

## Controller

### Authentication modules

#### POST /register

Anyone can register new organisation and user, whoever create new oragnisation is the admin by default. Password should be hashed before store in the database. Combination of username and organisation name should be unique.

#### POST /login

User login with username and password.

### Project module

#### GET /project

List all project of an organisation, with a search string to query on the name and description field. Only return everything, except `details`.

#### GET /project/{:id}

Get the detail of a project, return everything in the SolanaProject table, and return all ProjectFile rows related to the project.

#### POST /projects

Create a project. The root_path should be generated randomly on the server, it is a folder name with 8 characters.

#### PUT /projects

Edit a project. Check permission, make sure user within the same organisation can edit a project.

#### DELETE /projects

Delete a project. Check permission, make sure only admin of the same organisation can delete a project.

### IO handler

#### POST /projects/{:id}/init

Init the a Anchor project, the name is the same with SolanaProject name field. The folder of the project is root folder from the env + root_path of the SolanaProject.
Before running the process, create a task with status: "doing" in the Task table.
The init process will run for a long time so run it on a seperate thread with the webserver. Once it finishes, update the task with status "finished" and store the terminal output to result field.

#### POST /projects/{:id}/build

Build the project with Anchor. To build, take files from a folder of which the root folder is in env file, and the project folder is the root_path of the SolanaProject.
Before running the process, create a task with status: "doing" in the Task table.
The init process will run for a long time so run it on a seperate thread with the webserver. Once it finishes, update the task with status "finished" and store the terminal output to result field.

#### POST /projects/{:id}/test

Test the project.
Before running the process, create a task with status: "doing" in the Task table.
The init process will run for a long time so run it on a seperate thread with the webserver. Once it finishes, update the task with status "finished" and store the terminal output to result field.

#### GET /projects/{:id}/list

Dive deep into the project folder to list all files and sub-folder and return a tree of file and folder, each node holder the parent folder and the absolute path from the project folder. Skip following folders: .anchor, .github, target. Skip following files: Cargo.lock, package-lock.json, yarn.lock.

#### GET /file/{:path}

Return the content of a file in the path; append the root + project's root_path to the beginning of the file to get the exact file path.

### POST /file/{:path}

Create the file; append the root + project's root_path to the beginning of the file to get the exact file path.
Before running the process, create a task with status: "doing" in the Task table.
The init process will run for a long time so run it on a seperate thread with the webserver. Once it finishes, update the task with status "finished" and store the terminal output to result field.

### PUT /file/{:path}

Edit the file; append the root + project's root_path to the beginning of the file to get the exact file path.
Before running the process, create a task with status: "doing" in the Task table.
The init process will run for a long time so run it on a seperate thread with the webserver. Once it finishes, update the task with status "finished" and store the terminal output to result field.

### DELETE /file/{:path}

Delete the file; append the root + project's root_path to the beginning of the file to get the exact file path.
Before running the process, create a task with status: "doing" in the Task table.
The init process will run for a long time so run it on a seperate thread with the webserver. Once it finishes, update the task with status "finished" and store the terminal output to result field.

### POST /ai/prompt

Query the api from mistral ai to generate code. The client will decide what parameter it want to send to the AI, the server only act as proxy to forward the message.
