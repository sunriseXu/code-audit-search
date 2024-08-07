import * as cp from "child_process";
import * as crypto from 'crypto';
import * as path from 'path';
import * as deepmerge from 'deepmerge'
import * as YAML from 'yaml'
import * as fs from 'fs'
import { RegexRaw } from "./RTpyes";

export const md5 = (contents: string) => crypto.createHash('md5').update(contents).digest("hex");

export const execShell = (cmd: string) =>
    new Promise<string>((resolve, reject) => {
        cp.exec(cmd, (err, out) => {
            // if (err) {
            //     return reject(err);
            // }
            return resolve(out);
        });
    });


export const splitLines = (lines: string) => {
    return lines.split(/\r?\n/)
}


export const splitLine = (line: string, regex: string) => {
    
    var fidx = line.indexOf(":");
    var sidx = line.indexOf(":", fidx+1);
    var filePath = line.substring(0, fidx);
    var lineNum = line.substring(fidx+1, sidx);
    var mString = line.substring(sidx+1, line.length)
    
    if (!parseInt(lineNum))
        return false

    var regexp = RegExp(regex,'g')
    var result = regexp.exec(mString)
    var startIdx = result?.index
    var lastIdx = regexp.lastIndex

    var tmp = filePath + ':' + lineNum + ':' + mString
    var hash = md5(tmp)
    
    
    return {
        [filePath]: {
            [hash]: {
                lineNum: lineNum,
                mString: mString,
                startIdx: startIdx,
                lastIdx: lastIdx
            }
        }
    }
}

export const genLabel = (label: string, startIdx: number, lastIdx: number) => {
    var i, frontSpaceLen = 0;
    for(i = 0; i < label.length; i++){
        if(label.charAt(i)==' '){
            frontSpaceLen += 1;
            continue;
        } 
        break
    }
    return <any>{ label: label.trim(), highlights: [[startIdx - frontSpaceLen, lastIdx - frontSpaceLen]] }
}

export const mergeMap = (treeMap: Object, item: Object) => {
    return deepmerge(treeMap, item)

}

export const countResults = (treeMap: Object) =>{
    var fileLen = Object.keys(treeMap).length
    var resultLen = 0
    for(var filePath of Object.keys(treeMap)){
        resultLen += Object.keys(treeMap[filePath as keyof typeof treeMap]).length
    }
    return {
        fileLen: fileLen,
        resultLen: resultLen
    }
}

// all results: obj1
// remaining results: obj2
export const difference = (obj1: any, obj2: any) => {
    let result: any = {}
    for (var filePath of Object.keys(obj1)) {
        if(!(filePath in obj2)){
            result[filePath] = obj1[filePath]
        }else{
            var tmp:any = {}
            for(var hash of Object.keys(obj1[filePath])){
                if(!(hash in obj2[filePath])){
                    tmp[hash] = obj1[filePath][hash]
                }
            }
            if(Object.keys(tmp).length > 0){
                result[filePath] = tmp
            }
        }
    }
    return result
}
export function clone(a: Object) {
    return JSON.parse(JSON.stringify(a));
}

export const getFileName = (filePath: string, workspacePath: string) => {
    let basename = path.basename(filePath);
    let dirname = path.resolve(path.dirname(filePath));
    if(dirname.startsWith(workspacePath)){
        dirname = dirname.replace(workspacePath+path.sep, "")
    }
    return [basename, dirname]

}

export const parseYaml = (filePath: string) => {
    const file = fs.readFileSync(filePath, 'utf8')
    return YAML.parse(file)
}


export const parseRegex = (data: RegexRaw, workspaceDir: string) => {
    let regex = data.re.replaceAll('"','\\x22')
                .replaceAll("'","\\x27").replaceAll("`","\\x60")
    let includes = data.include?data.include.split(',').map(item => item.trim()):[]
    let excludes = data.exclude?data.exclude.split(',').map(item => item.trim()):[]
    let excludeDirs = data.excludeDir?data.excludeDir.split(',').map(item => item.trim()):[]

    // grep -P '\([\x22\x27\x60]' -rno  ./ --include="*.js" --exclude="*.min.js" --exclude-dir="node_modules*"
    let includeCmd = includes.reduce((partial, item) => partial + ` --include="${item.replaceAll('"',"")}"`, "")
    let excludeCmd = excludes.reduce((partial, item) => partial + ` --exclude="${item.replaceAll('"',"")}"`, "")
    let excludeDirCmd = excludeDirs.reduce((partial, item) => partial + ` --exclude-dir="${item.replaceAll('"',"")}"`, "")
    let cmd = `grep -P '${regex}' -rn ${workspaceDir} ${includeCmd} ${excludeCmd} ${excludeDirCmd} 2>&-`
    return {
        re: regex,
        include: includes,
        exclude: excludes,
        excludeDir: excludeDirs,
        cmd: cmd
    }
}

