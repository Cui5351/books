<template>
	<navigation show_back='true'>斗地主</navigation>
	<page>
		<view class="container">
		<image src="https://www.mynameisczy.asia/rabbit/back.jpg" style="position: absolute;top:0;height: 100%;width: 100%;opacity:0.8;" mode=""></image>
		<view class="invitation">
			<view class="title">
				<view class="tit" v-if='!p_time.flag'>
					我的队伍
				</view>
				<view class="load"  v-if='p_time.flag'>
					{{p_time.flag?'正在匹配:'+p_time.time:'1'}}
				</view>
			</view>
			<view class="users">
				<view class="user" v-for="(item,index) in users" :key="index">
					<button open-type="share" type='default' class="share_btn">
					<view class="avatar" @click="invation(item)" :style="{border:'7px solid '+(item.privilege?'orangered':'white')}">
						<!-- privilege -->
						<!-- border:7px solid white; -->
						<image :src="item.avatar"></image>
						<view class="ready" :style="{backgroundColor:item.ready?'rgb(102,188,39)':'orangered'}">
							{{item.ready?'已准备':'未准备'}}
						</view>
					</view>
					</button>
					<view class="name">
						{{item.name}}
					</view>
				</view>
			</view>
			<view class="btns" v-if="count>=3&&room_state">
				<view class="btn2" @click='start_game'>
					开始游戏
				</view>				
			</view>
			<view class="btns" v-if='!(count>=3&&room_state)'>
				<view class="btn2" @click="rand_persons" v-if='room_state'>
					{{solo_state?'匹配队友':'匹配中'}}
				</view>
				<view class="btn" @click="change_user_state" :style="{backgroundColor:user_state?'rgb(79,70,229)':'rgba(255,255,255,0)',color:user_state?'white':'black'}" v-if="!room_state">
					{{user_state?'取消准备':'准备'}}
				</view>
<!-- 				<view class="">
					{{p_time.flag?'正在匹配'+p_time.time:''}}
				</view> -->
			</view>
		</view>
		</view>
	</page>
</template>

