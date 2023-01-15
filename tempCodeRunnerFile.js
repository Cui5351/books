readdir(resolve(__dirname),function(err,data){
    if(err){
    return
    }
    console.log(data);
})