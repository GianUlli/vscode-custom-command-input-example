# vscode-custom-command-input-example

This is a demonstration of how to write a VS Code extension to define custom input pick dialogs.

The extensions adds a command `vscode-custom-command-input-example.pickTestCase` to VS Code. The command can be used in
task definitions or launch configurations. It launches a QuickPick dialog to let the user select a JSON file from a
folder ("test case"). The folder is configurable using the setting `customCommandInput.cwd`.

## Run extension

This extension was created using the offical
[VS Code guide](https://code.visualstudio.com/api/get-started/your-first-extension). To run the extension, open the
repository in VS Code press F5.
