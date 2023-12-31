const express=require('express')
const cors=require('cors')
const {readFile, readFileSync}=require('fs')
const {query} =require('../db_config/query')
const {connectionMysql}=require('../db_config/dbs')
const { resolve } = require('path')
const https=require('https')
const expressWS=require('express-ws')
const { randomUUID } = require('crypto')


// 创建app
const app=express()

app.use(cors())
const options = {
key: readFileSync(resolve(__dirname,'..', 'cert','a.key')),
cert: readFileSync(resolve(__dirname,'..', 'cert','a.pem'))
}
// app.use((req,res,next)=>{
//     const referer=req.get('referer')
//     console.log(referer,'referer')
//     if(!referer||!(referer=='https://servicewechat.com/wxf5e611bcd30eb83d/16/page-frame.html'||referer=='https://www.mynameisczy.cn/'||referer=='https://servicewechat.com/wxf5e611bcd30eb83d/devtools/page-frame.html')){
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
        const {db_config}=data

// 这是机制问题，当没有操作数据的时候，就断开连接了 在网站stackoverflow看到了解决方案 强制连接,让数据库每1hours查询一次        
        
        // await connectionMysql(db_config).then(()=>{
            let server=https.createServer(options,app).listen('7086',function(){
            })
            let ws_config={
                wss:expressWS(app,server).getWss('/'),
                persons:[], // 游戏人数
                teams:[] // 队伍
            }
            MountRouter(ws_config)  
        // 使用express-ws
        // })
    })
}

