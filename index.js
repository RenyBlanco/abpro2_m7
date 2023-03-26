const express = require('express') ;
const { Pool } = require('pg') ;
const PgError = require('pg-error')

// Inicializacion
const app = express();
console.clear()

// Configuración
app.set('port', process.env.PORT || 4000);

// Conectando
const cliente = new Pool ({
    host: 'localhost',
    user: 'postgres',
    database: 'clinica',
    port: 5433,
    max: 20,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 2000,
});

const coneccion = () => {
    try {
        cliente.connect();
        console.log('DB Conectada!');
    } catch (error) {
        console.log('Error: ', error);
    }
} 

coneccion();

function emitPgError(err) {
    switch (err.severity) {
      case "ERROR":
      case "FATAL":
      case "PANIC": return this.emit("error", err)
      default: return this.emit("notice", err)
    }
  }
   
coneccion.on("PgError", emitPgError);

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

function inserta() {
    const query = {
            name: 'insert',
            text: "INSERT INTO estudiantes (nombre,rut,curso,nivel) VALUES($1, $2, $3, $4) RETURNING *",
            valores: [process.argv[3],process.argv[4],process.argv[5],process.argv[6]]
        };
    try {
        cliente.query(query);
        console.log('Estudiante '+process.argv[3]+' insertado con éxito');
    } catch (err) {
        console.log(err.stack);
    }
    cliente.release();
}

function edita() {
    const query = {
        name: 'update',
        text: "UPDATE estudiantes SET nombre = $1, rut = $2, curso = $3, nivel = $4 WHERE rut = $2",
        valores : [process.argv[3],process.argv[4],process.argv[5],process.argv[6]]
    };
    try {
        cliente.query(query);
        console.log('Estudiante '+process.argv[3]+' editado con éxito');
    } catch (err) {
        console.log(err.stack);
    }
    cliente.release();
}

function elimina() {
    const query = {
        name: 'delete',
        text: "DELETE FROM estudiantes WHERE rut = $1",
        valor: [process.argv[3]]
    };
    try {
        cliente.query(query);
        console.log('Estudiante con rut No. '+process.argv[3]+' eliminado con éxito');
    } catch (err) {
        console.log(err.stack);
    }
    cliente.release();
}

function rut(){
    const query = {
        name: 'rut',
        text: "SELECT * FROM estudiantes WHERE rut = $1",
        valor: [process.argv[3]]
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

function consultar(){
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