const API = "https://api.github.com/users/";

const tiempoMaximoEnMs = 3000

const app = Vue.createApp({
    data() {
      return {
        search: null,
        result : null,
        error:null,
        favorites: new Map()
      }
    },
    created(){
      
      const jsonFavoritos = JSON.parse(window.localStorage.getItem("favorites"));
      if(jsonFavoritos!=null){
        if(jsonFavoritos.length){
          const favorites = new Map(jsonFavoritos.map(fav => [fav.login,fav]))
          this.favorites=favorites;
        }
      }
     
    },
    computed:{
      isFavorite(){
        return this.favorites.has(this.result.login)
      },
      all(){
        return Array.from(this.favorites.values())
      }
    },
    methods:{
     
        async buscar() {

          this.result= this.error= null;

          const encontradoEnFavoritos = this.favorites.get(this.search)

          const hacerRequestDevuelta = (() => {
            if(!!encontradoEnFavoritos){
              const { lastRequestTime } = encontradoEnFavoritos

              const now = Date.now()

              return (now - encontradoEnFavoritos) > tiempoMaximoEnMs
            }

            return false;
          })()

          if(!!encontradoEnFavoritos && !hacerRequestDevuelta /* la funcion se ejecuta y devuelve un bool */ ){
            return this.result=encontradoEnFavoritos;
          }


          try{
            const response = await fetch(API + this.search)

            if(!response.ok) throw new Error("User not found")

            const data = await response.json(); 
            console.log(data);
            this.result=data;

            if(encontradoEnFavoritos)
              encontradoEnFavoritos.lastRequestTime = Date.now() // cuando se pide un nuevo usuario se reinicia el tiempo 

          }catch(error){
            this.error=error;
          }finally{
            this.search=null;
          }
            
        },
        agregarFavorito(){

          this.result.lastRequestTime = Date.now();

          this.favorites.set(this.result.login,this.result)
          this.updateStorage()
        },
        quitarFavorito(){
          this.favorites.delete(this.result.login)
          this.updateStorage()
        },
        verFavorito(fav){
          this.result=fav;
        },
        updateStorage(){
          window.localStorage.setItem("favorites",JSON.stringify(this.all));
        }
    }
  })

  const mountedApp = app.mount("#app")