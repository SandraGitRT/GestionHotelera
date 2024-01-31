const express = require("express");
const router = express.Router();
const Limpieza = require(__dirname + "/../models/limpieza");
const Habitacion = require(__dirname + "/../models/habitacion");
const { autenticacion } = require("../utils/auth");
//

//obtener limpiezas de una habitación --funciona
router.get("/:id", (req, res) => {
  Limpieza.find({ idHabitacion: req.params.id })
    .sort({ fechaHora: -1 })
    .then((limpiezas) => {
      Habitacion.findById(req.params.id).then((resultadoHab) => {
            res.render("limpiezas_listado", {limpiezas: limpiezas, habitacion: resultadoHab});      
          }).catch((error) =>{
            res.render("error", {error: "No se encontró la habitación."})
          });
        })
        .catch((error) => {
          res.render("error", { error: "No se encontró la limpieza." });
        });
    })

router.get("/nueva/:id", autenticacion, (req, res) => {
  Habitacion.findById(req.params.id).then((habitacion) => {
    let fechaActual = new Date();
    let anyo = fechaActual.getFullYear();
    let mes = (fechaActual.getMonth() + 1).toString().padStart(2, "0");
    let dia = fechaActual.getDate();
    res.render("limpiezas_nueva", {
      habitacion: habitacion,
      anyo: anyo,
      mes: mes,
      dia: dia,
    });
  });
});


//actualizar limpieza --funciona
router.post("/:id", (req, res) => {
  let limpiezaNueva = new Limpieza({
    idHabitacion: req.params.id,
    fechaHora: req.body.fecha,
  });

  if (req.body.observaciones) {
    limpiezaNueva.observaciones = req.body.observaciones;
  }

  limpiezaNueva
    .save()
    .then((resultado) => {
      if (resultado) {
        Habitacion.findById(req.params.id).then((habitacion) => {
            Limpieza.find({ idHabitacion: habitacion.id }).sort({ fechaHora: -1 }).then((limpiezaResultado) => {
                habitacion.ultimaLimpieza = limpiezaResultado[0].fechaHora;
                habitacion.save().then(() => {res.render("limpiezas_listado",{limpiezas: limpiezaResultado,
                  habitacion: habitacion});
              }).catch((error) => {
                res.render("error", {error:"Error actualizando la fecha de última limpieza de la habitación",
                });
              });
          }).catch((error) => {
            res.render("error", {error:"Error actualizando la fecha de última limpieza de la habitación"});
          });
      });
    }
  }).catch((error) => {
      res.render("error", {error: "Error en la introducción de los datos"});
    });
});

module.exports = router;
