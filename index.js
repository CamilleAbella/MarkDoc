const fs = require("fs")
const path = require('path')

module.exports = (filePathResolvable, docPathResolvable) => {
    const filePath = path.resolve(filePathResolvable)
    const docPath = path.resolve(docPathResolvable)
    if(!filePath.endsWith(".js")) throw Error("The input must be a JS file")
    if(!docPath.endsWith(".md")) throw Error("The input must be a MD file")
    fs.readFile(filePath, {encoding : "utf8"}, (error, string) => {

        if(error) throw error

        const docs = {props:[`## Properties`],methods:[`## Methods`]}
        const _module = require(filePath)
        const props = Object.getOwnPropertyDescriptors(_module.prototype || _module)

        for(prop in props){

            const desc = props[prop]

            const isFunction = typeof desc.value == "function" || typeof desc.value == "asyncFunction"
            const readonly = !desc.writable || desc.get
            const isAsync = typeof method == "asyncFunction"
            const args = isFunction ? `( ${
                string.split("\n").find(line => {
                    return (
                        line.includes(`${prop}(`) && 
                        line.includes("){")
                    )
                })
                    .replace(`${prop}(`,"")
                    .replace("){","")
                    .replace("async","")
                    .trim() || ""
            })` : ""
            const returns = isFunction ? (
                isAsync ? "[Promise](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Promise)" : "?unknown"
            ) : (
                desc.value && desc.value.constructor ? desc.value.constructor.name : typeof desc.value
            )

            const doc = [
                `### .${prop}${args} ${readonly ? "`READ-ONLY`" : ""}`,
                `| Name | ${isFunction ? "Return" : "Type"} | Description |`,
                `|:-:|:-:|:-:|`,
                `| ${prop} | ${returns} | No description. |`
            ]

            docs[isFunction ? "methods" : "props"].push(doc.join("\n"))
        }

        fs.writeFile(docPath,
            `# ${filePath.slice(filePath.lastIndexOf("\\")+1).replace(".js","").trim()}\n> No description.\n\n`+
            docs.props.join("\n\n")+"\n\n"+
            docs.methods.join("\n\n")
        , error => {
            if(error) throw error
        })
    })
}