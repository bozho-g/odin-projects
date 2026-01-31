const express = require('express');
const { ensureAuthenticated } = require('../authUtil');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), preservePath: true });
const supabase = require('../supabaseClient');
const prisma = require('../prismaClient');
const { Prisma } = require('../generated/prisma');

router.get('/', async function (req, res) {
  if (!req.user) {
    return res.render('index', { folders: [], files: [], isPublic: true });
  }

  const files = await prisma.file.findMany({
    where: { userId: req.user.id, folderId: null },
  });

  const folders = await prisma.folder.findMany({
    where: { userId: req.user.id, parentFolderId: null },
  });

  res.render('index', { folders, files, isPublic: false });
});

router.get('/shared', ensureAuthenticated, async function (req, res) {
  const user = req.user;

  const sharedLinks = await prisma.sharedLink.findMany({
    where: {
      userId: user.id,
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      file: true,
      folder: true
    }

  });

  sharedLinks.forEach(link => {
    if (link.fileId) {
      link.url = '/public/file/' + link.id;
    } else if (link.folderId) {
      link.url = '/public/folder/' + link.id;
    }
  });

  res.render('shared', { sharedLinks });
});

router.post('/shared/:id/delete', ensureAuthenticated, async function (req, res, next) {
  try {
    const user = req.user;

    const sharedLink = await prisma.sharedLink.findUnique({
      where: { id: req.params.id },
    });

    if (!sharedLink || sharedLink.userId !== user.id) {
      throw new Error('Shared link not found or access denied.');
    }

    await prisma.sharedLink.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post('/upload-file', ensureAuthenticated, upload.single('file'), checkFiles, async function (req, res, next) {
  try {
    const user = req.user;
    const file = req.file;

    let folder = null;
    let folderPath = 'root';
    if (req.body.folderId) {
      folder = await prisma.folder.findUnique({
        where: { id: parseInt(req.body.folderId), userId: user.id, },
      });

      folderPath = folder?.storagePath;
    }

    const sanitizedFilename = file.originalname.split('/').pop().replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${user.id}/${folderPath}/${sanitizedFilename}`;

    const { data, error } = await supabase.storage
      .from("files")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw new Error("Upload error: " + error.message);
    }

    const { data: urlData } = supabase.storage.from('files').getPublicUrl(filePath);

    await prisma.file.create({
      data: {
        name: file.originalname,
        size: file.size,
        url: urlData.publicUrl,
        storagePath: filePath,
        userId: user.id,
        folderId: folder?.id,
        mimeType: file.mimetype,
      }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error('The resource already exists.');
    }
    next(error);
  }
});

router.post('/upload-folder', ensureAuthenticated, upload.array('folder'), checkFiles, async function (req, res, next) {
  try {
    const user = req.user;
    const files = req.files;

    let parentFolder = null;
    let baseStoragePath = '';
    let parentFolderId = null;

    if (req.body.folderId) {
      parentFolder = await prisma.folder.findUnique({
        where: { id: parseInt(req.body.folderId), userId: user.id },
      });

      if (parentFolder) {
        baseStoragePath = parentFolder.storagePath;
        parentFolderId = parentFolder.id;
      }
    }

    const folderSet = folderPaths(files);
    const sortedPaths = Array.from(folderSet).sort((a, b) => a.split('/').length - b.split('/').length);

    const folderMap = {};
    for (const path of sortedPaths) {
      const parts = path.split('/');
      const folderName = parts[parts.length - 1];
      const parentPath = path.includes('/') ? path.substring(0, path.lastIndexOf('/')) : null;

      const parentId = parentPath ? folderMap[parentPath] : parentFolderId;

      const fullStoragePath = baseStoragePath ? `${baseStoragePath}/${path}` : path;

      try {
        const folder = await prisma.folder.create({
          data: {
            name: folderName,
            storagePath: fullStoragePath,
            userId: user.id,
            parentFolderId: parentId,
          }
        });

        folderMap[path] = folder.id;
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          throw new Error('The resource already exists.');
        }
      }
    }

    for (const file of files) {
      const pathParts = file.originalname.split('/');
      const fileName = pathParts.pop();
      const folderPath = pathParts.join('/');
      const folderId = folderMap[folderPath];

      const fullFilePath = baseStoragePath
        ? `${user.id}/${baseStoragePath}/${file.originalname}`
        : `${user.id}/${file.originalname}`;

      const { data, error } = await supabase.storage
        .from("files")
        .upload(fullFilePath, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) {
        throw new Error("Upload error: " + error.message);
      }

      const { data: urlData } = supabase.storage.from('files').getPublicUrl(fullFilePath);

      try {
        await prisma.file.create({
          data: {
            name: fileName,
            size: file.size,
            url: urlData.publicUrl,
            storagePath: fullFilePath,
            userId: user.id,
            folderId: folderId,
            mimeType: file.mimetype,
          }
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          throw new Error('The resource already exists.');
        }
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

function folderPaths(files) {
  const paths = new Set();
  files.forEach(file => {
    const parts = file.originalname.split('/');
    parts.pop();

    let currentPath = '';
    parts.forEach(part => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      paths.add(currentPath);
    });
  });

  return paths;
}

function checkFiles(req, res, next) {
  const files = req.files ? req.files : req.file ? [req.file] : [];

  if (files.length === 0) {
    throw new Error("No files uploaded");
  }

  if (!checkFileSizes(files)) {
    throw new Error('File Size Exceeded');
  }

  next();
}

function checkFileSizes(files) {
  const MAX_SIZE_BYTES = 4.5 * 1024 * 1024;
  const totalSize = files.reduce((accumulator, currentValue) => accumulator + currentValue.size, 0);
  return totalSize <= MAX_SIZE_BYTES;
}

module.exports = router;
