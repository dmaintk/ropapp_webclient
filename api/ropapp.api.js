
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
    Cookies.defaults = { expires: 7, path: '/' };

    var ajaxCall = function( type, url, data ) {
        return $.ajax({
            type: type, 
            url: baseUrl + url, 
            data: data, 
            dataType: 'json'  // tipo de respuesta
        });
    }

    var post = function( url, data ) {
        return ajaxCall( 'POST', url, data );
    }

    var get = function( url ) {
        return ajaxCall( 'GET', url, {} );
    }

    var del = function( url ) {
        return ajaxCall( 'DELETE', url, {} );
    }

    var callIfDef = function( func, param ) {
        if(debug)
            console.log(param);

        if($.isDef(func))
            func(param);
    }

    return {  // Interfaz pública

        login: function( credentials, onSuccess, onError ) {
            var request = post('signin', credentials);

            request.done(function(response) {
                Cookies.set('token', response.access_token);
                Cookies.set('username', credentials.username);
                callIfDef(onSuccess, "Login exitoso");
            });

            request.fail(function(response) {
                callIfDef(onError, "Usuario o contraseña incorrecta");
            });
        },

        logout: function( onSuccess, onError ) {
            var request = post('signout', { access_token: Cookies.get('token') });
            
            request.done(function(response) {
                Cookies.remove('token');
                callIfDef(onSuccess, "Logout exitoso");
            });

            request.fail(function(response) {
                callIfDef(onError, "El usuario no estaba loggeado");
            });   
        },

        isLoggedIn: function() {
            return $.isDef(Cookies.get('token'));
        },

        getUsername: function() {
            var username = Cookies.get('username');
            return $.isDef(username) ? username : "";
        },

        registerUser: function( formContent, onSuccess, onError ) {
            var request = post('signup', formContent);
            
            request.done(function(response) {
                    Cookies.set('token', response.access_token);
                    Cookies.set('username', formContent.username);
                    callIfDef(onSuccess, "Usuario creado exitosamente");
            });

            request.fail(function(response) {
                callIfDef(onError, "No se pudo crear el usuario: "+
                        response.responseText);
            });
        },

        getUserData: function( username, onSuccess, onError ) {
            var request = get('user/' + username);
            
            request.done(function(response) {
                console.log(username);
                callIfDef(onSuccess, response);
            });

            request.fail(function(response) {
                console.log(username);
                callIfDef(onError, "El usuario no existe");
            });
        },

        removeUser: function( username, onSuccess, onError ) {
            var request = del('user/' + username + '?access_token=' + Cookies.get('token'));
            
            request.done(function(response) {
                callIfDef(onSuccess, "Usuario eliminado exitosamente");
            });

            request.fail(function(response) {
                callIfDef(onError, "No se pudo eliminar el usuario: "+
                        response.responseText);
            });
        }
    }
})();

