# Overview

This is an UI to drag and drop to build solana dapp system design. Based on the design, user can use AI to generate code and documents. User can also view, edit, build and test code.

## Pages

### Authentication

The layout of these pages is fullscreen

#### Landing page

route: /

#### Login

rout: /login

User login with username and password. Once successful, it will open the /design route.

#### Register

route: /register

User register with organisation name, username and password.

### Working pages

The layout of these pages is a full-height vertical panel with four icon: System design (using a cog as icon), Coding (using a file as icon) and Documentation (using chat symbol as icon) and User (using a account as icon). These routes are permission-protected. If user open a project, the detail of project is shared among three pages.

### Design

route: /design

If user open this route the first time, it with an overlay modal (can not closed) showing list of project (pagination); a panel to input the project name and create a new project.
On the top header of this page, there are 2 menu: Project and Team. Team has two option: Invite & View which are both disabled for now. In Project, there are 3 items: Open, Save, New.
Click Open will reopen the dialog showing all project. Click New will open a dialog to set the name and save the current design. Click Save will save the current design or prompting to create a new one if the current has never been saved.
On the main working space, there are 3 area: toolbox, drag and drop area and property panel area. Most of the code for this area is working now.
Once the code is generated, click each item in the main working space will show files that related to it, showing on the property panel.

### Code

route: /code

This route is disabled until user click "Generate Code" in the panel of the Program. Compiling mean it will create code based on system design.
On the top header of this page, there are 5 menuitems: Project, Team, Save, Build, Test. Project and Team is the same as it is in Design. Save means saving the current file content. Build is invoking building project and Test invoking testing the project.
On the main working area, the layout is similar to a code editor. On the left, there is a tree display view showing content of the folder of the current project. In middle, is a coding area and on the right is a chat panel to interact with AI to generate code.

On the tree section (left), user can click each of the file to open it and showing in the code section.
In the code section in the middle, the top is 80% of the screen showing code using Monaco Editor for good code syntax highlight and the bottom is a terminal section which can be toggle. This section will show the result of "build", "test".
On the right section, there is a chat box in the bottom and on top is a chat history. This component is for interacting with AI to generate detail code of each file.

### Doc

route: /doc

This route is disabled until user click "Build" in the top panel in the Code page.
This page has the same layout with the Code page. Instead of working on Code, it is working on Documentation.

### Account

If user click the account icon, there will be option to log out.
