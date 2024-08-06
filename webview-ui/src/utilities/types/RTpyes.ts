export type RegexItem = {
    lang?: string,
    re: string,
    include: string,
    label?: string,
    exclude?: string,
    excludeDir?: string
  }
  
export type RegexModel = {
    [type: string]: RegexItem[]
  }

  export type ReSelectOptions = {
    includes: string[],
    excludes: string[],
    excludeDirs: string[],
  }