import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import * as React from 'react';
import "./ForwardedTextInput.css"

type Props = {
  label: string,
  placeholder: string,
  initData: string[],
  onEnter: () => void;
};

const TextInput:React.ForwardRefRenderFunction<any, Props> = (
  { label, placeholder, initData, onEnter},
  ref
) => {
  
  const [open, setOpen] = React.useState(false);

  const arrowRef = React.useRef(null) as any;

  const divRef = React.useRef(null) as any;

  React.useEffect(() => {
    const closeDropdown = (e: Event) => {
      if (!arrowRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.body.addEventListener('click', closeDropdown)
    return () => document.body.removeEventListener('click', closeDropdown)
  }, []);

  function handleKeyDown(e: any) {
    if (e.key === 'Enter') {
      onEnter()
      
    }
  }

  function handleSelect(value: string) {
    divRef.current.children[0].value = value
  }


  return (
    <>
      <div className="mydropdown"
       ref={divRef}
       style={{width:"100%", maxWidth:"190px", position:"relative"}}>
        <VSCodeTextField 
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          ref={ref}
        >
          {label}
          <span slot="end" 
            className={"codicon codicon-chevron-right " + (open ? "rotate" : "")}
            onClick={() => setOpen(!open)}
            ref={arrowRef}
          >
          </span>
        </VSCodeTextField>

        <ul role="listbox" className={open ? "show": ""}>
          {initData.map(item=>(
            <li title={item}
              onClick={() => {
                handleSelect(item)
                setOpen(!open);
              }}
            >{item}</li>
          ))}
          
          
        </ul>
      </div>
      
    </>
  );
}
const ForwardedTextInput = React.forwardRef(TextInput);
export default ForwardedTextInput;