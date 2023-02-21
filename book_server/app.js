const express=require('express')
const cors=require('cors')
const {readFile, readFileSync,writeFile}=require('fs')
const {query} =require('./query')
const {connectionMysql,insertData,update}=require('./dbs')
const { resolve } = require('path')
const https=require('https')
const axios= require('axios')
const {createHash}=require('crypto')
// 创建app
const app=express()

// 解析post请求数据
app.use(express.urlencoded({ extended: true }))
app.use(express.json({limit : '21000000kb'}));


app.use(cors())
const options = {
  key: readFileSync(resolve(__dirname, 'cert','a.key')),
  cert: readFileSync(resolve(__dirname, 'cert','a.pem'))
}
app.use((req,res,next)=>{
    const referer=req.get('referer')
    if(!referer||!(referer=='https://servicewechat.com/wxf5e611bcd30eb83d/16/page-frame.html'||referer=='https://www.mynameisczy.asia/'||referer=='https://mynameisczy.asia/'||referer=='https://servicewechat.com/wxf5e611bcd30eb83d/devtools/page-frame.html')){
        res.status(403).send('权限不够')
    }else{
        next()
    }
})
entry()

function entry(){
    // 解析文件
    readFile('./base_config.json',async function(err,data){   
        if(err) return 
        data=JSON.parse(data.toString())
        const {server_config,db_config}=data

// 这是机制问题，当没有操作数据的时候，就断开连接了 在网站stackoverflow看到了解决方案 强制连接,让数据库每1hours查询一次        
        
        await connectionMysql(db_config).then(value=>{
            let n=0
            setInterval(()=>{
                value.query('select 1')
                n++
            },3600000)
            MountRouter(server_config.port,value,db_config)  
            https.createServer(options,app).listen('5351',function(){
            })  
        })
    })
}