function MountRouter(ws_config){
    app.ws('/poker',function(ws,req){
        // 每个人已进入都是单独一个数组房间
        // req.query.game_state='pending'
        req.query.ws=ws
        // 是否在进行匹配
        req.query.state=0
        // 是否正在游戏
        req.query.playing=0
        // 是否正在队伍
        req.query.teams=0
        // 默认游戏类型（斗地主）
        // req.query.mode='mode1'

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
        ws.on('message',async function(msg){
            msg=JSON.parse(msg)

    if(msg.state==1){
                // 创建房间成功
                let {position}=msg
                ws_config.persons[position].privilege=true
                ws_config.persons[position].ready=true
                let room_id=randomUUID()
                let c={message:[],room_id:room_id,t:[ws_config.persons[position]],type:'ddz',isPlay:false}
                
                // 创建房间
                ws_config.teams.push(c) 

                ws_config.teams[ws_config.teams.indexOf(c)].t.forEach(item=>{
                    item.ws.send(JSON.stringify({
                        state:2,
                        create_room:true,
                        room_id:room_id,
                        type:ws_config.teams[ws_config.teams.indexOf(c)].type,
                        current_persons:ws_config.teams[ws_config.teams.indexOf(c)].t.map(item=>{return{name:item.user_name,openid:item.openid,avatar:item.user_avatar,privilege:item.privilege,ready:item.ready}})
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
                let ind=-1
                // 查看是否在房间内
                for(let i=0;i<ws_config.teams.length;i++){
                    ws_config.teams[i].t.forEach(it=>{
                        if(it.openid==openid){
                            flag=1
                            ind=i
                        }
                    })
                }
                if(ind!=-1&&flag==1){
                    // 房间存在,向所有人发
                    ws_config.teams[ind].t.forEach(item=>{
                        clearTimeout(item.timer)
                        item.timer=setTimeout(() => {
                            item.state=0
                        }, 1100);
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
                    if(ws_config.teams[i].t.length<3&&ws_config.teams[i].t[0].playing==0&&ws_config.teams[i].t[0].state==1){
                        for(let j=0;j<ws_config.teams[i].t.length;j++){
                            // 匹配自己是否已经在内（那么退出）
                            if(ws_config.teams[i].t[j].openid===ws_config.persons[index].openid)
                                return
                        }
                        ws_config.teams[i].t.push(ws_config.persons[index])
                        // 加入队伍
                        ws_config.persons[index].teams=1
                        ws_config.persons[index].state=1
                        // 给ws_config.persons[index]回复进入成功
                        // 房主
                        ws_config.teams[i].t[0].privilege=true
                        ws_config.teams[i].t[0].ready=true
                        let k=1;
                        while(k<ws_config.teams[i].t.length){
                            // 其他玩家
                            ws_config.teams[i].t[k].privilege=false
                            // 是否准备
                            ws_config.teams[i].t[k].ready=true
                            k++
                        }

                        // 给 ws_config.teams[i]里玩家回复成功
                        ws_config.teams[i].t.forEach(item=>{
                            item.ws.send(JSON.stringify({
                                room_id:ws_config.teams[i].room_id,
                                state:2,
                                type:ws_config.teams[i].type,
                                current_persons:ws_config.teams[i].t.map(item=>{return{name:item.user_name,openid:item.openid,avatar:item.user_avatar,privilege:item.privilege,ready:item.ready}})
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
                    let c={message:[],t:arr,room_id:randomUUID(),type:'ddz',isPlay:false}
                    ws_config.teams.push(c)
                    // 创建队伍，通知两方
                    ws_config.teams[ws_config.teams.indexOf(c)].t.forEach(item=>{
                        item.ws.send(JSON.stringify({
                            state:2,
                            room_id:ws_config.teams[ws_config.teams.indexOf(c)].room_id,
                            type:ws_config.teams[ws_config.teams.indexOf(c)].type,
                            current_persons:ws_config.teams[ws_config.teams.indexOf(c)].t.map(item=>{return{name:item.user_name,openid:item.openid,avatar:item.user_avatar,privilege:item.privilege,ready:item.ready}})
                        }))
                    })
                    return
                }
            }
    else if(msg.state==3){
        // 匹配用户
        const {state,ind}=matchRoomId(ws_config.teams,msg.room_id)
        // 房间不存在
        if(!state){
            console.log('房间不存在');
            return
        }
        let room_id=ind
                // 用户取消准备
                ws_config.teams[room_id].t.forEach(item=>{
                    if(item.openid==msg.openid)
                        item.ready=msg.ready
                })
                ws_config.teams[room_id].t.forEach(item=>{
                    item.ws.send(JSON.stringify({
                        state:3,
                        current_persons_ready:ws_config.teams[room_id].t.map(item=>{return{openid:item.openid,ready:item.ready}})
                    }))
                })
            }
    else if(msg.state==4){ // 开始游戏
                // 如果都不叫地主：将重新调用4
                const {state,ind}=matchRoomId(ws_config.teams,msg.room_id)
                // 房间不存在
                if(!state){
                    console.log('房间不存在');
                    return
                }
                ws_config.teams[ind].isPlay=true
                let mode=new Game[Game.check(ws_config.teams[ind].type)]
                let obj=mode.create()
                // 设置一个首先能抢地主的人
                let master=Math.round(Math.random()*2)

                ws_config.teams[ind].t.forEach((item,index)=>{
                    // 将正在匹配设置为0
                    item.state=0
                    // 游戏进行中
                    item.playing=1
                    obj.user_cards[index].openid=item.openid
                // 排序函数
                    // arr=arr.sort((a,b)=>{
                    //     let reg=/(\d)/g
                    //     // console.log(a.match(reg).join(''));
                    //     return Number(b.match(reg).join(''))-Number(a.match(reg).join(''))
                    //   })
                    item.ws.send(JSON.stringify({
                        state:4,
                        cards:obj.user_cards[index],
                        current_player_openid:ws_config.teams[ind].t[master].openid,
                        users_card:obj.user_cards.map(item2=>{
                            return JSON.parse(JSON.stringify(item2,['count','pre_master_count','master','out_card_state']))
                        })
                    }))
                })

            // 每个用户参数
                // count:17,
                // cards:[],
                // pre_master_count:0,
                // master:false,
                // total_count:0

                // 创建裁判
                ws_config.teams[ind].t.push({
                    mode:mode,
                    order:master,
                    room_id:ws_config.teams[ind].room_id,
                    master_openid:'',
                    users:obj.user_cards,
                    master_card:obj.others,
                    current_player_openid:'',
                    rounds:[],
                    score:10,
                    rounds_state:false,
                    interval_flag:'',
                    stop_interval_flag:function(){
                        clearInterval(this.interval_flag)
                    },
                    interval:function(){
                        this.stop_interval_flag()
                        let count=30
                        this.interval_flag=setInterval(() => {
                            if(count<=0){
                                // 下一个玩家
                                this.stop_interval_flag()
                                next_player()
                            }
                            ws_config.teams[ind].t.forEach((item,index)=>{
                                if(index>=3)
                                    return
                                item.ws.send(JSON.stringify({
                                    state:15,
                                    current_player_openid:this.current_player_openid,
                                    count:count
                                }))
                            })
                            count--
                            // 每次将count发送给current_player_openid
                        }, 1000)
                        next_player=async()=>{
                            for(let i=0;this.users.length;i++){
                                if(i>=3)
                                    break
                                if(this.users[i].openid==this.current_player_openid){
                                    this.users[i].out_card_state=false
                                }
                            }
            
            
                            // 如果有两个人都不出，那么就结束下一回合
                            let openid=this.current_player_openid
                            let test=await test_users_out_card_state(ind)
                            // 检测回合是否结束
                            if(test){
                                // 回合结束:test是可以出牌的openid
                                this.rounds_state=false
                                this.current_player_openid=test
                                // 通知所有人下一回合开始
                                ws_config.teams[ind].t.forEach((item,index)=>{
                                    if(index>=3)
                                        return
                                // 不出
                                    item.ws.send(JSON.stringify({
                                        state:11,
                                        openid:openid,
                                        new_round:true,
                                        current_player_openid:this.current_player_openid
                                    }))
                                })
                            }else{
                                // 设置下一个玩家
                                await set_next_out_card_user(ind)
                                ws_config.teams[ind].t.forEach((item,index)=>{
                                    if(index>=3)
                                        return
                                // 不出
                                    item.ws.send(JSON.stringify({
                                        state:11,
                                        openid:openid,
                                        new_round:false,
                                        current_player_openid:this.current_player_openid
                                    }))
                                })
                            }    

                        this.interval()
                }

                                        
                    }
                    
                })
            }
            // 抢地主
    else if(msg.state==5){
                // 设置抢地主信息
                let {room_id,openid}=msg.rule
                const {state,ind}=matchRoomId(ws_config.teams,room_id)
                // 房间不存在
                if(!state){
                    console.log('房间不存在');
                    return
                }
                room_id=ind
                // 有人抢地主
                ws_config.teams[room_id].t[3].score*=2
                let openid_count_max=openid
                let count=0;
                let inde=0
                ws_config.teams[room_id].t[3].users.forEach((item,index)=>{
                    if(item.openid==openid){
                        // 这个玩家抢地主
                        item.pre_master_count++
                    }
                    if(item.pre_master_count>count){
                        count=item.pre_master_count
                        openid_count_max=item.openid
                        inde=index
                    }
                })
                if(count>=2){
                    // 地主产生
                    ws_config.teams[room_id].t[3].master_openid=openid_count_max
                    ws_config.teams[room_id].t[3].current_player_openid=openid_count_max
                    ws_config.teams[room_id].t[3].users[inde].out_card_state=true

                    ws_config.teams[room_id].t[3].users[inde].cards.push(...ws_config.teams[room_id].t[3].master_card)
                    ws_config.teams[room_id].t[3].users[inde].count+=ws_config.teams[room_id].t[3].master_card.length
                    // 把地主牌发给地主并公布
                    ws_config.teams[room_id].t.forEach((item,index)=>{
                        if(index>=3)
                            return
                        item.ws.send(JSON.stringify({
                            state:9,
                            master_openid:ws_config.teams[room_id].t[3].master_openid,
                            master_card:ws_config.teams[room_id].t[3].master_card,
                            current_player_openid:ws_config.teams[room_id].t[3].current_player_openid,
                            score:ws_config.teams[room_id].t[3].score
                        }))
                    })
                    setTimeout(() => {
                        ws_config.teams[room_id].t[3].interval()
                    }, 1000);
                    return
                }
                // 裁判判断

                // 下一个到玩家
                ws_config.teams[room_id].t[3].order=ws_config.teams[room_id].t[3].order>=2?0:ws_config.teams[room_id].t[3].order+1

                if(ws_config.teams[room_id].t[3].users[ws_config.teams[room_id].t[3].order].cancel_master==true)
                    ws_config.teams[room_id].t[3].order=ws_config.teams[room_id].t[3].order>=2?0:ws_config.teams[room_id].t[3].order+1

                if(ws_config.teams[room_id].t[3].users[ws_config.teams[room_id].t[3].order].cancel_master==true)
                    ws_config.teams[room_id].t[3].order=ws_config.teams[room_id].t[3].order>=2?0:ws_config.teams[room_id].t[3].order+1                    

                ws_config.teams[room_id].t[3].current_player_openid=ws_config.teams[room_id].t[3].users[ws_config.teams[room_id].t[3].order].openid
                // 发送抢地主消息
                ws_config.teams[room_id].t.forEach((item,index)=>{
                    if(index>=3)
                        return
                    item.ws.send(JSON.stringify({
                        state:6,
                        after_player_openid:openid, // 当前抢地主的玩家id
                        current_player_openid:ws_config.teams[room_id].t[3].current_player_openid,
                        score:ws_config.teams[room_id].t[3].score
                    }))
                })
    }else if((msg.state==6)){
                let {room_id,openid}=msg.rule
                // 放弃抢地主，下个玩家
                const {state,ind}=matchRoomId(ws_config.teams,room_id)
                // 房间不存在
                if(!state){
                    console.log('房间不存在');
                    return
                }
                room_id=ind
                let master=false
                
                ws_config.teams[room_id].t[3].users.forEach((item,index)=>{
                    if(index>=3)
                        return
                    if(item.openid==openid){
                        item.cancel_master=true
                        let flag={
                            count:0,
                            openid:'',
                            index:0
                        }
                        // 查看其他两个的pre_master_count
                        // 如果另外两个其中有一个是true，另外一个的count>=1，那么另外一个就是地主
                    ws_config.teams[room_id].t[3].users.forEach((item2,index2)=>{
                        if(index2>=3||index2==index)
                            return
                        // 统计没有取消的人数
                        if(!item2.cancel_master){
                            flag.count++
                            flag.openid=item2.openid
                            flag.index=index2
                        }
                    })
                    if(flag.count==1){
                            // 地主产生
                            master=true
                            ws_config.teams[room_id].t[3].master_openid=flag.openid
                            ws_config.teams[room_id].t[3].current_player_openid=flag.openid
                            // 把地主牌发给地主并公布
                            ws_config.teams[room_id].t[3].users[flag.index].cards.push(...ws_config.teams[room_id].t[3].master_card)
                            ws_config.teams[room_id].t[3].users[flag.index].count+=ws_config.teams[room_id].t[3].master_card.length
                            ws_config.teams[room_id].t.forEach((item3,index)=>{
                                if(index>=3)
                                    return
                                item3.ws.send(JSON.stringify({
                                    state:9,
                                    master_openid:ws_config.teams[room_id].t[3].master_openid,
                                    master_card:ws_config.teams[room_id].t[3].master_card,
                                    current_player_openid:ws_config.teams[room_id].t[3].current_player_openid
                                }))
                            })
                            setTimeout(() => {
                                ws_config.teams[room_id].t[3].interval()
                            }, 1000);
                            return                            
                    }
                    }
                })
                if(master){
                    return
                }

                
                
                ws_config.teams[room_id].t[3].order=ws_config.teams[room_id].t[3].order>=2?0:ws_config.teams[room_id].t[3].order+1

                // 如果cancel_master为true，那么就跳过
                if(ws_config.teams[room_id].t[3].users[ws_config.teams[room_id].t[3].order].cancel_master==true){
                    ws_config.teams[room_id].t[3].order=ws_config.teams[room_id].t[3].order>=2?0:ws_config.teams[room_id].t[3].order+1
                    // 查看第三者
                }

                if(ws_config.teams[room_id].t[3].users[ws_config.teams[room_id].t[3].order].cancel_master==true){
                    // 这里都没有抢地主
                    // 通知所有人：游戏结束
                    ws_config.teams[room_id].t.forEach(item=>{
                        item.ws.send(JSON.stringify({
                            state:8
                        }))
                    })
                    ws_config.teams[room_id].t[3].stop_interval_flag()
                    ws_config.teams[room_id].isPlay=false
                    ws_config.teams[room_id].t.pop()
                    return
                }
                

                ws_config.teams[room_id].t[3].current_player_openid=ws_config.teams[room_id].t[3].users[ws_config.teams[room_id].t[3].order].openid

            // 发送放弃消息
                ws_config.teams[room_id].t.forEach((item,index)=>{
                    if(index>=3)
                        return
                    item.ws.send(JSON.stringify({
                        state:7,
                        after_player_openid:openid, // 当前放弃抢地主的玩家id
                        current_player_openid:ws_config.teams[room_id].t[3].current_player_openid
                    }))
                })
    // 邀请人加入房间
    }else if(msg.state==7){
                // 加入房间
                let {room_id,position}=msg
                const {state,ind}=matchRoomId(ws_config.teams,room_id)
                // 房间不存在
                if(!state){
                    console.log('房间不存在');
                    return
                }
                // 查看房间是否存在
                if(ws_config.teams[ind].t==undefined){
                    // 房间不存在，
                    ws_config.persons[position].ws.send(JSON.stringify({
                        state:13
                    }))
                    return
                }

                //  检查房间是否满人
                if(ws_config.teams[ind].t.length>=3){
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
                ws_config.teams[ind].t.push(ws_config.persons[position])
                // 通知所有人
                ws_config.teams[ind].t.forEach(item=>{
                    item.ws.send(JSON.stringify({
                        state:2,
                        room_id:room_id,
                        type:ws_config.teams[ind].type,
                        current_persons:ws_config.teams[ind].t.map(item=>{return{name:item.user_name,openid:item.openid,avatar:item.user_avatar,privilege:item.privilege,ready:item.ready}})
                    }))
                })
            }else if(msg.state==8){
    // 出牌
                let {room_id,openid,cards}=msg
                const {state,ind}=matchRoomId(ws_config.teams,room_id)
                // 房间不存在
                if(!state){
                    console.log('房间不存在');
                    return
                }
                room_id=ind
                if(ws_config.teams[room_id].t.length<=2){
                    console.log('退出');
                    // 房间异常
                    return
                }

                if(ws_config.teams[room_id].t[3].current_player_openid!=openid){
                    // 有人抢先，（还没轮到该角色出牌）
                    console.log('有人抢先出');
                    return
                }
                // 检测牌是否存在

                let exists=await test_cards_exists(room_id,cards,openid)
                // 不存在
                if(!exists){
                    console.log('出的牌不存在');
                }

                // 检测出牌是否符合规则
                let result2=await ws_config.teams[room_id].t[3].mode.check_card_regular(cards)

                if(!result2){
                    // 出的牌不符合规则
                    ws_config.teams[room_id].t.forEach((item,index)=>{
                        if(index>=3)
                            return
                        if(item.openid==openid)
                            item.ws.send(JSON.stringify({
                                    state:20,
                                    errMes:'出的牌不符合规则'
                                }))
                    })
                    return
                }
                // 创建(第一回合或开始新的回合)
                if(ws_config.teams[room_id].t[3].rounds.length<=0||ws_config.teams[room_id].t[3].rounds_state==false){
                    await set_users_out_card_state_all_true(room_id)
                    await set_next_out_card_user(room_id)
                    let count=await decrement_cards(room_id,cards,openid)

                    ws_config.teams[room_id].t[3].rounds_state=true
                    // 扣除cards
                    ws_config.teams[room_id].t[3].rounds.push([{
                        openid:openid,
                        cards:cards,
                        count:count
                    }])
                    if(count>0){
                        // 返回最新的一回合
                        ws_config.teams[room_id].t.forEach((item,index)=>{
                            if(index>=3)
                                return
                            item.ws.send(JSON.stringify({
                                state:10,
                                new_round:false,
                                cards:ws_config.teams[room_id].t[3].rounds[ws_config.teams[room_id].t[3].rounds.length-1],
                                current_player_openid:ws_config.teams[room_id].t[3].current_player_openid,
                                score:ws_config.teams[room_id].t[3].score
                            }))
                        })
                    }else{
                    // 返回最新的一回合
                        ws_config.teams[room_id].t.forEach((item,index)=>{
                            if(index>=3){
                                ws_config.teams[room_id].t[3].stop_interval_flag()
                                setTimeout(() => {
                                    // 游戏结束
                                        ws_config.teams[room_id].t.forEach((item,index)=>{
                                            if(index>=3)
                                                return
                                            // 每次返回最新的两条数据
                                            item.ws.send(JSON.stringify({
                                                state:14,
                                                winner_openid:openid,
                                                other_cards:ws_config.teams[room_id].t[3].users
                                            }))
                                        })
                                        ws_config.teams[room_id].t.pop()
                                        ws_config.teams[room_id].isPlay=false
                                        // 删除裁判
                                    }, 1000);   
                                return
                            }
                            item.ws.send(JSON.stringify({
                                state:10,
                                new_round:false,
                                cards:ws_config.teams[room_id].t[3].rounds[ws_config.teams[room_id].t[3].rounds.length-1],
                                current_player_openid:'',
                                score:ws_config.teams[room_id].t[3].score
                            }))
                        }) 
                        return                    
                    }
                    // 开始计数
                    setTimeout(() => {
                        ws_config.teams[room_id].t[3].interval()
                    }, 500);
                    return
                }

                // 检测出的牌是否合理(拿上次的跟这次的进行对比)
                let result=await ws_config.teams[room_id].t[3].mode.check_card_regular(ws_config.teams[room_id].t[3].rounds[ws_config.teams[room_id].t[3].rounds.length-1][ws_config.teams[room_id].t[3].rounds[ws_config.teams[room_id].t[3].rounds.length-1].length-1].cards)
                
                // 有grade的都是炸弹
                if(ws_config.teams[room_id].t[3].mode.check_card_regular2(result,result2)){
                    // 翻倍
                    if(ws_config.teams[room_id].t[3].mode.times(result2))
                        ws_config.teams[room_id].t[3].score*=2
                }else{
                    // 出的牌不合理
                    ws_config.teams[room_id].t.forEach((item,index)=>{
                        if(index>=3)
                            return
                        if(item.openid==openid)
                            item.ws.send(JSON.stringify({
                                    state:21,
                                    errMes:'出的牌不合理'
                                }))
                    })
                    return
                }
                await set_next_out_card_user(room_id)
                // 扣除cards
                let count=await decrement_cards(room_id,cards,openid)

                // 回合添加数据
                ws_config.teams[room_id].t[3].rounds[ws_config.teams[room_id].t[3].rounds.length-1].push({
                    openid:openid,
                    cards:cards,
                    count:count
                })

                // 如果一个回合内头=尾，那么所有人都又可以出牌了
                if(ws_config.teams[room_id].t[3].rounds[ws_config.teams[room_id].t[3].rounds.length-1][0].openid==ws_config.teams[room_id].t[3].rounds[ws_config.teams[room_id].t[3].rounds.length-1][ws_config.teams[room_id].t[3].rounds[ws_config.teams[room_id].t[3].rounds.length-1].length-1].openid){
                    await set_users_out_card_state_all_true(room_id)
                }

                // 将出的牌返回，每次返回2个
                if(count>0){

                    ws_config.teams[room_id].t.forEach((item,index)=>{
                        if(index>=3)
                            return
                        // 每次返回最新的两条数据
                        item.ws.send(JSON.stringify({
                            state:10,
                            new_round:false,
                            cards:ws_config.teams[room_id].t[3].rounds[ws_config.teams[room_id].t[3].rounds.length-1].slice(ws_config.teams[room_id].t[3].rounds[ws_config.teams[room_id].t[3].rounds.length-1].length-2,ws_config.teams[room_id].t[3].rounds[ws_config.teams[room_id].t[3].rounds.length-1].length),
                            current_player_openid:ws_config.teams[room_id].t[3].current_player_openid,
                            score:ws_config.teams[room_id].t[3].score
                        }))
                    })
                    // 开始计数
                    setTimeout(() => {
                        ws_config.teams[room_id].t[3].interval()
                    }, 500);                    
                }
                else{
                    ws_config.teams[room_id].t.forEach((item,index)=>{
                        if(index>=3){
                            ws_config.teams[room_id].t[3].stop_interval_flag()
                            setTimeout(() => {
                            // 游戏结束
                                ws_config.teams[room_id].t.forEach((item,index)=>{
                                    if(index>=3)
                                        return
                                    // 每次返回最新的两条数据
                                    item.ws.send(JSON.stringify({
                                        state:14,
                                        winner_openid:openid,
                                        other_cards:ws_config.teams[room_id].t[3].users
                                    }))
                                })
                                ws_config.teams[room_id].t.pop()
                            ws_config.teams[room_id].isPlay=false
                            }, 1000);
                            return
                        }
                        // 每次返回最新的两条数据
                        item.ws.send(JSON.stringify({
                            state:10,
                            new_round:false,
                            cards:ws_config.teams[room_id].t[3].rounds[ws_config.teams[room_id].t[3].rounds.length-1].slice(ws_config.teams[room_id].t[3].rounds[ws_config.teams[room_id].t[3].rounds.length-1].length-2,ws_config.teams[room_id].t[3].rounds[ws_config.teams[room_id].t[3].rounds.length-1].length),
                            current_player_openid:'',
                            score:ws_config.teams[room_id].t[3].score
                        }))
                    })
                }
                
            }else if(msg.state==9){
                // 不出牌
                let {room_id,openid}=msg
                const {state,ind}=matchRoomId(ws_config.teams,room_id)
                // 房间不存在
                if(!state){
                    console.log('房间不存在');
                    return
                }
                room_id=ind
                if(ws_config.teams[room_id].t.length<=2){
                    console.log('退出');
                    // 房间异常
                    return
                }

                if(ws_config.teams[room_id].t[3].current_player_openid!=openid){
                    // 有人抢先，（还没轮到该角色出牌）
                    return
                }
                for(let i=0;i<ws_config.teams[room_id].t[3].users.length;i++){
                    if(i>=3)
                        break
                    if(ws_config.teams[room_id].t[3].users[i].openid==ws_config.teams[room_id].t[3].current_player_openid){
                        ws_config.teams[room_id].t[3].users[i].out_card_state=false
                    }
                }


                // 如果有两个人都不出，那么就结束下一回合
                let test=await test_users_out_card_state(room_id)
                // 检测回合是否结束
                if(test){
                    // 回合结束:test是可以出牌的openid
                    ws_config.teams[room_id].t[3].rounds_state=false
                    ws_config.teams[room_id].t[3].current_player_openid=test
                    // 通知所有人下一回合开始
                    ws_config.teams[room_id].t.forEach((item,index)=>{
                        if(index>=3)
                            return
                    // 不出
                        item.ws.send(JSON.stringify({
                            state:11,
                            openid:openid,
                            new_round:true,
                            current_player_openid:ws_config.teams[room_id].t[3].current_player_openid
                        }))
                    })
                }else{``
                    // 设置下一个玩家
                    await set_next_out_card_user(room_id)
                    ws_config.teams[room_id].t.forEach((item,index)=>{
                        if(index>=3)
                            return
                    // 不出
                        item.ws.send(JSON.stringify({
                            state:11,
                            openid:openid,
                            new_round:false,
                            current_player_openid:ws_config.teams[room_id].t[3].current_player_openid
                        }))
                    })
                }
                setTimeout(() => {
                    ws_config.teams[room_id].t[3].interval()
                }, 500);
            }else if(msg.state==10){
                const {state,ind}=matchRoomId(ws_config.teams,msg.room_id)
                // 房间不存在
                if(!state){
                    console.log('房间不存在');
                    return
                }
                room_id=ind
                // send message
                const {content,openid,avatar,name}=msg.info
                ws_config.teams[room_id].t.forEach((item,index)=>{
                    if(index>=3)
                        return
                    item.ws.send(JSON.stringify({
                        state:100,
                        openid:openid,
                        mes:{
                            openid,
                            avatar,
                            name,
                            content
                        }
                    }))
                })
            }else if(msg.state==11){
                const {state,ind}=matchRoomId(ws_config.teams,msg.room_id)
                // 房间不存在
                if(!state){
                    console.log('房间不存在');
                    return
                }
                room_id=ind
                // send message
                const {content,openid}=msg
                ws_config.teams[room_id].t.forEach((item,index)=>{
                    if(index>=3)
                        return
                    item.ws.send(JSON.stringify({
                        state:16,
                        openid:openid,
                        content:content
                    }))
                })
            }else if(msg.state==12){
                const {state,ind}=matchRoomId(ws_config.teams,msg.room_id)
                // 房间不存在
                if(!state){
                    console.log('房间不存在');
                    return
                }
                // 游戏正在进行中
                if(ws_config.teams[ind].isPlay){
                    return
                }
                // 改变游戏类型
                ws_config.teams[ind].type=msg.type
                ws_config.teams[ind].t.forEach((item,index)=>{
                    if(index>=3)
                        return
                    item.ws.send(JSON.stringify({
                        state:17,
                        type:ws_config.teams[ind].type
                    }))
                })
            }
                // 扣除对应的牌
    function decrement_cards(room_id,cards,openid){
        let count=0
        return new Promise(res=>{
            for(let i=0;i<ws_config.teams[room_id].t[3].users.length;i++){
                if(ws_config.teams[room_id].t[3].users[i].openid==openid){
                    for(let j=0;j<cards.length;j++){
                        for(let k=0;k<ws_config.teams[room_id].t[3].users[i].cards.length;k++){
                            if(cards[j]==ws_config.teams[room_id].t[3].users[i].cards[k]){
                                ws_config.teams[room_id].t[3].users[i].cards.splice(k,1)
                                ws_config.teams[room_id].t[3].users[i].count--
                                count=ws_config.teams[room_id].t[3].users[i].count
                            }
                        }
                    }
                    res(count)
                }
            }
        })
    }

    // 检测是否有两个人不出(回合结束)
    function test_users_out_card_state(room_id){
        let count=0
        let openid=''
        return new Promise(res=>{
            for(let i=0;i<ws_config.teams[room_id].t[3].users.length;i++){
                if(ws_config.teams[room_id].t[3].users[i].out_card_state==false)
                    count++
                else
                    openid=ws_config.teams[room_id].t[3].users[i].openid
            }
            // 回合结束，返回那个可以出牌的openid
            if(count>=2)
                res(openid)
            res(false)
        })
    }
    // 检测牌是否存在
    function test_cards_exists(room_id,cards,openid){
        return new Promise(res=>{
            for(let i=0;i<ws_config.teams[room_id].t[3].users.length;i++){
                if(ws_config.teams[room_id].t[3].users[i].openid==openid){
                    for(let j=0;j<cards.length;j++){
                            if(ws_config.teams[room_id].t[3].users[i].cards.indexOf(cards[j])<0){
                                res(false)
                            }
                    }
                    res(true)
                }
            }
        })
    }

    // 将所有人是否能出牌重置为true(每回合开始前调用)
    function set_users_out_card_state_all_true(room_id){
        return new Promise(res=>{
            for(let i=0;i<3;i++){
                ws_config.teams[room_id].t[3].users[i].out_card_state=true
            }
            res()
        })
    }

        function set_next_out_card_user(room_id){
            return new Promise(res=>{
                for(let i=ws_config.teams[room_id].t[3].users.length-1;i>=0;i--){
                    if(i>=3)
                        break
                    if(ws_config.teams[room_id].t[3].users[i].openid==ws_config.teams[room_id].t[3].current_player_openid){
                        // if(((i+1)>=3?ws_config.teams[room_id][3].users[0].out_card_state:ws_config.teams[room_id][3].users[i+1].out_card_state)==false){
                            // 如果下一个为false，就检测下下个
                            // i++
                        // }
                        // 设置下一个出牌用户
                        ws_config.teams[room_id].t[3].current_player_openid=(i-1)<0?ws_config.teams[room_id].t[3].users[2].openid:ws_config.teams[room_id].t[3].users[i-1].openid
                        res()
                        return
                }
            }
        })
    }

           
        })
        ws.on('error',function(e){
                console.log(e,'err');
        })

        ws.on('close',function(){
            // 从persons里删除
            let openid=ws_config.persons[position].openid
            ws_config.persons.splice(position,1,'空')
            // 遍历teams，查看是否在队伍当中
            ws_config.teams.forEach((item,index)=>{
                for(let i=0;i<item.t.length;i++){
                    if(i>=3){
                        return
                    }
                    if(item.t[i].openid==openid){
                        // 找到了,进行删除
                        let rm=item.t.splice(i,1)
                        if(rm[0].privilege)
                            if(item.t.length)
                                item.t[0].privilege=true

                        // 通知其他人(如果还有就通知)
                        item.t.forEach((item2,ind)=>{
                            // 结束正在游戏标识
                            item2.playing=0
                            if(item2.hasOwnProperty('master_openid')){
                                // 移除裁判
                                item.t.splice(ind,1)
                                return
                            }
                            if(!item2.hasOwnProperty('openid'))
                                return
                            item2.ws.send(JSON.stringify({
                                state:2,
                                lost:true,
                                current_persons:ws_config.teams[index].t.map(item=>{return{name:item.user_name,openid:item.openid,avatar:item.user_avatar,privilege:item.privilege,ready:item.ready}})
                            }))
                        })
                        ws_config.teams[index].isPlay=false
                        if(item.t.length>1){
                            // 移除裁判
                            if(item.t[item.t.length-1].hasOwnProperty('current_player_openid')){
                                // 裁判存在，移除裁判
                                item.t[item.t.length-1].stop_interval_flag()
                                item.t.splice(item.t.length-1,1)
                            }
                        }
                        if(item.t.length<=1){
                            // 解散
                            ws_config.teams.splice(index,1)
                        }
                        break
                    }
                }
            })
        })
    })
}
function matchRoomId(team,room_id){
    let state=false
    let index=-1
    team.forEach((item,i)=>{
        if(item.room_id==room_id){
            state=true
            index=i
        }
    })
    return {state,ind:index}
}
class Game{
    static cards=[
        '10black_peach.svg', '10block.svg',           '10club.svg',
        '10red_heart.svg',   '11black_peach.svg',     '11block.svg',
        '11club.svg',        '11red_heart.svg',       '12black_peach.svg',
        '12block.svg',       '12club.svg',            '12red_heart.svg',
        '13black_peach.svg', '13block.svg',           '13club.svg',
        '13red_heart.svg',   '14black_peach.svg',     '14block.svg',
        '14club.svg',        '14red_heart.svg',       '15black_peach.svg',
        '15block.svg',       '15club.svg',            '15red_heart.svg',
        '16king.svg',        '17king.svg',            '3black_peach.svg',
        '3block.svg',        '3club.svg',             '3red_heart.svg',
        '4black_peach.svg',  '4block.svg',            '4club.svg',
        '4red_heart.svg',    '5black_peach.svg',      '5block.svg',
        '5club.svg',         '5red_heart.svg',        '6black_peach.svg',
        '6block.svg',        '6club.svg',             '6red_heart.svg',
        '7black_peach.svg',  '7block.svg',            '7club.svg',
        '7red_heart.svg',    '8black_peach.svg',      '8block.svg',
        '8club.svg',         '8red_heart.svg',        '9black_peach.svg',
        '9block.svg',        '9club.svg',             '9red_heart.svg'
    ]
    static check(name){
        let type=[{
            t:'ddz',
            name:'mode1'
        },{
            t:'kj',
            name:'mode2'
        }]
        let c='ddz'
        type.forEach(item=>{
            if(item.t==name){
                c=item.name
            }
        })
        return c
    }
    static mode1=class{
        // type='ddz'
        create(){
            // 首先是发牌,所谓发牌就是开局时一副牌共有 54 张,分为三份,
                // 一人 17 张,留 3 张做底牌,在确定地主之前玩家不能看底牌。


            // 总共3个人，54张牌，首先每人17张牌

            let a={
                count:17,
                cards:[],
                pre_master_count:0,
                master:false,
                total_count:0,
                out_card_state:false,
                cancel_master:false,
                openid:''
            }
            let b={
                count:17,
                cards:[],
                pre_master_count:0,
                master:false,
                total_count:0,
                out_card_state:false,
                cancel_master:false,
                openid:''
            }
            let c={
                count:17,
                cards:[],
                pre_master_count:0,
                master:false,
                total_count:0,
                out_card_state:false,
                cancel_master:false,
                openid:''
            }
            let cards2=JSON.parse(JSON.stringify(Game.cards))
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
            a.count=a.cards.length
            b.count=b.cards.length
            c.count=c.cards.length
            return {user_cards:[a,b,c],others:cards2}
        }

        times(result2){
            if(result2.type=='炸'||result2.type=='王炸'||result2.type=='飞机')
                return true
            else
                false
        }
        check_card_regular2(result,result2){
            if((result.type==result2.type&&result.card<result2.card&&result.length==result2.length)||result.grade<result2.grade){
                return true
            }else   
                return false
        }
                    // 匹配规则
        check_card_regular(cards){
            // 检测是否有两个是3个的
            function fn(cards){
                // 78飞机带对三
                    let arr=[]
                    for(let i=0;i<cards.length;i++){
                        let count=0
                        for(let j=i;j<cards.length;j++){
                            if(cards[i]==cards[j]){
                                count++
                            }
                            if(count>=3){
                                if(arr.indexOf(cards[i])<0){
                                    arr.push(cards[i])
                                }
                            }
                        }
                    }
                    if((arr.length*3==cards.length)||(arr.length>=2&&(arr.length*3+arr.length)==cards.length&&cards.length%2==0))
                        return {type:'飞机',card:arr[0],length:arr.length,grade:0}
                    return false
                }
                        return new Promise(res=>{
                            // 把数字匹配出来
                            let reg=/(\d)/g
                            cards=cards.map(a=>{
                                return Number(a.match(reg).join(''))
                            }).sort((a,b)=>a-b)
                
                            let plane=false
                            // 规则
                            // 1单
                            if(cards.length==1){
                                res({type:'单',card:cards[0],length:1,grade:0})
                            }
                            // 2双
                            else if(cards.length==2&&cards.indexOf(16)<0){
                                if(cards[0]!=cards[1]){
                                    res(false)
                                }
                                res({type:'双',card:cards[0],length:2,grade:0})
                            }
                            else if(cards.length==3&&cards[0]==cards[1]&&cards[1]==cards[2]){
                                res({type:'三单',card:cards[0],length:2,grade:0})
                            }
                            // 3 单连
                            else if(cards.length>=5&&cards[0]==(cards[1]-1)&&cards[1]==cards[2]-1&&cards[2]==cards[3]-1&&cards[3]==cards[4]-1&&cards[cards.length-1]!='15'){
                                for(let i=0;i<cards.length-1;i++){
                                    if(cards[i]!=cards[++i]-1){
                                        res(false)
                                        return
                                    }
                                }
                                // 进行匹配
                                res({type:'单连',card:cards[cards.length-1],length:cards.length,grade:0})
                            }
                            // 4 双连
                            else if(cards.length>=6&&cards[0]==cards[1]&&cards[1]!=cards[2]&&cards[2]==cards[3]&&cards[3]!=cards[4]&&cards.length%2==0&&cards[cards.length-1]!='15'){
                                for(let i=0;i<cards.length;i=i+2){
                                    if(cards[i]!=cards[i+1]){
                                        res(false)
                                        return
                                    }
                                }
                                res({type:'双连',card:cards[cards.length-1],length:cards.length,grade:0})
                            }
                            // 5炸
                            else if(cards.length==4&&cards[0]==cards[3]){
                                for(let i=0;i<cards.length-1;i++){
                                    if(cards[i]!=cards[++i]){
                                        res(false)
                                    }
                                }
                                res({type:'炸',card:cards[0],length:cards.length,grade:cards[0]*(cards.length-3)})
                            }
                            // 6王炸
                            else if(cards.indexOf(16)>=0&&cards.indexOf(17)>=0){
                                res({type:'王炸',card:cards[0],length:cards.length,grade:100})
                            }
                            // 7飞机
                            else if(plane=fn(cards)){
                                res(plane)
                            }
                            // 8三带一
                            else if(cards.length==4&&cards[0]!=cards[3]){
                                // 情况一 3334
                                if(cards[0]==cards[1]&&cards[1]==cards[2]){
                                    res({type:'三带一',card:cards[0],length:cards.length,grade:0})
                                }
                                // 情况二 3444
                                if(cards[1]==cards[2]&&cards[2]==cards[3]){
                                    res({type:'三带一',card:cards[3],length:cards.length,grade:0})
                                }
                                res(false)
                            }
                            // 0 1 2 3 4
                            // 3 3 3 4 4
                
                            // 4 4 4 3 3
                
                            // 9三带二
                            else if(cards.length==5&&((cards[0]!=cards[3]&&cards[3]==cards[4]&&cards[0]==cards[1]&&cards[2]==cards[3])||(cards[4]!=cards[0]&&cards[0]==cards[1]&&cards[1]==cards[2]&&cards[3]==cards[4]))){
                                // 情况一 33344
                                if(cards[0]==cards[1]&&cards[1]==cards[2]){
                                    res({type:'三带二',card:cards[0],length:cards.length,grade:0})
                                }
                                // 情况二 33444
                                if(cards[2]==cards[3]&&cards[3]==cards[4]){
                                    res({type:'三带二',card:cards[4],length:cards.length,grade:0})
                                }
                                res(false)
                                // 4带二
                            }else if(cards.length==6&&((cards[0]==cards[1]&&cards[1]==cards[2]&&cards[2]==cards[3])||(cards[5]==cards[4]&&cards[4]==cards[3]&&cards[3]==cards[2]))){
                                if(cards[0]==cards[1]&&cards[1]==cards[2]&&cards[2]==cards[3]){
                                    res({type:'四带二',card:cards[0],length:cards.length,grade:0})
                                }else{
                                    res({type:'四带二',card:cards[5],length:cards.length,grade:0})
                                }
                            }
                            res(false)
                        })
                    }
    }
    static mode2=class{
        // type='kj'
        create(){
            // 首先是发牌,所谓发牌就是开局时一副牌共有 54 张,分为三份,
                // 一人 17 张,留 3 张做底牌,在确定地主之前玩家不能看底牌。


            // 总共3个人，54张牌，首先每人17张牌

            let a={
                count:28,
                cards:[],
                pre_master_count:0,
                master:false,
                total_count:0,
                out_card_state:false,
                cancel_master:false,
                openid:''
            }
            let b={
                count:28,
                cards:[],
                pre_master_count:0,
                master:false,
                total_count:0,
                out_card_state:false,
                cancel_master:false,
                openid:''
            }
            let c={
                count:28,
                cards:[],
                pre_master_count:0,
                master:false,
                total_count:0,
                out_card_state:false,
                cancel_master:false,
                openid:''
            }
            let cards2=[...JSON.parse(JSON.stringify(Game.cards)),...JSON.parse(JSON.stringify(Game.cards))]
            let rand=0
            // 随机数分配三人
            while(cards2.length>0&&(a.count||b.count||c.count)){
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
            a.count=a.cards.length
            b.count=b.cards.length
            c.count=c.cards.length
            return {user_cards:[a,b,c],others:[]}
        }
        times(result2){
            if(result2.type=='炸'||result2.type=='王炸'||result2.type=='飞机'||result2.type=='kj')
                return true
            else
                false
        }
        check_card_regular2(result,result2){
            if(result.type=='二双'&&(result.type==result2.type&&result.card==result2.card-1)){
                return true
            }
            if(result.type=='双连'&&(result.type==result2.type&&result.card==result2.card-1)){
                return true
            } 
            if((result.type!=='二双'&&result.type!='双连'&&result.type==result2.type&&result.card<result2.card&&result.length==result2.length)||result.grade<result2.grade){
                return true
            }else   
                return false
        }
        // 匹配规则
        check_card_regular(cards){
            // 检测是否有两个是3个的
            function fn(cards){
                // 78飞机带对三
                    let arr=[]
                    for(let i=0;i<cards.length;i++){
                        let count=0
                        for(let j=i;j<cards.length;j++){
                            if(cards[i]==cards[j]){
                                count++
                            }
                            if(count>=3){
                                if(arr.indexOf(cards[i])<0){
                                    arr.push(cards[i])
                                }
                            }
                        }
                    }
                    // 找单（若每张牌数都大于1，就说明）
                    if((arr.length*3==cards.length)&&(arr.length>=2&&cards.length%2==0))
                        return {type:'飞机',card:arr[0],length:arr.length,grade:0}
                    return false
                }
                function bone(arr){
                    let count=0
                    arr.forEach(item=>{
                        if(arr[0]==item)
                            count++
                    })
                    if(count==arr.length)
                        return true
                    else
                        return false
                }
                function checkKJ(){
                    let c=[...arguments]
                    let reg=/[^(\d).svg]/g
                    let power=true
                    let grade=1
                    c.forEach((item,index)=>{
                        if(!index)
                            return
                        if(c[index-1].match(reg).join('')!=item.match(reg).join('')){
                            power=false
                        }
                    })
                    if(power){
                        let icon=c[0].match(reg).join('')
                        if(icon=='block')
                            grade+=0.1
                        else if(icon=='club')
                            grade+=0.2
                        else if(icon=='red_heart')
                            grade+=0.3
                        else if(icon=='black_peach')
                            grade+=0.4
                    }
                    // 如果为真，检查权重
                    // 'block'=2.1
                    // 'club'=2.2
                    // 'red_heart'=2.3
                    // 'black_peach'=2.4
                    return {power,grade}
                }
                        return new Promise(res=>{
                            // 把数字匹配出来
                            let reg=/(\d)/g
                            let cards2=JSON.parse(JSON.stringify(cards))
                            cards=cards.map(a=>{
                                return Number(a.match(reg).join(''))
                            }).sort((a,b)=>a-b)
                
                            let plane=false
                            // 规则
                            // 1单
                            if(cards.length==1){
                                res({type:'单',card:cards[0],length:1,grade:0})
                            }
                            // 2双
                            else if(cards.length==2&&cards.indexOf(16)<0){
                                if(cards[0]!=cards[1]){
                                    res(false)
                                }
                                res({type:'双',card:cards[0],length:2,grade:0})
                            }
                            else if(cards.length==4&&(cards[0]==cards[1]&&cards[2]==cards[3]&&cards[1]!=cards[2])&&cards[3]!='15'){
                                res({type:'二双',card:cards[3],length:4,grade:0})
                            }
                            // 3连
                            else if(cards.length==3&&cards[0]==cards[1]&&cards[1]==cards[2]){
                                res({type:'三单',card:cards[0],length:2,grade:0})
                            }else if(cards.length==3&&cards[0]=='5'&&cards[1]=='10'&&cards[2]=='13'){
                                let {power,grade}=checkKJ(...cards2)
                                // 真
                                if(power)
                                    res({type:'kj',card:cards[0],length:2,grade:grade})
                                else// 假
                                    res({type:'kj',card:cards[0],length:2,grade:grade})
                            }
                            // 4 双连
                            else if(cards.length>=6&&cards[0]==cards[1]&&cards[1]!=cards[2]&&cards[2]==cards[3]&&cards[3]!=cards[4]&&cards.length%2==0&&cards[cards.length-1]!='15'){
                                for(let i=0;i<cards.length;i=i+2){
                                    if(cards[i]!=cards[i+1]){
                                        res(false)
                                        return
                                    }
                                }
                                res({type:'双连',card:cards[cards.length-1],length:cards.length,grade:0})
                            }
                            // 5炸
                            else if(cards.length>=4&&bone(cards)){
                            res({type:'炸',card:cards[0],length:cards.length,grade:cards[0]*(cards.length-3)})
                            }
                            // 6王炸
                            else if(cards.indexOf(16)>=0&&cards.indexOf(17)>=0){
                                res({type:'王炸',card:cards[0],length:cards.length,grade:16})
                            }
                            // 7飞机
                            else if(plane=fn(cards)){
                                res(plane)
                            }
                            res(false)
                        })
                    }
    }
}