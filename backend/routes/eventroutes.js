const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');

const { protect } = require('../middleware/auth');

// Protéger toutes les routes
router.use(protect);

router
  .route('/')
  .get(getEvents)
  .post(createEvent);

router
  .route('/:id')
  .get(getEvent)
  .put(updateEvent)
  .delete(deleteEvent);

module.exports = router;
