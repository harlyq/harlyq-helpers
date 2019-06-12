// @ts-ignore
const fs = require("fs")

export async function readFile(filename) {
  return new Promise( (resolve, reject) => fs.readFile(filename, "utf8", (err, data) => { 
    if (err) reject(err); else resolve(data) 
  } ))
}

export async function readFilenames(path) {
  return new Promise( (resolve, reject) => fs.readdir(path, (err, filenames) => { 
    if (err) reject(err); else resolve(filenames) 
  } ) )
} 

export async function writeFile(filename, data) {
  return new Promise( (resolve, reject) => fs.writeFile(filename, data, (err) => { 
    if (err) reject(err); else resolve() 
  } ) )
}
