const fastify = require('fastify')({ logger: true })
const multer = require('fastify-multer')
const axios = require('axios')
const sharp = require('sharp');
const tf = require('@tensorflow/tfjs-node')
const nsfw = require('nsfwjs')

const upload = multer()

let _model
tf.enableProdMode()
sharp.cache(false);
fastify.register(multer.contentParser)

fastify.route({
  method: 'POST', url: '/pcensorApi', preHandler: upload.single('image'), handler: async (req, res) => {
    try {
      if (!req.file && !req.body.image) res.status(400).send('Missing image multipart/form-data')
      else {
        let image = {}
        if (!req.file) {
          if (req.body.image.substr(0, 4) == 'http') {
            let pic = await axios.get(req.body.image, {
              responseType: 'arraybuffer',
            })
            let { data } = await sharp(pic.data).resize({
              width: 448,
              height: 448,
              fit: sharp.fit.contain,
              background: { r: 255, g: 255, b: 255, alpha: 0 }
            }).png().toBuffer({ resolveWithObject: true })
            image = tf.node.decodeImage(data, 3)
            data = null;
            pic = null;
          } else {
            res.status(400).send("url invaild")
            return;
          }
        } else {
          let { data } = await sharp(req.file.buffer).resize({
            width: 448,
            height: 448,
            fit: sharp.fit.contain,
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          }).png().toBuffer({ resolveWithObject: true })
          image = tf.node.decodeImage(data, 3)
          data = null;
        }
        let predictions = await _model.classify(image)
        image.dispose();
        //1 = everyone, 2 = teen, 3 = adult
        var rating = 1;
        if (predictions[0].className == 'Porn' || predictions[0].className == 'Sexy' || predictions[0].className == 'Hentai') {
          if (predictions[0].className == 'Porn') {
            if (predictions[0].probability > 0.4) {
              rating = 3
            } else {
              rating = 2
            }
          }
          if (predictions[0].className == 'Sexy') {
            if (predictions[0].probability >= 0.55) {
              rating = 3
            } else {
              rating = 2
            }
          }
          if (predictions[0].className == 'Hentai') {
            if (predictions[0].probability >= 0.55) {
              rating = 3
            } else {
              rating = 2
            }
          }
        }
        if (rating == 3) {
          console.log(predictions);
        }
        tf.dispose()
        console.log("exection over. result = ", rating)
        let _response = {}
        _response.code = 0
        _response.rating = rating
        _response.data = predictions
        res.send(_response)
        _response = null;
      }

    } catch (error) {
      console.log(error)
      res.status(400).send('system error')
    }
  }
})

const load_model = async () => {
  _model = await nsfw.load("file:///home/pcensor/model/")
}


const start = async () => {
  try {
    await fastify.listen(｛port:8080｝)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

// Keep the model in memory, make sure it's loaded only once
load_model().then(() => start())
