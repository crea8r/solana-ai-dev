# Introduction

**Sol.AI** aims to empower Solana development teams with a comprehensive, all-in-one platform for creating, building, and managing decentralized applications. Through an intuitive drag-and-drop interface, when this application is publicly released, you will be able to visually design your Solana Anchor Program architecture, use AI to generate production-ready code (including Rust code, TypeScript test code, and TypeScript SDK for the frontend), and easily generate comprehensive project documentation. Sol.AI streamlines collaboration by simplifying the development workflow from design to deployment.

You can find the demo [here](https://www.youtube.com/watch?v=NbO50Rm8u6Q&t=1s) and the pitch deck [here](https://www.youtube.com/watch?v=4xFQxohXmLg).

## Structure

This is a mono-repo project, consisting of:

- server (backend), using nodejs to handle http request, working with database and automated Anchor-related tasks.
- webapp (frontend), using reactjs.

## How to build?

### Server project

- [ ] Step 1: Install a [Postgresql server](https://hub.docker.com/_/postgres)
- [ ] Step 2: Run `server/migration/schema.sql` to intialise the database.
- [ ] Step 3: Create `.env` file in the `server` folder with following variables:

```env
PORT=9999
JWT_SECRET=[a random string]
ROOT_FOLDER=[This is where you keep the built code]
DB_USER=[From step 2]
DB_HOST=[From step 2]
DB_NAME=[From step 2]
DB_PASSWORD=[From step 2]
DB_PORT=[From step 2]
```

- [ ] Step 4: In the `server` folder, run `npm i` then `npm run dev`
- [ ] Step 5: Go to browser, go to `http://localhost:9999/health` (suppose it is localhost and port 9999) and it should show a success message. For further testing of the server, use this [Postman collection](https://cloudy-desert-694328.postman.co/workspace/SolAI~d3a5854f-82e5-4718-83d6-ea5a599c8046/collection/3992815-525526da-a15b-46d7-876b-8b332f79c120?action=share&creator=3992815&active-environment=3992815-84490455-6ff0-4901-8b33-6549450c5229). Pay attention to all the environment variable for the Post man collection.

### Webapp project

- [ ] Step 1: Create .env, the content is

```env
REACT_APP_API_URL=[endpoint of the server, e.g: http://localhost:9999]
```

- [ ] Step 2: Run `npm i` to install all packages, then `npm start` to start the project.


Steps to use the application:

- [ ] Step 1: Register an organisation, username & password.
- [ ] Step 2: Login and start drag & drop to build the system design (or select from the list of examples). Start with the Program, then Account and finally Instruction. Remember to connect all accounts, instructions to the program. The idea is that you can design multiple programs in a project, but please test with one program-per project for now.
- [ ] Step 3: After you have finished the design, click on the `Generate Code` button on the top panel to generate the project files.
- [ ] Step 4: To navigate to the generated project files, click `View Files` or navigate to the `Code` page from the left handside panel.
