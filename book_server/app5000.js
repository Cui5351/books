const express=require('express')
const cors=require('cors')
const {readFile, readFileSync,writeFile}=require('fs')
const {query} =require('../db_config/query')
const {connectionMysql,insertData, update}=require('../db_config/dbs')
const { resolve } = require('path')
const https=require('https')
const { default: axios } = require('axios')
const expressWS=require('express-ws')
const multer=require('multer')

// 创建app
const app=express()

const storage=multer.diskStorage({
    //设置保存路径
    destination: function (req, file, cb) {
        cb(null, '/backup/server_data/books/user_avatar')
        //注意这里的文件路径,不是相对路径，直接填写从项目根路径开始写就行了
},
//设置保存的name
filename: function (req, file, cb) {    
    // 1拿到图片的类型
    let type=file.mimetype.match(/(jpg|jpeg|png)/g)
    cb(null, `${file.fieldname}${Date.now()}.${type}`)
}
})
const upload=multer({storage:storage}).single('avatar')

// 解析post请求数据
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(cors())
const options = {
key: readFileSync(resolve(__dirname,'..', 'cert','a.key')),
cert: readFileSync(resolve(__dirname,'..', 'cert','a.pem'))
}
// app.use((req,res,next)=>{
//     const referer=req.get('referer')
//     if(!referer||!(referer=='https://servicewechat.com/wxf5e611bcd30eb83d/0/page-frame.html'||referer=='https://www.books.asia/'||referer=='https://servicewechat.com/wxf5e611bcd30eb83d/devtools/page-frame.html')){
//         console.log(referer,'referer')
//         res.status(403).send('权限不够')
//     }else{
//         console.log('next')
//         next()
//     }
// })
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
            let server=https.createServer(options,app).listen('5000',function(){
            })
            let ws_config={
                wss:expressWS(app,server).getWss('/'),
                chat_count:0
            }
            MountRouter(server_config.port,value,db_config,ws_config)  
        // 使用express-ws
        })
    })
}


