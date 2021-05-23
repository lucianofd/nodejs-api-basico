const express = require("express");
const mysql = require("mysql");
const util = require("util");
const unless = require("express-unless");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

/***********************************************************************************************/
/*APERTURA DE PUERTO DE ESCUCHA Y CONEXION A MYSQL*/
/***********************************************************************************************/
const PORT = process.env.PORT ? process.env.PORT : 3000;

app.listen(PORT, () => {
  console.log("Esperando solicitudes es ", PORT);
});

var conexion = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "diplomatura1",
});

conexion.connect();
const query = util.promisify(conexion.query).bind(conexion);

/***********************************************************************************************/
/*CATEGORIA*/
/***********************************************************************************************/

/***********************************************************************************************/
/*CATEGORIA - AGREGAR UNA NUEVA */
/***********************************************************************************************/

app.post("/categoria", async (req, res) => {
  try {
    let nombre = req.body.nombre;
    nombre = nombre.toUpperCase();

    if (nombre == null || nombre.length == 0 || /^\s+$/.test(nombre)) {
      res.status(413).send("El campo nombre no puede estar vacío");
    } else {
      const existe = await query("SELECT * FROM CATEGORIA WHERE NOMBRE =?", [
        nombre,
      ]);

      if (existe.length > 0) {
        res.status(413).send("Ese nombre de categoria ya existe");
      } else {
        const respuesta = await query(
          "INSERT INTO CATEGORIA (nombre) values (?)",
          [nombre]
        );
        const registroInsertado = await query(
          "SELECT * FROM CATEGORIA WHERE ID =?",
          [respuesta.insertId]
        );
        res.status(200).json(registroInsertado[0]);
      }
    }
  } catch (e) {
    res.status(413).send("Error al cargar la categoria: " + e);
  }
});

/***********************************************************************************************/
/*CATEGORIA - LISTAR CATEGORIAS */
/***********************************************************************************************/
app.get("/categoria", async (req, res) => {
  try {
    const respuesta = await query("SELECT * FROM CATEGORIA");
    res.status(200).json(respuesta);
  } catch (e) {
    res.status(413).send("Error al leer las categorias: " + e);
  }
});

/***********************************************************************************************/
/*CATEGORIA - SOLICITAR UNA CATEGORIA ESPECIFICA */
/***********************************************************************************************/
app.get("/categoria/:id", async (req, res) => {
  try {
    const respuesta = await query(
      "SELECT * FROM CATEGORIA WHERE ID=?",
      req.params.id
    );

    if (respuesta.length == 1) {
      res.status(200).json(respuesta[0]);
    } else {
      res.status(404).send("Categoria no encontrada");
    }
  } catch (e) {
    res.status(413).send("Error inesperado" + e);
  }
});

/***********************************************************************************************/
/*CATEGORIA - ELIMINAR UNA CATEGORIA ESPECIFICA */
/***********************************************************************************************/
app.delete("/categoria/:id", async (req, res) => {
  try {
    const respuestaCategoria = await query(
      "SELECT * FROM CATEGORIA WHERE ID =?",
      [req.params.id]
    );
    const respuestaLibro = await query(
      "SELECT * FROM LIBRO WHERE CATEGORIA_ID =?",
      [req.params.id]
    );

    if (respuestaLibro.length > 0) {
      res
        .status(413)
        .send("Categorias con libros asociados no se pueden eliminar");
    } else if (respuestaCategoria.length == 0) {
      res.status(404).send("Categoria no encontrada");
    } else {
      const resultado = await query("DELETE FROM CATEGORIA WHERE ID =?", [
        req.params.id,
      ]);
      res.status(200).send("Se borro correctamente");
    }
  } catch (e) {
    res.status(413).send("Error inesperado" + e);
  }
});

/***********************************************************************************************/
/*PERSONA*/
/***********************************************************************************************/

/***********************************************************************************************/
/*PERSONA - AGREGAR UNA PERSONA */
/***********************************************************************************************/

