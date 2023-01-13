<template>
	<navigation show_back='1'>进入阶段</navigation>
	<page>
		<view class="container">
			<view class="users">
				<view class="user" v-for="(item,index) in users" :key="index">
					<view class="avatar" :style="{border:'7px solid '+(rule.current_player_openid==item.openid?'red':'white')}">
						<image :src="item.avatar"></image>
						<view class="ready" :style="{backgroundColor:item.ready?'rgb(102,188,39)':'orangered'}">
							{{item.ready?'已准备':'未准备'}}
						</view>
					</view>
					<view class="name">
						{{item.name}}
					</view>
				</view>
			</view>
			<view class="menu" v-if="rule.pre_master_count>=0">
				<view class="btn2" @click="get_master" v-show='rule.current_player_openid==rule.openid&&!rule.master&&!rule.cancel_master&&!rule.game_playing'>
					{{rule.total_count?'抢地主':'叫地主'}}
				</view>
				<view class="btn" v-show='rule.pre_master_count<=0&&rule.current_player_openid==rule.openid&&!rule.cancel_master&&!rule.game_playing' @click="cancel_master">
					不叫
				</view>
				<view class="btn2" v-show="rule.openid==rule.current_player_openid&&rule.game_playing" @click="out_cards">
					出牌
				</view>
			</view>
			<view class="cards">
				<view class="card" v-for="(item,index) in user_cards" :key="index">
					{{item}}
				</view>
			</view>
		</view>
	</page>
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
			
			uni.current_this19=this
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
					setTimeout(()=>{
						uni.showToast({
							title:`地主牌是${data.master_card}`,
							duration:2000
						})
					},2000)
					if(uni.current_this19.rule.openid==data.master_openid){
						// 地主牌给他/她
						uni.current_this19.user_cards.push(...data.master_card)
					// 权限赋值
						uni.current_this19.rule.master=true
					}
					// 当前玩家
					uni.current_this19.rule.current_player_openid=data.current_player_openid
					// 开始游戏
					uni.current_this19.rule.game_playing=true
				}
			})
			let cards=JSON.parse(res.cards)
			
			// 将原用户信息推入
			this.users.push(...JSON.parse(res.users))
			
			this.rule.room_id=Number(res.room_id)
			uni.current_this19.rule.current_player_openid=res.current_player_openid
			
			Object.keys(this.rule).forEach(item=>{
				if(item=='room_id'||item=='openid'||item=='current_player_openid'||item=='game_playing')
					return
				this.rule[item]=cards[item]
			})
			console.log('rule',this.rule);
			cards.cards.forEach(item=>{
				setTimeout(()=>{
					this.user_cards.push(item)
				},300)
			})
			
			
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
			// 默认属性
			let rule=reactive({
					room_id:-1,
				    count:17,
					current_player_openid:'',	
					pre_master_count:0,
					openid:store.getters.user_openid,
					master:false,
					cancel_master:false,
					game_playing:false
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
		function out_cards(){
			uni.showToast({
				title:'出牌'
			})
		}
			// 地主产生后，将所有pre.master=false
			return {out_cards,user_cards,audio,rule,get_master,store,users,cancel_master}
		}
	}
</script>

<style lang="less">
@import url('@/general.less');
.container{
	height:100%;
	width:100%;
&>.users{
		margin:20px 0;
		justify-content: space-around;
		display: flex;
		&>.user{
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			box-sizing: border-box;
			&>.name{
				background-color: rgba(0,0,0,.2);
				padding:5px 10px;
				border-radius: 10px;
				color: white;
				height:20px;
			}
			&>.avatar{
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
	&>.menu{
		height:10%;
		display: flex;
		justify-content: space-around;
	}
	&>.cards{
		width:100%;
		height:40%;
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		background-color: black;
		grid-gap: 10px;
		&>.card{
			border: 5px solid red;
			box-sizing: border-box;
			display: flex;
			background-color: white;
			font-size:30px;
			border-radius: 10px;
			justify-content:center;
			padding:20px 0 0 0;
		}
	}
}
</style>
