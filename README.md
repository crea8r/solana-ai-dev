# Introduction

**SolAI** is the one-stop shop for Solana product team. SolAI provides drag and drop UI to create system architect for a Solana Anchor Program, then use AI to generate deployable-code (Rust code, TS test code and TS SDK for front-end) and finally build and test it (coming soon). SolAI also generate document from the code, provide a seamless workflow for the whole team.

You can find the demo [here](https://youtu.be/6xZNdc48EhQ?si=lP78g_6INehb_-T9) and the pitch deck [here](https://docs.google.com/presentation/d/1SQEEkuTKqrlIdpMBYpd2vE2XxM4l7Zwigy8-MlQ3WtU/edit#slide=id.p).

## Structure

This is a mono-repo project, there are 2 projects:

- server, using nodejs to handle http request, working with database and automate Anchor-related tasks.
- webapp, using reactjs.

## How to build?

### Server project

- [ ] Step 1: Install a [Postgresql server](https://hub.docker.com/_/postgres)
- [ ] Step 2: Run `server/migration/schema.sql` to intialise the database.
- [ ] Step 3: Register an api key from [codestral](https://codestral.mistral.ai/). Note that it must be `codestral` section, not the `api` or else you will have an `401 Unauthorized` error.
- [ ] Step 4: Create `.env` file in the `server` folder with following variables:

```env
PORT=9999
JWT_SECRET=[a random string]
ROOT_FOLDER=[This is where you keep the built code]
DB_USER=[From step 2]
DB_HOST=[From step 2]
DB_NAME=[From step 2]
DB_PASSWORD=[From step 2]
DB_PORT=[From step 2]
MISTRAL_API_KEY=[From step 3]
```

- [ ] Step 5: In the `server` folder, run `npm i` then `npm run dev`
- [ ] Step 6: Go to browser, go to `http://localhost:9999/health` (suppose it is localhost and port 9999) and it should show a success message. For further testing of the server, use this [Postman collection](https://cloudy-desert-694328.postman.co/workspace/SolAI~d3a5854f-82e5-4718-83d6-ea5a599c8046/collection/3992815-525526da-a15b-46d7-876b-8b332f79c120?action=share&creator=3992815&active-environment=3992815-84490455-6ff0-4901-8b33-6549450c5229). Pay attention to all the environment variable for the Post man collection.

### Webapp project

- [ ] Step 1: Create .env, the content is

```env
REACT_APP_API_URL=[endpoint of the server, e.g: http://localhost:9999]
```

- [ ] Step 2: Run `npm i` to install all packages, then `npm start` to start the project.

## How to reproduce the Demo?

**Note:** Though the server is completed, the current webapp project do not use all the endpoint yet.

Steps to reproduce the demo.

- [ ] Step 1: Register an organisation, username & password.
- [ ] Step 2: Login and start drag & drop to build the system design. Start with the Program (red), then Account (Purple) and finally Instruction (green). Remember to connect all accounts, instructions to the program. The idea is that you can design multiple programs in a project, but please test with one program-per project for now.
- [ ] Step 3: After finish the design, click button `Prompt` on the top panel to generate the code structure (not every code files)
- [ ] Step 4: Click the `Code` section on the left handside panel, click each of the code file to generate the real code; it will take sometime.
- [ ] Step 5: After you generate all the code, click the `Doc` section on the left handside to generate the doc. Voila!
