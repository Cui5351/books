const express=require('express')
const cors=require('cors')
const {readFile, readFileSync,writeFile}=require('fs')
const {query} =require('./query')
const {connectionMysql,insertData, update}=require('./dbs')
const { resolve } = require('path')
const https=require('https')
const { default: axios } = require('axios')
const expressWS=require('express-ws')


// 创建app
const app=express()

app.use(cors())
const options = {
  key: readFileSync(resolve(__dirname, 'cert','a.key')),
  cert: readFileSync(resolve(__dirname, 'cert','a.pem'))
}
entry()

function entry(){
    // 解析文件
    readFile('./base_config.json',async function(err,data){   
        if(err) return 
        data=JSON.parse(data.toString())
        const {server_config,db_config}=data

// 这是机制问题，当没有操作数据的时候，就断开连接了 在网站stackoverflow看到了解决方案 强制连接,让数据库每1hours查询一次        
        
        await connectionMysql(db_config).then(value=>{
            let server=https.createServer(options,app).listen('7086',function(){
            })
            let ws_config={
                wss:expressWS(app,server).getWss('/'),
                persons:[], // 游戏人数
                teams:[] // 队伍
            }
            MountRouter(value,db_config,ws_config)  
           // 使用express-ws
        })
    })
}

function MountRouter(dbs,db_config,ws_config){
    app.ws('/poker',function(ws,req){
        // 每个人已进入都是单独一个数组房间
        req.query.ws=ws

        // 是否在进行匹配
        req.query.state=0
        // 是否正在游戏
        req.query.playing=0
        // 是否正在队伍
        req.query.teams=0

        req.query.timer=null
        
        let position=ws_config.persons.length
        if(ws_config.persons.indexOf('空')!=-1){
            position=ws_config.persons.indexOf('空')
            ws_config.persons[position]=req.query
        }
        else
            ws_config.persons.push(req.query)
        
        // 将本地的位置返回
        ws_config.persons[position].ws.send(JSON.stringify({
            state:1,
            position:position
        }))
        ws.on('message',function(msg){
            msg=JSON.parse(msg)

    if(msg.state==1){
                // 创建房间成功
                let {position}=msg
                ws_config.persons[position].privilege=true
                ws_config.persons[position].ready=true
                // 创建房间
                ws_config.teams.push([ws_config.persons[position]])
                let room_id=ws_config.teams.length-1

                ws_config.teams[room_id].forEach(item=>{
                    item.ws.send(JSON.stringify({
                        state:2,
                        create_room:true,
                        room_id:room_id,
                        current_persons:ws_config.teams[room_id].map(item=>{return{name:item.user_name,openid:item.openid,avatar:item.user_avatar,privilege:item.privilege,ready:item.ready}})
                    }))
                })
            }
            // 开始匹配
    else if(msg.state==2){
                // 查找遍历数组
                const {openid}=msg
                let index=0
                let flag=0
                for(let i=0;i<ws_config.persons.length;i++){
                    if(ws_config.persons[i].openid==openid){
                        index=i
                        ws_config.persons[i].state=1
                        break
                    }else if(i==ws_config.persons.length-1){
                        // 重新登录
                        console.log('重新登陆');
                        return
                    }
                }
                // 查看是否在房间内
                for(let i=0;i<ws_config.teams.length;i++){
                    ws_config.teams[i].forEach(i=>{
                        if(i.openid==openid){
                            flag=1
                        }
                    })
                }
                if(msg.room_id!=-1||flag==-1){
                    // 房间存在,向所有人发
                    ws_config.teams[msg.room_id].forEach(item=>{
                        clearTimeout(item.timer)
                        item.timer=setTimeout(() => {
                            item.state=0
                        }, 1200);
                        item.ws.send(JSON.stringify({
                            state:5
                        }))
                    })
                    // 团队是不需要进行匹配其他人
                        // 只需要将正在匹配设置为true
                        // 然后再让单个匹配者匹配进入即可
                    return
                    // 如果1s后没有再请求，就将state==0
                }else{
                    clearTimeout(ws_config.persons[index].timer)
                    ws_config.persons[index].timer=setTimeout(() => {
                        ws_config.persons[index].state=0
                    }, 1200);
                    ws_config.persons[index].ws.send(JSON.stringify({
                        state:5
                    }))
                }                


                // 遍历是否在队伍team里
                // 先遍历teams,看是否差人（玩家是一个人的时候，可以匹配到团队）
                for(let i=0;i<ws_config.teams.length;i++){
                    // 有队伍差人进入,并且队伍没有在进行游戏
                    if(ws_config.teams[i].length<3&&ws_config.teams[i][0].playing==0&&ws_config.teams[i][0].state==1){
                        for(let j=0;j<ws_config.teams[i].length;j++){
                            // 匹配自己是否已经在内（那么退出）
                            if(ws_config.teams[i][j].openid===ws_config.persons[index].openid)
                                return
                        }
                        ws_config.teams[i].push(ws_config.persons[index])
                        console.log(ws_config.teams[i]);
                        console.log(ws_config.persons[index].user_name,'加入');
                        // 加入队伍
                        ws_config.persons[index].teams=1
                        ws_config.persons[index].state=1
                        // 给ws_config.persons[index]回复进入成功
                        // 房主
                        ws_config.teams[i][0].privilege=true
                        ws_config.teams[i][0].ready=true
                        let k=1;
                        while(k<ws_config.teams[i].length){
                            // 其他玩家
                            ws_config.teams[i][k].privilege=false
                            // 是否准备
                            ws_config.teams[i][k].ready=true
                            k++
                        }

                        // 给 ws_config.teams[i]里玩家回复成功
                        ws_config.teams[i].forEach(item=>{
                            item.ws.send(JSON.stringify({
                                room_id:i,
                                state:2,
                                current_persons:ws_config.teams[i].map(item=>{return{name:item.user_name,openid:item.openid,avatar:item.user_avatar,privilege:item.privilege,ready:item.ready}})
                            }))
                        })
                        return
                    }
                }


                let arr=[ws_config.persons[index]]
                // 查找其他正在匹配的人(非队伍，非开游戏)
                for(let i=0;i<ws_config.persons.length;i++){
                    if(ws_config.persons[i].openid!=ws_config.persons[index].openid&&ws_config.persons[i].state==1&&ws_config.persons[i].teams==0&&ws_config.persons[i].playing==0&&arr.length<3){
                        arr.push(ws_config.persons[i])
                    }
                }

                // 是否匹配到人
                if(arr.length>1){
                    ws_config.persons[index].teams=1
                    // 房主
                    arr[0].privilege=true
                    arr[0].ready=true
                    let i=1;
                    while(i<arr.length){
                        arr[i].teams=1
                        // 其他玩家
                        arr[i].privilege=false
                        // 是否准备
                        arr[i].ready=true
                        i++
                    }
                    ws_config.teams.push(arr)
                    // 创建队伍，通知两方
                    ws_config.teams[ws_config.teams.indexOf(arr)].forEach(item=>{
                        item.ws.send(JSON.stringify({
                            state:2,
                            room_id:ws_config.teams.indexOf(arr),
                            current_persons:ws_config.teams[ws_config.teams.indexOf(arr)].map(item=>{return{name:item.user_name,openid:item.openid,avatar:item.user_avatar,privilege:item.privilege,ready:item.ready}})
                        }))
                    })
                    return
                }
            }
    else if(msg.state==3){
                // 用户取消准备
                ws_config.teams[msg.room_id].forEach(item=>{
                    if(item.openid==msg.openid)
                        item.ready=msg.ready
                })
                ws_config.teams[msg.room_id].forEach(item=>{
                    item.ws.send(JSON.stringify({
                        state:3,
                        current_persons_ready:ws_config.teams[msg.room_id].map(item=>{return{openid:item.openid,ready:item.ready}})
                    }))
                })
            }
    else if(msg.state==4){ // 开始游戏
                // 如果都不叫地主：将重新调用4
                const {room_id}=msg
                let obj=create()
                console.log(room_id,'桌开始');

                // 设置一个首先能抢地主的人
                let master=Math.round(Math.random()*2)

                ws_config.teams[room_id].forEach((item,index)=>{
                    // 将正在匹配设置为0
                    item.state=0
                    // 游戏进行中
                    item.playing=1
                    obj.user_cards[index].openid=item.openid
                    item.ws.send(JSON.stringify({
                        state:4,
                        cards:obj.user_cards[index],
                        current_player_openid:ws_config.teams[room_id][master].openid,
                        users_card:obj.user_cards.map(item2=>{
                            return JSON.parse(JSON.stringify(item2,['count','pre_master_count','master']))
                        })
                    }))
                })

            // 每个用户参数
                // count:17,
                // cards:[],
                // pre_master_count:0,
                // master:false,
                // total_count:0

                // 裁判
                ws_config.teams[room_id].push({
                    order:master,
                    master_openid:'',
                    users:obj.user_cards,
                    master_card:obj.others,
                    current_player_openid:''
                })
                console.log('创建裁判');
                console.log(ws_config.teams[room_id][master].user_name,'是先手');
            }
            // 抢地主
    else if(msg.state==5){
                // 设置抢地主信息
                const {room_id,openid}=msg.rule
                ws_config.teams[room_id].forEach(item=>{
                    if(item.openid==openid){
                        console.log(item.user_name,'在抢地主');
                    }
                })
                let openid_count_max=openid
                let count=0;
                ws_config.teams[room_id][3].users.forEach(item=>{
                    if(item.openid==openid){
                        // 这个玩家抢地主
                        item.pre_master_count++
                    }
                    if(item.pre_master_count>count){
                        count=item.pre_master_count
                        openid_count_max=item.openid
                    }
                })
                if(count>=2){
                    // 地主产生
                    ws_config.teams[room_id][3].master_openid=openid_count_max
                    ws_config.teams[room_id][3].current_player_openid=openid_count_max
                    // 把地主牌发给地主并公布
                    ws_config.teams[room_id].forEach((item,index)=>{
                        if(index>=3)
                            return
                        item.ws.send(JSON.stringify({
                            state:9,
                            master_openid:ws_config.teams[room_id][3].master_openid,
                            master_card:ws_config.teams[room_id][3].master_card,
                            current_player_openid:ws_config.teams[room_id][3].current_player_openid
                        }))
                    })
                    return
                }
                // 裁判判断

                // 下一个到玩家
                ws_config.teams[room_id][3].order=ws_config.teams[room_id][3].order>=2?0:ws_config.teams[room_id][3].order+1

                if(ws_config.teams[room_id][3].users[ws_config.teams[room_id][3].order].cancel_master==true)
                    ws_config.teams[room_id][3].order=ws_config.teams[room_id][3].order>=2?0:ws_config.teams[room_id][3].order+1

                if(ws_config.teams[room_id][3].users[ws_config.teams[room_id][3].order].cancel_master==true)
                    ws_config.teams[room_id][3].order=ws_config.teams[room_id][3].order>=2?0:ws_config.teams[room_id][3].order+1                    

                ws_config.teams[room_id][3].current_player_openid=ws_config.teams[room_id][3].users[ws_config.teams[room_id][3].order].openid
                // 发送抢地主消息
                ws_config.teams[room_id].forEach((item,index)=>{
                    if(index>=3)
                        return
                    item.ws.send(JSON.stringify({
                        state:6,
                        after_player_openid:openid, // 当前抢地主的玩家id
                        current_player_openid:ws_config.teams[room_id][3].current_player_openid
                    }))
                })
    }else if((msg.state==6)){
                let {room_id,openid}=msg.rule
                // 放弃抢地主，下个玩家

                let master=false
                
                ws_config.teams[room_id][3].users.forEach((item,index)=>{
                    if(index>=3)
                        return
                    if(item.openid==openid){
                        item.cancel_master=true
                        let flag={
                            count:0,
                            openid:''
                        }
                        // 查看其他两个的pre_master_count
                        // 如果另外两个其中有一个是true，另外一个的count>=1，那么另外一个就是地主
                    ws_config.teams[room_id][3].users.forEach((item2,index2)=>{
                        if(index2>=3||index2==index)
                            return
                        // 统计没有取消的人数
                        if(!item2.cancel_master){
                            flag.count++
                            flag.openid=item2.openid
                        }
                    })
                    if(flag.count==1){
                            // 地主产生
                            master=true
                            ws_config.teams[room_id][3].master_openid=flag.openid
                            ws_config.teams[room_id][3].current_player_openid=flag.openid
                            // 把地主牌发给地主并公布
                            ws_config.teams[room_id].forEach((item3,index)=>{
                                if(index>=3)
                                    return
                                item3.ws.send(JSON.stringify({
                                    state:9,
                                    master_openid:ws_config.teams[room_id][3].master_openid,
                                    master_card:ws_config.teams[room_id][3].master_card,
                                    current_player_openid:ws_config.teams[room_id][3].current_player_openid
                                }))
                            })
                            return                            
                    }
                    }
                })
                if(master){
                    return
                }

                
                
                ws_config.teams[room_id][3].order=ws_config.teams[room_id][3].order>=2?0:ws_config.teams[room_id][3].order+1

                // 如果cancel_master为true，那么就跳过
                if(ws_config.teams[room_id][3].users[ws_config.teams[room_id][3].order].cancel_master==true){
                    ws_config.teams[room_id][3].order=ws_config.teams[room_id][3].order>=2?0:ws_config.teams[room_id][3].order+1
                    // 查看第三者
                }

                if(ws_config.teams[room_id][3].users[ws_config.teams[room_id][3].order].cancel_master==true){
                    // 这里都没有抢地主
                    // 通知所有人：游戏结束
                    ws_config.teams[room_id].forEach(item=>{
                        item.ws.send(JSON.stringify({
                            state:8
                        }))
                    })
                    return
                }
                

                ws_config.teams[room_id][3].current_player_openid=ws_config.teams[room_id][3].users[ws_config.teams[room_id][3].order].openid

            // 发送放弃消息
                ws_config.teams[room_id].forEach((item,index)=>{
                    if(index>=3)
                        return
                    item.ws.send(JSON.stringify({
                        state:7,
                        after_player_openid:openid, // 当前放弃抢地主的玩家id
                        current_player_openid:ws_config.teams[room_id][3].current_player_openid
                    }))
                })
                

            }else if(msg.state==7){
                // 加入房间
                const {room_id,position}=msg

                // 查看房间是否存在
                if(ws_config.teams[room_id]==undefined){
                    // 房间不存在，
                    ws_config.persons[position].ws.send(JSON.stringify({
                        state:13
                    }))
                    return
                }

                //  检查房间是否满人
                if(ws_config.teams[room_id].length>=3){
                    // 返回满人12
                    ws_config.persons[position].ws.send(JSON.stringify({
                        state:12
                    }))
                    return
                }
                
                ws_config.persons[position].teams=1
                ws_config.persons[position].privilege=false
                ws_config.persons[position].ready=true

                // 加入房间
                ws_config.teams[room_id].push(ws_config.persons[position])
                // 通知所有人
                ws_config.teams[room_id].forEach(item=>{
                    item.ws.send(JSON.stringify({
                        state:2,
                        room_id:room_id,
                        current_persons:ws_config.teams[room_id].map(item=>{return{name:item.user_name,openid:item.openid,avatar:item.user_avatar,privilege:item.privilege,ready:item.ready}})
                    }))
                })
            }
        })

        ws.on('close',function(){
            console.log('有人离开',ws_config.persons[position].user_name);
            console.log(ws_config.teams,'team');
            console.log(ws_config.persons[position].openid,'openid');
            // 遍历teams，查看是否在队伍当中
            ws_config.teams.forEach((item,index)=>{
                for(let i=0;i<item.length;i++){
                    if(i>=3){
                        return
                    }
                    if(item[i].openid==ws_config.persons[position].openid){
                        // 找到了,进行删除
                        let rm=item.splice(i,1)
                        console.log(rm[0].user_name,'删除');
                        if(rm[0].privilege)
                            if(item.length)
                                item[0].privilege=true
                        // 通知其他人
                        item.forEach((item2,ind)=>{
                            // 结束正在游戏标识
                            item2.playing=0
                            if(item2.hasOwnProperty('master_openid')){
                                // 移除裁判
                                item.splice(ind,1)
                                return
                            }
                            if(!item2.hasOwnProperty('openid'))
                                return
                        // 移除裁判
                            item2.ws.send(JSON.stringify({
                                state:2,
                                lost:true,
                                current_persons:ws_config.teams[index].map(item=>{return{name:item.user_name,openid:item.openid,avatar:item.user_avatar,privilege:item.privilege,ready:item.ready}})
                            }))
                        })
                        if(item.length<=1){
                            // 解散
                            ws_config.teams.splice(index,1)
                        }
                        break
                    }
                }
            })
            // 从persons里删除
            ws_config.persons.splice(position,1,'空')
        })
    })
}