app.post("/persona", async (req, res) => {
  try {
    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    const email = req.body.email;
    const alias = req.body.alias;

    if (nombre == null || nombre.length == 0 || /^\s+$/.test(nombre)) {
      res.status(413).send("El campo nombre no puede estar vacío");
    } else if (
      apellido == null ||
      apellido.length == 0 ||
      /^\s+$/.test(apellido)
    ) {
      res.status(413).send("El campo apellido no puede estar vacio");
    } else if (
      email == null ||
      email.length == 0 ||
      !/^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i.test(email)
    ) {
      res
        .status(413)
        .send("El mail se encuentra vacio o su formato es incorrecto");
    } else if (alias == null || alias.length == 0 || /^\s+$/.test(alias)) {
      res.status(413).send("El alias se encuentra esta vacio");
    } else {
      const existeemail = await query(
        "SELECT * FROM PERSONA WHERE EMAIL = ?",
        email
      );
      if (existeemail.length == 1) {
        res.status(413).send("El mail ya existe en la base");
      } else {
        const respuesta = await query(
          "insert into persona (nombre, apellido, email, alias) values (?, ?, ?, ?)",
          [nombre, apellido, email, alias]
        );
        const registroInsertado = await query(
          "select * from persona where id=?",
          [respuesta.insertId]
        );
        res.status(200).json(registroInsertado[0]);
      }
    }
  } catch (e) {
    res.status(413).send("Error inesperado " + e);
  }
});

/***********************************************************************************************/
/*PERSONA - LISTAR PERSONAS */
/***********************************************************************************************/
app.get("/persona", async (req, res) => {
  try {
    const respuesta = await query("select * from persona");
    res.status(200).json(respuesta);
  } catch (e) {
    res.status(413).send("Error inesperado " + e);
  }
});

/***********************************************************************************************/
/*PERSONA - SOLICITAR UNA PERSONA ESPECIFICA */
/***********************************************************************************************/
app.get("/persona/:id", async (req, res) => {
  try {
    const respuesta = await query("select * from persona where id=?", [
      req.params.id,
    ]);
    if (respuesta.length == 1) {
      res.status(200).json(respuesta[0]);
    } else {
      res.status(413).send("La persona no existe");
    }
  } catch (e) {
    res.status(413).send("Error inesperado " + e);
  }
});

/***********************************************************************************************/
/*PERSONA - MODIFICAR  UNA PERSONA */
/**********************************************************************************************/
app.put("/persona/:id", async (req, res) => {
  try {
    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    const email = req.body.email;
    const alias = req.body.alias;

    const respuesta = await query("select * from persona where id=?", [
      req.params.id,
    ]);
    if (respuesta.length == 1) {
      if (nombre == null || nombre.length == 0 || /^\s+$/.test(nombre)) {
        res.status(413).send("El nombre se encuentra vacio");
      } else if (
        apellido == null ||
        apellido.length == 0 ||
        /^\s+$/.test(apellido)
      ) {
        res.status(413).send("El apellido se encuentra esta vacio");
      } else if (alias == null || alias.length == 0 || /^\s+$/.test(alias)) {
        res.status(413).send("El alias se encuentra vacio");
      } else {
        const respuesta = await query(
          "update persona set nombre=?, apellido=?, alias=? where id=?",
          [nombre, apellido, alias, req.params.id]
        );
        const registroInsertado = await query(
          "select * from persona where id=?",
          [req.params.id]
        );
        res.status(200).json(registroInsertado[0]);
      }
    } else {
      res.status(404).json("La persona indicada no se encuentra");
    }
  } catch (e) {
    res.status(413).send("Error inesperado " + e);
  }
});

