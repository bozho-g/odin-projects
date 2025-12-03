const router = require('express').Router();
const prisma = require('../prismaClient');

router.get('/', async (req, res) => {
    const pictures = await prisma.picture.findMany();
    res.render('game/index', { pictures });
});

router.get('/game/:id', async (req, res) => {
    const pictureId = parseInt(req.params.id);
    const picture = await prisma.picture.findUnique({
        where: { id: pictureId },
        include: { characters: true }
    });

    const found = {};
    picture.characters.forEach(character => {
        found[character.id] = false;
    });

    res.cookie("startTime", Date.now().toString(), { httpOnly: true, signed: true, sameSite: "strict" });
    res.cookie("token", JSON.stringify(found), { httpOnly: true, signed: true, sameSite: "strict" });
    res.render('game/show', { picture, startTime: Date.now(), characters: picture.characters, found });
});

router.post('/game/:id/check', async (req, res) => {
    const pictureId = parseInt(req.params.id);
    const { lastClickX, lastClickY, characterId } = req.body;

    const character = await prisma.character.findFirst({
        where: {
            id: parseInt(characterId),
            pictureId: pictureId
        }
    });

    if (!character) {
        return res.status(400).json({ found: false, message: 'Character not found for this picture.' });
    }

    const inside = lastClickX >= character.x1 && lastClickX <= character.x2 &&
        lastClickY >= character.y1 && lastClickY <= character.y2;

    if (inside) {
        const found = JSON.parse(req.signedCookies.token);
        found[character.id] = true;

        let areAllFound = Object.values(found).every(v => v === true);
        if (areAllFound) {
            const endTime = Date.now();
            const startTime = parseInt(req.signedCookies.startTime);
            const totalTime = endTime - startTime;
            res.cookie("totalTime", totalTime.toString(), { httpOnly: true, signed: true, sameSite: "strict" });
            res.json({ finish: true, found: true, time: totalTime });
            return;
        }

        res.cookie("token", JSON.stringify(found), { httpOnly: true, signed: true, sameSite: "strict" });
        return res.json({ found: true, message: `You found ${character.name}!` });
    } else {
        return res.json({ found: false, message: `Try again! ${character.name} is not there.` });
    }
});

router.post('/game/:id/submit-score', async (req, res) => {
    const { username } = req.body;
    const pictureId = parseInt(req.params.id);
    const totalTime = parseInt(req.signedCookies.totalTime);

    const pictureIds = await prisma.picture.findMany({
        select: { id: true }
    });
    const validPictureIds = pictureIds.map(p => p.id);

    if (!username || isNaN(totalTime) || !validPictureIds.includes(pictureId)) {
        return res.json({ message: 'Invalid submission.' });
    }

    await prisma.leaderboard.create({
        data: {
            username: username,
            time: totalTime,
            pictureId: pictureId
        }
    });

    res.json({ message: 'Score submitted successfully!' });
});

router.get('/leaderboards/:id', async (req, res) => {
    const pictureId = parseInt(req.params.id);

    const picture = await prisma.picture.findUnique({
        where: { id: pictureId }
    });

    if (!picture) {
        return res.status(404).send('Picture not found.');
    }

    const leaderboards = await prisma.leaderboard.findMany({
        where: { pictureId: pictureId },
        include: { picture: true },
        orderBy: { time: 'asc' },
    });

    res.render('game/leaderboard', { leaderboards, picture });
});

router.get('/leaderboards', async (req, res) => {
    const pictures = await prisma.picture.findMany();
    res.render('game/leaderboards', { pictures });
});


module.exports = router;