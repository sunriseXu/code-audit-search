import { vscode } from "../utilities/vscode";
import { VSCodeTextField, VSCodeDivider } from "@vscode/webview-ui-toolkit/react";
import * as React from 'react';
import ForwardedTextInput from "./ForwardedTextInput";
import { ReSelectOptions } from "../utilities/types/RTpyes";
import "./SearchBox.css"
type propsType = {
  data: ReSelectOptions
}

export function SearchBox(props: propsType) {
  
  const [searchRes, setSearchRes] = React.useState<string>('');

  const [isRes, setIsRes] = React.useState<boolean>(false);

  const reRef = React.useRef(null) as any;

  const includeRef = React.useRef(null) as any;

  const excludeRef = React.useRef(null) as any;

  const excludeDirRef = React.useRef(null) as any;

  React.useEffect(() => {
    const handleWebviewEvents = (event: any) => {
      console.log("new event", event)
      switch(event.data.command){
        case "result":
          let message = event.data.message;
          setSearchRes(message)
          setIsRes(true)
          break;
        case "click":
          let initData = event.data.message;
          reRef.current.value = initData.re;
          includeRef.current.value = initData.include;
          excludeRef.current.value = initData.hasOwnProperty('exclude') ? initData?.exclude : props.data.excludes[0]
          excludeDirRef.current.value = initData.hasOwnProperty('excludeDir') ? initData?.excludeDir : props.data.excludeDirs[0]
          if(event.data?.search)
            handleEnter()
          break;
      }
    }
    window.addEventListener("message", handleWebviewEvents)
    return () => window.removeEventListener('message', handleWebviewEvents)
  }, []);

  function handleEnter(){
    console.log("enter called")
    console.log("current value:",includeRef)
    console.log("current value:",includeRef.current.value)
    let re = reRef.current.value;
    let include = includeRef.current.value;
    let exclude = excludeRef.current.value;
    let excludeDir = excludeDirRef.current.value;

    vscode.postMessage({
      command: "search",
      obj: {
          re: re,
          include: include,
          exclude: exclude,
          excludeDir: excludeDir
      }
    });
  }

  function handleReEnter(e: any){
    if (e.key === 'Enter') {
      handleEnter()
    }
  }

  function handleOnchange(e: any){
    console.log("handle onchange")
    setIsRes(false)
  }


  return (
    <>
      <VSCodeTextField 
        placeholder="use perl regex"
        ref={reRef}
        onKeyDown={handleReEnter}
        onChange={handleOnchange}
      >
        search regex
        {/* <span slot="end" 
            className="codicon codicon-regex regex">
        </span> */}
        <span slot="end" className="codicon--regex regex"></span>
      </VSCodeTextField>

      <ForwardedTextInput 
        ref={includeRef}
        label="files to include"
        placeholder="e.g. *.js,*.ts"
        initData={props.data.includes}
        onEnter={handleEnter}
      />

      <ForwardedTextInput 
        ref={excludeRef}
        label="files to exclude"
        placeholder="e.g. *.min.js,*test.js"
        initData={props.data.excludes}
        onEnter={handleEnter}
      />

      <ForwardedTextInput 
        ref={excludeDirRef}
        label="directories to exclude"
        placeholder="e.g. test*,docs"
        initData={props.data.excludeDirs}
        onEnter={handleEnter}
      />
      {isRes?(<div className="">{searchRes}</div>):""}
      <VSCodeDivider></VSCodeDivider>
      
    </>
  );
}
