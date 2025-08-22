const {FileSystem} = require("../index.js");
const {create} = require("kit/js/util");

console.log("initializing test");
(async () => {
    const fs = create(FileSystem)(".");
    const a = await fs.each((f) => console.log("pass 1",f.path));
    const b = await fs.each((f) => console.log("pass 2",f.path));
})();
