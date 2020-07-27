const { GridFSBucket } = require('mongodb');

module.exports = (db) => {
  async function getFile(req, res) {
    try {
      const { params: { filename } } = req;

      const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

      const [file] = await bucket.find({ filename }).toArray();

      if (!file) {
        res.status(404).send('file not found!');
        return;
      }

      res.setHeader('Content-Type', file.contentType);

      bucket.openDownloadStreamByName(filename)
        .pipe(res)
        .on('error', (error) => { throw error });
    } catch (error) {
      console.error(error);
      res.status(500).send('Failed to load file');
    }
  }

  return getFile;
}
