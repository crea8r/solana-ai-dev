import { FileTreeItemType } from '../components/FileTree';
import { CodeFile } from '../contexts/CodeFileContext';
import { Project, ProjectDetails } from '../interfaces/project';

const todoproject: Project = {
  id: '123',
  rootPath: 'todo_program',
  name: 'Todo Program',
  description: 'A todo program',
  details: {
  nodes: [
    {
      width: 56,
      height: 44,
      id: 'program-1729506920961',
      type: 'program',
      position: {
        x: 322,
        y: 198,
      },
      data: {
        label: 'Todo',
        item: {
          id: 'program-1729506920961',
          type: 'program',
          name: 'Todo',
          description: 'A todo program',
        },
      },
      selected: false,
      positionAbsolute: {
        x: 322,
        y: 198,
      },
    },
    {
      width: 80,
      height: 44,
      id: 'account-1729506922025',
      type: 'account',
      position: {
        x: 574,
        y: 108,
      },
      data: {
        label: 'Task',
        item: {
          id: 'account-1729506922025',
          type: 'account',
          name: 'Task',
          description: 'Store the task content',
          json: '{owner: pubk, content: string}',
          ownerProgramId: 'program-1729506920961',
        },
      },
      selected: false,
      positionAbsolute: {
        x: 574,
        y: 108,
      },
      dragging: false,
    },
    {
      width: 66,
      height: 44,
      id: 'instruction-1729506923018',
      type: 'instruction',
      position: {
        x: 569,
        y: 221,
      },
      data: {
        label: 'create',
        item: {
          id: 'instruction-1729506923018',
          type: 'instruction',
          name: 'create',
          description: 'Create the task',
          parameters: 'content: string',
          aiInstruction: 'Assign the signer as the owner of the task',
          ownerProgramId: 'program-1729506920961',
        },
      },
      selected: true,
      positionAbsolute: {
        x: 569,
        y: 221,
      },
      dragging: false,
    },
  ],
  edges: [
    {
      id: 'b87e8042-6a9a-45c1-908e-c125d61212e1',
      source: 'program-1729506920961',
      target: 'account-1729506922025',
      type: 'solana',
      animated: false,
      style: {
        stroke: '#ff0072',
        cursor: 'pointer',
        strokeWidth: 2,
      },
    },
    {
      id: 'ff752afc-ac78-40f6-9347-fbe9239778fd',
      source: 'program-1729506920961',
      target: 'instruction-1729506923018',
      type: 'solana',
      animated: false,
      style: {
        stroke: '#ff0072',
        cursor: 'pointer',
        strokeWidth: 2,
      },
    },
  ],
  files: {
    name: 'todo_program',
    children: [
      {
        name: 'programs',
        children: [
          {
            name: 'todo',
            children: [
              {
                name: 'state.rs',
                children: [],
                path: 'todo_program/programs/todo/state.rs',
              },
              {
                name: 'instructions',
                children: [
                  {
                    name: 'create.rs',
                    children: [],
                    path: 'todo_program/programs/todo/instructions/create.rs',
                  },
                  {
                    name: 'mod.rs',
                    children: [],
                    path: 'todo_program/programs/todo/instructions/mod.rs',
                  },
                ],
                path: 'todo_program/programs/todo/instructions',
              },
              {
                name: 'mod.rs',
                children: [],
                path: 'todo_program/programs/todo/mod.rs',
              },
            ],
            path: 'todo_program/programs/todo',
          },
        ],
        path: 'todo_program/programs',
      },
      {
        name: 'tests',
        children: [
          {
            name: 'todo.ts',
            children: [],
            path: 'todo_program/tests/todo.ts',
          },
        ],
        path: 'todo_program/tests',
      },
      {
        name: 'ts-sdk',
        children: [
          {
            name: 'todo.ts',
            children: [],
            path: 'todo_program/ts-sdk/todo.ts',
          },
        ],
        path: 'todo_program/ts-sdk',
      },
    ],
    path: 'todo_program',
  } as FileTreeItemType,
  codes: [
    {
      name: 'state.rs',
      path: 'todo_program/programs/todo/state.rs',
      content:
        '// todo_program/programs/todo/src/state.rs\nuse anchor_lang::prelude::*;\n\n#[account]\npub struct Task {\n    pub owner: Pubkey,\n    pub content: String,\n}\n\nimpl Task {\n    pub const LEN: usize = 8 + 32 + 4 + 400; // Discriminator + Pubkey + String prefix + Max content length\n}',
    },
    {
      name: 'create.rs',
      path: 'todo_program/programs/todo/instructions/create.rs',
      content:
        "use anchor_lang::prelude::*;\nuse crate::state::Task;\n\npub mod create {\n    use super::*;\n\n    pub fn run(ctx: Context<Create>, content: String) -> Result<()> {\n        let task = &mut ctx.accounts.task;\n        task.owner = ctx.accounts.signer.key();\n        task.content = content;\n        Ok(())\n    }\n\n    #[derive(Accounts)]\n    pub struct Create<'info> {\n        #[account(init, payer = signer, space = 8 + Task::LEN)]\n        pub task: Account<'info, Task>,\n        #[account(mut)]\n        pub signer: Signer<'info>,\n        pub system_program: Program<'info, System>,\n    }\n}\n\npub mod mod {\n    pub use super::create::*;\n}",
    },
    {
      name: 'mod.rs',
      path: 'todo_program/programs/todo/instructions/mod.rs',
      content:
        '// todo_program/programs/todo/instructions/mod.rs\n\npub mod create;\n\npub use create::*;',
    },
    {
      name: 'mod.rs',
      path: 'todo_program/programs/todo/mod.rs',
      content:
        '// todo_program/programs/todo/mod.rs\npub mod create;\npub mod state;\n\nuse anchor_lang::prelude::*;\n\ndeclare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");\n\n#[program]\npub mod todo_program {\n    use super::*;\n\n    pub mod task {\n        use super::*;\n        pub use crate::create::*;\n    }\n}',
    },
    {
      name: 'todo.ts',
      path: 'todo_program/tests/todo.ts',
      content:
        'import * as anchor from "@coral-xyz/anchor";\nimport { Program } from "@coral-xyz/anchor";\nimport { TodoProgram } from "../target/types/todo_program";\nimport assert from "assert";\n\ndescribe("todo_program", () => {\n  const provider = anchor.AnchorProvider.local();\n  anchor.setProvider(provider);\n\n  const program = anchor.workspace.TodoProgram as Program<TodoProgram>;\n\n  it("Creates a new task", async () => {\n    const taskAccount = anchor.web3.Keypair.generate();\n    const taskContent = "Finish the Solana program";\n\n    await program.rpc.create(taskContent, {\n      accounts: {\n        task: taskAccount.publicKey,\n        user: provider.wallet.publicKey,\n        systemProgram: anchor.web3.SystemProgram.programId,\n      },\n      signers: [taskAccount],\n    });\n\n    const task = await program.account.task.fetch(taskAccount.publicKey);\n\n    assert.equal(task.owner.toBase58(), provider.wallet.publicKey.toBase58());\n    assert.equal(task.content, taskContent);\n  });\n});',
    },
    {
      name: 'todo.ts',
      path: 'todo_program/ts-sdk/todo.ts',
      content:
        'import { Program, AnchorProvider, web3 } from "@coral-xyz/anchor";\nimport { TodoProgram } from "../target/types/todo_program";\nimport { Keypair, PublicKey } from "@solana/web3.js";\n\nexport class TodoSDK {\n  private program: Program<TodoProgram>;\n  private provider: AnchorProvider;\n\n  constructor(provider: AnchorProvider) {\n    this.provider = provider;\n    this.program = new Program(\n      JSON.parse(require("fs").readFileSync("../target/idl/todo_program.json", "utf8")),\n      new PublicKey("your_program_id"),\n      provider\n    );\n  }\n\n  async createTask(content: string): Promise<web3.PublicKey> {\n    const task = Keypair.generate();\n    await this.program.rpc.create(content, {\n      accounts: {\n        task: task.publicKey,\n        owner: this.provider.wallet.publicKey,\n        systemProgram: web3.SystemProgram.programId,\n      },\n      signers: [task],\n    });\n    return task.publicKey;\n  }\n\n  async getTasks(owner: PublicKey): Promise<any[]> {\n    const tasks = await this.program.account.task.all([\n      {\n        memcmp: {\n          offset: 8, // Discriminator.\n          bytes: owner.toBase58(),\n        },\n      },\n    ]);\n    return tasks;\n  }\n}',
    },
    ] as CodeFile[],
    docs: [],
    isSaved: false,
    isAnchorInit: false,
    isCode: true,
    aiFilePaths: [],
    aiStructure: '',
    stateContent: '',
  } as ProjectDetails,
} as Project;
export { todoproject };
