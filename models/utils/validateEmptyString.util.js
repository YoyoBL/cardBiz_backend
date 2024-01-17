function validateEmptyString(v, minLength = false) {
   if (v !== "" && v.length <= minLength) return false;
   return true;
}

module.exports = { validateEmptyString };
