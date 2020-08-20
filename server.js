const express = require('express');
const app = express();
const router = express.Router();
const mongoose = require('mongoose');
const config = require('config');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const multer = require('multer');
const fs = require('fs');
const auth = require('./middleware/auth')
const path = require('path')
const { Image } = require('./models/Image');
const { User } = require('./models/Users');
const crypto = require('crypto');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
require('dotenv').config()
// const methodOverride =  require('method');
// const uuid = require('uuid')

const users = require('./routes/users');
const login = require('./routes/login');
const chat = require('./routes/chat');
const { Chat } = require('./models/Chat');
const profileImage = require('./routes/profileImage');

// if (!config.get('jwtPrivateKey')) {
//   console.error('Fatal error: jwtPrivateKey not defined');
//   process.exit(1);
// }

// app.use(cors({ origin: true, credentials: true }))
// app.use(cors())
if (`${process.env.NODE_ENV}` === 'development') {
  app.use(cors({ origin: `${process.env.CLIENT_URL}` }));
}
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// const connect = mongoose.connect('mongodb://localhost:27017/flitchat')
const connect = mongoose.connect(process.env.DATABASE, {useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false, useUnifiedTopology: true})
  .then(() => console.log('Connected to mongoDB'))
  .catch(err => console.error('Could not connect to mongoDB'))

app.use(express.json());
// app.use('/api/profileImage', profileImage);
app.use('/api/users', users);
app.use('/api/login', login);
app.use('/api/chat', chat);

// storage for file upload during chats
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`)
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    if (ext !== '.jpg' && ext !== '.png' && ext !== '.mp4') {
      return cb(res.status(400).end('only jpg, png, mp4 is allowed'), false);
    }
    cb(null, true)
  }
})

var upload = multer({ storage: storage }).single("file")

// post file uploads during chats
app.post("/api/chat/uploadfiles", (req, res) => {
  upload(req, res, err => {
    if (err) {
      return res.json({ success: false, err })
    }
    return res.json({ success: true, url: res.req.file.path });
  })
});

let Storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'profilepics/')
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`)
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    if (ext !== '.jpg' && ext !== '.png' && ext !== '.jpeg') {
      return cb(res.status(400).end('only jpg, png, mp4 is allowed'), false);
    }
    cb(null, true)
  }
})

const uploads = multer({ storage: Storage }).single('file');

app.get("/api/user/profileImage", auth, async (req, res) => {
  const image = await Image.findOne(req.image)
  // console.log(image)
  res.json({ success: true, image })
})

app.post("/api/profileImage", (req, res) => {
  uploads(req, res, err => {
    if (err) {
      return res.json({ success: false, err })
    }

    let image = new Image();
      image.originalname = req.file.originalname,
      image.mimetype = req.file.mimetype,
      image.filename = req.file.filename,
      image.path = req.file.path,

      image.save();
    return res.json({ success: true, image });
    // return res.json({ success: true, url: res.req.file.path });
  })
})

io.on("connection", socket => {
  socket.on("Input Chat Message", msg => {
    connect.then(db => {
      try {
        let chat = new Chat({ message: msg.chatMessage, sender: msg.userId, images: msg.userImage, type: msg.type })
        // console.log(chat)
        chat.save((err, doc) => {
          if (err) return res.json({ suceess: false, err })

          Chat.find({ "_id": doc._id })
            .populate("sender")
            .exec((err, doc) => {
              return io.emit("Output Chat Message", doc)
            })
        })
      } catch (error) {
        console.error(error);
      }
    })
  })
})

//use this to show the image you have in node js server to client (react js)
//https://stackoverflow.com/questions/48914987/send-image-path-from-node-js-express-server-to-react-client
app.use('/uploads', express.static('uploads'));
app.use('/profilepics', express.static('profilepics'));

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('flitchat/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../flitchat', 'build', 'index.html'));
  });
}

const port = 5000
// const port = process.env.PORT || 5000

server.listen(port, () => {
  console.log(`connected to port ${port}`)
})