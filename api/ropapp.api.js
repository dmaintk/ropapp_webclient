
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

    var isDef = function( val ) {
        return typeof val != 'undefined' && val != null;
    }

    var callIfDef = function( func, param ) {
        if(debug)
            console.log(param);

        if(isDef(func))
            func(param);
    }

    return {  // Interfaz pública

        
        /*** Autenticación ***/

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

        
        /*** Usuarios ***/

        getUserData: function( username, onSuccess, onError ) {
            var request = get('user/' + username);
            
            request.done(function(response) {
                callIfDef(onSuccess, response);
            });

            request.fail(function(response) {
                callIfDef(onError, "El usuario no existe");
            });
        },

        modifyUser : function( onSuccess, onError ) {

        },

        removeUser: function( onSuccess, onError ) {
            var request = del('user/' + Cookies.get('username') + 
                '?access_token=' + Cookies.get('token'));
            
            request.done(function(response) {
                callIfDef(onSuccess, "Usuario eliminado exitosamente");
            });

            request.fail(function(response) {
                callIfDef(onError, "No se pudo eliminar el usuario: "+
                        response.responseText);
            });
        },

        
        /*** Sucursales ***/

        
        /*** Prendas ***/

        getClothData: function( code, onSuccess, onError ) {
            var request = get('cloth/'+Cookies.get('username')+'/'+code);
            
            request.done(function(response) {
                callIfDef(onSuccess, response);
            });

            request.fail(function(response) {
                callIfDef(onError, "La prenda no existe");
            });
        },

        getClothImage: function( code, onSuccess, onError ) {

        },

        registerClothImage: function( image, onSuccess, onError ) {

        },

        registerCloth: function( formContent, onSuccess, onError ) {
            formContent.access_token = Cookies.get('token');
            console.log(formContent);
            var request = post('cloth', formContent);
            
            request.done(function(response) {
                console.log(response);
                callIfDef(onSuccess, "Prenda creada exitosamente");
            });

            request.fail(function(response) {
                callIfDef(onError, "No se pudo crear la prenda: "+
                        response.responseText);
            });
        },

        modifyCloth: function() {
            
        },

        removeCloth: function() {
            
        },


        /*** Misc ***/

        isLoggedIn: function() {
            return isDef(Cookies.get('token'));
        },

        getUsername: function() {
            var username = Cookies.get('username');
            return isDef(username) ? username : "";
        },

        getClothTypeTranslation: function( type ) {
            var esp = {"t-shirt": "Camiseta", "shirt": "Camisa", 
                "sweater": "Sweater", "shoes": "Zapatos", 
                "trousers": "Pantalones", "jacket": "Chaqueta"};
            return esp[type];
        }
    }
})();
