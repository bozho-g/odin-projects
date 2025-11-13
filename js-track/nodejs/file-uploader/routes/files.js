const { ensureAuthenticated } = require('../authUtil');
const router = require('express').Router();
const supabase = require('../supabaseClient');
const prisma = require('../prismaClient');

router.post('/:id/delete', ensureAuthenticated, async function (req, res, next) {
    try {
        const itemId = parseInt(req.params.id);

        const fileToDelete = await prisma.file.findUnique({
            where: { id: itemId, userId: req.user.id },
        });

        if (!fileToDelete) {
            throw new Error('File not found');
        }

        const file = await prisma.file.delete({
            where: { id: itemId, userId: req.user.id },
        });

        await prisma.sharedLink.deleteMany({
            where: { fileId: itemId }
        });

        supabase.storage
            .from("files")
            .remove([file.storagePath]);

        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

router.get('/:id/download', ensureAuthenticated, async function (req, res, next) {
    const id = req.params.id;

    const file = await prisma.file.findUnique({
        where: { id: parseInt(id), userId: req.user.id },
    });

    if (!file) {
        throw new Error('File not found');
    }

    const data = await downloadFileFromSupabase(file);

    const buffer = Buffer.from(await data.arrayBuffer());

    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    res.setHeader('Content-Type', data.type || 'application/octet-stream');
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
});

async function downloadFileFromSupabase(file) {
    const { data, error } = await supabase.storage
        .from("files")
        .download(file.storagePath);

    if (error) {
        throw new Error('Download error: ' + error.message);
    }

    if (!data) {
        throw new Error('Download error');
    }

    return data;
}

router.post('/:id/share', ensureAuthenticated, async function (req, res, next) {
    try {
        const itemId = parseInt(req.params.id);
        const { expiration } = req.body;

        const expirationNum = parseInt(expiration);
        let expirationTime = 24 * 60 * 60 * 1000;
        if (expirationNum) {
            expirationTime = expirationNum * 60 * 60 * 1000;
        }

        let expirationDate = new Date(Date.now() + expirationTime);

        const file = await prisma.file.findUnique({
            where: { id: itemId, userId: req.user.id },
        });

        if (!file) {
            throw new Error('File not found');
        }

        const link = await prisma.sharedLink.create({
            data: {
                fileId: file.id,
                expiresAt: expirationDate,
                userId: req.user.id,
            },
        });

        res.json({ url: '/public/file/' + link.id });
    } catch (error) {
        next(error);
    }
});

router.get('/:id/info', ensureAuthenticated, async function (req, res, next) {
    try {
        const itemId = parseInt(req.params.id);

        const file = await prisma.file.findUnique({
            where: { id: itemId, userId: req.user.id },
        });

        if (!file) {
            throw new Error('File not found');
        }

        const objToReturn = {
            id: file.id,
            name: file.name,
            size: file.size,
            mimeType: file.mimeType || 'not specified',
            createdAt: file.createdAt,
        };

        res.json(objToReturn);
    } catch (error) {
        next(error);
    }
});

module.exports = { router, downloadFileFromSupabase };