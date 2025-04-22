const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  const { password, title, contributor, body } = JSON.parse(event.body);

  if (password !== process.env.ADMIN_PASSWORD) {
    return {
      statusCode: 403,
      body: JSON.stringify({ success: false, message: "Unauthorized" })
    };
  }

  const filePath = path.join(__dirname, "../../approved-stories.json");
  const existing = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath))
    : [];

  const updated = [...existing, { title, contributor, body }];
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
};
