import express from 'express';
import cors from 'cors';
import { encode, decode } from '@toon-format/toon';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'TOON Converter API' });
});

// JSON to TOON
app.post('/encode', (req, res) => {
  try {
    const { data, options } = req.body;

    if (!data) {
      return res.status(400).json({
        error: 'Missing "data" field in request body'
      });
    }

    const toonOutput = encode(data, options || {});

    res.json({
      success: true,
      toon: toonOutput,
      originalSize: JSON.stringify(data).length,
      toonSize: toonOutput.length,
      savings: `${(((JSON.stringify(data).length - toonOutput.length) / JSON.stringify(data).length) * 100).toFixed(1)}%`
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      details: 'Failed to encode data to TOON format'
    });
  }
});

// TOON to JSON
app.post('/decode', (req, res) => {
  try {
    const { toon, options } = req.body;

    if (!toon) {
      return res.status(400).json({
        error: 'Missing "toon" field in request body'
      });
    }

    const jsonOutput = decode(toon, options || {});

    res.json({
      success: true,
      data: jsonOutput,
      toonSize: toon.length,
      jsonSize: JSON.stringify(jsonOutput).length
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      details: 'Failed to decode TOON format to JSON'
    });
  }
});

// Bulk convert (array of items)
app.post('/encode-batch', (req, res) => {
  try {
    const { items, options } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        error: '"items" must be an array'
      });
    }

    const results = items.map((item, idx) => {
      try {
        const toonOutput = encode(item, options || {});
        return {
          index: idx,
          success: true,
          toon: toonOutput
        };
      } catch (error) {
        return {
          index: idx,
          success: false,
          error: error.message
        };
      }
    });

    res.json({
      success: true,
      total: results.length,
      failed: results.filter(r => !r.success).length,
      results
    });
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
});

// With stats and delimiter options
app.post('/encode-advanced', (req, res) => {
  try {
    const { data, delimiter = ',', keyFolding = 'off', indent = 2 } = req.body;

    if (!data) {
      return res.status(400).json({
        error: 'Missing "data" field'
      });
    }

    const toonOutput = encode(data, {
      delimiter,
      keyFolding,
      indent
    });

    const jsonStr = JSON.stringify(data);
    const savings = (((jsonStr.length - toonOutput.length) / jsonStr.length) * 100).toFixed(1);

    res.json({
      success: true,
      toon: toonOutput,
      stats: {
        jsonTokens: jsonStr.length,
        toonTokens: toonOutput.length,
        tokenSavings: `${savings}%`,
        delimiter: delimiter === '\t' ? 'tab' : delimiter === '|' ? 'pipe' : 'comma'
      }
    });
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
});

// API documentation
app.get('/', (req, res) => {
  res.json({
    name: 'TOON Converter API',
    version: '1.0.0',
    endpoints: {
      'POST /encode': {
        description: 'Convert JSON to TOON format',
        example: { data: { users: [{ id: 1, name: 'Alice' }] }, options: {} }
      },
      'POST /decode': {
        description: 'Convert TOON to JSON format',
        example: { toon: 'users[1]{id,name}:\\n1,Alice', options: {} }
      },
      'POST /encode-batch': {
        description: 'Convert multiple JSON objects to TOON',
        example: { items: [{ id: 1 }, { id: 2 }], options: {} }
      },
      'POST /encode-advanced': {
        description: 'Advanced encoding with delimiter and folding options',
        example: {
          data: { items: [{ id: 1, name: 'Test' }] },
          delimiter: ',',
          keyFolding: 'off',
          indent: 2
        }
      },
      'GET /health': {
        description: 'Health check endpoint'
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`TOON Converter API running on http://localhost:${PORT}`);
});