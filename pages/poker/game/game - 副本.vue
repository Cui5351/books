<template>
		<view class="container" :style="{width:(container_height)+'px',height:container_width+'px'}">
			<view class='head'>
					<view @click="back" class="back">退出</view>
					<view class="master_card">
						<view v-for="(item,index) in master_cards" :key="index">
							<image :src="'https://www.mynameisczy.asia/cards_svg/'+item" style="width:100%;height:100%;" mode=""></image>
						</view>
					</view>
				<view>12</view>
			</view>
			<view class="others">
				<!-- <view  v-for="(item,index) in users" :key="index" v-if='item.openid!=rule.openid'> -->
				<template  v-for="(item,index) in users" :key="index" >
				<view  v-if='item.openid!==rule.openid'>
					<view class="user">
						<view class="avatar">
							<image style="height: 100%;width:100%;" :src='item.avatar' mode=""></image>
						</view>
						<view class="name">{{item.name}}</view>
						<view class="count">牌:{{item.count}}</view>
						<view class="master">{{rule.current_player_openid==item.openid?'当前玩家':''}}</view>	
						</view>
					<view class="person_cards">
						<view v-for="(item2,index) in item.out_cards" :key="index">
							<image :src="'https://www.mynameisczy.asia/cards_svg/'+item2" style="width:100%;height:100%;" mode=""></image>
						</view>
					</view>
				</view>
				</template>
					<view class="btns" >
						<view class="btn2"  @click="get_master" v-if='rule.current_player_openid==rule.openid&&!rule.master&&!rule.cancel_master&&!rule.game_playing'>
							{{rule.total_count?'抢地主':'叫地主'}}
						</view>
						<view class="btn"  v-if='rule.pre_master_count<=0&&rule.current_player_openid==rule.openid&&!rule.cancel_master&&!rule.game_playing' @click="cancel_master">不抢</view>
						<view class="btn2" v-if="rule.openid==rule.current_player_openid&&rule.game_playing" @click="out_cards_btn">
							出牌
						</view>
					</view>
<!-- 				<view class="person2">
					<view class="user">
						<view class="avatar">
							<image style="height: 100%;width:100%;" src='../../static/back_img/back1.jpg' mode=""></image>
						</view>
						<view class="name">name</view>
						<view class="count">count</view>
						<view class="master">master</view>
						</view>
				</view> -->
			</view>
			<view class="cards">
				<view class="card" @click="out_cards(item,index)" :style="{transform:`translate(-${index*55}%,-${item.flag?20:0}%)`}" v-for="(item,index) in user_cards" :key="index">
					<image :src="'https://www.mynameisczy.asia/cards_svg/'+item.card" style="width:100%;height:100%;" mode=""></image>
				</view>
			</view>
			<view class="myself">
				<!-- <view class="user2" v-for="(item,index) in users" :key="index" v-if='item.openid==rule.openid'> -->
				<template  v-for="(item,index) in users" :key="index" >
				<view class="user2" v-if='item.openid==rule.openid'>
						
					<view class="avatar">
						<image style="height: 100%;width:100%;" :src='item.avatar' mode=""></image>
					</view>
					<view class="my_name">{{item.name}}</view>
					<view class="my_count">牌:{{item.count}}</view>
					<view style="margin-left:10px;">
						{{rule.master?'地主':'农民'}}
					</view>
				</view>
				</template>
				<view class="chat">
					<view>
						<view class="bei1">
						倍
						</view>
					<view class="bei">
						0
					</view>
					</view>
					<view class="chat2">聊天</view>
				</view>
			</view>
		</view>
</template>

