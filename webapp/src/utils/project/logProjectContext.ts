import { Project } from "../../interfaces/project";

export const logProjectContext = (projectContext: Project) => {
    const {
      id: projectId,
      name,
      description,
      rootPath,
      details: {
        nodes,
        edges,
        designIdl,
        uiStructure,
        isAnchorInit,
        isCode,
        files,
        filePaths,
        fileTree,
        uiResults,
        aiInstructions,
        sdkFunctions,
        buildStatus,
        deployStatus,
        isSdk,
        isUi,
        genUiClicked,
        idl,
        sdk,
        programId,
        pdas,
        keyFeatures,
        userInteractions,
        sectorContext,
        optimizationGoals,
        uiHints,
      },
    } = projectContext;
  
    console.group("Project Context State");
  
    // General Information
    console.group("General Information");
    console.log("Project ID:", projectId);
    console.log("Name:", name || "Not set");
    console.log("Description:", description || "Not set");
    console.log("Root Path:", rootPath || "Not set");
    console.groupEnd();
  
    // Details: Nodes and Edges
    console.group("Nodes and Edges");
    console.log("Nodes:", nodes.length ? nodes : "No nodes defined");
    console.log("Edges:", edges.length ? edges : "No edges defined");
    console.groupEnd();
  
    // Details: Design and UI
    console.group("Design and UI");
    console.log("Design IDL:", designIdl);
    console.log("UI Structure:", uiStructure);
    console.log("UI Results:", uiResults.length ? uiResults : "No UI results");
    console.groupEnd();
  
    // Details: File Information
    console.group("File Information");
    console.log("Is Anchor Initialized:", isAnchorInit);
    console.log("Is Code Generated:", isCode);
    console.log("File Tree:", files);
    console.log("File Paths:", filePaths.length ? filePaths : "No file paths");
    console.log("File Tree Structure:", fileTree);
    console.groupEnd();
  
    // Details: Instructions and SDK
    console.group("Instructions and SDK");
    console.log("AI Instructions:", aiInstructions.length ? aiInstructions : "No instructions");
    console.log("SDK Functions:", sdkFunctions.length ? sdkFunctions : "No SDK functions");
    console.log("IDL:", idl);
    console.log("SDK:", sdk);
    console.groupEnd();
  
    // Details: Build and Deploy
    console.group("Build and Deploy Status");
    console.log("Build Status:", buildStatus);
    console.log("Deploy Status:", deployStatus);
    console.groupEnd();
  
    // Details: Program Information
    console.group("Program Information");
    console.log("Program ID:", programId || "Not set");
    console.log("PDAs:", pdas.length ? pdas : "No PDAs");
    console.groupEnd();
  
    // Details: Features and Interactions
    console.group("Key Features and User Interactions");
    console.log("Key Features:", keyFeatures.length ? keyFeatures : "No key features");
    console.log("User Interactions:", userInteractions.length ? userInteractions : "No user interactions");
    console.groupEnd();
  
    // Details: Context and Goals
    console.group("Context and Optimization Goals");
    console.log("Sector Context:", sectorContext || "Not set");
    console.log("Optimization Goals:", optimizationGoals.length ? optimizationGoals : "No optimization goals");
    console.groupEnd();
  
    // Details: UI Hints
    console.group("UI Hints");
    console.log("UI Hints:", uiHints.length ? uiHints : "No UI hints");
    console.groupEnd();
  
    console.groupEnd(); // End of main group
  };
  