/***********************************************************************************************/
/*PERSONA - ELIMINAR UNA PERSONA ESPECIFICA */
/***********************************************************************************************/
app.delete("/persona/:id", async (req, res) => {
  try {
    const resultado = await query("SELECT * FROM LIBRO WHERE PERSONA_ID=?", [
      req.params.id,
    ]);
    if (resultado.length > 0) {
      res.status(413).send("La persona tiene un libro prestado");
    } else {
      const registro = await query("select * from persona where id=?", [
        req.params.id,
      ]);
      if (registro.length == 1) {
        await query("delete from persona where id=?", [req.params.id]);
        res.status(200).send("Borrado con exito");
      } else {
        res.status(413).send("El registro no existe");
      }
    }
  } catch (e) {
    res.status(413).send("Error inesperado " + e);
  }
});

/***********************************************************************************************/
/*LIBROS - LISTAR LIBROS*/
/***********************************************************************************************/

app.get("/libro", async (req, res) => {
  try {
    const respuesta = await query("select*from libro");
    res.status(200).json(respuesta);
  } catch (e) {
    res.status(413).send("Error inesperado " + e);
  }
});

/***********************************************************************************************/
/* LIBROS - SOLICITAR UN  LIBRO ESPECIFICO*/
/***********************************************************************************************/

app.get("/libro/:id", async (req, res) => {
  try {
    const respuesta = await query("select*from libro where id=?", [
      req.params.id,
    ]);
    if (respuesta.length == 1) {
      res.status(200).json(respuesta[0]);
    } else {
      res.status(404).send("no se encuentre ese libro");
    }
  } catch (e) {
    res.status(413).send("Error inesperado " + e);
  }
});

/***********************************************************************************************/
//LIBROS - AGREGAR UN LIBRO
/***********************************************************************************************/
app.post("/libro", async (req, res) => {
  try {
    const nombre = req.body.nombre;
    const descripcion = req.body.descripcion;
    const categoria_id = req.body.categoria_id;

    if (nombre == null || nombre.length == 0 || /^\s+$/.test(nombre)) {
      res.status(413).send("El nombre es es obligatorios");
    } else if (
      isNaN(categoria_id) ||
      categoria_id == null ||
      categoria_id.length == 0 ||
      /^\s+$/.test(categoria_id)
    ) {
      res.status(413).send("La categoria es obligatoria y debe ser un numero");
    } else {
      const existe = await query("select * from libro where nombre=?", [
        nombre,
      ]);
      if (existe.length > 0) {
        res.status(413).send("el libro ya existe");
      }
      const existeCat = await query("select * from categoria where id = ?", [
        categoria_id,
      ]);
      if (existeCat.length == 0) {
        res.status(413).send("no existe la categoria indicada");
      } else {
        const respuesta = await query(
          "insert into libro (nombre, descripcion, categoria_id) values (?,?,?)",
          [nombre, descripcion, categoria_id]
        );
        const registroInsertado = await query(
          "SELECT * from libro where id=?",
          [respuesta.insertId]
        );
        res.json(registroInsertado[0]);
      }
    }
  } catch (e) {
    res.status(413).send("Error inesperado");
  }
});
/***********************************************************************************************/
/*LIBROS - MODIFICAR UN LIBRO*/
/***********************************************************************************************/

app.put("/libro/:id", async (req, res) => {
  try {
    const nombre = req.body.nombre;
    const descripcion = req.body.descripcion;
    const categoria_id = req.body.categoria_id;
    const persona_id = req.body.persona_id;

    if (nombre == null || nombre.length == 0 || /^\s+$/.test(nombre)) {
      res.status(413).send("El campo nombre no puede estar vacío");
    } else if (
      isNaN(categoria_id) ||
      categoria_id == null ||
      categoria_id.length == 0 ||
      /^\s+$/.test(categoria_id)
    ) {
      res.status(413).send("La categoria es obligatoria y debe ser un numero");
    } else {
      const existeCat = await query(
        "select * from libro where categoria_id=?",
        [categoria_id]
      );
      if (existeCat.length == 0) {
        res.status(413).send("no existe la categoria indicada");
      } else {
        const respuesta = await query(
          "update libro set nombre=?, descripcion=?, categoria_id=?, persona_id=? where id=?",
          [nombre, descripcion, categoria_id, persona_id, req.params.id]
        );
        const registroInsertado = await query(
          "select * from libro where id=?",
          [req.params.id]
        );
        res.json(registroInsertado[0]);
      }
    }
  } catch (e) {
    res.status(413).send("Error inesperado " + e);
  }
});

