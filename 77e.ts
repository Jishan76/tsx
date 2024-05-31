const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const jimp = require('jimp');

module.exports = {
    config: {
        name: "fakechat",
        aliases: [],
        version: "1.0",
        author: "চুদানির পোলা",
        countDown: 5,
        role: 0,
        shortDescription: "",
        longDescription: "fake fb chat",
        category: "fun",
        guide: "{p} mention | {text1} | {text2} or {P}fakechat mention | text"
    },

    onStart: async function ({ api, event, args }) {
        const mention = Object.keys(event.mentions);
        if (mention.length === 0) return api.sendMessage("Please mention someone. ex: @mention | text", event.threadID, event.messageID);

        const mentionedUserID = mention[0];
        const mentionedUserProfilePic = await getUserProfilePic(mentionedUserID);

        if (!mentionedUserProfilePic) {
            return api.sendMessage("Failed to load profile picture.", event.threadID, event.messageID);
        }

        const circleSize = 90;
        const avtwo = await createCircularImage(mentionedUserProfilePic, circleSize);

        const background = await loadImage("https://i.ibb.co/SVmYmrn/420578140-383334164549458-685915027190897272-n.jpg");
        const canvas = createCanvas(background.width, background.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(background, 0, 0);

        const profilePicY = 90;
        const mentionNameY = 50;
        const greyBoxY = 80;
        const blueBoxY = greyBoxY + 130;

        drawImage(ctx, avtwo, 30, profilePicY);

        const mentionName = getMentionName(args);

        wrapText(ctx, mentionName, 150, mentionNameY, 420, 25);

        const texts = args.join(' ').split('|');
        if (texts.length !== 3) {
            return api.sendMessage("Invalid format. Please use: @mention | text1 | text2", event.threadID, event.messageID);
        }

        wrapText(ctx, texts[1].trim(), 150, greyBoxY, 420, 25);
        wrapText(ctx, texts[2].trim(), 150, blueBoxY, 420, 25);

        const buffer = canvas.toBuffer('image/jpeg');
        fs.writeFileSync('fakechat.jpg', buffer);

        return api.sendMessage({
            attachment: fs.createReadStream('fakechat.jpg')
        }, event.threadID, () => fs.unlinkSync('fakechat.jpg'));
    }
};

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    var words = text.split(' ');
    var line = '';
    for(var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        }
        else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
}

async function getUserProfilePic(userID) {
    try {
        const response = await axios.get(`https://graph.facebook.com/${userID}/picture?type=large&redirect=false`);
        return response.data.data.url;
    } catch (error) {
        console.error("Error fetching profile picture:", error);
        return null;
    }
}

function createCircularImage(url, size) {
    return new Promise((resolve, reject) => {
        jimp.read(url, (err, image) => {
            if (err) return reject(err);
            image.resize(size, size);
            image.circle();
            image.getBuffer(jimp.MIME_JPEG, (error, buffer) => {
                if (error) return reject(error);
                resolve(buffer);
            });
        });
    });
}

function drawImage(context, image, x, y) {
    const img = new Image();
    img.onload = () => {
        context.drawImage(img, x, y);
    };
    img.src = image;
}

function getMentionName(args) {
    const mention = args.find(arg => arg.startsWith('@'));
    return mention ? mention.slice(1) : '';
}
