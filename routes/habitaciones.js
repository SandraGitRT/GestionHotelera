const express = require("express");
const router = express.Router();
const upload = require(__dirname + "/../utils/uploads.js");
const upload2 = require(__dirname + "/../utils/uploads.js");
const Habitacion = require(__dirname + "/../models/habitacion");
const Limpieza = require(__dirname + "/../models/limpieza");
const multer = require("multer");
const { autenticacion } = require("../utils/auth");

// const Usuario = require(__dirname + '/../models/usuario.js');

router.get("/", (req, res) => {
  //obtener todas las habitaciones --funciona
  Habitacion.find()
    .then((resultado) => {
      res.render("habitaciones_listado", { habitaciones: resultado });
    })
    .catch((error) => {
      res.render("error", { error: "Error listando habitaciones." });
    });
});

router.get("/nueva", autenticacion, (req, res) => {
  res.render("habitaciones_nueva");
});

//obtener detalles de una habitación --funciona
router.get("/:id", (req, res) => {
  Habitacion.findById(req.params.id)
    .then((resultado) => {
      if (resultado) {
        res.render("habitaciones_ficha", { habitaciones: resultado });
      } else {
        res.render("error", { error: "No existe el número de habitación." });
      }
    })
    .catch((error) => {
      res.render("error", { error: "No existe el número de habitación." });
    });
});

//insertar una habitación --funciona
router.post("/", upload.upload.single("imagen"), (req, res) => {
  let nuevaHabitacion = new Habitacion({
    numero: req.body.numero,
    tipo: req.body.tipo,
    descripcion: req.body.descripcion,
    ultimaLimpieza: Date.now(),
    precio: req.body.precio,
  });

  if (req.file) {
    nuevaHabitacion.imagen = req.file.filename;
  }

  nuevaHabitacion
    .save()
    .then((resultado) => {
      res.redirect(req.baseUrl);
    })
    .catch((error) => {
      let errores = {
        general: "Error en la aplicación",
      };
      if (error.errors.numero) {
        errores.numero = error.errors.numero;
      }
      if (error.errors.tipo) {
        errores.tipo = error.errors.tipo;
      }
      if (error.errors.descripcion) {
        errores.descripcion = error.errors.descripcion;
      }
      if (error.errors.ultimaLimpieza) {
        errores.ultimaLimpieza = error.errors.ultimaLimpieza;
      }
      if (error.errors.precio) {
        errores.precio = error.errors.precio;
      }

      res.render("habitaciones_nueva", { errores: errores });
    });
});

//actualizar todas las ultimas limpiezas --funciona
router.put("/ultimaLimpieza", (req, res) => {
  Habitacion.find()
    .then((habitaciones) => {
      if (habitaciones.length > 0) {
        habitaciones.forEach((habitacion) => {
          Limpieza.findOne({ idHabitacion: habitacion.id })
            .sort({ fechaHora: -1 })
            .then((limpieza) => {
              habitacion.ultimaLimpieza = limpieza.fechaHora;
              habitacion.save().catch((error) => {
                res
                  .status(400)
                  .send({ error: "Error actualizando las limpiezas" });
              });
            });
        });
        res.status(200).send({ resultado: habitaciones });
      } else {
        res.status(400).send({ error: "Error actualizando las limpiezas" });
      }
    })
    .catch((error) => {
      res.status(400).send({ error: "Error actualizando las limpiezas" });
    });
});

//actualizar los datos de una habitación --funciona
router.put("/:id", (req, res) => {
  Habitacion.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        numero: req.body.numero,
        tipo: req.body.tipo,
        descripcion: req.body.descripcion,
        ultimaLimpieza: req.body.ultimaLimpieza,
        precio: req.body.precio,
        imagen: req.body.imagen,
      },
    },
    { new: true }
  )
    .then((resultado) => {
      if (resultado) {
        res.status(200).send({ resultado: resultado });
      } else {
        res
          .status(400)
          .send({ error: "Error actualizando los datos de la habitación." });
      }
    })
    .catch((error) => {
      res
        .status(400)
        .send({ error: "Error actualizando los datos de la habitación" });
    });
});

//eliminar una habitacion --funciona
router.delete("/:id", autenticacion, (req, res) => {
  Habitacion.findByIdAndRemove(req.params.id)
    .then((resultado) => {
      Limpieza.deleteMany({ idHabitacion: req.params.id }).then(() => {
        res.redirect(req.baseUrl);
      });
    })
    .catch((error) => {
      res.render("error", { error: "Error eliminando la habitación." });
    });
});

//añadir nueva incidencia en una habitación --funciona
router.post(
  "/:id/incidencias",
  upload2.upload2.single("imagen"),
  autenticacion,
  (req, res) => {
    Habitacion.findById(req.params.id)
      .then((habitacion) => {
        if (!habitacion) {
          res.status(404).send({ error: "Habitación no encontrada" });
        }

        const nuevaIncidencia = {
          descripcion: req.body.descripcion,
          fechaInicio: new Date(),
        };

        if (req.file) {
          nuevaIncidencia.imagen = req.file.filename;
        }

        habitacion.incidencias.push(nuevaIncidencia);
        habitacion
          .save()
          .then((resultado) => {
            res.render("habitaciones_ficha", { habitaciones: resultado });
          })
          .catch((error) => {
            res.render("error", { error: "Error añadiendo la incidencia." });
          });
      })
      .catch((error) => {
        res.render("error", { error: "Error añadiendo la incidencia." });
      });
  }
);

//actualizar el estado de una incidencia --funciona
router.put("/:idH/incidencias/:idI", autenticacion, (req, res) => {
  const habitacionID = req.params.idH;
  const incidenciaID = req.params.idI;

  Habitacion.findById(habitacionID)
    .then((habitacion) => {
      habitacion.incidencias.forEach((incidencia) => {
        if (incidencia.id === incidenciaID) {
          incidencia.fechaFin = Date.now();
          habitacion
            .save()
            .then((resultado) => {
              res.redirect(req.baseUrl + "/" + req.params.idH);
            })
            .catch((error) => {
              res.render("error", { error: "No se ha cerrado la incidencia" });
            });
        }
      });
    })
    .catch((error) => {
      res.status(400).send({ error: "Incidencia no encontrada" });
    });
});


module.exports = router;