/***********************************************************************************************/
/* LIBROS - PRESTAR LIBRO - ACTUALIZA PERSONA_ID PERO SOBREESCRIBE
/***********************************************************************************************/

app.put("/libro/prestar/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const persona_id = req.body.persona_id;

    //validación de datos no nulos

    if (
      isNaN(persona_id) ||
      persona_id == null ||
      persona_id.length == 0 ||
      /^\s+$/.test(persona_id)
    ) {
      res.status(413).send("El Id debe ser numerico y no debe estar vacio");
    } else {
      //validacion que persona exista
      const existePersona = await query(
        "SELECT * FROM PERSONA WHERE ID=?",
        persona_id
      );
      if (existePersona.length == 0) {
        res
          .status(404)
          .send(
            "No se encontro la persona a la que se quiere prestar el libro"
          );
      }

      //validacion si existe libro
      const existeLibro = await query("SELECT * FROM LIBRO WHERE ID=?", id);
      if (existeLibro.length == 0) {
        res.status(404).send("No se encontro el libro");
      }

      //validacion que libro no este prestado
      const libroPrestado = await query(
        "SELECT * FROM LIBRO WHERE ID=? AND PERSONA_ID IS NUll",
        id
      );
      if (libroPrestado.length == 0) {
        res
          .status(404)
          .send(
            "El libro ya se encuentra prestado, no se puede prestar hasta que no se devuelva"
          );
      }

      //realizo el prestamo
      const respuesta = await query(
        "update libro SET persona_id=? where id=?",
        [persona_id, req.params.id]
      );

      //busco libro con datos actualizados (en este caso con PERSONA_ID)
      const registroInsertado = await query("select * from libro where id=?", [
        req.params.id,
      ]);

      //retorno datos de libro actualizado
      res.json(registroInsertado[0]);
    }
  } catch (e) {
    res.status(413).send("Error inesperado " + e);
  }
});

/***********************************************************************************************/
/* LIBROS - PUT DEVOLVER LIBRO*/
/***********************************************************************************************/

app.put("/libro/devolver/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const existeLibro = await query("SELECT * FROM LIBRO WHERE ID=?", id);
    if (existeLibro.length == 0) {
      res.status(404).send("El libro no existe");
    } else {
      const estaPrestado = await query(
        "SELECT * FROM LIBRO WHERE ID=? AND PERSONA_ID IS  NULL",
        id
      );
      if (estaPrestado.length != 0) {
        res.status(404).send("Ese libro no estaba prestado");
      } else {
        const respuesta = await query(
          "UPDATE LIBRO SET PERSONA_ID=NULL WHERE ID=?",
          id
        );

        res.status(200).send("Se devolvio correctamente");
      }
    }
  } catch (e) {
    res.status(413).send("Error inesperado " + e);
  }
});

/***********************************************************************************************/
/* LIBRO - ELIMINAR  UN LIBRO ESPECIFICO
/***********************************************************************************************/

app.delete("/libro/:id", async (req, res) => {
  try {
    const registro = await query("select * from libro where id=?", [
      req.params.id,
    ]);

    if (registro.length == 1) {
      const estaPrestado = await query(
        "SELECT * FROM LIBRO WHERE ID=? AND PERSONA_ID IS NOT NULL",
        req.params.id
      );
      if (estaPrestado.length != 0) {
        res.status(404).send("Este libro no se puede borrar, esta prestado");
      } else {
        await query("delete from libro where ID=?", [req.params.id]);
        res.status(200).send("Se borro correctamente");
      }
    } else {
      res.status(404).send("Ese libro no existe");
    }
  } catch (e) {
    res.status(413).send("Error inesperado " + e);
  }
});
