'use strict';

import { ExtensionContext, QuickPickItem, window, workspace, WorkspaceFolder } from 'vscode';
import * as glob from 'glob';
import path = require('path');

/**
 * @returns Current workspace folder, or undefined if not available.
 */
function getWorkspaceFolder(): string | undefined {
    if (!workspace.workspaceFolders) {
        return undefined;
    }

    // Try to get workspace from current file
    let workspacePath: WorkspaceFolder | undefined = undefined;
    if (window.activeTextEditor) {
        const currentDocumentUri = window.activeTextEditor?.document.uri;
        workspacePath = workspace.getWorkspaceFolder(currentDocumentUri);
    }
    if (!workspacePath) {
        // Current file is not from workspace, we use the first folder as a fallback.
        const fallbackWorkspace = workspace.workspaceFolders[0];
        workspacePath = fallbackWorkspace;
    }
    return workspacePath.uri.fsPath;
}

function substituteVariables(settingsString: string): string {
    if (settingsString.includes('${workspaceFolder}')) {
        let workspaceFolder = getWorkspaceFolder();
        if (workspaceFolder !== undefined) {
            settingsString = settingsString.replace(/\${workspaceFolder}/g, workspaceFolder);
        } else {
            window.showErrorMessage('Unable to resolve ${workspaceFolder} because no workspace is selected.');
        }
    }
    return settingsString.replace(/\${env:([^}]+)}/g, (sub: string, envName: string) => {
        var value = process.env[envName];
        if (value === undefined) {
            return '';
        } else {
            return value;
        }
    });
}

/**
 * Shows a quick select box with all test cases defined in a given folder.
 * @param context
 */
export async function pickTestCase() {
    // Read cwd from config (user settings)
    // If not set, we use the current workspace folder
    const configName = ['customCommandInput', 'cwd'];
    let config = workspace.getConfiguration(configName[0]);
    let workingFolder = config.get<string>(configName[1]);
    if (workingFolder === null || workingFolder === undefined) {
        if (workspace.workspaceFolders && workspace.workspaceFolders.length > 0) {
            workingFolder = workspace.workspaceFolders[0].uri.fsPath;
        }
    } else {
        workingFolder = substituteVariables(workingFolder);
    }

    return new Promise<string[]>((resolve, reject) => {
        glob('*.json', { cwd: workingFolder, absolute: true }, (err, files) => {
            if (err) {
                return reject(err);
            }
            resolve(files);
        });
    })
        .then((files) => {
            if (files.length > 0) {
                let testCases: QuickPickItem[] = files.map((file) => {
                    return { label: path.basename(file), description: file };
                });
                return window.showQuickPick(testCases);
            } else {
                window.showErrorMessage(
                    `Could not find any test cases. Check your configuration. The working folder 
                 (${configName[0]}.${configName[1]}) is set to ${workingFolder}.`
                );
                return undefined;
            }
        })
        .then((testCase) => {
            return testCase?.description;
        });
}
