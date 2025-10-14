const Transformer = require("../models/transformer.model");
const Organisation = require("../models/organisation.models");
const User = require("../models/user.model");

async function getDashboard(req, res, next) {
  try {
    const user = req.user;

    // We will show organisation transformers and indicate which ones are assigned to the current user.

    // Fetch organisation info and its transformers.
    // Use only the authoritative list stored on organisation.totalTransformers.
    const organisation = await Organisation.findById(user.organisation).lean();
    let orgTransformers = [];
    if (
      organisation &&
      Array.isArray(organisation.totalTransformers) &&
      organisation.totalTransformers.length
    ) {
      const ids = organisation.totalTransformers;
      // Select only the fields defined in the Transformer model and populate owner with basic info
      orgTransformers = await Transformer.find({ _id: { $in: ids } })
        .select("name installationDate metadata owner createdAt")
        .populate("owner", "name email")
        .lean();

      // attach pending alerts and assignedToUser flag to each org transformer
      // Normalize all ids to strings before comparing to avoid ObjectId/string mismatches
      const userIdStr = user && user._id ? user._id.toString() : String(user);
      orgTransformers = orgTransformers.map((t) => {
        const ownerObj = t.owner || null;
        const ownerIdStr = ownerObj
          ? ownerObj._id
            ? ownerObj._id.toString()
            : String(ownerObj)
          : null;
        const assignedToUser = ownerIdStr ? ownerIdStr === userIdStr : false;
        return {
          id: t._id ? t._id.toString() : String(t._id),
          name: t.name,
          installationDate: t.installationDate,
          metadata: t.metadata || {},
          owner: ownerObj,
          createdAt: t.createdAt,
          pendingAlerts: 0,
          assignedToUser,
        };
      });
    }

    // Organisation summary fields
    const orgSummary = organisation
      ? {
          id: organisation._id,
          name: organisation.name,
          // prefer authoritative count stored on organisation, fall back to actual fetched list
          totalTransformers: Array.isArray(organisation.totalTransformers)
            ? organisation.totalTransformers.length
            : orgTransformers.length,
          // also expose the transformer id list recorded on organisation (may be used by frontend)
          totalTransformerIds: organisation.totalTransformers || [],
          totalRedFlags: organisation.totalRedFlags || 0,
          totalMissingReports: organisation.totalMissingReports || 0,
          totalFieldEngineers: organisation.totalFieldEngineers || 0,
          totalAssetManagers: organisation.totalAssetManagers || 0,
          createdAt: organisation.createdAt,
          updatedAt: organisation.updatedAt,
        }
      : null;

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      organisation: orgSummary,
      organisationTransformers: orgTransformers,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard };
