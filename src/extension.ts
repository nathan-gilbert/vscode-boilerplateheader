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

function updateEditorTimeStamp(text: string) {
    const editor = vscode.window.activeTextEditor;
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
        if (doc.lineCount > 2)
        {
            let firstLine = doc.lineAt(0);
            let endLine = doc.lineAt(2);
        }
        else {
            console.log('Not enough lines in file.');
        }
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
}

// this method is called when your extension is deactivated
export function deactivate() {
}