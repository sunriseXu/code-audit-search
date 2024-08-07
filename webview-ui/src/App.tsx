import "./App.css";
import YamlContent from "./regex.yaml"
import { RegexModel, ReSelectOptions } from "./utilities/types/RTpyes";
import { SearchBox } from "./components/SearchBox";
import RegexListWraper from "./components/RegexListWraper";

console.log("yaml:", YamlContent)

let initData: RegexModel = {} as RegexModel
let initOption: ReSelectOptions = {} as ReSelectOptions
function convertYamlContent() {
  var regexs = YamlContent['regexs']
  for (var reItem of regexs) {
    var label = Object.keys(reItem)[0]

    var lang = reItem[label]['lang']
    var type = reItem[label]['type']
    var regex = reItem[label]['re']
    var fileRe = reItem[label]['fileRe']

    if (type in initData) {
      initData[type].push({
        lang: lang,
        re: regex,
        include: fileRe,
        label: label
      })
    } else {
      initData[type] = []
      initData[type].push({
        lang: lang,
        re: regex,
        include: fileRe,
        label: label
      })
    }
  }
  console.log("initData:", initData)
}

function convertYamlOptoins() {
  initOption.includes = Object.keys(YamlContent['fileRex']).map(key => {
    return YamlContent['fileRex'][key]['fileRe']
  })
  initOption.excludes = YamlContent['ignore']['file']
  initOption.excludeDirs = YamlContent['ignore']['directory']
}

convertYamlContent()
convertYamlOptoins()

function App() {

  return (
    <main>
      <SearchBox data={initOption} />
      <RegexListWraper initData={initData} />

    </main>
  );
}

export default App;
