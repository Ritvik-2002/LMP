const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getAllProducts);
router.get('/stats', productController.getStats);
router.get('/export', productController.exportProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.addProduct);
router.post('/import', productController.importProducts);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.delete('/', productController.clearAll);

module.exports = router;