const emails = ["student@example.com", "admin@lms.com", "tutor1@gmail.com", "rep@institution.com"];
for (const email of emails) {
  let rawRole;
  if (!rawRole) {
    const lowerEmail = email.toLowerCase();
    if (lowerEmail.includes("admin")) {
      rawRole = "admin";
    } else if (lowerEmail.includes("tutor")) {
      rawRole = "tutor";
    } else if (lowerEmail.includes("institution") || lowerEmail.includes("rep")) {
      rawRole = "institution";
    } else {
      rawRole = "student";
    }
  }
  console.log(email, "->", rawRole);
}
