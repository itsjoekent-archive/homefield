const fs = require('fs');
const crypto = require('crypto');
const { promisify } = require('util');

const multer = require('multer');
const mime = require('mime-types');
const { GridFSBucket } = require('mongodb');

const loadAccount = require('../middleware/loadAccount');

const randomBytes = promisify(crypto.randomBytes);
const upload = multer({ dest: '/tmp' });

module.exports = () => {
  async function handler(req, res) {
    const { account, db, file } = req;

    if (!account) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!file) {
      res.status(400).json({ error: 'Missing file' });
      return;
    }

    const { size, mimetype, path } = file;

    if (size > 16000000) {
      res.status(400).json({ error: 'File must be less than 16mb' });
      return;
    }

    if (mimetype.indexOf('image/') !== 0) {
      res.status(400).json({ error: 'File is not an image' });
      return;
    }

    const randomFileId = await randomBytes(16);
    const filename = `${randomFileId.toString('hex')}-${Date.now()}.${mime.extension(mimetype)}`;

    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });
    const writeStream = bucket.openUploadStream(filename, { contentType: mimetype });

    const url = `${process.env.API_HOST}/files/${filename}`;

    fs.createReadStream(path)
      .pipe(writeStream)
      .on('error', (error) => { throw error })
      .on('finish', () => res.json({ data: { filename, url } }));
  }

  return ['post', '/files', handler, [loadAccount, upload.single('file')]];
}
