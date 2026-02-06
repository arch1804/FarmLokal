const express = require('express');
const { getSupplierProducts, getStatus } = require('../controllers/externalController');

const router = express.Router();

router.get('/supplier-products', getSupplierProducts);
router.get('/status', getStatus);

module.exports = router;
