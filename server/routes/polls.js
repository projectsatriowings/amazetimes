import express from 'express';
import { query, pool } from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/polls/active - Active poll and quiz
router.get('/active', async (req, res) => {
  try {
    // 1. Get active poll
    const pollRes = await query(
      'SELECT id, question, total_votes FROM polls WHERE is_active = true ORDER BY created_at DESC LIMIT 1'
    );
    let poll = null;
    if (pollRes.rows.length > 0) {
      poll = pollRes.rows[0];
      const optionsRes = await query(
        'SELECT id, option_text, votes_count FROM poll_options WHERE poll_id = $1 ORDER BY id ASC',
        [poll.id]
      );
      poll.options = optionsRes.rows;
    }

    // 2. Get active quiz
    const quizRes = await query(
      'SELECT id, question, explanation FROM quizzes WHERE is_active = true ORDER BY created_at DESC LIMIT 1'
    );
    let quiz = null;
    if (quizRes.rows.length > 0) {
      quiz = quizRes.rows[0];
      const quizOptionsRes = await query(
        'SELECT id, option_text, is_correct FROM quiz_options WHERE quiz_id = $1 ORDER BY id ASC',
        [quiz.id]
      );
      quiz.options = quizOptionsRes.rows;
    }

    res.json({ success: true, poll, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/polls/vote - Cast a vote in active poll
router.post('/vote', async (req, res) => {
  const client = await pool.connect();
  try {
    const { poll_id, option_id } = req.body;
    if (!poll_id || !option_id) {
      return res.status(400).json({ success: false, message: 'Poll ID மற்றும் Option ID தேவை' });
    }

    await client.query('BEGIN');

    // Increment option vote count
    await client.query('UPDATE poll_options SET votes_count = votes_count + 1 WHERE id = $1 AND poll_id = $2', [option_id, poll_id]);
    // Increment total votes
    await client.query('UPDATE polls SET total_votes = total_votes + 1 WHERE id = $1', [poll_id]);

    await client.query('COMMIT');

    // Fetch updated tallies
    const pollRes = await query('SELECT id, question, total_votes FROM polls WHERE id = $1', [poll_id]);
    const optionsRes = await query('SELECT id, option_text, votes_count FROM poll_options WHERE poll_id = $1 ORDER BY id ASC', [poll_id]);

    const updatedPoll = pollRes.rows[0];
    updatedPoll.options = optionsRes.rows;

    res.json({ success: true, message: 'வாக்கு பதிவு செய்யப்பட்டது!', poll: updatedPoll });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
});

// POST /api/polls/create - Admin create new poll
router.post('/create', authenticate, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const { question, options } = req.body;
    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ success: false, message: 'கேள்வி மற்றும் குறைந்தபட்சம் 2 தெரிவுகள் தேவை' });
    }

    await client.query('BEGIN');

    // Deactivate previous polls
    await client.query('UPDATE polls SET is_active = false');

    const pollRes = await client.query(
      'INSERT INTO polls (question, is_active, created_by) VALUES ($1, true, $2) RETURNING id, question, total_votes',
      [question.trim(), req.user.id]
    );
    const newPollId = pollRes.rows[0].id;

    for (const optText of options) {
      await client.query(
        'INSERT INTO poll_options (poll_id, option_text, votes_count) VALUES ($1, $2, 0)',
        [newPollId, optText.trim()]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({ success: true, message: 'புதிய கருத்துக்கணிப்பு உருவாக்கப்பட்டது!' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
});

export default router;
