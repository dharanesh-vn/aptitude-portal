const { param } = require('express-validator');

const submissionIdParam = [param('id').isMongoId().withMessage('Invalid submission id')];

module.exports = { submissionIdParam };
