const express = require("express");
const router = express.Router();
const Usuario = require("../models/usuario");

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/habitaciones");
});

router.post("/login", (req, res) => {
  let usuario = new Usuario({
    login: req.body.login,
    password: req.body.password,
  });

  Usuario.findOne({ login: usuario.login, password: usuario.password })
    .then((resultado) => {
      if (resultado) {
        req.session.usuario = resultado.login;
        res.redirect("/habitaciones");
      } else {
        res.render("login", { error: "No se ha podido inciciar sesión." });
      }
    })
    .catch((error) => { 
        res.render("login", { error: "No se ha podido iniciar sesión." });
    });

});

module.exports = router;
