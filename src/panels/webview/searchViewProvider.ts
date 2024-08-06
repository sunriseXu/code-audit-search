import * as vscode from "vscode";
import { getNonce } from "../../utilities/getNonce";
import { getUri } from "../../utilities/getUri";
import { execShell, splitLines, splitLine, mergeMap } from "../../utilities/oneUtils"
import { LocalStorageService } from "../../utilities/localStorageService";
import { parseRegex, countResults } from "../../utilities/oneUtils";
import { GlobalStorageService } from "../../utilities/globalStorageService";
import { multiStepInput } from "../../utilities/multiStepInput";
import { RegexRaw } from "../../utilities/RTpyes";

export class SearchViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'AuditSearch.searchView';

	private _view?: vscode.WebviewView;

    private storageManager?: LocalStorageService;
    private globalStorageManager?: GlobalStorageService;

    private regexRaw?: RegexRaw;

	constructor(
		private readonly _extensionUri: vscode.Uri,
        private readonly context: vscode.ExtensionContext,
	) { 
        this.storageManager = new LocalStorageService(this.context.workspaceState);
		this.globalStorageManager = new GlobalStorageService(context.globalState);

        // save this search in current workspace, in local storage
        // saved search
        // we need a uniq hash to save the result, label -> regex, no tag
        // hash: user give input a uniq tag, tooltip -> regex
        // user click save button, execute the save function.

        context.subscriptions.push(
			vscode.commands.registerCommand('AuditSearch.updateLocalData', () => this.updateLocalData())
		)

        // save this regex globally, in global storage
        // custom regex
        // we need create a label and tag 
        context.subscriptions.push(
            vscode.commands.registerCommand('AuditSearch.quickInput', async () => this.showInput())
        );

        // context.subscriptions.push(
		// 	vscode.commands.registerCommand('AuditSearch.updateGlobalData', () => this.updateGlobalData())
		// )

    }

    public updateLocalData(){
        let allLocalData = this.storageManager?.getAllData()
        let allLocalSearch = allLocalData?.map(item => {
            return item?.regexRaw
        })
        allLocalSearch = allLocalSearch?.filter(element => {
            return element !== undefined
        })

        this._view?.webview.postMessage({
            command:"localData",
            message: allLocalSearch,
          });
    }

    public updateGlobalData(){
        let allGlobalData = this.globalStorageManager?.getAllData()
        allGlobalData = allGlobalData?.filter(element => {
            return element?.hasOwnProperty("label")
        })
        
        this._view?.webview.postMessage({
            command:"globalData",
            message: allGlobalData,
          });
        
    }

    public async showInput(){
        const state = await multiStepInput(this.context)
        let label = state?.label.trim()
        let lang = state?.lang
        if(!label||!this.regexRaw?.re.trim()){
            vscode.window.showInformationMessage("Failed, please make sure `tag` or `regex` is not blank")
            return;
        }
        this.globalStorageManager?.setValue(label, {
            label: label, 
            lang: lang, 
            ...this.regexRaw}
        )
        this.updateGlobalData()
    }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);


        this.updateLocalData()
        this.updateGlobalData()

		webviewView.webview.onDidReceiveMessage(async data => {

			switch (data.command) {
                case "initLocal":
                    this.updateLocalData();
                    this.updateGlobalData();
                    break;
                case "search":
                    if(vscode.workspace.workspaceFolders !== undefined) {
                        let wf = vscode.workspace.workspaceFolders[0].uri.path;
                        this.regexRaw = data.obj;
                        
                        let regexObj = parseRegex(data.obj, wf);

                        console.log("regex obj:", regexObj)
                        try {
                            var res = await execShell(regexObj.cmd)
                            var mergedMap = {}
                            // parse the results
                            var lines = splitLines(res)
                            for (var line of lines){
                                if(!line.trim())
                                    continue
                                var lineObj = splitLine(line, regexObj.re);
                                mergedMap = mergeMap(mergedMap, lineObj)
                                
                            }

                            let resultCountObj = countResults(mergedMap)
                            webviewView.webview.postMessage({
                                command:"result",
                                message: `${resultCountObj.resultLen} results in ${resultCountObj.fileLen} files`,
                              });

                            // check if saved
                            // 1. fetch from local storage
                            // 2. compare storage with the results
                            
                            let regex = "testtest3"
                            //show result
                            vscode.commands.executeCommand('AuditSearch.initTodoView', mergedMap, data.obj)
                            vscode.commands.executeCommand('AuditSearch.initDeletedView', mergedMap, data.obj)
                        } catch (e) {
                            webviewView.webview.postMessage({
                                command:"result",
                                message:"no results found",
                              });
                            vscode.commands.executeCommand('AuditSearch.initTodoView', {}, data.obj)
                            vscode.commands.executeCommand('AuditSearch.initDeletedView', {}, data.obj)
                        }
                        
                    } 
                    else {
                        let message = "YOUR-EXTENSION: Working folder not found, open a folder an try again" ;
                    
                        vscode.window.showErrorMessage(message);
                    }
                    break;
			}
		});
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		// The CSS file from the React build output
        const stylesUri = getUri(webview, this._extensionUri, ["webview-ui", "build", "assets", "index.css"]);
        // The JS file from the React build output
        const scriptUri = getUri(webview, this._extensionUri, ["webview-ui", "build", "assets", "index.js"]);
    
        const iconStyleUri = getUri(webview, this._extensionUri, ["webview-ui", "node_modules", '@vscode/codicons', 'dist', 'codicon.css']);
    
		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();
        //<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';font-src ${webview.cspSource};">

		return `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="stylesheet" type="text/css" href="${stylesUri}">
                <link rel="stylesheet" type="text/css" href="${iconStyleUri}">
                <title>Hello World</title>
                </head>
                <body>
                <div id="root"></div>
                <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
                </body>
            </html>
            `;
	}
}