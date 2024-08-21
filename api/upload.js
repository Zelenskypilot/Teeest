import fetch from 'node-fetch';
import FormData from 'form-data';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const formData = new FormData();
            formData.append('image', req.body.image);
            formData.append('key', process.env.IMG_API_KEY); // API key from environment variable

            const imgResponse = await fetch('https://api.imgbb.com/1/upload', {
                method: 'POST',
                body: formData
            });

            const imgData = await imgResponse.json();

            if (!imgData.success) {
                return res.status(500).json({ success: false, message: 'Image upload failed' });
            }

            const imageUrl = imgData.data.url;
            const paymentId = req.body.paymentId;
            const encodedMessage = encodeURIComponent(`Payment ID: ${paymentId}\nImage: ${imageUrl}`);
            const phone = process.env.PHONE_NUMBER; // Phone number from environment variable
            const apiKey = process.env.CALL_ME_BOT_API_KEY; // API key from environment variable

            const msgResponse = await fetch(`https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodedMessage}&apikey=${apiKey}`, {
                method: 'GET'
            });

            const msgData = await msgResponse.text();

            if (msgData.includes("MESSAGE SENT")) {
                return res.status(200).json({ success: true });
            } else {
                return res.status(500).json({ success: false, message: 'Message sending failed' });
            }
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
                }
