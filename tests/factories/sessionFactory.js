const Keygrip = require("keygrip");
const keys = require("../../config/keys");
const Buffer = require("safe-buffer").Buffer;
const keygrip = new Keygrip([keys.cookieKey]);

module.exports = (user) => {
  const sessionObject = {
    passport: {
      user: user._id.toString(), // user._id returns an object
    },
  };
  //convert sessionObject into string
  const sessionString = Buffer.from(JSON.stringify(sessionObject)).toString(
    "base64"
  );
  // The cookies library expects the format as session=sessionString
  const signature = keygrip.sign("session=" + sessionString);

  return { sessionString, signature };
};