function create(){
    let cards1=['14','15','3','4','5','6','7','8','9','10','11','12','13']

    cards1=cards1.map(item=>{return [item,item,item,item]})

    let cards2=[]

    cards1.forEach(item=>{
        cards2.push(...item)    
    })
    cards2.push(...['16','17'])

    // 首先是发牌,所谓发牌就是开局时一副牌共有 54 张,分为三份,
        // 一人 17 张,留 3 张做底牌,在确定地主之前玩家不能看底牌。


    // 总共3个人，54张牌，首先每人17张牌

    let a={
        count:17,
        cards:[],
        pre_master_count:0,
        master:false,
        total_count:0,
        cancel_master:false
    }
    let b={
        count:17,
        cards:[],
        pre_master_count:0,
        master:false,
        total_count:0,
        cancel_master:false
    }
    let c={
        count:17,
        cards:[],
        pre_master_count:0,
        master:false,
        total_count:0,
        cancel_master:false
    }
    let rand=0
    // 随机数分配三人
    while(cards2.length>3){
        rand=Math.round(Math.random()*(cards2.length-1))
        if(a.count){
            a.cards.push(...cards2.splice(rand,1))
            a.count--
        }else if(b.count){
            b.cards.push(...cards2.splice(rand,1))
            b.count--
        }else if(c.count){
            c.cards.push(...cards2.splice(rand,1))
            c.count--
        }
    }
    return {user_cards:[a,b,c],others:cards2}
}