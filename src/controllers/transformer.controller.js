const transformerService = require("../services/transformer.service");
const testService = require("../services/test.service");

async function createTransformer(req, res, next) {
  try {
    const payload = Object.assign({}, req.body, { owner: req.user._id });
    const t = await transformerService.createTransformer(payload);
    res.status(201).json(t);
  } catch (err) {
    next(err);
  }
}

async function listTransformers(req, res, next) {
  try {
    const orgId = req.user.organisation;
    const list = await transformerService.getOrganisationTransformers(orgId);
    const transformersWithCounts = list.map((t) => {
      const assignedToUser =
        t.owner &&
        t.owner._id &&
        t.owner._id.toString() === req.user._id.toString();
      return Object.assign(
        {},
        {
          id: t._id,
          name: t.name,
          installationDate: t.installationDate,
          metadata: t.metadata || {},
          owner: t.owner || null,
          createdAt: t.createdAt,
          pendingAlerts: 0,
          assignedToUser,
        }
      );
    });
    res.json(transformersWithCounts);
  } catch (err) {
    next(err);
  }
}

async function getTransformer(req, res, next) {
  try {
    const t = await transformerService.getTransformerById(req.params.id);
    if (!t) return res.status(404).json({ error: "Not found" });
    res.json(t);
  } catch (err) {
    next(err);
  }
}

async function updateTransformer(req, res, next) {
  try {
    const t = await transformerService.updateTransformer(
      req.params.id,
      req.body
    );
    res.json(t);
  } catch (err) {
    next(err);
  }
}

async function deleteTransformer(req, res, next) {
  try {
    await transformerService.deleteTransformer(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

async function uploadTestFile(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: "File required" });
    // verify transformer exists and belongs to user's organisation
    const transformer = await transformerService.getTransformerById(
      req.params.transformerId
    );
    if (!transformer)
      return res.status(404).json({ error: "Transformer not found" });
    // normalize organisation id
    const orgId =
      req.user && req.user.organisation
        ? req.user.organisation.toString()
        : null;
    // ensure transformer id is included in organisation's list when possible
    const Organisation = require("../models/organisation.models");
    const organisation = orgId
      ? await Organisation.findById(orgId).lean()
      : null;
    if (
      organisation &&
      Array.isArray(organisation.totalTransformers) &&
      !organisation.totalTransformers
        .map((id) => id.toString())
        .includes(transformer._id.toString())
    ) {
      return res
        .status(403)
        .json({ error: "Forbidden: transformer not in your organisation" });
    }

    // Optionally parse to extract lightweight metadata like testDate, but do not persist raw content
    let parsedMeta = {};
    try {
      const parser = require("../utils/parseFile");
      parsedMeta = await parser.parseFile(req.file);
    } catch (e) {
      /* ignore parse errors for direct ML path */
    }

    // build a minimal fileRecord we store (no uploadPath)
    const fileRecord = {
      filename: req.file.originalname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
    };

    // Send file directly to ML via service; avoid storing raw content
    const test = await testService.createTestRecord({
      transformerId: req.params.transformerId,
      fileRecord,
      parsedData: {},
      testDate: parsedMeta.testDate || new Date(),
      uploaderId: req.user._id,
      uploadedFile: req.file,
    });
    // Add id alias for frontend convenience
    res
      .status(201)
      .json(
        Object.assign({}, test.toObject ? test.toObject() : test, {
          id: test._id,
        })
      );
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createTransformer,
  listTransformers,
  getTransformer,
  updateTransformer,
  deleteTransformer,
  uploadTestFile,
};
