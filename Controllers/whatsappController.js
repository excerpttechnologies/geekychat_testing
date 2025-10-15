// 📁 controllers/whatsappController.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const ACCESS_TOKEN = 'EAAdzxxobLG4BPEtZAP5MEjZBGD7k90zSbiOfQGkdnH1MsyhYqgQs6WFZBZB14rnoTPYxztiqePjDQFf95EHhYuDo8Bh18wClrfevzytVgfo6GxUOdfmLlZAXxumXUd4Tygg94cuoR2gfMImMZAHmRaMUb4uHO8rk9Ri6juN3bZAx1ZAVaN4cacqsbDJZBcRiSMBlmlp9alxe8hcV6bRi5qGDPKG8QnPWiXjLfyFVP';
const PHONE_ID = '671028016100461';
const VERSION = 'v23.0';

exports.sendWhatsAppMessage = async (req, res) => {
  const { numbers, message } = req.body;
  const image = req.files?.image?.[0];
  const video = req.files?.video?.[0];
  const doc = req.files?.doc?.[0];

  const recipients = numbers.split(',').map(n => n.trim()).filter(Boolean);

  const mediaUpload = async (media) => {
    const form = new FormData();
    const tempPath = path.join(__dirname, '..', 'temp', media.originalname);

    // Save file to temp folder
    fs.writeFileSync(tempPath, media.buffer);

    // Append media file as stream
    form.append('file', fs.createReadStream(tempPath), {
      filename: media.originalname,
      contentType: media.mimetype,
    });
    form.append('messaging_product', 'whatsapp');

    const { data } = await axios.post(
      `https://graph.facebook.com/${VERSION}/${PHONE_ID}/media`,
      form,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          ...form.getHeaders(),
        },
      }
    );

    // Clean up temp file
    fs.unlinkSync(tempPath);
    return data.id;
  };

  const sendToRecipient = async (phone) => {
    try {
      // Send Text Message
      if (message) {
        await axios.post(
          `https://graph.facebook.com/${VERSION}/${PHONE_ID}/messages`,
          {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'text',
            text: { body: message },
          },
          {
            headers: {
              Authorization: `Bearer ${ACCESS_TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Send Image
      if (image) {
        const mediaId = await mediaUpload(image);
        await axios.post(
          `https://graph.facebook.com/${VERSION}/${PHONE_ID}/messages`,
          {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'image',
            image: { id: mediaId },
          },
          {
            headers: {
              Authorization: `Bearer ${ACCESS_TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Send Video
      if (video) {
        const mediaId = await mediaUpload(video);
        await axios.post(
          `https://graph.facebook.com/${VERSION}/${PHONE_ID}/messages`,
          {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'video',
            video: { id: mediaId },
          },
          {
            headers: {
              Authorization: `Bearer ${ACCESS_TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Send Document
      if (doc) {
        const mediaId = await mediaUpload(doc);
        await axios.post(
          `https://graph.facebook.com/${VERSION}/${PHONE_ID}/messages`,
          {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'document',
            document: {
              id: mediaId,
              filename: doc.originalname,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${ACCESS_TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }

    } catch (err) {
      console.error(`❌ Failed for ${phone}:`, err?.response?.data || err.message);
    }
  };

  for (let phone of recipients) {
    await sendToRecipient(phone);
  }

  res.json({ message: '✅ Messages processed successfully.' });
};