// 路由注入
function MountRouter(port,dbs,db_config,ws_config){

    app.ws('/store_info',function(ws,req){
        // 发送菜单
        // 查询菜单

        ws.on('message',function(msg){
            msg=JSON.parse(msg)
            // 减少
        })
    })
    app.post('/before_pay',function(req,res){
        // 获取商品信息(个数)
        if(typeof req.body == 'string')
            req.body=JSON.parse(req.body)
        if(!req.body.hasOwnProperty('openid')||!req.body.hasOwnProperty('shop_info')){
            res.send({
                state:0,
                error:1,
                errMes:'缺少参数'
            })
            return
        }
        let {openid,shop_info}=req.body        
        // 先查询存货
        query(dbs,db_config.database+'.store',['count','price'],{name:shop_info.name}).then(result=>{
            if(result.length<=0){
                res.send({
                    state:0,        
                    error:1,
                    errMes:'select error'
                })
                return
            }
            let {count,price}=result[0]
            price=Number(price)
            if(count<=0){
                res.send({
                    state:0,
                    error:2,
                    errMes:'存货不足'
                })
                return
            }
            // 查询用户信息
            query(dbs,db_config.database+'.user_info',['score','shops'],{openid}).then(result=>{
                if(result.length<=0){
                    res.send({
                        state:0,
                        error:3,
                        errMes:'users select error'
                    })
                    return
                }
                if(result[0].score<price){
                    res.send({
                        state:0,
                        error:4,
                        errMes:'score is no enough '
                    })
                    return
                }
                // 扣除相应的值
                result[0].shops=JSON.parse(result[0].shops)
                result[0].score=Number(result[0].score)-price
                count--
                let flag=0
                result[0].shops.forEach(item=>{
                    if(item.name==shop_info.name){
                        item.count2++
                        flag++
                    }
                })
                if(!flag){
                    shop_info.count2=1
                    result[0].shops.push(shop_info)
                }
                update(dbs,db_config.database+'.user_info',{openid},'score',result[0].score,'number')
                update(dbs,db_config.database+'.user_info',{openid},'shops',JSON.stringify(result[0].shops),'string')
                update(dbs,db_config.database+'.store',{name:shop_info.name},'count',count,'number')
                shop_info.count--
                ws_config.wss.clients.forEach(item=>{
                    item.send(JSON.stringify({
                        state:1,
                        value:shop_info
                    }))
                })
                res.send({
                    state:1,
                    error:0
                })
            }).catch(e=>{
            console.log('用户查询失败');
                res.send({
                    state:0,
                    error:1,
                    errMes:'select error2'
                })                
            })
        }).catch(e=>{
            console.log('商品查询失败');
            res.send({
                state:0,
                error:1,
                errMes:'select error2'
            })
        })
    })
    app.get('/get_shops',function(req,res){
        query(dbs,db_config.database+'.store',['name','picture','price','count']).then(e=>{
            res.send({
                state:1,
                error:0,
                value:e
            })
        }).catch(e=>{
            res.send({
                error:1,
                state:0,
                errMes:'Select Error'
            })
        })
    })
    app.post('/get_user_shop',function(req,res){
        if(typeof req.body == 'string')
            req.body=JSON.parse(req.body)
        if(!req.body.hasOwnProperty('openid')){
            res.send({
                state:0,
                error:1,
                errMes:'缺少参数'
            })
            return
        }
        const {openid}=req.body
        query(dbs,db_config.database+'.user_info',['shops'],{openid},{skip:0,count:1}).then(e=>{
            if(e.length<=0){
                res.send({
                    state:0,
                    error:1,
                    error:'用户不存在'
                })
                return
            }
            res.send({
                    state:1,
                    error:0,
                    value:e[0]
                })
        }).catch(()=>{
            res.send({
                state:0,
                error:1,
                error:'用户不存在'
            })
        })
    })
    app.ws('/user_chat',function(ws,req){
        // 返回最近10条信息
        ws_config.chat_count++
        //  将最近15条数据传回
        query(dbs,db_config.database+'.user_chat','',null,{skip:0,count:20},{order:'desc',by:'id'}).then(result=>{
            if(result.length<=0){
                ws.send(JSON.stringify({
                    state:4,
                    value:'[]',
                    chat_date:'2022-10-5T5:20:21'
                }))     
                return           
            }
            // result.forEach((item,index)=>{
            //     let month=item.chat_date.getMonth()==12?1:item.chat_date.getMonth()+1
            //     let chat_date=`${item.chat_date.getFullYear()}-${month<10?'0'+month:month}-${item.chat_date.getDate()<10?'0'+item.chat_date.getDate():item.chat_date.getDate()}`
            // 	let hours=item.chat_date.getHours()
            // 	let minute=item.chat_date.getMinutes()
            //     item.chat_date=`${chat_date} ${hours}:${minute}`
            // })
            ws.send(JSON.stringify({
                state:4,
                value:JSON.stringify(result),
                chat_date:JSON.stringify(result[0].chat_date)
            }))
        })
        ws.on('close',function(){
            if(ws_config.chat_count>=1)
                ws_config.chat_count--
            ws_config.wss.clients.forEach(e=>{
                e.send(JSON.stringify({
                    state:3,
                    error:0,
                    chat_count:ws_config.chat_count
                }))
            })
        })
        ws.on('message',function(msg){

            // 发送消息之前
            // 检测当天是否存在

        // state
            // 进入聊天为1
            // 发送消息为2
            // 退出聊天为3                        
        // 查看总人数

            msg=JSON.parse(msg)
            if(msg.data.length>30)
                msg.data=msg.data.substring(0,30)

            if(msg.state==2){

                // openid,name,avatar,gender,chat_content
                const {openid,name,avatar,gender,data}=msg
                // 将聊天记录存入数据库
                insertData(dbs,db_config.database+'.user_chat',{openid,name,avatar,gender,data})
                msg.chat_date=JSON.stringify(new Date())
                // let sql=`insert into ${db_config.database+'.user_chat'}(openid,user_name,avatar,gender,chat_content) values('${openid}',${user_name}')`
                // dbs.query(sql)
            }
                
            msg.chat_count=ws_config.chat_count
            ws_config.wss.clients.forEach((e) => {
                e.send(JSON.stringify(msg))
            })                            

        })
    })    
        // 小程序上传文件接口
        app.post('/upload_avatar',(req,res)=>{
            upload(req,res,function(err){
                if(err){
                    console.log(err,'err');
                    res.send({
                        state:0,
                        error:1,
                        errMes:err
                    })
                    return
                }
            if(typeof req.body == 'string') 
                req.body=JSON.parse(req.body)
            // 缺少参数
            if(req.body.openid.length<=0||req.body.openid==null||req.body.openid==undefined){
                res.send({
                    state:0,
                    error:1,
                    errMes:'缺少参数'
                })
                return
            }
            let path=`https://www.mynameisczy.asia/user_avatar/${req.file.filename}`
            // 写入数据库
            update(dbs,db_config.database+'.user_info',{openid:req.body.openid},'avatarUrl',path,'string').then(()=>{
                // 保存成功
                    res.send({
                        state:1,
                        error:0,
                        value:path
                    })
                query(dbs,db_config.database+'.user_chat',['openid','id'],null,{skip:0,count:20},{order:'desc',by:'id'}).then(e=>{
                    // 查看这里的openid是否在消息记录中存在
                    // 如果存在，那么就使用wss发送
                    let id=e[0].id
                    let openid_arr=e.map(item=>item.openid)
                    for(let i=0;i<openid_arr.length;i++){
                        if(openid_arr[i]==req.body.openid){
                            ws_config.wss.clients.forEach(e=>{
                                e.send(JSON.stringify({
                                    openid:req.body.openid,
                                    value:path,
                                    state:5
                                }))
                            })
                            // 修改数据库
                            let sql=`update ${db_config.database}.user_chat set avatar='${path}' where id>${id-20} and openid='${req.body.openid}'`
                            dbs.query(sql)
                            return
                        }
                    }
                })
            })
            })
        })
        app.get('/',(req,res)=>{
            res.send({
                value:'hello'
            })
        })

        app.post('/set_user_property',function(req,res){
            if(typeof req.body === 'string')
                req.body=JSON.parse(req.body)
            if(!req.body.hasOwnProperty('openid')||!req.body.hasOwnProperty('value')||!req.body.hasOwnProperty('property')){
                res.send({
                    state:0,
                    errorCode:1,
                    errorMes:'缺少参数'
                })
                return 
            }          
            
            const {value,property,openid}=req.body
            update(dbs,db_config.database+'.user_info',{openid:openid},property,value,'string').then(e=>{
                res.send({
                    state:1,
                    errorCode:0
                })

                query(dbs,db_config.database+'.user_chat',['openid','id'],null,{skip:0,count:20},{order:'desc',by:'id'}).then(e=>{
                    // 查看这里的openid是否在消息记录中存在
                    // 如果存在，那么就使用wss发送
                    let id=e[0].id
                    let openid_arr=e.map(item=>item.openid)
                    for(let i=0;i<openid_arr.length;i++){
                        if(openid_arr[i]==openid){
                            ws_config.wss.clients.forEach(e=>{
                                e.send(JSON.stringify({
                                    openid:openid,
                                    property:property,
                                    value:value,
                                    state:6
                                }))
                            })
                            // 修改数据库
                            let sql=`update ${db_config.database}.user_chat set ${property}='${value}' where id>${id-20} and openid='${openid}'`
                            dbs.query(sql)
                            return
                        }
                    }
                })
            }).catch(e=>{
                res.send({
                    state:0,
                    errorCode:1
                })
            })
        })

        app.post('/chat_state',function(req,res){
            if(typeof req.body === 'string')
                req.body=JSON.parse(req.body)
            if(!req.body.hasOwnProperty('openid')){
                res.send({
                    state:0,
                    errorCode:1,
                    errorMes:'缺少参数'
                })
                return 
            }               
            let {openid}=req.body
            // 通过openid查询
            query(dbs,db_config.database+'.user_info','chat_state',{openid:openid}).then(result=>{
                if(result.length<=0){
                    res.send({
                        state:0,
                        errorCode:1,
                        value:0
                    })
                    return
                }
                res.send({
                    state:1,
                    errorCode:0,
                    value:result[0].chat_state
                })
            })
        })

        // 查看最近7天签到记录
        app.post('/get_sign_in_day',(req,res)=>{
            let data=req.body
            if(typeof data === 'string')
                data=JSON.parse(data)
            if(!data.hasOwnProperty('openid')){
                res.send({
                    state:0,
                    error:1,
                    errMes:"缺少参数"
                })
                return
            }
            // 获取sign_in_day
            query(dbs,db_config.database+'.user_info','sign_in_day',{openid:data.openid}).then(value=>{
                if(!value.length){
                    res.send({
                        state:0,
                        error:1,
                        errorMes:"用户状态异常,请重新登录"
                    })
                    return
                }
                value=JSON.parse(value[0].sign_in_day)
                // 如果签到的次数小于7那就全部返回
                if(value.length<7){
                    res.send({
                        state:1,
                        error:0,
                        value:value
                    })
                    return
                }else{
                    let val=[]
                    // 推出最近的7次记录
                    for(let i=0;i<7;i++){
                        val.unshift(value.pop())
                    }
                    res.send({
                        state:1,
                        error:0,
                        value:val
                    })
                    return
                }
            }).catch(err=>{
                res.send({
                    state:0,
                    error:1,
                    errMes:"get record fail"
                })                
            })
        })

        // 签到
        app.post('/sign_in_day',(req,res)=>{
            /**
             * 
             * 签到状态值state
             *   缺少参数: error:1 state:0
             *   已经签到过: error:1 state:1 
             *   服务端错误(请进行反馈): error:2
             *   签到成功: error:0 state:1  value:'number' 
             *   签到失败: error:4 state:0
             *   积分增加失败: error:3 state:0
             */
            let data=req.body
            if(typeof data === 'string')
                data=JSON.parse(data)
            if(!data.hasOwnProperty('openid')){
                res.send({
                    state:0,
                    error:1,
                    errMes:"缺少参数"
                })
                return
            }
            const {openid}=data
            // 查看今天是否登录
            axios.post('https://www.mynameisczy.asia:5000/get_sign_in_day',data={openid:openid}).then(result=>{
                if(typeof  result.data.value == 'string')
                    result.data.value=JSON.parse(result.data.value)
                let sign_in_arr=result.data.value
                // 签到成功
                if(!(sign_in_arr instanceof Array)){
                    // 错误
                    res.send({
                        error:2,
                        state:0,
                        errMes:'服务端错误'
                    })
                    return;
                }
                // 查看今天日期
                let date=new Date()
                let month=date.getMonth()==12?1:date.getMonth()+1
                let day=date.getDate()<10?'0'+date.getDate():date.getDate()

                let current_date=`${date.getFullYear()}-${month<10?'0'+month:month}-`

                // 拿出最近登录的一次
                let cd=result.data.value[result.data.value.length-1]
                // 检测之前是否登录过
                if(cd==current_date+day){
                    res.send({
                        error:1,
                        state:1,
                        errMes:'already sign in'
                    })
                    return
                }
                // 之前没有登录过，那么将今天登录进行推入
                sign_in_arr.push(current_date+day)

                // 计数(如果连续，每次分数+5) 
                let count=0 // count*5
                let score_=10

                // 今日登录数据进行更新
                update(dbs,db_config.database+'.user_info',{openid:openid},'sign_in_day',JSON.stringify(sign_in_arr),'string').then(e=>{
                    // 更新分数
                    update(dbs,db_config.database+'.user_info',{openid:openid},'score',score_,'number','+').then(e=>{
                        res.send({
                            state:1,
                            error:0,
                            value:score_+''
                        })
                    }).catch(e=>{
                        // 积分增加失败
                        res.send({
                            state:0,
                            error:3,
                            errMes:"score add fail"
                        })                
                    })
                }).catch(e=>{
                    // 签到失败
                    res.send({
                        state:0,
                        error:4,
                        errMes:"sign in fail"
                    })    
                })
            }).catch(err=>{
                // 检查登录失败
                res.send({
                    state:0,
                    error:3,
                    errMes:"登录失败"
                })                
            })
        })  
        
        app.post('/getAnswer',function(req,res){
            // 通过openid获取answer字段并返回
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
            // 查看openid
            query(dbs,'books.user_info',['author_answer','data_provide_answer'],{openid:openid}).then(e=>{
                res.send({
                    state:1,
                    error:0,
                    value:e
                })
                return
            }).catch(e=>{
                res.send({
                    state:0,
                    error:1,
                    value:e
                })    
                return
            })
        })  
        

//  登录
app.post('/login_user',function(req,res){
    // 参数列表:
        // nickName:<string> 
        // avatarUrl:<string>
        // gender:<string>(可选)
        // openid:<string>(用户唯一标识)

    if(typeof req.body === 'string')
        req.body=JSON.parse(req.body)
    if(!req.body.hasOwnProperty('nickName')||!req.body.hasOwnProperty('avatarUrl')||!req.body.hasOwnProperty('openid')){
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
    const {nickName,avatarUrl,openid}=req.body                
    // 查询用户是否注册(在user_info里显示)
    query(dbs,'books.user_info',['avatarUrl','gender','nickName','score','author_answer','data_provide_answer','introduction'],{openid:openid}).then(e=>{
        // 存在
        // 将查询到的数据返回
        if(e.length){
            res.send({
                state:2,
                error:0,
                value:e[0]
            })
            return
        }else{
        // 不存在
        // 插入数据
        let bookshelf='[]'
        let author_answer='[]'
        let sign_in_day='[]'
        let shops='[]'
        let data_provide_answer='[]'
            insertData(dbs,'books.user_info',JSON.stringify({
                nickName,
                avatarUrl,
                gender,
                openid,
                bookshelf,
                author_answer,
                data_provide_answer,
                sign_in_day,
                shops
            })).then(e=>{
                // 插入成功
                res.send({
                    state:1,
                    error:0
                })
                return
            }).catch(e=>{
                // 插入失败
                res.send({
                    state:0,
                    error:1,
                    errorMes:"插入失败"
                })
                return
            })
        }
    })
})

// 拿到openid
app.post('/getOpenid',function(req,res){
    // {
        // session_key: 'FVzfM5h17mD+R4TfgQSsmg==',
        // openid: 'o8e2B5FgakIBZkIl9PUkdAfv2_aA'
    //   }            
        const appid='wxf5e611bcd30eb83d'
        const secret='bc2ad95a6c4f75f906a80eb532cebdc4'
        if(typeof req.body === 'string')
            req.body=JSON.parse(req.body)
        if(!req.body.hasOwnProperty('code')){
            res.send({
                state:0,
                error:1,
                errorMes:'缺少参数'
            })
            return
        }
        if(typeof req.body.code !== 'string'){
            res.send({
                state:0,
                error:1,
                errorMes:'数据类型出错'
            })
            return
        }
        if(!req.body.code.trim().length){
            res.send({
                state:0,
                error:2,
                errorMes:"数据值无效(上传数据为空|长度小于1)"
            })
            return
        }
        const {code}=req.body
        let url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + secret + '&js_code=' + code + '&grant_type=authorization_code';

        axios.post(url).then(value=>{
            // 这里拿到value存入
            // 先查看是否存在，不存在就存储
            // query(dbs,'mynameisczy_asia.user_info',[''])
            res.send({
                state:1,
                value:value.data
            })
            return
        }).catch(e=>{
            res.send({
                state:0,
                error:1,
                errorMes:e
            })
            return
        })
    })        
        
        app.post('/login_test',function(req,res){
            if(typeof req.body === 'string')
                req.body=JSON.parse(req.body)
            if(!req.body.hasOwnProperty('name')||!req.body.hasOwnProperty('password')){
                res.send({
                    state:0,
                    errorCode:1,
                    errorMes:'缺少参数'
                })
                return 
            }   
            for(let item in req.body){
                if(typeof req.body[item] === 'string')
                    if(req.body[item].trim().length<1){
                        res.send({
                            state:0,
                            errorCode:2,
                            errorMes:"数据值无效(上传数据为空|长度小于1)"
                        })
                        return
                }            
            }              
            res.send({
                state:1,
                error:0,
                value:'注册用户成功'
            })
            return
        })

        app.post('/user_data_auto_update',(req,res)=>{
            if(!req.body.hasOwnProperty('openid'))
                res.send({
                    state:0,
                    error:1,
                    errorMes:'缺少参数'
                })
            if(typeof req.body == 'string')
                req.body=JSON.parse(req.body)
            let {openid}=req.body
            query(dbs,'books.user_info',['avatarUrl','gender','nickName','score','author_answer','data_provide_answer'],{openid:openid}).then(e=>{
                // 存在
                // 将查询到的数据返回
                if(e.length){
                    res.send({
                        state:1,
                        error:0,
                        value:e[0]
                    })
                }
            }).catch(e=>{
                res.send({
                    state:0,
                    error:1,
                    errMes:e
                })                
            })
        })
        
        app.post('/video',function(req,res){
            let {src}=req.body
            let base64 = src.replace(/^data:image\/\w+;base64,/, "")
            const dataBuffer = new Buffer(base64, 'base64'); //把base64码转成buffer对象
            writeFile(resolve(__dirname,'user_video',Date.now().toString()+'.jpeg'),dataBuffer,function(err){
                if(err){
                    console.log(err)
                    res.send({
                        state:0
                    })
                    return
                }
                res.send({
                    state:1
                })
                console.log('上传成功!')
            })
        })

        app.post('/small_program_state',function(req,res){
            if(typeof req.body === 'string')
                req.body=JSON.parse(req.body)
            if(!req.body.hasOwnProperty('small_program_name')){
                res.send({
                    state:0,
                    errorCode:1,
                    errorMes:'缺少参数'
                })
                return 
            }
            
            for(let item in req.body){
                if(typeof req.body[item] === 'string')
                    if(req.body[item].trim().length<1){
                        res.send({
                            state:0,
                            errorCode:2,
                            errorMes:"数据值无效(上传数据为空|长度小于1)"
                        })
                        return
                }            
            }   
            const {small_program_name}=req.body
            query(dbs,db_config.database+'.small_program_state',['state'],{small_program_name:small_program_name}).then(value=>{
                // 为1
                if(Number(value[0].state)){
                    res.send({
                        state:1,
                        error:0,
                        value:Number(value[0].state)
                    })
                    return
                }
                // 为0
                res.send({
                    state:1,
                    error:0,
                    value:0
                })
            })
    })

    app.post('/getBookInfo',function(req,res){
        query(dbs,db_config.database+'.books_info',['book_name','author','book_introduce']).then(value=>{
            res.send({
                state:1,
                error:0,
                data:value
            })
            return
        })
    })
    app.post('/send_answer',function(req,res){
        // 参数列表->
            // my_openid:<string>
            // send_object_openid:<string>
            // message:<string>        
        if(typeof req.body === 'string')
                req.body=JSON.parse(req.body)
            if(!req.body.hasOwnProperty('my_openid')||!req.body.hasOwnProperty('message')||!req.body.hasOwnProperty('send_object_openid')){
                res.send({
                    state:0,
                    errorCode:1,
                    errorMes:'缺少参数'
                })
                return 
            }
            
            for(let item in req.body){
                if(typeof req.body[item] === 'string')
                    if(req.body[item].trim().length<1){
                        res.send({
                            state:0,
                            errorCode:2,
                            errorMes:"数据值无效(上传数据为空|长度小于1)"
                        })
                        return
                }
            }   
        const {my_openid,send_object_openid,message}=req.body

        // 先拿到my_openid的权限user_privilege
        // 没拿到就返回无权限
        query(dbs,db_config.database+'.user_info','user_privilege',{openid:my_openid}).then(e=>{
            if(e.length<=0){
                res.send({
                    state:0,
                    error:1,
                    errorMes:'用户状态异常,请在小程序上重新登录'
                })
                return
            }
            if(e[0].user_privilege=='normal'){
                res.send({
                    state:0,
                    error:1,
                    errorMes:'用户无权限'
                })
                return
            }
            // 拿到所有回复
        query(dbs,db_config.database+'.user_info',e[0].user_privilege=='author'?'author_answer':'data_provide_answer',{openid:send_object_openid}).then(e2=>{
            if(e2.length<=0){
                res.send({
                    state:0,
                    error:1,
                    errorMes:'用户状态异常,请在小程序上重新登录'
                })
                return
            }
            let answers=JSON.parse(e2[0][e[0].user_privilege=='author'?'author_answer':'data_provide_answer'])
            answers.push(message)
            answers=JSON.stringify(answers)
            // 然后给回复里添加内容
            update(dbs,db_config.database+'.user_info',{openid:send_object_openid},e[0].user_privilege=='author'?'author_answer':'data_provide_answer',answers,'string').then(e=>{
                res.send({
                    state:1,
                    error:0,
                })
                return
            }).catch(e=>{
                res.send({
                    state:0,
                    error:1,
                    errorMes:e
                })
                return                
            })

        })

        })


    })
    app.post('/get_privilege',function(req,res){
        if(typeof req.body === 'string')
        req.body=JSON.parse(req.body)
    if(!req.body.hasOwnProperty('name')||!req.body.hasOwnProperty('password')){
        res.send({
            state:0,
            errorCode:1,
            errorMes:'缺少参数'
        })
        return 
    }
    
    for(let item in req.body){
        if(typeof req.body[item] === 'string')
            if(req.body[item].trim().length<1){
                res.send({
                    state:0,
                    errorCode:2,
                    errorMes:"数据值无效(上传数据为空|长度小于1)"
                })
                return
        }
    }
    let {name,password}=req.body
            // 查询密码是否正确
        query(dbs,'books.user_info','user_privilege',{nickName:name,openid:password}).then(v=>{
            if(v.length){
                // 正确correct
                if(v[0].user_privilege=='author'||v[0].user_privilege=='小说提供猿')
                    res.send({ 
                        state:1,
                        errorCode:0,
                        data:1
                    })
                else{
                    res.send({ 
                        state:1,
                        errorCode:0,
                        data:0
                    })
                }
            }else{
                // 不正确incorrect
                res.send({
                    state:0,
                    errorCode:1
                })                        
            }
        })
    })
        app.post('/login',function(req,res){
            if(typeof req.body === 'string')
                req.body=JSON.parse(req.body)
            if(!req.body.hasOwnProperty('name')||!req.body.hasOwnProperty('password')){
                res.send({
                    state:0,
                    errorCode:1,
                    errorMes:'缺少参数'
                })
                return 
            }
            
            for(let item in req.body){
                if(typeof req.body[item] === 'string')
                    if(req.body[item].trim().length<1){
                        res.send({
                            state:0,
                            errorCode:2,
                            errorMes:"数据值无效(上传数据为空|长度小于1)"
                        })
                        return
                }
            }   

            // state：返回含义
                // 0：密码错误
                // 1：可以登录（密码正确）
                // 2：不包含（需在小程序上登录）

            // errorCode：返回韩意思
                // 0：无错误信息
                // 1：密码错误
            const {name,password}=req.body
            // 查询并返回
            query(dbs,'books.user_info','',{openid:password}).then(v=>{
                // 存在
                if(v.length){
                    // 查询密码是否正确
                query(dbs,'books.user_info','',{nickName:name,openid:password}).then(v=>{
                    if(v.length){
                        // 正确correct
                        res.send({ 
                            state:1,
                            errorCode:0,
                            data:v[0]
                        })
                    }else{
                        // 不正确incorrect
                        res.send({
                            state:0,
                            errorCode:1
                        })                        
                    }
                })
                }else{
                    // 不存在
                    res.send({
                        state:2,
                        errorCode:0
                    })
                    return
                }
            })
            // 查询user_info表中是否包含该数据(password)
                // 包含：检查密码是否正确
                    // 正确
                    // 不正确
                // 不包含：返回小程序需要注册

        })

    app.post('/getUserAnswer',function(req,res){
        if(typeof req.body === 'string')
        req.body=JSON.parse(req.body)
        if(!req.body.hasOwnProperty('name')||!req.body.hasOwnProperty('openid')){
            res.send({
                state:0,
                errorCode:1,
                errorMes:'缺少参数'
            })
            return 
        }
        
        for(let item in req.body){
            if(typeof req.body[item] === 'string')
                if(req.body[item].trim().length<1){
                    res.send({
                        state:0,
                        errorCode:2,
                        errorMes:"数据值无效(上传数据为空|长度小于1)"
                    })
                    return
            }
        }           
        const {name,openid}=req.body
        // 查询用户的信息，并获取权限（）

        // state参数
        // 0：无权限
        // 1：拿到结果

        // errorCode参数
        // 0：无误
        // 1：无权限
        // 2：登录失败，请返回登录页面
        query(dbs,'books.user_info','user_privilege',{nickName:name,openid:openid}).then(v=>{
            if(v.length){
            // 查询到
                // 拿到权限
                const {user_privilege}=v[0]
                    // 有权限
                        // 根据权限去user_feedback里去寻找回复的参数
                        // author可以拿到全部的回复
                    if(user_privilege === 'author'){
                        query(dbs,'books.user_feedback',['nickName','avatarUrl','gender','content','feedback_time','feedback_to','openid']).then(value=>{
                            res.send({
                                state:1,
                                data:value,
                                errorCode:0
                            })
                        })                        
                        return
                    }else if(user_privilege === '小说提供猿'){ 
                        // 拿到表中的数据
                        query(dbs,'books.user_feedback',['nickName','avatarUrl','gender','content','feedback_time','feedback_to','openid'],{feedback_to:user_privilege}).then(value=>{
                            res.send({
                                state:1,
                                data:value,
                                errorCode:0
                            })
                        })
                        return
                    }else{
                        // 无权限      
                        res.send({
                            state:0,
                            errorCode:1
                        })
                        return
                    }
            }else{
            // 未查询到
                res.send({
                    state:0,
                    error:2
                })
            }
        })

    })


    app.post('/getUserGoods',function(req,res){
        if(typeof req.body === 'string')
        req.body=JSON.parse(req.body)
        if(!req.body.hasOwnProperty('name')||!req.body.hasOwnProperty('openid')){
            res.send({
                state:0,
                errorCode:1,
                errorMes:'缺少参数'
            })
            return 
        }
        
        for(let item in req.body){
            if(typeof req.body[item] === 'string')
                if(req.body[item].trim().length<1){
                    res.send({
                        state:0,
                        errorCode:2,
                        errorMes:"数据值无效(上传数据为空|长度小于1)"
                    })
                    return
            }
        }           
        const {name,openid}=req.body
        // 查询用户的信息，并获取权限（）

        // state参数
        // 0：无权限
        // 1：拿到结果

        // errorCode参数
        // 0：无误
        // 1：无权限
        // 2：登录失败，请返回登录页面
        query(dbs,'books.user_info','user_privilege',{nickName:name,openid:openid}).then(v=>{
            if(v.length){
            // 查询到
                // 拿到权限
                const {user_privilege}=v[0]
                    // 有权限
                        // 根据权限去user_feedback里去寻找回复的参数
                        // author可以拿到全部的回复
                    if(user_privilege === 'author'||user_privilege === '小说提供猿'){
                        query(dbs,'books.user_info',['nickName','avatarUrl','shops','openid']).then(value=>{
                            res.send({
                                state:1,
                                data:value,
                                errorCode:0
                            })
                        })                        
                        return
                    }else{
                        // 无权限      
                        res.send({
                            state:0,
                            errorCode:1
                        })
                        return
                    }
            }else{
            // 未查询到
                res.send({
                    state:0,
                    error:2
                })
            }
        })

    })
    app.post('/goods_decrement',function(req,res){
        if(typeof req.body === 'string')
        req.body=JSON.parse(req.body)
        if(!req.body.hasOwnProperty('name')||!req.body.hasOwnProperty('openid')||!req.body.hasOwnProperty('goods')){
            res.send({
                state:0,
                errorCode:1,
                errorMes:'缺少参数'
            })
            return 
        }
        
        for(let item in req.body){
            if(typeof req.body[item] === 'string')
                if(req.body[item].trim().length<1){
                    res.send({
                        state:0,
                        errorCode:2,
                        errorMes:"数据值无效(上传数据为空|长度小于1)"
                    })
                    return
            }
        }           
        const {name,openid,goods}=req.body
        // 查询用户的信息，并获取权限（）

        // state参数
        // 0：无权限
        // 1：拿到结果

        // errorCode参数
        // 0：无误
        // 1：无权限
        // 2：登录失败，请返回登录页面
        query(dbs,'books.user_info',['user_privilege','shops'],{nickName:name,openid:openid}).then(v=>{
            if(v.length){
            // 查询到
                // 拿到权限
                let {user_privilege,shops}=v[0]
                    // 有权限
                        // 根据权限去user_feedback里去寻找回复的参数
                        // author可以拿到全部的回复
                    if(user_privilege === '小说提供猿'||user_privilege === 'author'){ 
                        // 将其商品进行扣除
                        shops=JSON.parse(shops)
                        let flag=0
                        for(let i=0;i<shops.length;i++){
                            if(shops[i].name==goods){
                                if(shops[i].count2>0){
                                    shops[i].count2--
                                    flag++
                                    // 商品成功兑换
                                    update(dbs,'books.user_info',{nickName:name,openid:openid},'shops',JSON.stringify(shops),'string')
                                    res.send({
                                        state:1,
                                        data:shops,
                                        errorCode:0
                                    })
                                }else{
                                    // 商品已经兑换完成（error）
                                    res.send({
                                        state:0,
                                        errorCode:2
                                    })
                                }
                                return
                            }
                        }
                        if(flag<=0){
                            // 商品不存在
                            res.send({
                                state:0,
                                errorCode:3
                            })
                        }
                    }else{
                        // 无权限      
                        res.send({
                            state:0,
                            errorCode:1
                        })
                        return
                    }
            }else{
            // 未查询到
                res.send({
                    state:0,
                    error:2
                })
            }
        })

    })
}