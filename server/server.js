const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const cors = require('cors');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const nodemailer = require('nodemailer');
// Load environment variables from a .env file in this directory
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { PassThrough } = require('stream');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const app = express();
const port = 4000;
// This points to your external videos folder.
// For better portability, you could consider moving this to an environment variable,
// but for your specific setup, an absolute path is perfectly fine.
const videosDir = '/Users/deepgunner/Desktop/MyVideos';
const metadataPath = path.join(__dirname, 'metadata.json');
let metadata = {};
try {
    // Load the metadata from the JSON file
    metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
} catch (err) {
    console.warn('Could not load metadata.json. Using default titles and descriptions.');
}
const cacheDir = path.join(__dirname, 'cache');
const thumbnailsDir = path.join(cacheDir, 'thumbnails');

// A map of supported video file extensions to their MIME types
const mimeTypes = {
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.mkv': 'video/x-matroska',
};

// Ensure the videos directory exists
if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
    console.log(`Created videos directory at ${videosDir}`);
    console.log('Please add some .mp4 video files to it.');
}

// Ensure the cache directory exists
if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
    console.log(`Created cache directory at ${cacheDir}`);
}

// Ensure the thumbnails directory exists
if (!fs.existsSync(thumbnailsDir)) {
    fs.mkdirSync(thumbnailsDir, { recursive: true });
    console.log(`Created thumbnails directory at ${thumbnailsDir}`);
}

app.use(cors());
app.options('*', cors()); // Enable pre-flight requests for all routes
app.use(express.json()); // Middleware to parse JSON bodies
app.use('/thumbnails', express.static(thumbnailsDir)); // Serve thumbnails statically

// Check for required environment variables on startup
if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || !process.env.TO_EMAIL_ADDRESS) {
    console.warn(`
    ###########################################################################
    # WARNING: Email sending is not configured.                               #
    # Please create a 'server/.env' file with your Gmail credentials.         #
    # The movie request feature will not work until this is configured.       #
    ###########################################################################
    `);
}

function generateThumbnail(videoFilename) {
    return new Promise((resolve, reject) => {
        const videoPath = path.join(videosDir, videoFilename);
        const thumbnailFilename = `${videoFilename}.jpg`;
        const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename);

        if (fs.existsSync(thumbnailPath)) {
            return resolve();
        }

        console.log(`Generating thumbnail for ${videoFilename}...`);
        ffmpeg(videoPath)
            .on('error', (err) => {
                console.error(`Error generating thumbnail for ${videoFilename}:`, err.message);
                reject(err);
            })
            .on('end', () => {
                console.log(`Thumbnail generated for ${videoFilename}`);
                resolve();
            })
            .screenshots({
                timestamps: ['1%'],
                filename: thumbnailFilename,
                folder: thumbnailsDir,
                size: '320x180',
            });
    });
}