// 路由注入
function MountRouter(port,dbs,db_config){
    // 微信接口测试
    app.get('/test_interface',(req,res)=>{
        const token='czyishandsome'
        const {timestamp,nonce,signature,echostr}=req.query
        let list=[timestamp,nonce,token].sort().join('')
        let result=createHash('sha1').update(list).digest('hex')
        console.log("------------")
        console.log(result,signature)
        console.log(req.query)
        console.log("------------")
        if(result==signature){
            console.log('符合')
            res.send({
                echostr:echostr
            })
        }
    })

        app.post('/setBookshelf',function(req,res){
            // 参数列表
            // openid:<number>
            // book_name:<string>
            if(typeof req.body === 'string')
                req.body=JSON.parse(req.body)
            if(!req.body.hasOwnProperty('openid')||!req.body.hasOwnProperty('book_name')){
                res.send({
                    state:0,
                    error:1,
                    errorMes:'缺少参数'
                })
                return
            }
            if(typeof req.body.openid !== 'string'||typeof req.body.book_name !== 'string'){
                res.send({
                    state:0,
                    error:1,
                    errorMes:'数据类型出错'
                })
                return
            }
            for(let item in req.body){
                if(typeof req.body[item] === 'string')
                    if(req.body[item].trim().length<1){
                        res.send({
                            state:0,
                            error:2,
                            errorMes:"数据值无效(上传数据为空|长度小于1)"
                        })
                        return
                    }
            }

            const {openid,book_name}=req.body            
            // 这里检测原数组
            axios.post('https://www.mynameisczy.asia:5351/getBookshelf',data={
                openid:openid
            }).then(e=>{
                // 查询e中是否包含book_name
                for(let i in e.data.data){
                    if(e.data.data[i]==book_name){
                        // 将其删除
                        e.data.data.splice(i,1)
                        update(dbs,'mynameisczy_asia.user_info',{openid:openid},'bookshelf',JSON.stringify(e.data.data),'string')
                        res.send({
                            state:1,
                            error:0,
                            message:"取消收藏成功"
                        })
                        return
                    }
                        
                }
                    // 包含
                        // 直接返回
                    // 不包含
                        // 添加
                // 返回的数组
                e.data.data.push(book_name)
                update(dbs,'mynameisczy_asia.user_info',{openid:openid},'bookshelf',JSON.stringify(e.data.data),'string').then(e=>{
                    res.send({
                        state:1,
                        error:0
                    })
                    return
                }).catch(e=>{
                })
            }).catch(e=>{
                res.send({
                    state:0,
                    error:1,
                })          
                return      
            })
        })

        app.post('/getBookshelf',function(req,res){
            // 参数列表
            // openid:<number>
            if(typeof req.body === 'string')
                req.body=JSON.parse(req.body)
            if(!req.body.hasOwnProperty('openid')){
                res.send({
                    state:0,
                    error:1,
                    errorMes:'缺少参数'
                })
                return
            }
            if(typeof req.body.openid !== 'string'){
                res.send({
                    state:0,
                    error:1,
                    errorMes:'数据类型出错'
                })
                return
            }
            if(!req.body.openid.trim().length){
                res.send({
                    state:0,
                    error:2,
                    errorMes:"数据值无效(上传数据为空|长度小于1)"
                })
                return
            }

            const {openid}=req.body

            // 通过openid拿到用户信息
            query(dbs,'mynameisczy_asia.user_info',['bookshelf'],{openid:openid}).then(value=>{
                if(!value.length){
                    res.send({
                        state:0,
                        error:1,
                        errorMes:"用户状态异常,请重新登录"
                    })
                    return
                }
                let bookshelf=value[0].bookshelf
                if(bookshelf.length)
                    bookshelf=JSON.parse(bookshelf)
                if(typeof bookshelf === 'string'){
                    // 更新bookshelf（设置值"[]"）
                    update(dbs,'mynameisczy_asia.user_info',{openid:openid},'bookshelf',"'[]'").then(e=>{
                        res.send({
                            state:1,
                            error:0,
                            data:[]
                        })
                        return
                    }).catch(e=>{
                        res.send({
                            state:0,
                            error:1,
                            errorMes:"用户状态异常,请重新登录"
                        })
                        return
                    })
                }else{
                    // 将其返回
                    res.send({
                        state:1,
                        error:0,
                        data:bookshelf
                    }) 
                    return
                }
                
            })
                // 拿到用户信息
                    // 获取到bookshelf
                        // bookshelf不为空
                            // 返回信息

                        // bookshelf为空
                            // 添加一个数组并保存"[]"

                // 没拿到用户信息
                    // 返回用户状态异常，请重新登录
            
        })

        app.post('/upload',async function(req,res){
            
            // 上传书籍内容
            // 地址:https://www.mynameisczy.asia:5351/upload
            // 请求方法:POST
            
            // 请求参数：
            // book_name:<string>书名
            // passage_value:<number>章节值
            // passage_name:<string>章节名
            // content:<string>小说内容内容
            
            if(typeof req.body === 'string')
                req.body=JSON.parse(req.body)
            if(!req.body.hasOwnProperty('book_name')||!req.body.hasOwnProperty('passage_value')||!req.body.hasOwnProperty('passage_name')||!req.body.hasOwnProperty('content')){
                res.send({
                    state:0,
                    error:1,
                    errorMes:'缺少参数'
                })
                return 
            }
            let {book_name,passage_value,passage_name,content}=req.body
            passage_value=Number(passage_value)
            
            // 格式错误
            if((typeof book_name !== 'string') || (isNaN(passage_value)) || (typeof passage_value !== 'number') ||(typeof passage_name !=='string')||(typeof content !== 'string')){
                res.send({
                    state:0,
                    error:1,
                    errorMes:"数据格式出错"
                })
                return
            }
            for(let item in req.body){
                if(typeof req.body[item] === 'string')
                    if(req.body[item].trim().length<1){
                        res.send({
                            state:0,
                            error:2,
                            errorMes:"数据值无效(上传数据为空|长度小于1)"
                        })
                        return
                    }
            }

            // 对数据库进行操作

            // 1先查询books_info里的book_name是否包含book_name
                query(dbs,"mynameisczy_asia.books_info",'book_name',{book_name:book_name},null).then(result=>{
                    // 1.2不包含：添加数据：1{给books_info中book_name添加book_name数据} 2{给books_content里添加{book_name和passage_value和passage_name和content}数据}
                if(!result.length){
                    // 不包含(返回上传指令)
                    res.send({
                        state:0,
                        error:1,
                        errorMes:"数据库中不包含该书,请先上传该书的信息"
                    })
                    return
                }else{
                    // 包含：查询books_content中的章节名是否包含
                    query(dbs,'mynameisczy_asia.books_content',['book_name','passage_name','passage_value'],{book_name,passage_name,passage_value},null).then(value=>{
                        if(value.length>=1){
                            // 包含：不保存
                            res.send({
                                state:1,
                                error:0,
                                mes:'该数据存在'
                            })
                        return
                        }else{
                            insertData(dbs,'mynameisczy_asia.books_content',JSON.stringify({book_name,passage_name,passage_value,content})).then(()=>{
                                res.send({
                                    state:1,
                                    error:0,
                                    mes:'保存章节成功'
                                })
                            return
                            }).catch((e)=>{
                                res.send({
                                    state:0,
                                    error:1,
                                    errorMes:'保存章节失败'
                                })                                
                            return
                            })
                        }
                    })
                }
            }).catch(e=>{
                // 查询出错
                res.send({
                    state:0,
                    error:1,
                    errorMes:'Select Error'
                })
                return
            })
                
                // 1.1包含：查询books_content里的book_name和passage_value和passage_name是否存在

                    // 1.11存在：不保存
                    // 1.12不存在：保存
            // 1.2不包含：添加数据：1{给books_info中book_name添加book_name数据} 2{给books_content里添加{book_name和passage_value和passage_name和content}数据}
        })

        app.post('/updateFeedback',function(req,res){

            // 参数列表:
                // nickName:<string> 
                // avatarUrl:<string>
                // content:<string>
                // feedback_to:<string>
                // gender:<string>(可选)
                // openid:<string>

            if(typeof req.body === 'string')
                req.body=JSON.parse(req.body)
            if(!req.body.hasOwnProperty('openid')||!req.body.hasOwnProperty('nickName')||!req.body.hasOwnProperty('avatarUrl')||!req.body.hasOwnProperty('content')||!req.body.hasOwnProperty('feedback_to')){
                res.send({
                    state:0,
                    error:1,
                    errorMes:'缺少参数'
                })
                return 
            }
            
            for(let item in req.body){
                if(typeof req.body[item] === 'string')
                    if(req.body[item].trim().length<1){
                        res.send({
                            state:0,
                            error:2,
                            errorMes:"数据值无效(上传数据为空|长度小于1)"
                        })
                        return
                }
            }

            let gender='未知'
            if(req.body.hasOwnProperty('gender')){
                if(req.body.gender==0)
                    gender='男'
                else{
                    gender='女'
                }
            }

            const {nickName,avatarUrl,content,feedback_to,openid}=req.body

            insertData(dbs,'mynameisczy_asia.user_feedback',JSON.stringify({
                nickName,avatarUrl,content,feedback_to,gender,openid
            })).then(e=>{
                res.send({
                    state:1,
                    error:0
                })
                return
            }).catch(e=>{
                res.send({
                    state:0,
                    error:1,
                    errorMes:"数据插入失败"
                })
                return
            })
        })

        app.post('/uploadBookInfo',function(req,res){
            // 上传书的信息
            // 地址:https://www.mynameisczy.asia:5351/uploadBookInfo
            // 请求方法:POST

            // 参数列表:
            // book_name:<string>书名(必须)
            // author:<string>作者名(必须)
                // score:<number>评分(可选)
            // book_type:<string>小说类型(玄幻，修真,古史，科幻，文学，都市，出版，仙侠，网游，悬疑)(必须)
            // book_introduce:<string>小说简介(必须)
                // book_state:<string>书的状态(可选{完结,连载}(默认连载))
            

            // book_photo:<二进制>图片(必须)
            
            if(typeof req.body === 'string')
                req.body=JSON.parse(req.body)
            if(!req.body.hasOwnProperty('book_name')||!req.body.hasOwnProperty('author')||!req.body.hasOwnProperty('book_type')||!req.body.hasOwnProperty('book_introduce')){
                res.send({
                    state:0,
                    error:1,
                    errorMes:'缺少参数'
                })
                return 
            }
            
            for(let item in req.body){
                if(typeof req.body[item] === 'string')
                    if(req.body[item].trim().length<1){
                        res.send({
                            state:0,
                            error:2,
                            errorMes:"数据值无效(上传数据为空|长度小于1)"
                        })
                        return
                    }
            }

            const {author,book_type,book_introduce,book_name}=req.body
            let score=5.5
            let book_state="连载"
            if(req.body.hasOwnProperty('score'))
                score=req.body.score
            if(req.body.hasOwnProperty('book_state'))
                book_state=req.body.book_state


            // 查询上传的数据在数据库中是否存在
            query(dbs,'mynameisczy_asia.books_info','book_name',{book_name:book_name},null,null).then(value=>{
                // 查询是否已经含有
                if(value.length>=1){
                    res.send({
                        state:0,
                        error:1,
                        errorMes:"该书已经存在"
                    })
                    return;
                }else{
                    // 书不存在(可以上传)
                    insertData(dbs,'mynameisczy_asia.books_info',JSON.stringify({
                        book_name,author,score,book_type,book_introduce,book_state
                    })).then(()=>{
                        res.send({
                            state:1,
                            error:0
                        })
                        return
                    }).catch(()=>{
                        res.send({
                            state:0,
                            error:1,
                            errorMes:'数据插入失败'
                        })    
                        return
                    })
                }
            })
        })

        app.post('/getRandomBook',function(req,res){
            if(typeof req.body === 'string')
                req.body=JSON.parse(req.body)  
            if(!req.body.hasOwnProperty('count')){
                res.send({
                    state:0,
                    error:1,
                    errorMes:'缺少参数'
                })
                return 
            }
            if(typeof req.body.count !== 'number'){
                res.send({
                    state:0,
                    error:2,
                    errorMes:"数据值无效(上传数据为空|长度小于1)"
                })
                return
            }
            const {count}=req.body
            // 先拿到books_info里的所有书的值
            query(dbs,'mynameisczy_asia.books_info','count(*)').then(value=>{
                let c=value[0]['count(*)']
                if(c<=count){
                    // 1发送网络请求(得到书的内容)
                        // 将所有数据全部返回
                        query(dbs,'mynameisczy_asia.books_info','book_name').then(value=>{
                            res.send({
                                state:1,
                                error:0,
                                value:value[0]
                            })
                        })
                    return 
                }else{
                    // 2这里随机获取几个数值(数值的个数=count)
                    query(dbs,'mynameisczy_asia.books_info','book_name').then(value=>{
                    let arr=[-2]
                    let random
                    while(arr.length<=count){
                        random=Number.parseInt(Math.random()*c)
                        arr.forEach((item,index)=>{
                            if(item == random){
                                random=-1
                            }
                            if(arr.length-1==index&&random!=-1){
                                arr.push(random)
                            }
                        })
                    }
                    arr.shift()
                    res.send({
                        state:1,
                        value:arr.map(item=>{return value[item]})
                    })
                    return;
                })
                }
            })
        })

        app.post('/SearchBookInfo',function(req,res){

            if(typeof req.body === 'string')
                req.body=JSON.parse(req.body)

            if(!req.body.hasOwnProperty('book_name')){
                res.send({
                    state:0,
                    error:1,
                    errorMes:'缺少参数'
                })
                return 
            }
            if(typeof req.body.book_name !== 'string'){
                res.send({
                    state:0,
                    error:2,
                    errorMes:"数据值无效(上传数据为空|长度小于1)"
                })
                return
            }
            const {book_name}=req.body
            let limit=''
            if(req.body.hasOwnProperty('skip')||req.body.hasOwnProperty('count')){
                limit=' limit '+req.body.skip+','+req.body.count
            }
            

            // dbs.query(`select * from mynameisczy_asia.books_info where book_name like '%${book_name}% or author like '%${book_name}%''`+limit,function(err,result){
            dbs.query(`select * from mynameisczy_asia.books_info where book_name like '%${book_name}%' or author='${book_name}'`+limit,function(err,result){
                // dbs.query(`select * from mynameisczy_asia.books_info where book_name like '%${book_name}%'`+limit,function(err,result){
                if(err){
                    res.send({
                        state:0,
                        error:1,
                        errorMes:err
                    })
                    return
                }
                res.send({
                    state:1,
                    error:0,
                    value:result
                })
            })

        })

        // 根据传入的类型来进行匹配
        app.post('/getBookInfo_category',function(req,res){
            // 参数列表
                // category:<string>(仙侠，玄幻，修真...)
                // skip:<number>(跳过的数量)
                // count:<number>(拿到的数量)

            if(typeof req.body === 'string')
                req.body=JSON.parse(req.body)

            if(!req.body.hasOwnProperty('category')||!req.body.hasOwnProperty('count')||!req.body.hasOwnProperty('skip')){
                res.send({
                    state:0,
                    error:1,
                    errorMes:'缺少参数'
                })
                return 
            }
            if(typeof req.body.category !== 'string'||req.body.category.length<2||typeof req.body.skip !== 'number'||typeof req.body.count !== 'number'){
                res.send({
                    state:0,
                    error:2,
                    errorMes:"数据值无效(上传数据为空|长度小于1)"
                })
                return
            }

            const {category,skip,count}=req.body

            query(dbs,'mynameisczy_asia.books_info','',{book_type:category},{
                skip:skip,count:count
            },{order:'desc',by:'score'}).then(value=>{
                res.send({
                    state:1,
                    error:0,
                    value:value
                })
            }).catch(e=>{
                res.send({
                    state:0,
                    error:1,
                    errorMes:e
                })
            })                   
        })
        app.post('/getBookInfo_one',(req,res)=>{
            let data=req.body
            if(typeof data === 'string')
                data=JSON.parse(data)
            if(!data.hasOwnProperty('book_name')||!data.hasOwnProperty('passage_value')){
                res.send({
                    state:0,
                    error:1,
                    errMes:"缺少参数"
                })
                return
            }
            if(typeof data.book_name !== 'string' || typeof data.passage_value !== 'number'){
                res.send({
                    state:0,
                    error:1,
                    errMes:"参数类型错误"
                })
                return
            }            
            const {book_name,passage_value}=data
            query(dbs,db_config.database+'.books_content','',{book_name:book_name,passage_value:passage_value}).then(result=>{
                if(result.length<=0){
                    res.send({
                        state:0,
                        error:1
                    })
                    return
                }
                res.send({
                    state:1,
                    error:0,
                    value:result[0]
                })
            }).catch(e=>{
                res.send({
                    state:0,
                    error:1,
                    errorMes:e
                })
            })
        })

        // 添加小说score
        // 用户每点击一次，books_info里的score就会+1
        app.post('/addBookScore',function(req,res){
            // 参数列表
                // book_name:<string>小说名
            if(typeof req.body === 'string')
                req.body=JSON.parse(req.body)

            if(!req.body.hasOwnProperty('book_name')){
                res.send({
                    state:0,
                    error:1,
                    errorMes:'缺少参数'
                })
                return 
            }             
            if(req.body.book_name.length<=1){
                res.send({
                    state:0,
                    error:2,
                    errorMes:"数据值无效(上传数据为空|长度小于1)"
                })
                return
            }
            const {book_name}=req.body

            update(dbs,db_config.database+'.books_info',{book_name:book_name},'score',1,null,'+').then(e=>{
                res.send({
                    state:1,
                    error:0
                })
            }).catch(e=>{
            })
        })


        app.post('/getBookInfo',function(req,res){

            // 请求参数
            // count:<number>请求个数
            // skip:<number>跳过个数
            // book_names:书名(可选)

            if(typeof req.body === 'string')
                req.body=JSON.parse(req.body)

            if(!req.body.hasOwnProperty('count')||!req.body.hasOwnProperty('skip')){
                res.send({
                    state:0,
                    error:1,
                    errorMes:'缺少参数'
                })
                return 
            } 

            if(req.body.hasOwnProperty('book_names')){
                const data={
                    book_info:[]
                }
                if(req.body.book_names instanceof Array){
                new Promise((res,rej)=>{
                    for(let i=0;i<req.body.book_names.length;i++){
                        query(dbs,'mynameisczy_asia.books_info','',{book_name:req.body.book_names[i]}).then(e=>{
                            data.book_info.push(e[0])
                            if(i==req.body.book_names){
                                res(data)
                            }
                        })
                    }
                }).then(e=>{
                    res.send({
                        state:1,
                        error:0,
                        value:e
                    })
                }).catch(e=>{
                    res.send({
                        state:0,
                        error:1,
                        errorMes:e
                    })                    
                })
                    return
                }else{
                    query(dbs,db_config.database+'.books_info','',{book_name:req.body.book_names}).then(e=>{
                        data.book_info.push(e[0])
                        res.send({
                            state:1,
                            error:0,
                            value:e
                        })                        
                    }).catch(e=>{
                        res.send({
                            state:0,
                            error:1,
                            errorMes:e
                        })
                    })
            }
            return
        }
            
            let {skip,count}=req.body
            query(dbs,'mynameisczy_asia.books_info','','',{skip:skip,count:count},{order:'desc',by:'score'}).then(value=>{
                res.send({
                    state:1,
                    value:value,
                    error:0
                })
            }).catch(e=>{
                res.send({
                    state:0,
                    error:1,
                    errorMes:e
                })
            })

        })

        app.post('/getBookDirectory',(req,res)=>{
            let data=req.body
            if(typeof data === 'string')
                data=JSON.parse(data)
            if(!data.hasOwnProperty('book_name')||!data.hasOwnProperty('skip')||!data.hasOwnProperty('count')){
                res.send({
                    state:0,
                    error:1,
                    errMes:"缺少参数"
                })
                return
            }
            if(typeof data.book_name !== 'string' || typeof data.skip !== 'number' || typeof data.count !== 'number'){
                res.send({
                    state:0,
                    error:1,
                    errMes:"参数类型错误"
                })
            }
                query(dbs,'mynameisczy_asia.books_content',['book_name','passage_name','passage_value'],{book_name:data.book_name},{skip:data.skip,count:data.count},{order:'asc',by:'passage_value'}).then(value=>{
                    res.send({
                        state:1,
                        error:0,
                        value:value
                    })
                }).catch(()=>{  
                    res.send({
                        state:0,
                        error:1,
                        errorMes:'error'
                    })
                })
            
        })

        app.post('/getBookPassage',(req,res)=>{
            let data=req.body
            if(typeof data === 'string')
                data=JSON.parse(data)
            if(!data.hasOwnProperty('book_name')||!data.hasOwnProperty('skip')||!data.hasOwnProperty('count')){
                res.send({
                    state:0,
                    error:1,
                    errMes:"缺少参数"
                })
                return
            }
            if(typeof data.book_name !== 'string' || typeof data.skip !== 'number' || typeof data.count !== 'number'){
                res.send({
                    state:0,
                    error:1,
                    errMes:"参数类型错误"
                })
            }

            // 在数据库中查找章节(默认取10条)
            query(dbs,'mynameisczy_asia.books_content',['content','passage_name','passage_value'],{book_name:data.book_name},{skip:data.skip,count:data.count},{order:'asc',by:'passage_value'}).then(value=>{
                res.send({
                    mes:"success",
                    value:value
                })
            }).catch(()=>{
                res.send({
                    state:0,
                    error:1,
                    errorMes:'error'
                })
            })
        })

        // 查看
        app.get('/get_no_end_books',function(req,res){
            query(dbs,db_config.database+'.books_info',['book_name'],{book_state:'连载'}).then(e=>{
                if(e.length<=0){
                    res.send({
                        state:0,
                        error:1
                    })
                    return
                }
                res.send({
                    state:1,
                    error:0,
                    value:e
                })
            }).catch(e=>{
                res.send({
                    state:0,
                    error:1
                })
                return
            })
        })


        // 设置
        app.post('/set_book_state',function(req,res){
            let data=req.body
            if(typeof data === 'string')
                data=JSON.parse(data)
            if(!data.hasOwnProperty('book_name')){
                res.send({
                    state:0,
                    error:1,
                    errMes:"缺少参数"
                })
                return
            }
            if(typeof data.book_name !== 'string'){
                res.send({
                    state:0,
                    error:1,
                    errMes:"参数类型错误"
                })
            }
            const {book_name}=data

            update(dbs,db_config.database+'.books_info',{book_name},'book_state','完结','string').then(()=>{
                res.send({
                    state:1,
                    error:0
                })
            }).catch(()=>{
                res.send({
                    state:0,
                    error:1,
                })
            })
        })

        app.post('/getCategory',function(req,res){
            query(dbs,db_config.database+'.books_category','book_type').then(value=>{
                res.send({
                    state:1,
                    error:0,
                    value:value
                })
            }).catch(e=>{
                res.send({
                    state:0,
                    error:1,
                    errorMes:e
                })                
            })
        })
app.post('/get_book_new_passage',function(req,res){
// SELECT * FROM `books_content` WHERE book_name="仙王的日常生活" order by passage_value desc limit 0,1
let data=req.body
if(typeof data === 'string')
    data=JSON.parse(data)
            if(!data.hasOwnProperty('book_name')){
                res.send({
                    state:0,
                    error:1,
                    errMes:"缺少参数"
                })
                return
            }
            if(typeof data.book_name !== 'string'){
                res.send({
                    state:0,
                    error:1,
                    errMes:"参数类型错误"
                })
                return
            }
            const {book_name}=data

            query(dbs,'books_content','',{book_name:book_name},{skip:0,count:1},{order:'desc',by:'passage_value'}).then(value=>{
                if(value.length<=0){
                    res.send({
                        state:0,
                        error:1
                    })
                    return
                }
                res.send({
                    state:1,
                    error:0,
                    data:value[0]
                })
            }).catch(e=>{
                res.send({
                    state:0,
                    error:1
                })
            })

        })
        // 获取所有的工具
        app.get('/getTools',(req,res)=>{
            query(dbs,db_config.database+'.tools').then(value=>{
                res.send({
                    state:1,
                    error:0,
                    value:value
                })
            }).catch(e=>{
                res.send({
                    state:0,
                    error:1,
                    errorMes:e
                }) 
            })
        })

        app.post('/get_author_info',(req,res)=>{
            let data=req.body
            if(typeof data === 'string')
                data=JSON.parse(data)
            if(!data.hasOwnProperty('count')||!data.hasOwnProperty('skip')){
                res.send({
                    state:0,
                    error:1,
                    errMes:"缺少参数"
                })
                return
            }
            query(dbs,db_config.database+'.author_info',null,null,{skip:data.skip,count:data.count}).then(result=>{
                if(result.length>=1){
                    res.send({
                        state:1,
                        error:0,
                        value:result
                    })
                    return
                }
                res.send({
                    state:0,
                    error:1,
                    errMes:'没有数据'
                })
            }).catch(()=>{
                res.send({
                    state:0,
                    error:2
                })
            })
        })


        app.post('/upload_author_info',function(req,res){
            let data=req.body
            if(typeof data === 'string')
                data=JSON.parse(data)
            if(!data.hasOwnProperty('name')||!data.hasOwnProperty('avatar')||!data.hasOwnProperty('description')){
                res.send({
                    state:0,
                    error:1,
                    errMes:"缺少参数"
                })
                return
            }

            const {name,avatar,description}=data
            // 查询是否存在
            query(dbs,db_config.database+'.author_info','name',{name:name}).then(e=>{
                if(e.length>=1){
                    res.send({
                        state:0,
                        error:1,
                        errMes:'数据存在'
                    })
                    return
                }
                insertData(dbs,db_config.database+'.author_info',JSON.stringify({name,avatar,description})).then(result=>{
                    res.send({
                        state:1,
                        error:0,
                        message:'插入成功'
                    })                
                }).catch(e=>{
                    res.send({
                        state:0,
                        error:1,
                        errMes:'插入失败'
                    })
                })
            })
        })

        app.post('/SearchAuthorBooks',function(req,res){

            if(typeof req.body === 'string')
                req.body=JSON.parse(req.body)

            if(!req.body.hasOwnProperty('author')){
                res.send({
                    state:0,
                    error:1,
                    errorMes:'缺少参数'
                })
                return 
            }
            if(typeof req.body.author !== 'string'||req.body.author.length<1){
                res.send({
                    state:0,
                    error:2,
                    errorMes:"数据值无效(上传数据为空|长度小于1)"
                })
                return
            }
            const {author}=req.body

            query(dbs,db_config.database+'.books_info',['book_name','passage_count'],{author}).then((result)=>{
                res.send({
                    state:1,
                    error:0,
                    value:result
                })
            }).catch(err=>{
                res.send({
                    state:0,
                    error:1,
                    errorMes:err
                })
            })

        })

}