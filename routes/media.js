const express = require("express");
const router = express.Router();
const isBase64 = require("is-base64");
const base64Img = require("base64-img");
const { Media } = require("../models")
const fs = require('fs');

/* post media */
router.post("/", (req, res) => {
  const image = req.body.image;
  if (!isBase64(image, { mimeRequired: true })) {
    return res
      .status(400)
      .json({ status: "error", message: "invalid base 64" });
  }
  base64Img.img(image, "./public/images", Date.now(), async (err, filepath) => {
    if (err) {
      return res.status(400).json({ status: "error", message: err.message });
    }
    const fileName = filepath.split("\\").pop().split("/").pop();
    const media = await Media.create({
      image: `images/${fileName}`,
    });
    return res.json({
      status: "success",
      data: {
        id: media.id,
        image: `${req.get("host")}/images/${fileName}`,
      },
    });
  });
});

router.get("/", async (req, res) => {
  const media = await Media.findAll();
  const mappedMedia = media.map((m) => {
    m.image = `${req.get('host')}/${m.image}`
    return m;
  })
  return res.json({ status: "OK", message: "Success get All images", data: mappedMedia })
})

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const media = await Media.findByPk(id);
  if (!media) {
    return res.status(404).json({status: "Error", message: "Status not found"})
  }
  fs.unlink(`./public/${media.image}`, async (err) => {
    if (err) {
      return res.status(400).json({status: "error", message: err.message})
    }
    await media.destroy();
    return res.json({
      status: "success",
      message: "Deleted success"
    })
  })
})

module.exports = router;
