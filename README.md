# Code Audit Search

## Description

During code audit, we use lots of regex to match potential vulnerable sources and sinks. However, in large codebase, the results can be so many that it's not easy to manage the results and review history. So that I write a vscode extension to improve your searching experience. You can search with your favorite regex and save the results, take a break, and go back to grab them. I also provide built-in handy regex with various vulnerablity type, including xss, rce, unsafe extraction. Just go and get it to start your code audit journey.

## Installation

_Either_

- click the extensions button (lowest square icon in the editor), and type in code audit search, select the one by sunriseXu

_or_

- go here [vscode Extensions Marketplace](https://marketplace.visualstudio.com/items?itemName=sunriseXu.audit-search&ssr=false#overview)


## Features

### Built-in regex templates

| Tag              | Type | Regex  | Description                                        |
| ------------------ | ----- | ------------ | ------------------------------------------- |
| `jqTempStr`  | xss |  `[\s\S]{0,20}<[\s\S]{0,200}?\${[\s\S]*?} |js template strings for raw html tags |
| `rubyTempStr`  | xss |  %Q?([^a-zA-Z\d\s])[\s\S]{0,50}?<[\s\S]{0,50}?#\\{[\s\S]{1,50}?\\}[\s\S]{0,50}?> |ruby template strings for raw html tags |
| `untarPython`  | traversal |  \\.extractall\\([\s\S]{0,100}?\\) |find extractor isuue, such as symlink to arbitrary file read |

![demo1](https://github.com/user-attachments/assets/4c403068-d705-41a7-bdf1-31a481395720)


### Save and Resume Your Searching

In `TODO VIEW`, click `save this search results` button, the search results will be saved in current workspace. You can delete the not interesting results during code audit. You can resume your auditing progress any time by clicking item in `Saved Search` tab.

![save-and-resume](https://github.com/user-attachments/assets/c12d8759-0420-475d-86ac-0bbd78666ab1)



### Save your custom regex across workspaces

Besides built-in regexs, you can build your custom regexs accross different workspaces. Just click `save this regex globally`, you will be prompted to fill in regex tag name and which language to use. You can find your custom regexs in `Custom Search` Tab.

![save-regex](https://github.com/user-attachments/assets/f575951e-ea5e-439d-9da9-de2b7d09f496)

