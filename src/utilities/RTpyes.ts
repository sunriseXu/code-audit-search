// export type RegexItem = {
//     lang: string,
//     re: string,
//     fileRe: string,
//     label: string
//   }
  
// export type RegexModel = {
//     [type: string]: RegexItem[]
//   }
  
  export type RegexRaw = {
    re: string,
    include: string,
    exclude: string,
    excludeDir: string
  }