// Endpoint to get the list of videos
app.get('/videos', async (req, res) => {
    try {
        const files = await fs.promises.readdir(videosDir);
        const supportedFiles = files.filter(file => mimeTypes[path.extname(file).toLowerCase()]);

        // Generate thumbnails for all videos if they don't exist
        await Promise.all(supportedFiles.map(file => generateThumbnail(file)));

        const baseUrl = `${req.protocol}://${req.get('host')}`;

        const videoFiles = supportedFiles.map(file => {
            const fileMetadata = metadata[file] || {};
            const defaultTitle = path.parse(file).name;
            return {
                filename: file,
                // Use the title from metadata if it exists, otherwise use the filename.
                title: fileMetadata.title || defaultTitle,
                description: fileMetadata.description || `A short summary of the movie '${defaultTitle}'. Perfect for a cozy evening!`,
                type: 'video/mp4', // We serve everything as mp4
                thumbnailUrl: `${baseUrl}/thumbnails/${file}.jpg`
            };
        });

        console.log('Serving video files with thumbnails:', videoFiles);
        res.json(videoFiles);
    } catch (err) {
        console.error("Could not list the directory or generate thumbnails.", err);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to handle movie requests
app.post('/request', async (req, res) => {
    const { movieTitle } = req.body;

    if (!movieTitle) {
        return res.status(400).send({ message: 'Movie title is required.' });
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.error('Gmail credentials are not set. Cannot send email.');
        return res.status(500).send({ message: 'Email service is not configured on the server.' });
    }

    // Nodemailer setup using Gmail
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD, // Use the App Password here
        },
    });

    const mailOptions = {
        from: `"Shruti's Vault" <${process.env.GMAIL_USER}>`, // Sender address
        to: process.env.TO_EMAIL_ADDRESS, // List of receivers
        subject: `New Movie Request: ${movieTitle}`, // Subject line
        html: `
          <html>
            <body>
              <h2>New Movie Request!</h2>
              <p>A request has been submitted for the following movie:</p>
              <h3>${movieTitle}</h3>
            </body>
          </html>`, // html body
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Request email sent for: ${movieTitle}`);
        res.status(200).send({ message: 'Request sent successfully!' });
    } catch (error) {
        console.error('Error sending email with Nodemailer:', error);
        res.status(500).send({ message: 'Failed to send request. Check server logs for details.' });
    }
});

async function streamMp4(filePath, req, res) {
    try {
        const stat = await fs.promises.stat(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(filePath, { start, end });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(200, head);
            fs.createReadStream(filePath).pipe(res);
        }
    } catch (error) {
        console.error(`Error streaming mp4: ${filePath}`, error);
        if (!res.headersSent) {
            res.status(500).send('Error streaming file.');
        }
    }
}

// Endpoint to stream a video
app.get('/video/:filename', async (req, res) => {
    const { filename } = req.params;
    const videoPath = path.join(videosDir, filename);

    try {
        await fs.promises.access(videoPath);
    } catch (error) {
        return res.status(404).send('File not found');
    }

    const extension = path.extname(filename).toLowerCase();    

    if (extension === '.mp4') {
        return await streamMp4(videoPath, req, res);
    }

    if (extension === '.mov' || extension === '.mkv') {
        const cachedFileName = `${filename}.mp4`;
        const cachedFilePath = path.join(cacheDir, cachedFileName);

        try {
            // Check if a cached version exists, stream it directly if so.
            await fs.promises.access(cachedFilePath);
            console.log(`Serving cached version for: ${filename}`);
            return await streamMp4(cachedFilePath, req, res);
        } catch (error) {
            // If not, transcode, cache, and stream it on-the-fly.
            console.log(`Transcoding, caching, and streaming on-the-fly: ${filename}`);

            res.writeHead(200, { 'Content-Type': 'video/mp4' });

            const ffmpegProcess = ffmpeg(videoPath)
                .format('mp4')
                .outputOptions('-movflags frag_keyframe+empty_moov') // Makes the mp4 streamable
                .on('error', (err) => {
                    console.error('ffmpeg error:', err.message);
                    if (!res.writableEnded) {
                        res.end(); // End the response if an error occurs
                    }
                });

            const passthrough = new PassThrough();
            // Pipe ffmpeg's output to the passthrough stream
            ffmpegProcess.pipe(passthrough);

            // Pipe the passthrough stream to both the response and the cache file
            passthrough.pipe(res);
            passthrough.pipe(fs.createWriteStream(cachedFilePath));
        }
    } else {
        res.status(400).send('Unsupported file format');
    }
});

const host = '0.0.0.0'; // Listen on all available network interfaces

app.listen(port, host, () => {
    console.log(`✅ Video streaming server is running!`);
    console.log(`\nOn your computer, access it at:`);
    console.log(`- Local:   http://localhost:${port}`);

    const interfaces = os.networkInterfaces();
    Object.keys(interfaces).forEach(devName => {
        const ifaceDetails = interfaces[devName].find(iface => iface.family === 'IPv4' && !iface.internal);
        if (ifaceDetails) {
            console.log(`\nFor other devices on the same network (like your phone):`);
            console.log(`- Network: http://${ifaceDetails.address}:${port}`);
        }
    });
});