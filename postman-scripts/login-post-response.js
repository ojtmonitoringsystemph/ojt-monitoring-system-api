// Post-response script for Login User request
// This script automatically stores the access token and refresh token from the login response
// into Postman environment variables for use in subsequent requests

pm.test("Login successful", function () {
  pm.response.to.have.status(200);
});

pm.test("Response has required fields", function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property("status");
  pm.expect(jsonData).to.have.property("data");
  pm.expect(jsonData.data).to.have.property("accessToken");
  pm.expect(jsonData.data).to.have.property("refreshToken");
  pm.expect(jsonData.data).to.have.property("user");
});

// Store tokens in environment variables
if (pm.response.code === 200) {
  const responseJson = pm.response.json();

  if (responseJson.status === "success" && responseJson.data) {
    const { accessToken, refreshToken, user } = responseJson.data;

    // Store tokens in environment variables
    pm.environment.set("accessToken", accessToken);
    pm.environment.set("refreshToken", refreshToken);

    // Store user information (optional)
    pm.environment.set("userId", user._id);
    pm.environment.set("userEmail", user.email);
    pm.environment.set("username", user.username);

    // Log success message
    console.log("✅ Tokens stored successfully!");
    console.log("📧 User:", user.email);
    console.log("🔑 Access Token:", accessToken.substring(0, 20) + "...");
    console.log("🔄 Refresh Token:", refreshToken.substring(0, 20) + "...");

    // Set token expiration reminder (7 days from now based on your JWT config)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);
    pm.environment.set("tokenExpiration", expirationDate.toISOString());

    console.log("⏰ Token expires:", expirationDate.toLocaleString());
  }
} else {
  console.log("❌ Login failed - tokens not stored");
}

// Optional: Clear any previous authentication errors
pm.environment.unset("authError");
