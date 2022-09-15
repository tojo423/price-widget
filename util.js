function onlyLettersAndNumbers(str) {
  return /^[A-Za-z0-9]*$/.test(str);
}

module.exports = {
  onlyLettersAndNumbers,
};
