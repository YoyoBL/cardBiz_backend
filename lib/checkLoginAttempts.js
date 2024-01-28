const { errorBadRequest } = require("./errorBadRequest");
const { LoginAttempt } = require("../models/loginAttempts.model");

function calculateTimeRemaining(timestamp) {
   const blockDuration = 24 * 60 * 60 * 1000; //  24 hours in milliseconds

   const timeElapsed = Date.now() - timestamp;
   const timeRemaining = Math.ceil(
      (blockDuration - timeElapsed) / (60 * 60 * 1000)
   ); // Convert to hours
   return timeRemaining;
}

async function checkLoginAttempts(email) {
   try {
      const check = await LoginAttempt.findOne({ email: email });
      //if no previous attempts
      if (!check) {
         const newAttempt = LoginAttempt({
            email,
            attempts: 1,
            timestamp: Date.now(),
         });
         newAttempt.save();
         return errorBadRequest(
            `Wrong email or password. You have 2 attempts left.`
         );
      }

      const timeRemaining = calculateTimeRemaining(check.timestamp);
      console.log(timeRemaining);
      if (check.attempts === 3) {
         //if more than 3 attempts - block message and time remaining
         if (timeRemaining > 0) {
            return errorBadRequest(
               `Account blocked. Try again in ${timeRemaining} hours.`
            );
         } else if (timeRemaining <= 0) {
            //if blocked time passed reset attempts
            await LoginAttempt.findByIdAndUpdate(check._id, {
               attempts: 1,
            });
            return errorBadRequest(
               `Wrong email or password. You have 2 attempts left.`
            );
         }
      }
      //if less than 3 attempts exists
      if (check.attempts < 3) {
         await LoginAttempt.findByIdAndUpdate(check._id, {
            attempts: (check.attempts += 1),
         });
         const errorMessage =
            check.attempts === 3
               ? `Wrong email or password.\nall attempts used.\nThe account is blocked for 24 hours`
               : `Wrong email or password.\nYou have ${
                    3 - check.attempts
                 } attempts left.`;
         return errorBadRequest(errorMessage);
      }
   } catch (error) {
      console.log(error);
      return errorBadRequest("Internal server error", 500);
   }
}

async function clearAttempts(email) {
   try {
      const check = await LoginAttempt.findOne({ email: email });
      if (!check) return;

      await LoginAttempt.findByIdAndDelete(check._id);
      return;
   } catch (error) {
      errorBadRequest("Server Error", 500);
   }
}
module.exports = { checkLoginAttempts, clearAttempts };
