import { ExtensionContext, window, commands } from "vscode";
import { SearchViewProvider } from "./panels/webview/searchViewProvider";
import { TodoView } from "./panels/tree/todoView";
import { DeletedView } from "./panels/tree/deletedView";

export function activate(context: ExtensionContext) {

  const provider = new SearchViewProvider(context.extensionUri, context);
  context.subscriptions.push(
    window.registerWebviewViewProvider(SearchViewProvider.viewType, provider)
  );

  new DeletedView(context);

  new TodoView(context);

}
