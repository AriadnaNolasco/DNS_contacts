require('dotenv').config();
const { Contact } = require('../models');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const stream = require('stream');
const crypto = require('crypto');

const s3 = new S3Client({ region: process.env.AWS_REGION });

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

function generateFileName(originalName) {
  const ext = originalName.split('.').pop();
  const rnd = crypto.randomBytes(8).toString('hex');
  return `${Date.now()}-${rnd}.${ext}`;
}

async function uploadBufferToS3(buffer, filename, mimeType) {
  const bucket = process.env.S3_BUCKET;
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: filename,
    Body: buffer,
    ContentType: mimeType
  });
  await s3.send(command);
  // Si tu bucket es público, la URL puede ser:
  return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
}

exports.uploadMiddleware = upload.single('photo');

exports.list = async (req, res) => {
  const contacts = await Contact.findAll({ order: [['last_name','ASC']]});
  res.render('index', { contacts });
};

exports.newForm = (req, res) => res.render('new');

exports.create = async (req, res) => {
  try {
    let photo_url = null;
    if (req.file) {
      const filename = generateFileName(req.file.originalname);
      photo_url = await uploadBufferToS3(req.file.buffer, filename, req.file.mimetype);
    }
    await Contact.create({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      date_of_birth: req.body.date_of_birth || null,
      photo_url
    });
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.editForm = async (req, res) => {
  const contact = await Contact.findByPk(req.params.id);
  if (!contact) return res.status(404).send('Not found');
  res.render('edit', { contact });
};

exports.update = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) return res.status(404).send('Not found');

    if (req.file) {
      // Opcional: borrar foto anterior si existe
      if (contact.photo_url) {
        const parts = contact.photo_url.split('/');
        const key = parts.slice(3).join('/'); // "bucket.s3.region.amazonaws.com/key"
        const filename = key; // esto depende de la estructura, en pruebas simples omitimos delete
        // Para eliminar con precisión, almacena solo el Key en DB en vez de URL completa.
      }
      const filename = generateFileName(req.file.originalname);
      const photo_url = await uploadBufferToS3(req.file.buffer, filename, req.file.mimetype);
      contact.photo_url = photo_url;
    }

    contact.first_name = req.body.first_name;
    contact.last_name = req.body.last_name;
    contact.email = req.body.email;
    contact.date_of_birth = req.body.date_of_birth || null;

    await contact.save();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.remove = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) return res.status(404).send('Not found');
    // opcional: borrar objeto de S3 (si guardas el key en DB, implementa DeleteObjectCommand)
    await contact.destroy();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.searchByLastName = async (req, res) => {
  const q = req.query.q || '';
  const contacts = await Contact.findAll({
    where: { last_name: sequelize.where(sequelize.fn('LOWER', sequelize.col('last_name')), 'LIKE', `${q.toLowerCase()}%`) }
  });
  res.render('index', { contacts });
};
