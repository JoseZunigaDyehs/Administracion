// Initialize Firebase
var config = {
  apiKey: "AIzaSyCnCnWrOmPiCvPYMxFKWPvRsi7eKagAmW8",
  authDomain: "administracion-e51ba.firebaseapp.com",
  databaseURL: "https://administracion-e51ba.firebaseio.com",
  projectId: "administracion-e51ba",
  storageBucket: "administracion-e51ba.appspot.com",
  messagingSenderId: "93179947109"
};
firebase.initializeApp(config);
var db = firebase.database();

/**
 * Iniciar sesion
 */
var ingresar = function () {
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function(){
      //alert('logeado');
      window.location = "agregarPlatillo.html";
    })
    .catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      if (errorCode === 'auth/wrong-password') {
        alert('Contraseña inválida');
      } else {
        alert(errorMessage);
      }
      alert(error);
    });
}

/**
 * Observador de usuario
 */
var user = firebase.auth().currentUser;
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
  } else {
    // No user is signed in.
  }
});

/**
 * Crear pratillos
 * @param {*} _nombre 
 * @param {*} _descripcion 
 * @param {*} _precio 
 * @param {*} _imagen 
 */
var createPlatillo = function (_nombre, _descripcion, _precio, _imagen) {
  db.ref('alimentos/').push({
    nombre: _nombre,
    descripcion: _descripcion,
    precio: _precio,
    cantidad: 0,
    imagen: _imagen
  });
};

function subirPlato() {
  var nombre = document.getElementById('nombre').value;
  var descripcion = document.getElementById('descripcion').value;
  var precio = document.getElementById('precio').value;
  precio = parseInt(precio);
  var imagen = document.getElementById('imgDir').value;

  try {
    createPlatillo(nombre, descripcion, precio, imagen);
    alert('Se agregó el platillo');
  } catch (error) {
    console.log('No se puedo agregar el platillo, erro: ' + error);
  }

}

/**
 * Imágenes
 */
function visualizarArchivo() {
  var storage = firebase.storage();
  var storageRef = storage.ref();

  var imagen = document.querySelector('#imgPlatillo');
  var archivo = document.querySelector('[name="imagen"]').files[0];
  var lector = new FileReader();

  lector.onloadend = function () {
    imagen.src = lector.result;
  }

  if (archivo) {
    lector.readAsDataURL(archivo);

    var subirImagen = storageRef.child('platillos/' + archivo.name).put(archivo);

    subirImagen.on('state_changed', function (snapshot) {
      //Los cambios en la carga de archivo
    }, function (error) {
      console.log('Error en carga de archivo: ' + error);
    }, function () {
      //Si todo sale bien
      console.log(subirImagen.snapshot.downloadURL);
      document.getElementById('imgDir').value = subirImagen.snapshot.downloadURL;
    });

  } else {
    imagen.src = "";
  }
}

/**
 * Leer platillos
 */
var leerPlatillos = function () {
  var query = db.ref('alimentos/');
  query.on('value', function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      console.log(childSnapshot.key);
      console.log(childSnapshot.val());
      debugger;
      var div = document.createElement('div');
      div.classList.add('card');
      var img = document.createElement('img');
      img.classList.add('card-img-top');
      img.src = childSnapshot.val().imagen;
      var divIn = document.createElement('div');
      divIn.classList.add('card-body');
      var h5 = document.createElement('h5');
      h5.classList.add('card-title');
      var t = document.createTextNode(childSnapshot.val().nombre);
      h5.appendChild(t);
      var button = document.createElement('a');
      button.href = '#';
      button.setAttribute('class', 'btn btn-danger');
      button.appendChild(document.createTextNode('Eliminar'));
      button.setAttribute('id', childSnapshot.key);
      button.setAttribute('onclick', 'eliminarPlatillo(this.id)');
      var p = document.createElement('p');
      p.classList.add('card-text');
      t = document.createTextNode(childSnapshot.val().descripcion);
      p.appendChild(t);

      //var link = document.createElement('a');
      //link.href = childSnapshot.

      div.appendChild(img);
      divIn.appendChild(h5);
      divIn.appendChild(p);
      divIn.appendChild(button);
      div.appendChild(divIn);
      var divCol = document.createElement('div');
      divCol.classList.add('col-md-4');
      divCol.appendChild(div);
      document.getElementById('cardPlato').appendChild(divCol);

    });
  });
};

/**
 * Eliminar Platillos
 */
function eliminarPlatillo(id) {
  db.ref('alimentos/' + id).remove()
    .then(function () {
      console.log("Remove succeeded.")
    })
    .catch(function (error) {
      console.log("Remove failed: " + error.message)
    });
}