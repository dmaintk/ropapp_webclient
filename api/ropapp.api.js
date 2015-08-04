// Extiendo jQuery con esta función
jQuery.fn.serializeObject = function() {
  var arrayData, objectData;
  arrayData = this.serializeArray();
  objectData = {};

  $.each(arrayData, function() {
    var value;

    if (this.value != null) {
      value = this.value;
    } else {
      value = '';
    }

    if (objectData[this.name] != null) {
      if (!objectData[this.name].push) {
        objectData[this.name] = [objectData[this.name]];
      }

      objectData[this.name].push(value);
    } else {
      objectData[this.name] = value;
    }
  });

  return objectData;
};

jQuery.isDef = function( val ) {
    return typeof val != 'undefined' && val != null;
}

var Ropapp = (function() {
    var debug = true;
    var baseUrl = "http://ropapp.cloudapp.net/";
    var token = "";  // TODO: escribir esto en una cookie
    var username = "";  // idem

    var ajaxCall = function( type, url, data, onSuccess, onError ) {
        $.ajax({
            type: type, 
            url: baseUrl + url, 
            data: data, 
            dataType: 'json',
            success: function(response) {
                onSuccess(response);
            },
            error: function(response) {
                onError(response);
            }
        });
    }

    var post = function( url, data, onSuccess, onError ) {
        ajaxCall( 'POST', url, data, onSuccess, onError );
    }

    var get = function( url, onSuccess, onError ) {
        ajaxCall( 'GET', url, {}, onSuccess, onError );
    }

    var del = function( url, onSuccess, onError ) {
        ajaxCall( 'DELETE', url, {}, onSuccess, onError );
    }

    var callIfDef = function( func, param ) {
        if(debug)
            console.log(param);

        if($.isDef(func))
            func(param);
    }

    return {  // Interfaz pública

        login: function( credentials, onSuccess, onError ) {
            post('signin', credentials, 
                function(response) {
                    token = response.access_token;
                    username = credentials.username;
                    callIfDef(onSuccess, "Login exitoso");
                }, 
                function(response) {
                    callIfDef(onError, "Usuario o contraseña incorrecta");
                });
        },

        logout: function( onSuccess, onError ) {
            post('signout', { access_token: token }, 
                function(response) {
                    token = "";
                    username = "";
                    callIfDef(onSuccess, "Logout exitoso");
                }, 
                function(response) {
                    callIfDef(onError, "El usuario no estaba loggeado");
                });   
        },

        isLoggedIn: function() {
            return token != "";
        },

        registerUser: function( formContent, onSuccess, onError ) {
            post('signup', formContent, 
                function(response) {
                    token = response.access_token;
                    username = formContent.username;
                    callIfDef(onSuccess, "Usuario creado exitosamente");
                }, 
                function(response) {
                    callIfDef(onError, "No se pudo crear el usuario: "+
                            response.responseText);
                });
        },

        getUserData: function( user, onSuccess, onError ) {
            get('user/' + ($.isDef(user) ? user : username), 
                function(response) {
                    console.log(user);
                    callIfDef(onSuccess, response);
                },
                function(response) {
                    console.log(user);
                    callIfDef(onError, "El usuario no existe");
                }
            );
        },

        removeUser: function( user, onSuccess, onError ) {
            del('user/' + /*($.isDef(user) ? user : username)*/"lalobla5" + '?access_token=' + token,
                function(response) {
                    callIfDef(onSuccess, "Usuario eliminado exitosamente");
                }, 
                function(response) {
                    callIfDef(onError, "No se pudo eliminar el usuario: "+
                            response.responseText);
                });
        }
    }
})();

