const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();


app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `temp_${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

app.post('/transcribe', upload.single('file'), (req, res) => {
  const filePath = req.file.path;

  const python = spawn('python3', ['transcribe.py', filePath]);

  let transcript = '';
  python.stdout.on('data', data => {
    transcript += data.toString();
  });

  python.stderr.on('data', data => {
    console.error(`stderr: ${data}`);
  });

  python.on('close', code => {
    fs.unlink(filePath, () => {});

    if (code !== 0) {
      return res.status(500).json({ error: 'Transcription failed' });
    }

    res.json({ transcript });
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server is running on PORT : ${PORT}`);
});
