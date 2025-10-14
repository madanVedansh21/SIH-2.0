const Transformer = require("../models/transformer.model");
const Test = require("../models/test.model");
const User = require("../models/user.model");
const Organisation = require("../models/organisation.models");

async function syncOrganisationTransformerCount(orgId) {
  if (!orgId) return;
  try {
    const organisation = await Organisation.findById(orgId).lean();
    if (!organisation) return;
    const count = Array.isArray(organisation.totalTransformers)
      ? organisation.totalTransformers.length
      : 0;
    await Organisation.findByIdAndUpdate(orgId, {
      /* no numeric field currently stored; keeping consistent */
    });
  } catch (err) {
    console.error(
      "Failed to sync organisation transformer count",
      err.message || err
    );
  }
}

async function createTransformer(data) {
  const t = new Transformer(data);
  const saved = await t.save();

  try {
    // add transformer id to organisation.totalTransformers if owner belongs to an organisation
    if (data.owner) {
      const user = await User.findById(data.owner)
        .select("organisation")
        .lean();
      if (user && user.organisation) {
        await Organisation.findByIdAndUpdate(user.organisation, {
          $addToSet: { totalTransformers: saved._id },
        });
        // attempt to sync counts (best-effort)
        try {
          await syncOrganisationTransformerCount(user.organisation);
        } catch (e) {}
      }
    }
  } catch (err) {
    // don't fail creation if org update fails; just log
    console.error(
      "Failed to update organisation with transformer",
      err.message || err
    );
  }

  return saved;
}

async function getUserTransformers(userId) {
  return Transformer.find({ owner: userId }).lean();
}

async function getOrganisationTransformers(orgId) {
  if (!orgId) return [];
  const organisation = await Organisation.findById(orgId).lean();
  if (
    !organisation ||
    !Array.isArray(organisation.totalTransformers) ||
    organisation.totalTransformers.length === 0
  )
    return [];
  const ids = organisation.totalTransformers;
  return Transformer.find({ _id: { $in: ids } })
    .select("name installationDate metadata owner createdAt")
    .populate("owner", "name email")
    .lean();
}

async function getTransformerById(id) {
  return Transformer.findById(id);
}

async function updateTransformer(id, data) {
  return Transformer.findByIdAndUpdate(id, data, { new: true });
}

async function deleteTransformer(id) {
  // find transformer to get owner/org info
  const t = await Transformer.findById(id).lean();
  await Test.deleteMany({ transformer: id });

  try {
    if (t && t.owner) {
      const user = await User.findById(t.owner).select("organisation").lean();
      if (user && user.organisation) {
        await Organisation.findByIdAndUpdate(user.organisation, {
          $pull: { totalTransformers: id },
        });
        // attempt to sync counts (best-effort)
        try {
          await syncOrganisationTransformerCount(user.organisation);
        } catch (e) {}
      }
    }
  } catch (err) {
    console.error(
      "Failed to remove transformer from organisation",
      err.message || err
    );
  }

  return Transformer.findByIdAndDelete(id);
}

module.exports = {
  createTransformer,
  getUserTransformers,
  getOrganisationTransformers,
  getTransformerById,
  updateTransformer,
  deleteTransformer,
};
