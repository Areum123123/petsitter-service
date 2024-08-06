import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import {
  AWS_SECRET_ACCESS_KEY,
  AWS_ACCESS_KEY_ID,
  AWS_REGION,
  S3_BUCKET_NAME,
} from '../constant/env.constant.js';

const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: S3_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, `uploads/${Date.now().toString()}_${file.originalname}`);
    },
    // Remove the acl option
    // acl: 'public-read',
  }),
});

export default upload;
