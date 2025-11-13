const router = require('express').Router();
const prisma = require('../prismaClient');
const { createFolderZipBuffer } = require('./folders');
const downloadFileFromSupabase = require('./files').downloadFileFromSupabase;

router.get('/file/:id', async function (req, res, next) {
    const link = await prisma.sharedLink.findUnique({
        where: { id: req.params.id },
        include: { file: true },
    });

    if (!link || (link.expiresAt && link.expiresAt < new Date())) {
        throw new Error('Link not found');
    }

    res.render('public/file', { link, title: 'Public File' });
});

router.get('/file/:id/download', async function (req, res, next) {
    const link = await prisma.sharedLink.findUnique({
        where: { id: req.params.id },
        include: { file: true },
    });

    if (!link) {
        throw new Error('Link not found');
    }

    const validLink = link.expiresAt && link.expiresAt > new Date();

    if (!validLink) {
        throw new Error('Link has expired');
    }

    const file = link.file;
    const data = await downloadFileFromSupabase(file);

    const buffer = Buffer.from(await data.arrayBuffer());

    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    res.setHeader('Content-Type', data.type || 'application/octet-stream');
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
});

router.get('/folder/:id', async function (req, res, next) {
    const link = await prisma.sharedLink.findUnique({
        where: { id: req.params.id },
        include: { folder: true },
    });

    if (!link || (link.expiresAt && link.expiresAt < new Date())) {
        throw new Error('Link not found');
    }

    const folder = await prisma.folder.findUnique({
        where: { id: link.folderId },
        include: { files: true, subFolders: true },
    });

    if (!folder) {
        throw new Error('Folder not found', 404);
    }

    folder.accessLink = `/public/folder/${link.id}`;
    folder.links = [folder];

    res.render('folders/index', { sharedLink: link, folder, isPublic: true });
});

router.get('/folder/:id/download', async function (req, res) {
    const link = await prisma.sharedLink.findUnique({
        where: { id: req.params.id },
        include: { folder: true },
    });

    if (!link) {
        throw new Error('Link not found');
    }

    const validLink = link.expiresAt && link.expiresAt > new Date();

    if (!validLink) {
        throw new Error('Link has expired');
    }

    const folder = await prisma.folder.findUnique({
        where: { id: link.folderId },
        include: { subFolders: true }
    });

    if (!folder) {
        throw new Error('Folder not found');
    }

    const buffer = await createFolderZipBuffer(folder);

    res.setHeader('Content-Disposition', `attachment; filename="${folder.name}.zip"`);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
});

router.get('/folder/:id/:subfolderId', async function (req, res) {
    const link = await prisma.sharedLink.findUnique({
        where: { id: req.params.id },
        include: { folder: true },
    });

    const subfolder = await prisma.folder.findUnique({
        where: { id: parseInt(req.params.subfolderId) },
        include: { files: true, parentFolder: true, subFolders: true },
    });

    if (!link || (link.expiresAt && link.expiresAt < new Date())) {
        throw new Error('Link not found');
    }

    if (!subfolder) {
        throw new Error('Folder not found');
    }

    const sharedRootFolderId = link.folderId;

    let currFolder = subfolder;
    subfolder.links = [currFolder];

    while (currFolder.parentFolder && currFolder.id !== sharedRootFolderId) {
        let parentFolder = await prisma.folder.findUnique({
            where: { id: currFolder.parentFolderId },
            include: { parentFolder: true },
        });

        if (!parentFolder) {
            break;
        }

        parentFolder.accessLink = `/public/folder/${link.id}/${parentFolder.id}`;
        subfolder.links.unshift(parentFolder);

        currFolder = parentFolder;
    }

    res.render('folders/index', { sharedLink: link, folder: subfolder, isPublic: true });
});

router.get('/folder/:id/file/:fileId', async function (req, res) {
    const link = await prisma.sharedLink.findUnique({
        where: { id: req.params.id },
        include: { folder: true },
    });

    if (!link) {
        throw new Error('Link not found');
    }

    const file = await prisma.file.findUnique({
        where: { id: parseInt(req.params.fileId) },
        include: { folder: true },
    });

    if (!file) {
        throw new Error('File not found');
    }

    const sharedRootFolderId = link.folderId;

    let parentFolders = [file.folder];
    let isValid = false;
    let currFileFolder = file.folder;

    while (!isValid && currFileFolder) {
        if (currFileFolder.id === sharedRootFolderId) {
            isValid = true;
            break;
        }

        if (currFileFolder.parentFolderId) {
            currFileFolder = await prisma.folder.findUnique({
                where: { id: currFileFolder.parentFolderId },
            });

            parentFolders.unshift(currFileFolder);
        } else {
            break;
        }
    }

    if (!link || (link.expiresAt && link.expiresAt < new Date()) || !isValid) {
        throw new Error('Link not found');
    }

    if (!file) {
        throw new Error('File not found');
    }

    res.render('public/file', { link: { ...link, file }, title: 'Public File' });
});

module.exports = router;