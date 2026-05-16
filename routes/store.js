const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

router.get('/store-products', storeController.getStoreProducts);
router.post('/store/buy/:id', storeController.buyProduct);

module.exports = router;
