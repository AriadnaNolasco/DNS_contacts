const express = require('express');
const router = express.Router();
const controller = require('../controllers/contactController');

router.get('/', controller.list);
router.get('/contacts/new', controller.newForm);
router.post('/contacts', controller.uploadMiddleware, controller.create);
router.get('/contacts/:id/edit', controller.editForm);
router.post('/contacts/:id', controller.uploadMiddleware, controller.update);
router.post('/contacts/:id/delete', controller.remove);
router.get('/search', controller.searchByLastName);

module.exports = router;