<script>
	import page from '../../inner_page/inner_page.vue'
	import navigation from '../../navigation/navigation_all.vue'
	import {reactive,ref} from 'vue'
	import {useStore} from 'vuex'
	export default {
		components:{
			navigation,page
		},
		onUnload() {
			this.audio.stop()
			uni.current_this18.room_id=-1
			uni.onSocketClose(()=>{})
			uni.onSocketMessage(function(res){
				let data=JSON.parse(res.data)
				console.log(data);
				if(data.state==1){
					uni.current_this18.position=data.position
				}else if(data.state==12){
					// 房间以满人
					uni.showToast({
						title:'房间已满人',
						icon:'none'
					})
				}else if(data.state==13){
					// 房间不存在
					uni.showToast({
						title:'该房间已解散',
						icon:'none'
					})
					uni.current_this18.users.shift()
					uni.current_this18.users.shift()
					uni.current_this18.users.shift()
					uni.current_this18.users.push(
						...[{
							avatar:uni.current_this18.store.getters.user_avatar,
							name:uni.current_this18.store.getters.user_name,
							openid:uni.current_this18.store.getters.user_openid,
							ready:true
						},{
							avatar:"https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
							name:'邀请好友'
						},{
							avatar:"https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
							name:'邀请好友'
						}])
				}
				else if(data.state==2){
					if(data.hasOwnProperty('create_room')){
						uni.showToast({
							title:'创建房间成功'
						})
					}
					uni.current_this18.users.shift()
					uni.current_this18.users.shift()
					uni.current_this18.users.shift()
					uni.current_this18.users.unshift(...data.current_persons)
					if(data.hasOwnProperty('room_id'))
						uni.current_this18.room_id=data.room_id
					if(data.hasOwnProperty('lost')){
						if(data.lost){
							uni.showToast({
								title:'有人离开了',
								icon:'none'
							})
						}
					}
					data.current_persons.forEach(item=>{
						if(item.openid==uni.current_this18.store.getters.user_openid){
							// 设置房间权限
							uni.current_this18.room_state=item.privilege
							if(item.privilege==false){
								clearInterval(uni.current_this18.timer)
							}
						}
					})
					while(uni.current_this18.users.length<3){
						uni.current_this18.users.push({
							avatar:"https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
							name:'邀请好友'
						})
					}
					uni.current_this18.count=data.current_persons.length
					if(data.current_persons.length<=-1&&uni.current_this18.users[0].privilege==false){
						uni.current_this18.users[0].ready=true
						uni.current_this18.time=0
						uni.current_this18.solo_state=true
						uni.current_this18.room_state=true
						uni.current_this18.user_state=true
						uni.current_this18.room_id=-1
					}
				}else if(data.state==3){
					data.current_persons_ready.forEach(item=>{
						uni.current_this18.users.forEach(item2=>{
							if(item.openid==item2.openid){
								item2.ready=item.ready
								if(item.ready==false){
									uni.current_this18.time=0
									uni.current_this18.solo_state=true
									clearInterval(uni.current_this18.timer)
								}
							}
						})
					})
				}else if(data.state==4){
					uni.current_this18.users.forEach((item,index)=>{
						Object.keys(data.users_card[index]).forEach(item2=>{
							item[item2]=data.users_card[index][item2]
						})
					})
					uni.current_this18.solo_state=true
					// 开始游戏
					uni.navigateTo({
						url:'/pages/poker/game/game?cards='+JSON.stringify(data.cards)+'&room_id='+uni.current_this18.room_id+'&users='+JSON.stringify(uni.current_this18.users)+'&current_player_openid='+data.current_player_openid
					})
				}else if(data.state==5){
					clearTimeout(uni.current_this18.p_time.timer)
					uni.current_this18.p_time.flag=1
					uni.current_this18.p_time.time++
					// 匹配中
					uni.current_this18.p_time.timer=setTimeout(function(){
						uni.current_this18.p_time.time=0
						uni.current_this18.p_time.flag=0
						// 结束匹配
					},1500)
				}
			})
		},
		onLoad(res) {
			uni.current_this19=this
			console.log('进入了');
			uni.onSocketClose(function(){
				uni.showToast({
					title:'正在重连',
					icon:'error'
				})
				uni.connectSocket({url:encodeURI(`wss://www.mynameisczy.asia:7086/poker?openid=${uni.current_this19.store.getters.user_openid}&&user_name=${uni.current_this19.store.getters.user_name}&&user_avatar=${uni.current_this19.store.getters.user_avatar}`),
				success() {
					console.log('连接成功');
				},fail() {
					console.log('连接失败');
				}})				
			})
			uni.onSocketError(function(){
				uni.showToast({
					title:'正在重连',
					icon:'error'
				})
				uni.connectSocket({url:encodeURI(`wss://www.mynameisczy.asia:7086/poker?openid=${uni.current_this19.store.getters.user_openid}&&user_name=${uni.current_this19.store.getters.user_name}&&user_avatar=${uni.current_this19.store.getters.user_avatar}`),
				success() {
					console.log('连接成功');
				},fail() {
					console.log('连接失败');
				}})
			})
			// 如果发现没有登录，那么退出登录
			
			uni.onSocketMessage(function(res){
				let data=JSON.parse(res.data)
				console.log(data,'game data');
				if(data.state==6){
					// 拿到刚刚抢地主的openid
					uni.current_this19.users.forEach(item=>{
						if(item.openid==data.after_player_openid){
							uni.showToast({
								title:`${item.name}抢地主了`
							})			
						}
					})
					uni.current_this19.rule.current_player_openid=data.current_player_openid
				}else if(data.state==2){
					uni.current_this18.users.shift()
					uni.current_this18.users.shift()
					uni.current_this18.users.shift()
					data.current_persons.forEach(item=>{
						if(item.hasOwnProperty('openid')){
							uni.current_this18.users.push(item)
						}
					})
					if(data.hasOwnProperty('room_id'))
						uni.current_this18.room_id=data.room_id
					data.current_persons.forEach(item=>{
						if(item.openid==uni.current_this18.store.getters.user_openid){
							// 设置房间权限
							uni.current_this18.room_state=item.privilege
						}
					})
					uni.current_this18.count=uni.current_this18.users.length
					while(uni.current_this18.users.length<3){
						uni.current_this18.users.push({
							avatar:"https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
							name:'邀请好友'
						})
					}
					if(data.hasOwnProperty('lost')){
						if(data.lost){
							uni.showToast({
								title:'有人离开了',
								icon:'none'
							})
							setTimeout(()=>{
								uni.navigateBack()
							},1000)
						}
					}
					if(uni.current_this18.count<=1){
						uni.current_this19.users[0].ready=true
						uni.current_this19.time=0
						uni.current_this19.solo_state=true
						uni.current_this19.room_state=true
						uni.current_this19.user_state=true
						uni.current_this19.room_id=-1
						uni.current_this18.room_state=false
						setTimeout(()=>{
							uni.navigateBack()
						},1000)
					}
				}else if(data.state==7){
					uni.current_this19.users.forEach(item=>{
						if(item.openid==data.after_player_openid){
							uni.showToast({
								title:`${item.name}放弃地主了`
							})
						}
					})
					uni.current_this19.rule.current_player_openid=data.current_player_openid
					
				}else if(data.state==8){
					// 游戏结束
					uni.showToast({
						icon:'none',
						title:'因为所有人都没有抢地主,游戏结束'
					})
					uni.current_this18.room_state=false
					setTimeout(()=>{
						uni.navigateBack()
					},1000)
				}else if(data.state==9){
					// 地主产生，地主牌公布
					uni.current_this19.users.forEach(item=>{
						if(item.openid==data.master_openid){
							uni.showToast({
								title:`地主是${item.name}`,
								icon:'none'
							})
						}
					})
					uni.current_this19.master_cards.push(...data.master_card)
					if(uni.current_this19.rule.openid==data.master_openid){
						uni.current_this19.rule.out_card_state=true
						// 地主牌给他/她
						uni.current_this19.user_cards.push(...data.master_card.map(item=>{
							return {
								card:item,
								flag:0
							}
						}))
											
						uni.current_this19.user_cards=uni.current_this19.user_cards.sort((a,b)=>{
						                        let reg=/(\d)/g
						                        return Number(b.card.match(reg).join(''))-Number(a.card.match(reg).join(''))
						                      })
					// 权限赋值
						uni.current_this19.rule.master=true
					}
					// 当前玩家
					uni.current_this19.rule.current_player_openid=data.current_player_openid
					// 开始游戏
					uni.current_this19.rule.game_playing=true
				}else if(data.state==10){
					let {cards,current_player_openid}=data
					uni.current_this19.rule.current_player_openid=data.current_player_openid
					for(let i=0;i<uni.current_this19.users.length;i++){
						while(uni.current_this19.users[i].out_cards.length>0){
							uni.current_this19.users[i].out_cards.pop()
						}
					}	
					// 将数据推入
					uni.current_this19.users.forEach(item=>{
						data.cards.forEach(item2=>{
							if(item2.openid==item.openid){
								item.out_cards.push(...item2.cards)
							}
						})
					})
					if(data.cards[data.cards.length-1].openid==uni.current_this19.rule.openid){
						let reg=/(\d)/g
					// 将牌减去
					while(data.cards[data.cards.length-1].cards.length>0){
						let b=data.cards[data.cards.length-1].cards.pop()[0]
						
						for(let i=0;i<uni.current_this19.user_cards.length;i++){
							if(Number(uni.current_this19.user_cards[i].card.match(reg).join(''))==b){
								uni.current_this19.user_cards.splice(i,1)
								break
							}
						}
					}
					// 清空预出的牌
					while(uni.current_this19.user_out_cards.length)
						uni.current_this19.user_out_cards.pop()
					}
				}
			})
			let cards=JSON.parse(res.cards)
			
			// 将原用户信息推入
			this.users.push(...JSON.parse(res.users).map(item=>{item.out_cards=['14red_heart.svg','15black_peach.svg','14red_heart.svg','15black_peach.svg','14red_heart.svg','15black_peach.svg','14red_heart.svg','15black_peach.svg','14red_heart.svg','15black_peach.svg','14red_heart.svg','15black_peach.svg','14red_heart.svg','15black_peach.svg'];return item}))
			console.log(this.users);
			
			this.rule.room_id=Number(res.room_id)
			uni.current_this19.rule.current_player_openid=res.current_player_openid
			
			Object.keys(this.rule).forEach(item=>{
				if(item=='room_id'||item=='openid'||item=='current_player_openid'||item=='game_playing')
					return
				this.rule[item]=cards[item]
			})
			cards.cards=cards.cards.map(item=>{
				return {
					card:item,
					flag:0
				}
			})
			cards.cards=cards.cards.sort((a,b)=>{
						                        let reg=/(\d)/g
						                        return Number(b.card.match(reg).join(''))-Number(a.card.match(reg).join(''))
						                      })
			this.user_cards.push(...cards.cards)
			// 音乐
			this.audio=uni.createInnerAudioContext()
			this.audio.src="https://www.mynameisczy.asia/audio/poker.mp3"
			this.audio.autoplay=true
			this.audio.loop=true
			this.audio.obeyMuteSwitch=true
			// this.audio.play()
			this.audio.title="斗地主来自QQ音乐"
			this.audio.onError(err=>{
				console.log(err,'audio err');
			})
		},
		setup() {
			let store=reactive(useStore())
			let user_cards=reactive([])
			let users=reactive([])
			let audio=reactive(null)
			let master_cards=reactive([])
			// 默认属性
			let rule=reactive({
					room_id:-1,
				    count:17,
					current_player_openid:'',	
					pre_master_count:0,
					openid:store.getters.user_openid,
					master:false,
					cancel_master:false,
					game_playing:false,
					out_card_state:false
			})
			function get_master(){
				uni.sendSocketMessage({
					data:JSON.stringify({
						state:5,
						rule:rule
					})
				})
			}
			
		// 放弃抢地主
		function cancel_master(){
			uni.sendSocketMessage({
				data:JSON.stringify({
					state:6,
					rule:rule
				})
			})
		}
		let user_out_cards=reactive([])
		function out_cards(item,index){
			// 检测user_cout_cards内是否有这个牌
				// 有：删除
				// 没有：添加
			for(let i=0;i<user_out_cards.length;i++){
				if(user_out_cards[i].index==index&&user_out_cards[i].card.card==item.card){
					user_out_cards[i].card.flag=0
					// 将其删除
					user_out_cards.splice(i,1)
					return
				}
			}
				item.flag=1
				user_out_cards.push({
					card:item,
					index:index
				})
				user_out_cards=user_out_cards.sort((a,b)=>{
						                        let reg=/(\d)/g
						                        return Number(b.card.card.match(reg).join(''))-Number(a.card.card.match(reg).join(''))
						                      })
		}
		function out_cards_btn(){
			console.log(user_out_cards.map(item=>{
						return item.card.card
					}),'card');
			uni.sendSocketMessage({
				data:JSON.stringify({
					state:8,
					room_id:rule.room_id,
					openid:rule.openid,
					cards:user_out_cards.map(item=>{
						return item.card.card
					})
				})
			})
		}
			function back(){
				// uni.getImageInfo({
					// src:''
				// })
				if(getCurrentPages().length>1)
					uni.navigateBack();
				else
					uni.switchTab({
						url:'/pages/home/home'
					})
			}
		let head_height_child=ref(uni.getMenuButtonBoundingClientRect().height*1.7)
		let container_height=ref(uni.getSystemInfoSync().windowHeight)
		let container_width=ref(uni.getSystemInfoSync().windowWidth)
			// 地主产生后，将所有pre.master=false
			return {user_out_cards,out_cards_btn,back,master_cards,out_cards,user_cards,audio,rule,get_master,store,users,cancel_master,head_height_child,container_height,container_width}
		}
	}
