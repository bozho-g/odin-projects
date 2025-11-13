const { ensureAuthenticated } = require('../authUtil');
const router = require('express').Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), preservePath: true });
const supabase = require('../supabaseClient');
const prisma = require('../prismaClient');
const { Prisma } = require('../generated/prisma');
const { BlobReader, BlobWriter, ZipWriter } = require('@zip.js/zip.js');

router.post('/create', ensureAuthenticated, async function (req, res, next) {
    try {
        const { folderName, parentFolderId } = req.body;
        const parentFolder = parentFolderId ?
            await prisma.folder.findUnique({
                where: { id: parseInt(parentFolderId), userId: req.user.id, },
            }) :
            null;

        const path = parentFolder ?
            `${parentFolder.storagePath}/${folderName.replace(/[^a-zA-Z0-9.-]/g, '_')}` :
            `${folderName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        await prisma.folder.create({
            data: {
                name: folderName,
                storagePath: path,
                userId: req.user.id,
                parentFolderId: parentFolderId ? parseInt(parentFolderId) : null,
            }
        });

        if (parentFolderId) {
            res.redirect(`${parentFolderId}`);
        } else {
            res.redirect('/');
        }
    } catch (error) {
        next(error);
    }
});

router.get('/:id', ensureAuthenticated, async function (req, res, next) {
    try {
        const folder = await prisma.folder.findUnique({
            where: { id: parseInt(req.params.id), userId: req.user.id, },
            include: { files: true, subFolders: true, parentFolder: true },
        });

        if (!folder) {
            throw new Error('Folder not found', 404);
        }

        let currFolder = folder;
        folder.links = [currFolder];
        while (currFolder.parentFolder) {
            let parentFolder = await prisma.folder.findUnique({
                where: { id: currFolder.parentFolderId, userId: req.user.id, },
                include: { parentFolder: true },
            });

            folder.links.unshift(parentFolder);

            currFolder = parentFolder;
        }

        res.locals.folder = folder;
        res.render('folders/index', { folder, isPublic: false });
    } catch (error) {
        next(error);
    }
});

router.get('/:id/download', ensureAuthenticated, async function (req, res, next) {
    try {
        const folderId = req.params.id;

        const folder = await prisma.folder.findUnique({
            where: { id: parseInt(folderId), userId: req.user.id },
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
    } catch (error) {
        next(error);
    }
});

async function createFolderZipBuffer(folder) {
    const files = await getAllFiles(folder, folder.storagePath);

    if (!files || !files.length) {
        throw new Error('Folder is empty');
    }

    const promises = files.map(file =>
        supabase.storage
            .from("files")
            .download(file.fullPath)
    );

    const responses = await Promise.allSettled(promises);

    const downloadedFiles = responses.map((result, index) => {
        if (result.status === "fulfilled" && result.value.data) {
            return {
                name: files[index].relativePath,
                blob: result.value.data,
            };
        }
        return null;
    }).filter(file => file !== null);

    if (downloadedFiles.length === 0) {
        throw new Error('Failed to download any files');
    }

    const zipFileWriter = new BlobWriter("application/zip");
    const zipWriter = new ZipWriter(zipFileWriter, { bufferedWrite: true });

    for (const downloadedFile of downloadedFiles) {
        await zipWriter.add(downloadedFile.name, new BlobReader(downloadedFile.blob));
    }

    await zipWriter.close();
    const zipBlob = await zipFileWriter.getData();

    const buffer = Buffer.from(await zipBlob.arrayBuffer());

    return buffer;
}

async function getAllFiles(folder, rootPath) {
    let files = [];

    let foldersToProcess = [folder];

    while (foldersToProcess.length > 0) {
        const currentFolder = foldersToProcess.pop();

        const subFolderFiles = await prisma.file.findMany({
            where: { folderId: currentFolder.id },
        });

        files.push(...subFolderFiles);

        const subfolders = await prisma.folder.findMany({
            where: { parentFolderId: currentFolder.id },
        });

        if (subfolders && subfolders.length > 0) {
            foldersToProcess.push(...subfolders);
        }
    }

    files = files.map(file => {
        let relativePath = file.storagePath;

        if (rootPath) {
            const idx = relativePath.indexOf(rootPath);
            if (idx !== -1) {
                relativePath = relativePath.substring(idx + rootPath.length);
                if (relativePath.startsWith('/')) {
                    relativePath = relativePath.substring(1);
                }
            }
        }

        return {
            fullPath: file.storagePath,
            relativePath: relativePath,
            id: file.id,
        };
    });
    return files;
}

router.post('/:id/delete', ensureAuthenticated, async function (req, res, next) {
    try {
        const folderId = req.params.id;

        const folder = await prisma.folder.findUnique({
            where: { id: parseInt(folderId), userId: req.user.id },
            include: { subFolders: true }
        });

        if (!folder) {
            throw new Error('Folder not found');
        }

        const files = await getAllFiles(folder);

        const promises = files.map(file =>
            supabase.storage
                .from("files")
                .remove([file.fullPath])
        );

        await Promise.allSettled(promises);

        const descendants = await findDescendantFolders(folder);
        const folderIdsToDelete = descendants.map(f => f.id);

        await prisma.folder.deleteMany({
            where: {
                id: {
                    in: folderIdsToDelete
                }
            }
        });

        await prisma.sharedLink.deleteMany({
            where: {
                folderId: {
                    in: folderIdsToDelete
                }
            }
        });

        await prisma.file.deleteMany({
            where: {
                OR: [
                    {
                        storagePath: {
                            in: files.map(f => f.fullPath)
                        }
                    }
                ]
            }
        });

        await prisma.sharedLink.deleteMany({
            where: {
                fileId: {
                    in: files.map(f => f.id)
                }
            }
        });

        res.status(204).send();
    } catch (e) {
        next(e);
    }
});

async function findDescendantFolders(folder) {
    let descendants = [];

    let foldersToProcess = [folder];
    while (foldersToProcess.length > 0) {
        const currentFolder = foldersToProcess.pop();
        descendants.push(currentFolder);

        const currEntityFolders = await prisma.folder.findMany({
            where: { parentFolderId: currentFolder.id },
            include: { subFolders: true }
        });

        const subfolders = currEntityFolders || [];
        foldersToProcess.push(...subfolders);
    }

    return descendants;
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

        const folder = await prisma.folder.findUnique({
            where: { id: itemId, userId: req.user.id },
        });

        if (!folder) {
            throw new Error('Folder not found');
        }

        const link = await prisma.sharedLink.create({
            data: {
                folderId: folder.id,
                expiresAt: expirationDate,
                userId: req.user.id,
            },
        });

        res.json({ url: '/public/folder/' + link.id });
    } catch (error) {
        next(error);
    }
});

module.exports = { router, createFolderZipBuffer };