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

function getConfiguration() {
    const userName = vscode.workspace.getConfiguration('boilerplateheader').get('username');
    return userName;
}

//look here for more examples: https://github.com/zhaopengme/vscode-fileheader/blob/master/extension.js
//and here: https://github.com/jsynowiec/vscode-insertdatestring/blob/master/src/extension.js
//Microsoft docs: https://code.visualstudio.com/Docs/extensions/example-hello-world
function getTemplate(singleComment: string, timeStamp:string) : string {
    let template: string = "";
    template += singleComment + "Author: " + getConfiguration() + "\n";
    template += singleComment + "Last Modified: " + timeStamp + "\n";
    return template.trim();
}

function createHeader() {
    const editor = vscode.window.activeTextEditor; 
    //if no editor do nothing
    if (!editor) {
        return;
    }

    let timeStamp: string = createTimeStamp(new Date());
    let doc = editor.document;
    if (doc.languageId === "python")
    {
        editor.edit(function (editBuilder) {
            try {
                editBuilder.insert(new vscode.Position(0, 0), getTemplate("#", timeStamp));
            } catch (error) {
                console.error(error);
            }
        });
    }
    else if(doc.languageId === "plaintext") {
        editor.edit(function (editBuilder) {
            try {
                editBuilder.insert(new vscode.Position(0, 0), getTemplate("", timeStamp));
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
        vscode.commands.registerCommand('extension.updateHeader', () => {
            createHeader();
        })
    ];

    context.subscriptions.push(disposable);

    vscode.workspace.onDidSaveTextDocument(function (file) {
        setTimeout(function () {
            try {
                const editor = vscode.window.activeTextEditor; 
                let document = editor.document;

                //find the old timeStamp
                let lastRange = document.lineAt(0).range;
                let updateFile:boolean = false;
                for (let i = 0; i < document.lineCount; i++) {
                    let linetAt = document.lineAt(i);
                    let line:string = linetAt.text;
                    line = line.trim();
                    if (line.indexOf("Last Modified:") > -1) {
                        let time:string = line.replace("Last Modified:", "").trim();
                        let oldTime = new Date(time);
                        let curTime = new Date();
                        updateFile = (((curTime - oldTime) / 1000) > 20) ? true : false;
                        lastRange = document.lineAt(i).range;
                        break;
                    }
                }

                if (updateFile){
                    //replace the text and save the file again
                    setTimeout(function () {
                        editor.edit(function (edit) {
                            edit.replace(lastRange, "Last Modified: " + createTimeStamp(new Date()));
                        });
                        document.save();
                    }, 200);
                }
            }
            catch(error)
            {
                console.error(error);
            }
        }, 200);
    }
}

// this is called when your extension is deactivated
export function deactivate() {
}