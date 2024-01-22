const chalk = require("chalk");
const fs = require("node:fs");
const path = require("node:path");

function errorFileLogger(errorObj) {
   if (!errorObj.message) throw new Error("Must provide error message.");

   const { message, statusCode } = errorObj;

   const date = new Date().toDateString();
   const dataToWrite = `
    Date: ${date}
    Status Code: ${statusCode}
    Error: ${message}
    `;

   const filePath = path.resolve(__dirname, `../logs/ErrorLog_${date}.txt`);

   //if file already exists
   if (fs.existsSync(filePath)) {
      fs.appendFile(filePath, dataToWrite, (err) => {
         if (err) return console.log(chalk.red(err));
      });
      console.log(
         chalk.green("\nError log: Successfully added to existing file.")
      );
   } else {
      //if file does'nt exists
      fs.writeFile(filePath, dataToWrite, "utf8", (err) => {
         if (err) return console.log(chalk.red(err));
         console.log(
            chalk.green("\nError log: Successfully created new file.")
         );
      });
   }
}

module.exports = { errorFileLogger };
