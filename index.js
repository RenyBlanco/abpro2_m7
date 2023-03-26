const express = require('express') ;
const { Pool } = require('pg') ;
const PgError = require('pg-error')

// Inicializacion
const app = express();
console.clear()

// Configuración
app.set('port', process.env.PORT || 4000);

// Conectando
const pool = new Pool ({
    host: 'localhost',
    user: 'postgres',
    database: 'clinica',
    password: 'Rjbm-2310',
    port: 5433,
    max: 20,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 2000,
});

function emitPgError(err) {
    switch (err.severity) {
      case "ERROR":
      case "FATAL":
      case "PANIC": return this.emit("error", err)
      default: return this.emit("notice", err)
    }
  }
   
pool.on("PgError", emitPgError);

const accion = process.argv[2];

switch(accion){
    case 'nuevo':
        inserta();
        break;
    case 'consulta':
        consultar();
        break;
    case 'editar':
        edita();
        break;
    case 'eliminar':
        elimina();
        break;
    case 'rut':
        rut();
        break;
    default :
        console.log('Defecto');
        break;
}

async function inserta() {
    const cliente = await pool.connect();
    const query = {
            name: 'insert',
            text: "INSERT INTO estudiantes (nombre,rut,curso,nivel) VALUES($1, $2, $3, $4) RETURNING *",
            values: [process.argv[3],process.argv[4],process.argv[5],process.argv[6]]
        };
    try {
        cliente.query(query);
        console.log('Estudiante '+process.argv[3]+' insertado con éxito');
    } catch (err) {
        console.log(err.stack);
    }
    cliente.release();
}

async function edita() {
    const cliente = await pool.connect();
    const query = {
        name: 'update',
        text: "UPDATE estudiantes SET nombre = $1, rut = $2, curso = $3, nivel = $4 WHERE rut = $2",
        values : [process.argv[3],process.argv[4],process.argv[5],process.argv[6]]
    };
    try {
        cliente.query(query);
        console.log('Estudiante '+process.argv[3]+' editado con éxito');
    } catch (err) {
        console.log(err.stack);
    }
    cliente.release();
}

async function elimina() {
    const cliente = await pool.connect();
    const query = {
        name: 'delete',
        text: "DELETE FROM estudiantes WHERE rut = $1",
        values: [process.argv[3]]
    };
    try {
        cliente.query(query);
        console.log('Estudiante con rut No. '+process.argv[3]+' eliminado con éxito');
    } catch (err) {
        console.log(err.stack);
    }
    cliente.release();
}

async function rut(){
    const cliente = await pool.connect();
    const rut = process.argv[3];
    const query = {
        name: 'rut',
        text: "SELECT * FROM estudiantes WHERE rut = $1",
        values: [rut],
    };
    cliente.query(query, (err, resp) =>{
        if (!err){
            console.log('Consulta Rut ',resp.rows[0]);
        }else{
            console.log(err);
        }
        cliente.release();
    });
}

async function consultar(){
    let cliente = await pool.connect();
    const query = {
        name: 'consulta',
        text: "SELECT * FROM estudiantes"
    };
    cliente.query(query, (err, resp) =>{
        if (!err){
            let ultimo = (resp.rows.length-1);
            console.log('Registro actual: ', resp.rows[ultimo]);
        }else{
            console.log(err);
        }
        cliente.release();
    });
}

// Arrancando Servidor
app.listen(app.get('port'), () => {
    console.log('Corriendo Servidor en puerto : ',app.get('port'));
});