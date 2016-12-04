'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

//Date functions heavily influenced by https://github.com/jvlad/InsertTimeStamp.vscode.ts
//grab the month's name
function monthName(date: Date): string {
    let monthNameList: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let targetIndex: number = date.getMonth();
    return (monthNameList[targetIndex]);
}

//grab the day of the week
function dayName(date: Date): string {
    let dayNameList: string[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let targetIndex: number = date.getDay();
    return (dayNameList[targetIndex]);
}

//grab the timezone
function getTZ(): string {
    let timezone = require('moment-timezone');
    let userTimeZone: string = timezone.tz.guess();
    return timezone.tz(userTimeZone).zoneAbbr();
}

function createTimeStamp(date: Date): string {
    let currentDay: string = dayName(date);
    let currentMonth: string = monthName(date);
    let currentMonthDay: string = date.getDate().toString();
    let currentTime: string = date.toLocaleTimeString('en-US', { hour12: true });
    let timeZone: string = getTZ();
    let year: string = date.getFullYear().toString();

    var timestamp: string[] = [currentDay, currentMonth, currentMonthDay, currentTime, timeZone, year];
    return timestamp.join(" ");
}

//look here for more examples: https://github.com/zhaopengme/vscode-fileheader/blob/master/extension.js
//and here: https://github.com/jsynowiec/vscode-insertdatestring/blob/master/src/extension.js
function getLineText(lineNum, editor) : string {
    const document = editor.document;
    if (lineNum >= document.lineCount) {
        return '';
    }

    const start = new vscode.Position(lineNum, 0);
    const lastLine = document.lineAt(lineNum);
    const end = new vscode.Position(lineNum, lastLine.text.length);
    const range = new vscode.Range(start, end);
    var text = document.getText(range);
    return text;
}

function replaceLineText(lineNum, text, editor) {
    const document = editor.document;
    if (lineNum >= document.lineCount) {
        return '';
    }

    const start = new vscode.Position(lineNum, 0);
    const lastLine = document.lineAt(lineNum);
    const end = new vscode.Position(lineNum, lastLine.text.length);
    const range = new vscode.Range(start, end);
    editor.edit(function (edit) {
        edit.replace(range, text);
    });
}

function updateEditorTimeStamp(timeStamp: string) {
    const editor = vscode.editor || vscode.window.activeTextEditor; 
    //if no editor do nothing
    if (!editor) {
        return;
    }

    let doc = editor.document;
    if (doc.languageId === "python")
    {
        // This line of code will only be executed once when your extension is activated
        console.log('This is a python document');
    }
    else if(doc.languageId === "plaintext") {
        editor.edit(function (editBuilder) {
            try {
                editBuilder.insert(new vscode.Position(0, 0), timeStamp);
            } catch (error) {
                console.error(error);
            }
        });
    }
    else {
        console.log('I dont know what this document is.');
    }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    //console.log('Congratulations, your extension "updatetimestamp" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = [
        vscode.commands.registerCommand('extension.updateTimeStamp', () => {
            let timeStamp: string = createTimeStamp(new Date());
            updateEditorTimeStamp(timeStamp);
        })
    ];

    context.subscriptions.push(disposable);

    vscode.workspace.onDidSaveTextDocument(function (file) {
        setTimeout(function () {
            try {
                //find the old timeStamp
                for (let i:integer = 0; i < document.lineCount; i++) {
                    let linetAt:string = document.lineAt(i);
                    let line:string = linetAt.text;
                    line = line.trim();
                    let range = linetAt.range;
                    if (line.indexOf('Last\ Modified:') > -1) {
                        break;
                    }
                }

                //replace the text and save the file again
                setTimeout(function () {
                    editor.edit(function (edit) {
                        edit.replace(lastTimeRange, "Last Modified: " + createTimeStamp(new Date()));
                    });
                    document.save();
                }, 200);
            }
            catch(error)
            {
                console.error(error);
            }
        }, 200);

    }
}

// this }, 199 is called when your extension is deactivated
export function deactivate() {
}