const cloudinary = require('cloudinary').v2;
require('../config/cloudinary');
const { createId } = require('@paralleldrive/cuid2');
const apiSecret = cloudinary.config().api_secret;

const buildSignature = (params) => {
    const timestamp = Math.round(Date.now() / 1000);

    const paramsToSign = { timestamp, ...params };
    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    return { signature, timestamp };
};

const profilePictureSignedUrl = async (req, res) => {
    const userId = req.user.id;
    const folder = 'profiles';

    const publicId = userId ? `profile_${userId}` : undefined;

    const { signature, timestamp } = buildSignature({ folder, public_id: publicId });
    const cfg = cloudinary.config();

    return res.json({
        signature,
        timestamp,
        apiKey: cfg.api_key,
        cloudName: cfg.cloud_name,
        uploadUrl: `https://api.cloudinary.com/v1_1/${cfg.cloud_name}/auto/upload`,
        folder,
        publicId,
    });
};

const postPictureSignedUrl = async (req, res) => {
    const folder = 'posts';
    const publicId = `post_${createId()}`;
    const { signature, timestamp } = buildSignature({ folder, public_id: publicId });
    const cfg = cloudinary.config();

    return res.json({
        signature,
        timestamp,
        apiKey: cfg.api_key,
        cloudName: cfg.cloud_name,
        uploadUrl: `https://api.cloudinary.com/v1_1/${cfg.cloud_name}/auto/upload`,
        folder,
        publicId,
    });
};

const deletePictureEndpoint = async (req, res) => {
    const { publicId } = req.body;

    await deletePicture(publicId);

    return res.json({ message: 'Picture deleted successfully' });
};

const deletePicture = async (publicId) => {
    await cloudinary.uploader.destroy(publicId, { invalidate: true });
};

module.exports = { profilePictureSignedUrl, postPictureSignedUrl, deletePicture, deletePictureEndpoint };