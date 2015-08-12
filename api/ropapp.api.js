
var Ropapp = (function() {
    var debug = true;
    var baseUrl = "http://ropapp.cloudapp.net/";
    Cookies.defaults = { expires: 1, path: '/' };

    var ajaxCall = function( type, url, data, contentType ) { 
        var obj = {
            type: type, 
            url: baseUrl + url, 
            data: data, 
            dataType: 'json'  // tipo de respuesta
        };

        if(isDef(contentType)) {
            obj.contentType = contentType;
            obj.processData = false;
            obj.cache = false;
        }

        return $.ajax(obj);
    }

    var post = function( url, data, contentType ) {
        return ajaxCall( 'POST', url, data, contentType );
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
            var req = post('signin', credentials);

            req.done(function(response) {
                Cookies.set('token', response.access_token);
                Cookies.set('username', credentials.username);
                callIfDef(onSuccess, "Login exitoso");
            });

            req.fail(function(error) {
                callIfDef(onError, "Usuario o contraseña incorrecta");
            });
        },

        logout: function( onSuccess, onError ) {
            var req = post('signout', { access_token: Cookies.get('token') });
            
            req.done(function(response) {
                Cookies.remove('token');
                callIfDef(onSuccess, "Logout exitoso");
            });

            req.fail(function(error) {
                callIfDef(onError, "El usuario no estaba loggeado");
            });   
        },

        registerUser: function( formParams, onSuccess, onError ) {
            var req = post('signup', formParams);
            
            req.done(function(response) {
                Cookies.set('token', response.access_token);
                Cookies.set('username', formParams.username);
                callIfDef(onSuccess, "Usuario creado exitosamente");
            });

            req.fail(function(error) {
                callIfDef(onError, "No se pudo crear el usuario: "+
                        error.responseText);
            });
        },

        
        /*** Usuarios ***/

        getUserData: function( username, onSuccess, onError ) {
            var req = get('user/' + username);
            
            req.done(function(response) {
                callIfDef(onSuccess, response);
            });

            req.fail(function(error) {
                callIfDef(onError, "El usuario no existe: "+username);
            });
        },

        modifyUser: function( formParams, onSuccess, onError ) {
            formParams.username = Cookies.get('username');
            formParams.access_token = Cookies.get('token');
            var req = put('user', formParams);

            req.done(function(response) {
                callIfDef(onSuccess, "Usuario modificado exitosamente");
            });

            req.fail(function(error) {
                callIfDef(onError, "No se pudo modificar el usuario: "+
                        error.responseText);
            });
        },

        removeUser: function( onSuccess, onError ) {
            var req = del('user/' + Cookies.get('username') + 
                '?access_token=' + Cookies.get('token'));
            
            req.done(function(response) {
                Cookies.remove('token');
                callIfDef(onSuccess, "Usuario eliminado exitosamente");
            });

            req.fail(function(error) {
                callIfDef(onError, "No se pudo eliminar el usuario: "+
                        error.responseText);
            });
        },

        
        /*** Sucursales ***/

        getLocationData: function( code, onSuccess, onError ) {
            var req = get('location/'+Cookies.get('username')+'/'+code);
            
            req.done(function(response) {
                callIfDef(onSuccess, response);
            });

            req.fail(function(error) {
                callIfDef(onError, "La sucursal no existe: "+error);
            });
        },

        getUserLocations: function( onSuccess, onError ) {
            var req = get('location/' + Cookies.get('username'));
            
            req.done(function(response) {
                callIfDef(onSuccess, response["locations"]);
            });

            req.fail(function(error) {
                callIfDef(onError, "Error obteniendo sucursales: "+error);
            });
        },

        registerLocation: function( formParams, onSuccess, onError ) {
            formParams.access_token = Cookies.get('token');
            var req = post('location', formParams);
            
            req.done(function(response) {
                callIfDef(onSuccess, "Sucursal agregada exitosamente");
            });

            req.fail(function(error) {
                callIfDef(onError, "No se pudo agregar sucursal: "+
                        error.responseText);
            });
        },

        removeLocation: function( code, onSuccess, onError ) {
            var req = del('location/' + Cookies.get('username') +
                '/' + code + '?access_token=' + Cookies.get('token'));
            
            req.done(function(response) {
                callIfDef(onSuccess, "Sucursal eliminada exitosamente");
            });

            req.fail(function(error) {
                callIfDef(onError, "No se pudo eliminar sucursal: "+
                        error.responseText);
            });
        },


        /*** Prendas ***/

        getClothData: function( code, onSuccess, onError ) {
            var req = get('cloth/'+Cookies.get('username')+'/'+code);

            req.done(function(response) {
                callIfDef(onSuccess, response);
            });

            req.fail(function(error) {
                callIfDef(onError, "La prenda no existe: "+error);
            });
        },

        getUserClothes: function( onSuccess, onError ) {
            var req = get('cloth/search?seller_id='+Cookies.get('username'));
            
            req.done(function(response) {
                callIfDef(onSuccess, response["clothes"]);
            });

            req.fail(function(error) {
                callIfDef(onError, "Error obteniendo prendas: "+error);
            });   
        },

        getClothImage: function( code, onSuccess, onError ) {

        },

        registerClothImage: function( formData, onSuccess, onError ) {
            var formParams = { image: formData, 
                access_token: Cookies.get('token'),
                username: Cookies.get('username') };
            var req = post('cloth/' + Cookies.get('username') +
                '/' + Cookies.get('currCloth') + '/image', 
                formParams, "multipart/form-data");
            console.log(formParams);
            req.done(function(response) {
                callIfDef(onSuccess, "Imagen registrada exitosamente");
            });

            req.fail(function(error) {
                callIfDef(onError, "No se pudo registrar imagen: "+
                        error.responseText);
            });
        },

        registerCloth: function( formParams, onSuccess, onError ) {
            formParams.access_token = Cookies.get('token');
            var req = post('cloth', formParams);
            
            req.done(function(response) {
                callIfDef(onSuccess, "Prenda creada exitosamente");
            });

            req.fail(function(error) {
                callIfDef(onError, "No se pudo crear la prenda: "+
                        error.responseText);
            });
        },

        modifyCurrentCloth: function( formParams, onSuccess, onError ) {
            formParams.access_token = Cookies.get('token');
            var req = put('cloth/'+Cookies.get('currCloth'), formParams);

            req.done(function(response) {
                callIfDef(onSuccess, "Prenda modificada exitosamente");
            });

            req.fail(function(error) {
                callIfDef(onError, "No se pudo modificar la prenda: "+
                        error.responseText);
            });
        },

        removeCurrentCloth: function( onSuccess, onError ) {
            var req = del('cloth/'+ Cookies.get('username') +
                '/' + Cookies.get('currCloth') +
                '?access_token=' + Cookies.get('token'));
            
            req.done(function(response) {
                callIfDef(onSuccess, "Prenda eliminada exitosamente");
            });

            req.fail(function(error) {
                callIfDef(onError, "No se pudo eliminar la prenda: " +
                        error.responseText);
            });
        },


        /*** Stock ***/

        getCurrentClothStock: function( onSuccess, onError ) {
            var req = get('stock/'+Cookies.get('username')+
                '/'+Cookies.get('currCloth'));
            
            req.done(function(response) {
                $.each(response["clothes"], function(i, cloth) {
                    if(cloth.code == Cookies.get('currCloth'))
                        callIfDef(onSuccess, cloth.quantity);
                });
            });

            req.fail(function(error) {
                callIfDef(onError, "Error obteniendo stock: "+error);
            });   
        },

        modifyCurrentClothStock: function( newqty, onSuccess, onError ) {
            var formParams = { quantity: newqty, 
                access_token: Cookies.get('token') };
            var req = put('stock/'+Cookies.get('currCloth'), formParams);

            req.done(function(response) {
                callIfDef(onSuccess, "Stock modificado exitosamente");
            });

            req.fail(function(error) {
                callIfDef(onError, "No se pudo modificar el stock: "+
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
            var espaniol = {"t-shirt": "Camiseta", "shirt": "Camisa", 
                "sweater": "Sweater", "shoes": "Zapatos", 
                "trousers": "Pantalones", "jacket": "Chaqueta"};
            return espaniol[type];
        }
    }
})();
