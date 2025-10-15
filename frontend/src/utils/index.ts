let colorIndex = 1;
export const getRandomColor = (): string => {
  const hue = colorIndex * 137.508; // use golden angle approximation
  colorIndex++;
  return `hsl(${hue},70%,40%)`;
};

// Sorry, the types here are a mess and tbh you... probably don't need this but oh well 
export const asyncSQLiteExec = (db: any, query: string, options: any | null) => {
  return new Promise((resolve) => {
    // Add option to ensure row results are returned. Tbh, weird that we have to do this.
    if (options == null){
      options = {returnValue: "resultRows"}
    }else{
      options.returnValue = "resultRows"
    }

    resolve(db.exec(query, options))

  })

}