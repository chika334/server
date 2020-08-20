// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const express = require('express')
// const auth = require('../middleware/auth');
// const router = express.Router();
// const Image = require('../models/Image');

// var Storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'profilepics/')
//     // console.log("nice")
//   },
//   filename: function (req, file, cb) {
//     cb(null, `${Date.now()}_${file.originalname}`)
//   },
//   fileFilter: (req, file, cb) => {
//     const ext = path.extname(file.originalname)
//     if (ext !== '.jpg' && ext !== '.png' && ext !== '.mp4') {
//       return cb(res.status(400).end('only jpg, png, mp4 is allowed'), false);
//     }
//     cb(null, true)
//   },
// })

// var uploads = multer({ storage: Storage }).single("files")

// router.get("/user", auth, async (req, res) => {
//   const image = await Image.findOne(req.image)

//   res.send({ image })
// })

// router.post("/", (req, res) => {
//   uploads(req, res, err => {
//     if (err) {
//       return res.json({ success: false, err })
//     }
//     // console.log(req.body.image)
//     // let images = new Image({
//     //   image: req.body.image
//     // })
//     let image = new Image();
//     image.image = req.body.image
//     image.save()

//     res.json({ success: true, image })

//   })
// })

// //use this to show the image you have in node js server to client (react js)
// //https://stackoverflow.com/questions/48914987/send-image-path-from-node-js-express-server-to-react-client
// router.use('/profilepics', express.static('profilepics'));

// module.exports = router;