<script>
	import page from '../inner_page/inner_page.vue'
	import navigation from '../navigation/navigation_all.vue'
	import {reactive,ref} from 'vue'
	import {useStore} from 'vuex'
	export default {
		components:{
			navigation,page
		},
		async onShareAppMessage(res) {
			if(this.room_id<0&&this.position>=0){
				// 创建房间
				uni.sendSocketMessage({
					data:JSON.stringify({
						state:1,
						position:this.position
					})
				})
				return
			}else if(this.room_id>=0&&this.position>=0){
				// 直接邀请
				return {
					title: `敢不敢和我来场较量`, //分享的名称
					path: '/pages/poker/poker?room_id='+this.room_id
					// mpId:'' //此处配置微信小程序的AppId
				}
			}
			else{
				uni.showToast({
					title:'网络原因,请稍后重试',
					icon:'none'
				})
			}
		},
		async onLoad(res) {
			uni.onSocketOpen(function(){
				let timer=setInterval(function(){
				if(res.hasOwnProperty('room_id')&&uni.current_this18.position>=0){
					uni.showToast({
						title:'进入房间'
					})
					uni.sendSocketMessage({
						data:JSON.stringify({
							state:7,	
							position:uni.current_this18.position,
							room_id:Number(res.room_id)
						})
					})
					clearInterval(timer)
				}
				if(!res.hasOwnProperty('room_id'))
					clearInterval(timer)
				// else{
					// uni.showToast({
						// title:'加入失败',
						// icon:'none'
					// })
				// }
				},1000)
			})
			
			wx.showShareMenu({
				withShareTicket: true,
				menus: ["shareAppMessage", "shareTimeline"]
			})
			
			uni.current_this18=this
			// 连接socket
			let timer2=setInterval(function(){
				if(uni.current_this18.store.getters.user_openid.length<=0){
					uni.showToast({
						title:'请先登录',
						icon:'error'
					})
					clearInterval(timer2)
					uni.switchTab({
						url:'/pages/home/home'
					})
					return
				}
				clearInterval(timer2)
				uni.connectSocket({url:encodeURI(`wss://www.mynameisczy.asia:7086/poker?openid=${uni.current_this18.store.getters.user_openid}&&user_name=${uni.current_this18.store.getters.user_name}&&user_avatar=${uni.current_this18.store.getters.user_avatar}`),
				})
			},200)
			
			uni.onSocketClose(function(){
				uni.showToast({
					title:'离开了',
					icon:'error'
				})
				uni.connectSocket({url:encodeURI(`wss://www.mynameisczy.asia:7086/poker?openid=${uni.current_this19.store.getters.user_openid}&&user_name=${uni.current_this19.store.getters.user_name}&&user_avatar=${uni.current_this19.store.getters.user_avatar}`),
				})				
			})
			
			uni.onSocketError(function(){
				uni.showToast({
					title:'正在重连',
					icon:'error'
				})
				uni.connectSocket({url:encodeURI(`wss://www.mynameisczy.asia:7086/poker?openid=${uni.current_this18.store.getters.user_openid}&&user_name=${uni.current_this18.store.getters.user_name}&&user_avatar=${uni.current_this18.store.getters.user_avatar}`),
				})
			})
			
			uni.onSocketMessage(function(res){
				let data=JSON.parse(res.data)
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
					// 有人取消准备
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
			uni.showLoading({
				title:'进入中',
				mask:true
			})
			await this.await_position()
			
			uni.hideLoading()
		},
		onUnload() {
			uni.closeSocket()
			uni.onSocketClose(()=>{})
			clearInterval(this.timer)
		},
		setup() {
			let room_state=ref(true)
			let position=ref(-1)
			let room_id=ref(-1)
			let p_time=reactive({
				time:0,
				flag:0,
				timer:0
			})
			let user_state=ref(true)
			let solo_state=ref(true)
			let count=ref(1)
			const store=reactive(useStore())
			let users=reactive([{
				avatar:store.getters.user_avatar,
				name:store.getters.user_name,
				openid:store.getters.user_openid,
				ready:true
			},{
				avatar:"https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
				name:'邀请好友'
			},{
				avatar:"https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
				name:'邀请好友'
			}])
			let timer=ref(0)
			function rand_persons(){
				for(let i=0;i<users.length;i++){
					if(users[i].ready==false&&users[i].hasOwnProperty('openid')){
						uni.showToast({
							icon:'none',
							title:'有人未准备'
						})
						return
					}
				}
				solo_state.value=!solo_state.value
				if(solo_state.value){
					clearInterval(timer.value)
					return
				}
				timer.value=setInterval(function(){
					if(solo_state.value){
						clearInterval(timer.value)
						return
					}
					if(count.value>=3){
						solo_state.value=true
						clearInterval(timer.value)
						return
					}
				// 匹配人
				// 多人匹配：3
				// 单人匹配：2
				uni.sendSocketMessage({
					data:JSON.stringify({
						openid:store.getters.user_openid,
						user_name:store.getters.user_name,
						avatar:store.getters.user_avatar,
						room_id:room_id.value,
						state:2
					})
				})
				// 将信息发送
			},1000)
			}
		function invation(item){
			if(item.hasOwnProperty('openid')){
				if(item.openid.length>=10)
					return
			}
			uni.showToast({
				title:'发送邀请',
				icon:'success'
			})
		}
		function change_user_state(){
			user_state.value=!user_state.value
			// 取消准备
			uni.sendSocketMessage({
				data:JSON.stringify({
					state:3,
					openid:store.getters.user_openid,
					room_id:uni.current_this18.room_id,
					ready:uni.current_this18.user_state
				})
			})
		}
		function start_game(){
			for(let i=0;i<users.length;i++){
				if(users[i].ready==false&&users[i].hasOwnProperty('openid')){
					uni.showToast({
						icon:'none',
						title:'有人未准备'
					})
					return
				}
			}
			uni.showToast({
				title:'开始游戏'
			})
			// 开始游戏
			uni.sendSocketMessage({
				data:JSON.stringify({
					state:4,
					room_id:uni.current_this18.room_id
				})
			})
		}
		function await_position(){
			function fun(){
				return new Promise(res=>{
					let timer=setInterval(()=>{
						if(uni.current_this18.position>=0){
							res(uni.current_this18.position)
							clearInterval(timer)
						}
					},1000)
				})
			}
			return fun()
		}
			return{position,await_position,p_time,count,start_game,change_user_state,room_id,store,users,rand_persons,solo_state,timer,invation,room_state,user_state}
		}
	}
</script>

<style lang="less">
	@import url('@/general.less');
	.container{
		// background-color: rgba(255,0,0,.3);
		height:100%;
		width: 100%;
	}
.invitation{
	position: absolute;
	display: flex;
	flex-direction: column;
	top:50%;
	transform: translateY(-50%);
	height:300px;
	border-radius: 70px;
	background-color: rgba(255,255,255,.6);
	width:100%;
	box-sizing: border-box;
	&>.users{
		justify-content: space-around;
		&>.user{
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			box-sizing: border-box;
			.name{
				background-color: rgba(0,0,0,.2);
				padding:5px 10px;
				border-radius: 10px;
				color: white;
				height:20px;
			}
			.share_btn{
				margin:0;
				padding: 0;
				border:none;
				outline: none;
				border-radius:0;
				color: transparent;
				text-decoration: none;
				border-radius:50%;
				background-color: transparent;
			}
			.avatar{
				background-color: white;
				border:7px solid white;
				border-radius: 50%;
				margin-bottom:10px;
				width:80px;
				height:80px;
				display: flex;
				flex-direction: column;
				position: relative;
				&>image{
					border-radius:50%;
					width:100%;height:100%;
				}
				&>.ready{
					position: absolute;
					top:100%;
					height:20px;
					display: flex;
					justify-content: center;
					align-items: center;
					background-color: rgb(102,188,39);
					color:white;
					opacity:0.9;
					box-shadow: 0px 2px 10px -1px gray;
					font-size:13px;
					left:50%;
					width:50%;
					border-radius: 10px;
					transform: translateY(-100%) translateX(-50%);
					padding:5px 10px;
				}
			}
		}
	}
	&>.title{
		padding:0 40px;
		box-sizing: border-box;
		display:flex;
			font-size:30px;
		.tit{
			color: black;
			font-weight: bold;
			margin-right:10px;
		}
		&>.load{
		}
	}
	&>.btns{
		justify-content: space-around;
		&>view{
			width:100px;
		}
	}
	&>view{
		flex-grow: 1;
		justify-content: center;
		display: flex;
		align-items: center;
	}
}
</style>
