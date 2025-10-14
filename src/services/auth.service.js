const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Organisation = require("../models/organisation.models");
const config = require("../config");
const User = require("../models/user.model");

async function signup({ name, email, password, role, organisation }) {
  // Add a log to see exactly what value is being received for the organisation.
  console.log(`[AuthService] Signup attempt with : "${organisation}"`);

  if (
    !organisation ||
    typeof organisation !== "string" ||
    organisation.trim() === ""
  ) {
    const err = new Error("Organisation name must be a non-empty string.");
    err.status = 400; // Bad Request
    throw err;
  }

  let orgDoc;
  try {
    // Use a case-insensitive regex for a more robust search and trim whitespace.
    const trimmedOrgName = organisation.trim();
    orgDoc = await Organisation.findOne({
      name: { $regex: new RegExp(`^${trimmedOrgName}$`, "i") },
    });

    if (!orgDoc) {
      console.log(
        `[AuthService] Organisation "${trimmedOrgName}" not found. Creating new one.`
      );
      orgDoc = await Organisation.create({ name: trimmedOrgName });
    }
  } catch (error) {
    console.error(
      "[AuthService] Error finding or creating organisation:",
      error
    );
    const err = new Error("Could not find or create the organisation.");
    err.status = 500;
    throw err;
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    organisation: orgDoc._id,
  });

  // Create a JWT for the newly created user (same approach as login)
  const token = jwt.sign(
    { id: user._id, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  // Reconcile organisation user counts so dashboard shows correct numbers
  try {
    await syncOrganisationUserCounts(orgDoc._id);
  } catch (err) {
    console.error(
      "[AuthService] Failed to sync organisation user counts after signup",
      err.message || err
    );
  }

  return { user, token };
}

async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");
  const match = await user.comparePassword(password);
  if (!match) throw new Error("Invalid credentialss");
  const token = jwt.sign(
    { id: user._id, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
  // After login, reconcile organisation user counts to ensure dashboard shows correct numbers
  try {
    if (user.organisation) await syncOrganisationUserCounts(user.organisation);
  } catch (err) {
    console.error(
      "[AuthService] Failed to sync organisation user counts after login",
      err.message || err
    );
  }

  return { user, token };
}

async function syncOrganisationUserCounts(orgId) {
  if (!orgId) return;
  try {
    const [fieldEngineerCount, assetManagerCount] = await Promise.all([
      User.countDocuments({ organisation: orgId, role: "field-engineer" }),
      User.countDocuments({ organisation: orgId, role: "asset-manager" }),
    ]);
    await Organisation.findByIdAndUpdate(orgId, {
      totalFieldEngineers: fieldEngineerCount,
      totalAssetManagers: assetManagerCount,
    });
  } catch (err) {
    // don't throw - allow caller to continue even if sync fails
    console.error(
      "[AuthService] Error syncing organisation user counts",
      err.message || err
    );
  }
}

module.exports = { signup, login };