</script>
<style scoped lang="less">
@import url('/general.less');
      /*竖屏样式*/
      .container {
		  position: absolute;
		  /* top:0%; */
		  display: flex;
		  flex-direction: column;
        transform-origin: 0 0;
		/* background-color:red; */
        // transform: rotateZ(90deg) translateY(-100%);
		&>view{
			flex-grow: 1;
			background-color:blanchedalmond;
			border-bottom:5px solid white;
			box-sizing: border-box;
		}
		.myself{
			padding: 0 20px;
			box-sizing: border-box;
			max-height:50px;
			display: flex;
			justify-content: space-between;
			.chat{
				display: flex;
				justify-content: center;
				align-items: center;
				&>view{
					// width:50px;
					display: flex;
					height:60%;
				}
				.chat2{
					background-color: yellowgreen;
					padding:10px;
					box-sizing: border-box;
					display: flex;
					justify-content: center;
					align-items: center;
					border-radius:10px;
				}
				.bei1{
					height:30px;
					width:30px;
					text-align: center;
					line-height: 30px;
					background-color: skyblue;
					border-radius: 50%;
					position: relative;
					z-index: 2;
				}
				.bei{
					transform: translateX(-10%);
					border-top-right-radius: 10px;
					border-bottom-right-radius: 10px;
					width:80px;
					text-align: center;
					background-color: rgba(0,0,0,.1);
				}
			}
			&>.user2{
				display: flex;
				justify-content: center;
				align-items: center;
				.avatar{
					max-height:70px;
					max-width:70px;
					min-height:70px;
					min-width:70px;
					width:70px;
					height:70px;
					&>image{
						transform: translateY(-30%);
						border-radius:50%;
						position: relative;
						z-index:2;
						border: 5px solid white;
						box-sizing: border-box;
						background-color: white;
					}
				}
				.my_name{
					background-color: rgba(0,0,0,.1);
					height:60%;
					border-top-right-radius: 15px;
					display: flex;
					align-items: center;
					border-bottom-right-radius: 15px;
					// width:70px;
					padding:0 10px 0 50px;
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
					max-width:150px;
					color: white;
					box-sizing: border-box;
					transform: translateX(-30%);
				}
			}
			&>view{
				display: flex;
			}
		}
		.others{
			display: flex;
			padding: 2% 10px 0 10px;
			justify-content: space-between;
			align-items: center;
			height:30%;
			.btns{
				position: absolute;
				width:150px;
				left:50%;
				top:50%;
				display: flex;
				align-items: center;
				justify-content: space-between;
				&>view{
					max-width:40%;
					display: flex;
					justify-content: center;
					align-items: center;
				}
				transform: translate(-50%,-50%);
			}
			&>view{
				height:100%;
				max-width:40%;
				min-width:40%;
				width: 40%;
				.person_cards{
					max-width:100%;
					display: grid;
					grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
					overflow: hidden;
					grid-gap:0px;
					&>view{
						height:50px;
						max-height:50px;
						max-width:30px;
						min-width:30px;
					}
					padding: 10px;
					box-sizing: border-box;
					// background-color: yellow;
				}
				display: flex;
				view{
					flex-grow: 1;
				}
			}
			&>view:nth-child(2){
				flex-direction: row-reverse;
			}
		}
		.cards{
			display: flex;
			max-height:120px;
			padding:0 50px;
			align-items: flex-end;
			&>view{
				max-width:75px;
				height:100px;
				width:75px;
				min-width:75px;
				transition:.1s linear;
				box-shadow:-2px 0px 10px -5px gray;
				display: flex;
				transform: translate(0%,0%);
				justify-content:flex-start;
				font-size: 20px;
				font-weight: bold;
				flex-grow: 1;
				box-sizing: border-box;
			}
		}
		.head{
			display: flex;	
			align-items: center;
			justify-content: space-around;
			.back{
				font-weight: bold;
				&:active{
					background-color: @border;
				}
			}
			&>.master_card{
				width:150px;
				display: flex;
				justify-content: space-around;
					background-color: rgba(0,0,0,.1);
				&>view{
					height:100%;
					min-width:30px;
					max-width:30px;
					width:30px;
					border-radius: 10px;
					color: black;
					transform: scale(1.2);
					font-weight: bold;
				}
			}
			padding:0 50px 0 30px;
			max-height:40px;
			&>view{
				border: 1px solid white;
				border-radius: 10px;
				// width:30px;
				padding:0 5px;
				height:30px;
				line-height: 30px;
				text-align: center;
			}
		}
    }
	.user{
		max-width:30%;
		&>view{
			margin-top:5px;
		}
		.avatar{
			max-height:70px;
			max-width:70px;
			min-height:70px;
			min-width:70px;
			width:70px;
			height:70px;
			&>image{
				border: 5px solid white;
				box-sizing: border-box;
				background-color: white;
				border-radius:50%;
			}
		}
		.name{
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
			max-width:100px;
			color: white;
			max-height:30px;
		}
		&>view{
			text-align: center;
			flex-grow: 1;
		}
	}
</style>
