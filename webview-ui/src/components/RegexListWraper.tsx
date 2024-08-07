import RegexList from "./RegexList";
import { RegexModel } from "../utilities/types/RTpyes";
import * as React from 'react';
import { vscode } from "../utilities/vscode";

type propsType = {
  initData: RegexModel
}

function RegexListWraper(props: propsType) {
  const [checked, setChecked] = React.useState("");

  const [localSearch, setLocalSearch] = React.useState([]);

  const [globalSearch, setGlobalSearch] = React.useState([]);

  React.useEffect(() => {
    const handleWebviewEvents = (event: any) => {
      console.log("new event", event)
      switch (event.data.command) {
        case "localData":
          let regexRaws = event.data.message;
          console.log("regexRaws:", regexRaws)
          setLocalSearch(regexRaws)
          break;
        case "globalData":
          let globalregexRaws = event.data.message;
          console.log("globalData:", globalregexRaws)
          setGlobalSearch(globalregexRaws)
          break;
      }
    }

    vscode.postMessage({
      command: "initLocal"
    });

    window.addEventListener("message", handleWebviewEvents)
    return () => window.removeEventListener('message', handleWebviewEvents)
  }, []);

  function handleToggle(item: any) {
    if (item?.label == checked || item?.re == checked) {
      setChecked("")
      return
    }
    setChecked(item?.label ? item?.label : item?.re);
    window.postMessage({
      command: "click",
      message: item,
      search: true
    }, "*");
  }

  return (
    <>
      {/* local search  */}
      <RegexList
        type="Saved Search"
        initData={localSearch}
        checked={checked}
        handleToggle={handleToggle}
      />
      {/* custom saved regex  */}
      <RegexList
        type="Custom Search"
        initData={globalSearch}
        checked={checked}
        handleToggle={handleToggle}
      />
      {
        Object.keys(props.initData).map(key => (
          <RegexList
            type={key}
            initData={props.initData[key]}
            checked={checked}
            handleToggle={handleToggle}
          />
        )
        )
      }
    </>
  );
}

export default RegexListWraper;
