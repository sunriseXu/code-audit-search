import * as vscode from 'vscode';
import { LocalStorageService } from '../../utilities/localStorageService';
import { getFileName, difference, clone, genLabel } from '../../utilities/oneUtils';
import { RegexRaw } from '../../utilities/RTpyes';

export class DeletedView implements vscode.TreeDataProvider<Node> {
	
	private _onDidChangeTreeData: vscode.EventEmitter<Node | undefined | void> = new vscode.EventEmitter<Node | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Node | undefined | void> = this._onDidChangeTreeData.event;
	private rootPath: string = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : "";
	
	
	
	private regex: string = ""
	public tree: any = {}
	private origin: any = {}
	private storageManager?: LocalStorageService;
	private isStored: boolean = false;
	private regexRaw: RegexRaw = {} as RegexRaw;

	constructor(context: vscode.ExtensionContext) {
		this.storageManager = new LocalStorageService(context.workspaceState);
		const view = vscode.window.createTreeView('AuditSearch.deletedView', { treeDataProvider: this, showCollapseAll: true, canSelectMany: true });
		context.subscriptions.push(view);
		
		// init item
		context.subscriptions.push(
			vscode.commands.registerCommand('AuditSearch.initDeletedView', (origin, regexRaw) => this.setData(origin, regexRaw))
		)

		// update item
		context.subscriptions.push(
			vscode.commands.registerCommand('AuditSearch.updateDeletedView', (data) => this.updateItem(data))
		)
	}

	refresh(): void {
        this._onDidChangeTreeData.fire();
    }

	setData(origin: any, regexRaw: RegexRaw): void {
		this.regexRaw = regexRaw;
		this.regex = regexRaw.re;
		this.origin = clone(origin);

		// get previous stored data
		let localData: any = this.storageManager?.getValue(this.regex)
		// if exist, then we load stored data instead of search results
		if(localData?.tree){
			this.tree = difference(this.origin, localData?.tree);
			this.isStored = true;
		}else{
			this.tree = {};
		}
		
        this.refresh();
    }


	updateItem(data: any): void{

		this.tree = difference(this.origin, data);
		
		this.refresh();
	}

	// Tree data provider 
	public getChildren(element: Node): Thenable<Node[]> {
		return Promise.resolve(this._getChildren(element))
	}

	public getTreeItem(element: Node): vscode.TreeItem {
		return element;
	}
	

	dispose(): void {
		// nothing to dispose
	}

	_getChildren(element: Node | undefined): Node[] {
		if (!element) {
			// the folder: fileName, filePath
			// label = fileName; description = filepath
			
			return Object.keys(this.tree).map(filepath => {
				const [basename, dirname] = getFileName(filepath, this.rootPath)
				return this.toNode(basename, vscode.TreeItemCollapsibleState.Expanded, filepath, dirname, "",0,0, "")
			}
			);
		}
		if (this.tree[element.hash]) {
			// the search results: mstring, ""
			return Object.keys(this.tree[element.hash]).map(hash => 
				this.toNode(
					genLabel(
						this.tree[element.hash][hash]['mString'],
						this.tree[element.hash][hash]['startIdx'],
						this.tree[element.hash][hash]['lastIdx']
					), 
					vscode.TreeItemCollapsibleState.None, 
					hash, 
					'', 
					this.tree[element.hash][hash]['lineNum'],
					this.tree[element.hash][hash]['startIdx'],
					this.tree[element.hash][hash]['lastIdx'],
					element.hash
				)
			);
		}
		return [];
	}

	toNode(label: string, collaps: vscode.TreeItemCollapsibleState, hash: string, description: string, lineNum: string, startIdx: number, lastIdx: number, filePath: string): Node {
		if(lineNum){
			return new Node(label, collaps, hash, description, lineNum, startIdx, lastIdx, filePath, { 
				command: 'AuditSearch.openFile', 
				title: "Open File", 
				arguments: [vscode.Uri.file(filePath),lineNum, startIdx, lastIdx], 
			});
		}
		return new Node(label, collaps, hash, description, lineNum, 0, 0, filePath);
		
		
	};

}


export class Node extends vscode.TreeItem {

	constructor(
		public readonly label: any,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly hash: string,
		public readonly description: string,
		public readonly lineNum: string,
		public readonly startIdx: number,
		public readonly lastIdx: number,
		public readonly filePath: string,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
		this.id = hash;
		if(lineNum){
			this.tooltip = `${this.label?.label}`;
		}else{
			this.tooltip = hash;
		}
		
		// this.description = this.label;
	}

	// iconPath = {
	// 	light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
	// 	dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
	// };

	contextValue = 'file';
}