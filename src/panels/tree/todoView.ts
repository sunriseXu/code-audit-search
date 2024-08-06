import * as vscode from 'vscode';
import { getFileName, genLabel } from '../../utilities/oneUtils';
import { LocalStorageService } from '../../utilities/localStorageService';
import { RegexRaw } from '../../utilities/RTpyes';
export class TodoView implements vscode.TreeDataProvider<Node> {
	
	private _onDidChangeTreeData: vscode.EventEmitter<Node | undefined | void> = new vscode.EventEmitter<Node | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Node | undefined | void> = this._onDidChangeTreeData.event;
	private rootPath: string = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : "";
	
	
	private regex: string = ""
	public tree: any = {}
	private storageManager?: LocalStorageService;
	
	private isStored: boolean = false
	private origin: any = {}
	private regexRaw: RegexRaw = {} as RegexRaw;

	constructor(context: vscode.ExtensionContext) {
		this.storageManager = new LocalStorageService(context.workspaceState);
		
		const view = vscode.window.createTreeView('AuditSearch.todoView', { treeDataProvider: this, showCollapseAll: true, canSelectMany: true });
		context.subscriptions.push(view);
		
		context.subscriptions.push(
			vscode.commands.registerCommand('AuditSearch.initTodoView', (data, regexRaw) => this.setData(data, regexRaw))
		)

		context.subscriptions.push(
			vscode.commands.registerCommand('AuditSearch.openFile', (resource, lineNum, startIdx, lastIdx) => this.openResource(resource, lineNum, startIdx, lastIdx))
		)

		// delete item
		context.subscriptions.push(
			vscode.commands.registerCommand('AuditSearch.deleteTodoItem', (item) => this.deleteItem(item))
		)
		// clear mode
		context.subscriptions.push(
			vscode.commands.registerCommand('AuditSearch.deleteTodo', () => this.deleteAllData())
		)
		// save mode
		context.subscriptions.push(
			vscode.commands.registerCommand('AuditSearch.saveTodo', () => this.saveData())
		)

		
	}

	refresh(): void {
        this._onDidChangeTreeData.fire();
    }

	saveData(): void {
		this.isStored = true;
		if(this.regex){
			this.storageManager?.setValue(this.regex, 
				{
					regexRaw: this.regexRaw,
					tree: this.tree
				}
			)
			vscode.commands.executeCommand('AuditSearch.updateLocalData')
		}
	}

	deleteAllData(): void {
		this.isStored = false;
		if(this.regex){
			this.storageManager?.setValue(this.regex, undefined)
		}
	}

	setData(data: any, regexRaw: RegexRaw): void {
		this.regexRaw = regexRaw;
		this.regex = regexRaw.re;
		this.origin = Object.assign({}, data);

		// get previous stored data
		var localData: any = this.storageManager?.getValue(this.regex)
		// if exist, then we load stored data instead of search results
		if(localData){
			this.tree = localData?.tree;
			this.isStored = true;
		}else{
			// if not exits
			if(this.isStored){
				// we store the results
				this.storageManager?.setValue(this.regex, data)
			}
			// if no store, we just use memory
			this.tree = data;
		}
		
        this.refresh();

    }


	deleteItem(item: any): void{
		let filePath = item.filePath
		let hash = item.hash

		if(filePath==''){
			//delete all item in file
			delete this.tree[hash]
		}else{
			//delete single item
			delete this.tree[filePath][hash]
			if(Object.keys(this.tree[filePath]).length == 0)
				delete this.tree[filePath]
		}

		if(this.isStored){
			this.storageManager?.setValue(this.regex, 
				{
					regexRaw: this.regexRaw,
					tree: this.tree
				}
			)
		}
		
		vscode.commands.executeCommand('AuditSearch.updateDeletedView', this.tree)
		this.refresh();
	}


	private openResource(resource: vscode.Uri, lineNum: string, startIdx: number, lastIdx: number): void {

		var pos1 = new vscode.Position(parseInt(lineNum) - 1, startIdx);
		var pos2 = new vscode.Position(parseInt(lineNum) - 1, lastIdx);
		vscode.workspace.openTextDocument(resource).then(doc => 
		{
			vscode.window.showTextDocument(doc).then(editor => 
			{
				// Line added - by having a selection at the same position twice, the cursor jumps there
				editor.selections = [new vscode.Selection(pos1,pos1)]; 

				// And the visible range jumps there too
				var range = new vscode.Range(pos1, pos2);
				editor.revealRange(range);
				editor.selection = new vscode.Selection(range.start, range.end);
			});
		});
	}

	// Tree data provider 
	public getChildren(element: Node): Thenable<Node[]> {
		return Promise.resolve(this._getChildren(element))
	}

	public getTreeItem(element: Node): vscode.TreeItem {
		return element;
	}
	

	dispose(): void {
		// nothing to disposes
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