
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

    var put = function( url, data ) {
        return ajaxCall( 'PUT', url, data );
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

            request.fail(function(error) {
                callIfDef(onError, "Usuario o contraseña incorrecta");
            });
        },

        logout: function( onSuccess, onError ) {
            var request = post('signout', { access_token: Cookies.get('token') });
            
            request.done(function(response) {
                Cookies.remove('token');
                callIfDef(onSuccess, "Logout exitoso");
            });

            request.fail(function(error) {
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

            request.fail(function(error) {
                callIfDef(onError, "No se pudo crear el usuario: "+
                        error.responseText);
            });
        },

        
        /*** Usuarios ***/

        getUserData: function( username, onSuccess, onError ) {
            var request = get('user/' + username);
            
            request.done(function(response) {
                callIfDef(onSuccess, response);
            });

            request.fail(function(error) {
                callIfDef(onError, "El usuario no existe: "+username);
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

            request.fail(function(error) {
                callIfDef(onError, "No se pudo eliminar el usuario: "+
                        error.responseText);
            });
        },

        
        /*** Sucursales ***/

        
        /*** Prendas ***/

        getClothData: function( code, onSuccess, onError ) {
            var request = get('cloth/'+Cookies.get('username')+'/'+code);

            request.done(function(response) {
                callIfDef(onSuccess, response);
            });

            request.fail(function(error) {
                callIfDef(onError, "La prenda no existe: "+error);
            });
        },

        getUserClothes: function( onSuccess, onError ) {
            var request = get('cloth/search?seller_id='+Cookies.get('username'));
            
            request.done(function(response) {
                callIfDef(onSuccess, response["clothes"]);
            });

            request.fail(function(error) {
                callIfDef(onError, "Error obteniendo prendas: "+error);
            });   
        },

        getClothImage: function( code, onSuccess, onError ) {

        },

        registerClothImage: function( image, onSuccess, onError ) {

        },

        registerCloth: function( formContent, onSuccess, onError ) {
            formContent.access_token = Cookies.get('token');
            var request = post('cloth', formContent);
            
            request.done(function(response) {
                callIfDef(onSuccess, "Prenda creada exitosamente");
            });

            request.fail(function(error) {
                callIfDef(onError, "No se pudo crear la prenda: "+
                        error.responseText);
            });
        },

        modifyCurrentCloth: function( formContent, onSuccess, onError ) {
            formContent.access_token = Cookies.get('token');
            var request = put('cloth/'+Cookies.get('currCloth'), formContent);

            request.done(function(response) {
                callIfDef(onSuccess, "Prenda modificada exitosamente");
            });

            request.fail(function(error) {
                callIfDef(onError, "No se pudo modificar la prenda: "+
                        error.responseText);
            });
        },

        removeCurrentCloth: function() {
            var request = del('cloth/'+ Cookies.get('username') +
                '/' + Cookies.get('currCloth') +
                '?access_token=' + Cookies.get('token'));
            
            request.done(function(response) {
                callIfDef(onSuccess, "Prenda eliminada exitosamente");
            });

            request.fail(function(error) {
                callIfDef(onError, "No se pudo eliminar la prenda: " +
                        error.responseText);
            });
        },


        /*** Misc ***/

        isLoggedIn: function() {
            return isDef(Cookies.get('token'));
        },

        getUsername: function() {
            var username = Cookies.get('username');
            return isDef(username) ? username : "";
        },

        setCurrentCloth: function( code ) {
            Cookies.set('currCloth', code);
        },

        getCurrentCloth: function() {
            var currCloth = Cookies.get('currCloth');
            return isDef(currCloth) ? currCloth : "";
        },

        getClothTypeTranslation: function( type ) {
            var esp = {"t-shirt": "Camiseta", "shirt": "Camisa", 
                "sweater": "Sweater", "shoes": "Zapatos", 
                "trousers": "Pantalones", "jacket": "Chaqueta"};
            return esp[type];
        }
    }
})();
