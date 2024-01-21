const fs = require("node:fs");
const path = require("node:path");

function errorFileLogger(errorMessage, statusCode) {
   if (!statusCode) throw new Error("Must provide error status code.");
   if (!errorMessage) throw new Error("Must provide error message.");

   const error = new Error(errorMessage);
   error.statusCode = statusCode;

   const date = new Date().toDateString();
   const dataToWrite = `
    Date: ${date}
    Status Code: ${statusCode}
    Error: ${errorMessage}
    `;

   const filePath = path.resolve(__dirname, `../logs/ErrorLog_${date}.txt`);

   //if file already exists
   if (fs.existsSync(filePath)) {
      fs.appendFile(filePath, dataToWrite, (err) => {
         if (err) return console.log(err);
      });
      console.log("\nError log: Added to existing file.");
   } else {
      //if file does'nt exists
      fs.writeFile(filePath, dataToWrite, "utf8", (err) => {
         if (err) return console.log(err);
         console.log("\nError log: Created new file.");
      });
   }
   throw error;
}

module.exports = { errorFileLogger };
