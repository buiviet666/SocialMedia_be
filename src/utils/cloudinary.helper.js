const cloudinary = require('./cloudinary');
const {Readable} = require('stream');

function bufferToStream(buffer) {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
}

// Upload 1 file (ảnh/video) lên Cloudinary
exports.uploadToCloudinary = (fileBuffer, folder = 'posts', resourceType = 'image') => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      );
      bufferToStream(fileBuffer).pipe(stream);
    });
};

// Xoá ảnh/video khỏi Cloudinary bằng public_id
exports.deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });
      return result;
    } catch (error) {
      throw new Error('Xoá file trên Cloudinary thất bại');
    }
};