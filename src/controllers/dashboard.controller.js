const Transformer = require('../models/transformer.model');
const Organisation = require('../models/organisation.models');
const Alert = require('../models/alert.model');
const User = require('../models/user.models');

async function getDashboard(req, res, next){
  try{
    const user = req.user;

    // We will show organisation transformers and indicate which ones are assigned to the current user.

    // Fetch organisation info and its transformers.
    // Use only the authoritative list stored on organisation.totalTransformers.
    const organisation = await Organisation.findById(user.organisation).lean();
    let orgTransformers = [];
    if (organisation && Array.isArray(organisation.totalTransformers) && organisation.totalTransformers.length) {
      const ids = organisation.totalTransformers;
      // Select only the fields defined in the Transformer model and populate owner with basic info
      orgTransformers = await Transformer.find({ _id: { $in: ids } })
        .select('name installationDate metadata owner createdAt')
        .populate('owner', 'name email')
        .lean();

      // attach pending alerts and assignedToUser flag to each org transformer
      orgTransformers = await Promise.all(orgTransformers.map(async (t) => {
        const pending = await Alert.countDocuments({ transformer: t._id, read: false });
        const ownerId = t.owner ? (t.owner._id ? t.owner._id.toString() : t.owner.toString()) : null;
        const assignedToUser = ownerId && ownerId === user._id.toString();
        return { id: t._id, name: t.name, installationDate: t.installationDate, metadata: t.metadata || {}, owner: t.owner || null, createdAt: t.createdAt, pendingAlerts: pending, assignedToUser };
      }));
    }

    // Organisation summary fields
    const orgSummary = organisation ? {
      id: organisation._id,
      name: organisation.name,
      // prefer authoritative count stored on organisation, fall back to actual fetched list
      totalTransformers: (Array.isArray(organisation.totalTransformers) ? organisation.totalTransformers.length : orgTransformers.length),
      // also expose the transformer id list recorded on organisation (may be used by frontend)
      totalTransformerIds: organisation.totalTransformers || [],
      totalRedFlags: organisation.totalRedFlags || 0,
      totalMissingReports: organisation.totalMissingReports || 0,
      totalFieldEngineers: organisation.totalFieldEngineers || 0,
      totalAssetManagers: organisation.totalAssetManagers || 0,
      createdAt: organisation.createdAt,
      updatedAt: organisation.updatedAt
    } : null;

    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      organisation: orgSummary,
      organisationTransformers: orgTransformers
    });
  }catch(err){ next(err); }
}

module.exports = { getDashboard };
