const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

exports.handler = async (event) => {
  const { password, title, contributor, body, action } = JSON.parse(event.body);

  if (password !== process.env.ADMIN_PASSWORD) {
    return {
      statusCode: 403,
      body: JSON.stringify({ success: false, message: "Unauthorized" })
    };
  }  

  if (action === "get-submissions") {
    const siteId = process.env.SITE_ID;
    const token = process.env.NETLIFY_PAT;

    const formRes = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/forms`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const forms = await formRes.json();
    const storyForm = forms.find(f => f.name === "story-submission");

    const subRes = await fetch(`https://api.netlify.com/api/v1/forms/${storyForm.id}/submissions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const submissions = await subRes.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, submissions })
    };
  }

  // approve a single story
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
