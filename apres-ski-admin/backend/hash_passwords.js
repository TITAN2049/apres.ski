const bcrypt = require("bcrypt");

(async () => {
    const password = "eventpass"; // Replace with the actual password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("New Hashed Password:", hashedPassword);
})();
