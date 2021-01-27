if(process.env.NODE_ENV == "production"){
      module.exports = {mongoURI: "mongodb+srv://emersonklem:kbfkbfkbfkbfkbf@cluster0-aoufk.mongodb.net/test?retryWrites=true&w=majority"}
}else{
    module.exports = {mongoURI: "mongodb://localhost/blogapp"}

}