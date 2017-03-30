module.exports = {
  "prompts": {
    "name": {
      "type": "string",
      "required": true,
      "message": "Project name"
    },
    "description": {
      "type": "string",
      "required": false,
      "message": "Project description",
      "default": "My next great idea"
    },
    "author": {
      "type": "string",
      "message": "Author"
    },
    "build": {
      "type": "list",
      "message": "Vue build",
      "choices": [
        {
          "name": "Runtime: recommended for most users",
          "value": "runtime",
          "short": "runtime"
        },
        {
          "name": "Runtime + Compiler: support dynamic templates",
          "value": "standalone",
          "short": "standalone"
        },
      ]
    }
  },
  "completeMessage": "To get started:\n\n  {{^inPlace}}cd {{destDirName}}\n  {{/inPlace}}npm install\n  npm run serv"
};
