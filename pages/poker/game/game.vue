<template>
	<view class="cover" v-if="load_state>0">
	</view>
	<view style="height:1px;width: 1px;overflow: hidden;" v-show="false">
		<image  @load="load_" v-for="(item,index) in cards" :key="index" :src="'https://www.mynameisczy.cn/cards_svg/'+item"></image>
	</view>
		<view class="container" :style="{width:(container_height)+'px',height:container_width+'px'}">
			<!-- ;background:mediumslateblue -->
			<view style="background:mediumslateblue;height:100%;width:100%;position: absolute;">
				<image src="https://www.mynameisczy.cn/play_loop/甜蜜.svg" style="position: absolute;top:50%;left:50%;transform:translate(-50%,-50%);height: 200px;width: 250px;"></image>
			</view>
			<view class='head' style="position: relative;z-index: 2;">
					<view @click="back" class="back">退出</view>
					<view class="master_card">
						<view v-for="(item,index) in master_cards" :key="index">
							<image :src="'https://www.mynameisczy.cn/cards_svg/'+item" style="width:100%;height:100%;" mode=""></image>
						</view>
					</view>
				<view style="background-color: rgb(255,66,54);font-weight: bold;">其他</view>
			</view>
			<view class="others"  style="position: relative;z-index: 2;">
				<template  v-for="(item,index) in users" :key="index" >
				<view  v-if='item.openid!==rule.openid'>
					<view class="user">
						<view class="chat_audio" :style="{transform:item.order?'translateX(-120%)':'translateX(120%)'}" v-show="audio2_manager.openid==item.openid" >{{audio_srcs[audio2_manager.item].title}}</view>
						<view class="avatar">
							<image :style="{height:'100%',width:'100%',border:'5px solid '+(item.openid==rule.current_player_openid?'rgb(255,66,54)':'white')}" :src='item.avatar' mode=""></image>
						</view>
						<view class="name">{{item.name}}</view>
						<view class="count">牌:{{item.count}}</view>
						<view class="master" style="width:50px;height:50px;">
							<image :src="'https://www.mynameisczy.cn/svgs/'+(item.openid==rule.master_id?'cap':'nongming')+'.svg'" style="width: 100%;height: 100%;" mode=""></image>
						</view>	
						</view>
					<view class="person_cards" :style="{paddingLeft:(item.order==1?(200-item.out_cards.length*30)<100?100:(200-item.out_cards.length*30):10)+'px'}">
						<view v-if="interval.openid==item.openid" style="position: absolute;font-size:30px;height:70px;width:70px;margin-top:-20px;">
							<view style="position: absolute;left: 50%;top: 50%;transform: translate(-50%,-50%);z-index: 100;">
								{{interval.count}}
							</view>
							<image :style="{height:'100%',width:'100%',animation:interval.count<=10?'clock 2s linear infinite':''}" src="https://www.mynameisczy.cn/svgs/clock.svg" mode="">
							</image>
						</view>
						<view class="state" v-if="item.state.length&&!(interval.openid==item.openid)" >
							<image style="width:100%;height:100%;" :src="'https://www.mynameisczy.cn/svgs/'+item.state+'.svg'" mode="" ></image>
						</view>
							<view v-if='!(interval.openid==item.openid)||item<=0' class="card" v-for="(item2,index) in item.out_cards" :key="index" :style="{transform:`translateX(-${index*55}%`}">
								<image :src="'https://www.mynameisczy.cn/cards_svg/'+item2" style="width:100%;height:100%;" mode=""></image>
						</view>
					</view>
				</view>
				</template>
					<view class="btns">
						<view class="">
							<view class="myself_out_cards">
							<template v-for="(item,index) in users" :key="index">
							<template v-for="(item2,index) in item.out_cards" :key="index">
							<template  v-if="item.openid==rule.openid">
								<view class="state" v-if="item.state.length" >
									<image style="width:100%;height:100%;" :src="'https://www.mynameisczy.cn/svgs/'+item.state+'.svg'" mode="" ></image>
								</view>
								<view class="myself_out_card" :style="{transform:`translateX(-${index*55}%`}">
									<image :src="'https://www.mynameisczy.cn/cards_svg/'+item2" style="width:100%;height:100%;" mode=""></image>
								</view>
							</template>
							</template>
							</template>
								</view>
						</view>
						<view class="">
						<view class="btn_1" style="margin-top:-20px;position:rel	ative;z-index: 200;"  @click="get_master" v-if='rule.current_player_openid==rule.openid&&!rule.master&&!rule.cancel_master&&!rule.game_playing'>
							{{master_count<=0?'叫地主':'抢地主'}}
						</view>
						<view class="btn2" style="margin-top:-20px;position:relative;z-index: 200;"   v-if='rule.pre_master_count<=0&&rule.current_player_openid==rule.openid&&!rule.cancel_master&&!rule.game_playing' @click="cancel_master">不抢</view>
						<view class="btn2" style="margin-top:-20px;position:relative;z-index: 200;" v-if="rule.openid==rule.current_player_openid&&rule.game_playing&&!new_round" @click="no_card">
							不要
						</view>
						<view v-if="interval.openid==rule.openid&&interval.count>0" style="position: relative;font-size:30px;height:70px;width:70px;margin-top:-70px;">
							<view style="position: absolute;left: 50%;top: 50%;transform: translate(-50%,-50%);z-index: 100;">
								{{interval.count}}
							</view>
							<image :style="{height:'100%',width:'100%',animation:interval.count<=10?'clock 2s linear infinite':''}" src="https://www.mynameisczy.cn/svgs/clock.svg" mode="">
							</image>
						</view>
						<view class="btn_1" style="margin-top:-20px;position:relative;z-index: 200;" v-if="rule.openid==rule.current_player_openid&&rule.game_playing" @click="out_cards_btn">
							出牌
						</view>
						</view>
					</view>
			</view>
			<view class="cards_out">
					<view class="cards" :style="{width:user_cards.length*35+'px',transform:`${(user_cards.length>=20?'translateX(120px)':'translateX(120px)')}`}">
					<!-- <view class="card" @tap="out_cards(item,index)" :style="{transform:`translate(-${index*(user_cards.length>=20?65:55)}%,-${item.flag?20:0}%)`}" v-for="(item,index) in user_cards" :key="index"> -->
						<image :src="'https://www.mynameisczy.cn/cards_svg/'+item.card" style="width:100%;height:100%;" mode=""></image>
					</view>
				</view>
			</view>
			<view class="myself">
				<!-- <view class="user2" v-for="(item,index) in users" :key="index" v-if='item.openid==rule.openid'> -->
				<template  v-for="(item,index) in users" :key="index" >
				<view class="user2" v-if='item.openid==rule.openid'>
					<view class="avatar">
					<view class="chat_audio" style="transform: translate(25%,-200%);" v-show="audio2_manager.openid==item.openid" >{{audio_srcs[audio2_manager.item].title}}</view>
						<image :style="{height:'100%',width:'100%',border:'5px solid '+(item.openid==rule.current_player_openid?'rgb(255,66,54)':'white')}" :src='item.avatar' mode=""></image>
					</view>
					<view class="my_name">{{item.name}}</view>
					<view class="my_count"  style="position: relative;z-index: 2;">牌:{{item.count}}</view>
					<view style="margin-left:10px;width:50px;height:50px;">
						<!-- {{rule.master?'地主':'农民'}} -->
						<image :src="'https://www.mynameisczy.cn/svgs/'+(rule.master?'cap':'nongming')+'.svg'" style="width: 100%;height: 100%;position: relative;z-index: 2;" mode=""></image>
					</view>
				</view>
				</template>
				<view class="chat">
					<view>
						<view class="bei1">
						倍
						</view>
					<view class="bei">
						{{score}}
					</view>
					</view>
					<view class="chat2"  style="position: relative;z-index: 2;">
							<view class="cha" @click="chat_st=!chat_st">
								聊天
							</view>
							<view class="option" :style="{height:chat_st?'155px':'0px'}">
								<view  v-for="(item,index) in audio_srcs" :key="index" @click="play_audio(index)">{{item.title}}</view>
							</view>
					</view>
				</view>
			</view>
		</view>
</template>

<script>
	import page from '../../inner_page/inner_page.vue'
	import navigation from '../../navigation/navigation_all.vue'
	import {reactive,ref,watch} from 'vue'
	import {useStore} from 'vuex'
	export default {
		components:{
			navigation,page
		},
		onUnload() {
			this.audio.stop()
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
						uni.current_this18.mode.current=data.type
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
						uni.current_this18.room_id=''
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
				}else if(data.state==100){
					uni.current_this18.mes.push(data.mes)
					uni.current_this18.scrollTop+=200
					uni.hideLoading()
				}else if(data.state==17){
					uni.current_this18.mode.current=data.type
				}
			})
		},
		onLoad(res) {
			this.container_height=uni.global.height
			this.container_width=uni.global.width
			
			uni.current_this19=this
			uni.onSocketClose(function(e){
				uni.navigateBack()
				uni.current_this18.socket_state=false
				uni.showLoading({
					title:'正在尝试重连'
				})
				let l=uni.current_this18.users.length
				for(let i=0;i<l;i++){
					uni.current_this18.users.pop()
				}
				uni.current_this18.users.push([{
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
				uni.connectSocket({url:encodeURI(`wss://www.mynameisczy.cn:7086/poker?openid=${uni.current_this18.store.getters.user_openid}&&user_name=${uni.current_this18.store.getters.user_name}&&user_avatar=${uni.current_this18.store.getters.user_avatar}`),
				success() {
					uni.hideLoading()
					uni.current_this18.socket_state=true
				}})
			})
			uni.onSocketError(function(e){
				uni.navigateBack()
				uni.current_this18.socket_state=false
				uni.showLoading({
					title:'正在尝试重连'
				})
				// 踢掉所有人
				let l=uni.current_this18.users.length
				for(let i=0;i<l;i++){
					uni.current_this18.users.pop()
				}
				uni.current_this18.users.push([{
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
				uni.connectSocket({url:encodeURI(`wss://www.mynameisczy.cn:7086/poker?openid=${uni.current_this18.store.getters.user_openid}&&user_name=${uni.current_this18.store.getters.user_name}&&user_avatar=${uni.current_this18.store.getters.user_avatar}`),
					success() {
						uni.hideLoading()
						uni.current_this18.socket_state=true
					}
				})
			})
			// 如果发现没有登录，那么退出登录
			
			uni.onSocketMessage(function(res){
				let data=JSON.parse(res.data)
				if(data.state==6){
					// 拿到刚刚抢地主的openid
					uni.current_this19.users.forEach(item=>{
						if(item.openid==data.after_player_openid){
							if(uni.current_this19.master_count>0){
								item.state='get_master'
							}
							else{
								item.state='say_master'
								// uni.showToast({
									// title:`${item.name}抢地主了`
								// })			
							}
						}
					})
					uni.current_this19.score=data.score
					 // 9 10
					
					uni.current_this19.master_count=uni.current_this19.master_count+1
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
							item.state='abandon_master'
							// uni.showToast({
								// title:`${item.name}放弃地主了`
							// })
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
						// 清空状态
						item.state=''
						if(item.openid==data.master_openid){
							item.master=true
							item.count+=data.master_card.length
							uni.showToast({
								title:`地主是${item.name}`,
								icon:'none'
							})
						}
					})
					uni.current_this19.score=data.score
					data.master_card.sort((a,b)=>{
										let reg=/(\d)/g
										return Number(b.match(reg).join(''))-Number(a.match(reg).join(''))
									  })
					uni.current_this19.master_cards.push(...data.master_card)
					uni.current_this19.rule.master_id=data.master_openid
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
					
					uni.current_this19.user_cards.forEach(item=>{
						item.flag=0
					})
					for(let i=0;i<uni.current_this19.user_out_cards.length;i++)
						uni.current_this19.user_out_cards.pop()
				}else if(data.state==10){
					let {cards,current_player_openid}=data
					if(current_player_openid.length<=0){
						uni.current_this19.interval.openid=''
					}
					if(uni.current_this19.rule.openid==data.current_player_openid){
						uni.current_this19.new_round=data.new_round
					}
					for(let i=0;i<uni.current_this19.users.length;i++){
						while(uni.current_this19.users[i].out_cards.length>0){
							uni.current_this19.users[i].out_cards.pop()
						}
					}	
					// 将数据推入
					uni.current_this19.users.forEach(item=>{
						data.cards.forEach(item2=>{
							if(item2.openid==item.openid){
								item.state=''
								item.out_cards.push(...item2.cards)
								item.count=item2.count
							}
						})
					})
					uni.current_this19.score=data.score
					if(data.cards[data.cards.length-1].openid==uni.current_this19.rule.openid){
						let reg=/(\d)/g
					// 将牌减去
					while(data.cards[data.cards.length-1].cards.length>0){
						let b=data.cards[data.cards.length-1].cards.pop()
						for(let i=0;i<uni.current_this19.user_cards.length;i++){
							if(uni.current_this19.user_cards[i].card==b){
								uni.current_this19.user_cards.splice(i,1)
								break
							}
						}
					}
					// 清空预出的牌
					while(uni.current_this19.user_out_cards.length)
						uni.current_this19.user_out_cards.pop()
					}
					uni.current_this19.rule.current_player_openid=data.current_player_openid
				}else if(data.state==20){
					uni.showToast({
						title:data.errMes,
						icon:'error'
					})
				}else if(data.state==21){
					uni.showToast({
						title:data.errMes,
						icon:'error'
					})					
				}else if(data.state==11){
					if(uni.current_this19.rule.openid==data.current_player_openid){
						uni.current_this19.new_round=data.new_round
					}
					uni.current_this19.users.forEach(item=>{
						if(item.openid==data.openid){
							for(let i=0;item.out_cards.length;i++){
								item.out_cards.pop()
							}
							item.state='no_out'
							// uni.showToast({
								// title:`${item.name}不要`
							// })
						}
					})
					uni.current_this19.rule.current_player_openid=data.current_player_openid
				}else if(data.state==14){
					uni.showToast({
							title:`${uni.current_this19.rule.master_id==data.winner_openid?'地主':'农民'}胜利`
						})
						for(let i=0;i<uni.current_this19.users.length;i++){
							while(uni.current_this19.users[i].out_cards.length>0){
								uni.current_this19.users[i].out_cards.pop()
							}
						}	
						data.other_cards.forEach(item=>{
							item.cards.sort((a,b)=>{
								            let reg=/(\d)/g
						                    return Number(b.match(reg).join(''))-Number(a.match(reg).join(''))
							})
						})
						// 将数据推入
						uni.current_this19.users.forEach(item=>{
								if(item.openid==uni.current_this19.rule.openid){
										return
								}
							data.other_cards.forEach(item2=>{
								if(item2.openid==item.openid){
									item.state=''
									item.out_cards.push(...item2.cards)
								}
							})
						})
					setTimeout(()=>{
						uni.navigateBack()
					},4000)
				}else if(data.state==15){
					uni.current_this19.interval.count=data.count
					if(data.current_player_openid!=uni.current_this19.interval.openid)
						uni.current_this19.interval.openid=data.current_player_openid
				}else if(data.state==16){
					if(uni.current_this19.audio2_manager.audio_controller)
						return
					uni.current_this19.audio2_manager.audio_controller=true
					// 音乐
					uni.current_this19.audio2=uni.createInnerAudioContext()
					uni.current_this19.audio2_manager.item=data.content
					uni.current_this19.audio2_manager.openid=data.openid
					uni.current_this19.audio2.src=uni.current_this19.audio_srcs[data.content].src
					uni.current_this19.audio2.obeyMuteSwitch=true
					uni.current_this19.audio2.play()
					uni.current_this19.audio2.onEnded(e=>{
						uni.current_this19.audio2_manager.openid=''
						uni.current_this19.audio2_manager.audio_controller=false
					})
					uni.current_this19.audio2.onError(err=>{
						uni.current_this19.audio2_manager.openid=''
						uni.current_this19.audio2_manager.audio_controller=false
					})
				}
			})
			let cards=JSON.parse(res.cards)
			
			
			this.rule.room_id=res.room_id
			uni.current_this19.rule.current_player_openid=res.current_player_openid
			
			Object.keys(this.rule).forEach(item=>{
				if(item=='room_id'||item=='openid'||item=='current_player_openid'||item=='game_playing'||item=='master_id')
					return
				this.rule[item]=cards[item]
			})
			
			let count=0
			// 将原用户信息推入
			this.users.push(...JSON.parse(res.users).map(item=>{
				item.out_cards=[];
				item.state=''		
				if(item.openid!=uni.current_this19.rule.openid){
					item.order=count
					count++
				}
				return item}))
			
			cards.cards=cards.cards.map(item=>{
				return {
					card:item,
					flag:0
				}
			})
			// 排序函数（返回为真>0，降序<=0，否升序）
			// 会改变原数组
			cards.cards.sort((a,b)=>{
								let reg=/(\d)/g
								return Number(b.card.match(reg).join(''))-Number(a.card.match(reg).join(''))
							  })
			this.user_cards.push(...cards.cards)
			// 音乐
			this.audio=uni.createInnerAudioContext()
			this.audio.src="https://www.mynameisczy.cn/audio/poker.mp3"
			this.audio.autoplay=true
			this.audio.loop=true
			this.audio.obeyMuteSwitch=true
			// this.audio.play()
			this.audio.title="斗地主来自QQ音乐"
			this.audio.onError(err=>{
			})
		},
		setup() {
			let cards=reactive([
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
			    ])
			let interval=reactive({
				openid:'',
				count:30
			})
			let load_state=ref(54)
			let store=reactive(useStore())
			let user_cards=reactive([])
			let users=reactive([])
			let score=ref(10)
			let audio=reactive(null)
			let audio_srcs=reactive([{title:'催促',src:'https://www.mynameisczy.cn/audio/hurry_poker.mp3'},{title:'鼓励',src:'https://www.mynameisczy.cn/audio/encourage.mp3'},{title:'信心',src:'https://www.mynameisczy.cn/audio/confidence.mp3'},{title:"求饶",src:'https://www.mynameisczy.cn/audio/dont_kill_me.mp3'},{title:'我来',src:'https://www.mynameisczy.cn/audio/letmetry.mp3'}])
			let audio2=reactive(null)
			let chat_st=ref(false)
			let master_cards=reactive([])
			let new_round=ref(true)
			let get_master_state=ref(true)
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
					out_card_state:false,
					master_id:''
			})
			function get_master(){
				if(get_master_state.value){
					get_master_state.value=false
					uni.sendSocketMessage({
						data:JSON.stringify({
							state:5,
							rule:rule
						}),
						success(){
							setTimeout(()=>{
								get_master_state.value=true							
							},1000)
						}
					})
				}
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
		let audio2_manager=reactive({
			audio_controller:false,
			item:0,
			openid:''
		});
		function play_audio(index){
			if(audio2_manager.audio_controller)
				return
			chat_st.value=false
			uni.sendSocketMessage({
				data:JSON.stringify({
					state:11,
					room_id:rule.room_id,
					openid:rule.openid,
					content:index
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
		let master_count=ref(0)
		let head_height_child=ref(uni.getMenuButtonBoundingClientRect().height*1.7)
		let container_height=ref(0)
		let container_width=ref(0)
		function no_card(){
			uni.sendSocketMessage({
				data:JSON.stringify({
					state:9,
					room_id:rule.room_id,
					openid:rule.openid
				})
			})
		}	
		function load_(){
			uni.showLoading({
				title:'资源加载中: '+load_state.value+"'s"
			})
			if((load_state.value-1)<=0){
				setTimeout(()=>{
					uni.hideLoading()
					load_state.value--
				},500)
				return
			}
			load_state.value--
		}
			// 地主产生后，将所有pre.master=false
			return {audio2_manager,audio_srcs,audio2,interval,play_audio,chat_st,cards,score,get_master_state,load_,load_state,no_card,master_count,new_round,user_out_cards,out_cards_btn,back,master_cards,out_cards,user_cards,audio,rule,get_master,store,users,cancel_master,head_height_child,container_height,container_width}
		}
	}
</script>
<style>
	@keyframes clock{
		from{
			transform: rotate(0deg);
		}35%{
			transform: rotate(30deg);
		}
		85%{
			transform: rotate(-30deg);
		}
		to{
			transform: rotate(0deg);
		}
	}
</style>
<style scoped lang="less">
@import url('/general.less');
.chat_audio{
position: absolute;transform: translateX(-120%);background-color: white;border-radius: 5px;padding:5px 10px;
}
.chat2{
	// display: flex;
	padding:0;
	// flex-direction: column-reverse;
	max-height:30px;
	min-height:30px;
	height:30px;
	&>view{
		text-align: center;
	}
	// display:flex;
	// flex-direction: column-reverse;	
}
.chat2>.cha{
	width:100%;
	max-height:30px;
	line-height:30px;
	min-height:30px;
	height:30px;
}
.option{
	// position: relative;
	position: absolute;
	transform: translate(-10%,-100%);
	width:60px;
	border-radius: 10px;
	border-bottom-right-radius: 20px;
	border-bottom-left-radius: 20px;
	background-color: rgba(0,0,0,.4);
	transition: .5s ease;
	overflow: hidden;
	height:0px;
	&>view:first-child{
		border-top: none;
	}
	&>view{
		width:100%;
		color: white;
		max-height:30px;
		border-top:1px solid rgba(255,255,255,.1);
		line-height:30px;
		min-height:30px;
		height:30px;
		&:active{
			background-color:rgba(255,255,255,.1);
		}
	}
}
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
			// background-color:blanchedalmond;
			// background:mediumslateblue;
			// border-bottom:5px solid white;
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
					background-color: rgb(255,66,54);
					width:45px;
					border-radius:10px;
				}
				.bei1{
					height:30px;
					width:30px;
					text-align: center;
					line-height: 30px;
					background-color: rgb(255,66,54);
					font-weight: bold;
					border-radius: 50%;
					position: relative;
					z-index: 2;
				}
				.bei{
					transform: translateX(-10%);
					border-top-right-radius: 10px;
					border-bottom-right-radius: 10px;
					width:80px;
					display: flex;
					align-items: center;
					justify-content: center;
					background-color: rgba(255,255,255,.5);
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
					// background-color: rgba(0,0,0,.1);
					background-color: rgba(255,255,255,.5);
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
					// color: white;
					color: rgb(38,27,44);
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
				flex-direction: column;
				width:150px;
				left:50%;
				top:50%;
				display: flex;
				align-items: center;
				justify-content: space-between;
				&>view{
					min-height:45%;
					flex-grow: 1;
					max-width:100%;
					min-width:100%;
					display: flex;
					justify-content: center;
					align-items: center;
				}
				&>view:nth-child(1){
					display: flex;
					align-items: flex-end;
					justify-content: center;
					&>.myself_out_cards{
						display: flex;
						padding-left:130px;
						box-sizing: border-box;
						&>view{
							box-shadow:-2px 0px 10px -7px gray;
							height:55px;
							&>image{
								transform: scale(1.3);
							}
							max-height:55px;
							max-width:35px;
							min-width:35px;
						}
					}
				}
				&>view:nth-child(2){
					align-items: flex-start;
					min-height:55%;
					justify-content: space-around;
					&>view{
						max-width:30%;
					}
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
					min-width:100%;
					overflow:hidden;
					// background-color: rgba(0,0,0,.1);
					display: flex;
					&>.card{
							box-shadow:-2px 0px 10px -7px gray;
							max-height:55px;
							max-width:35px;
							min-width:35px;
							&>image{
								transform: scale(1.3);
							}
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
		.cards_out{
			display: flex;
			justify-content: center;
			box-sizing: border-box;
			padding-bottom:10px;
			align-items:flex-end;
		}
		.cards{
			display: flex;
			max-height:120px;
			box-sizing: border-box;
			// padding:0 45px;
			// width:90%;
			align-items: flex-end;
			&>view{
				max-width:75px;
				height:90px;
				&>image{
					max-height:100%;
					transform: scale(1.3);
					min-height:100%;
					max-width: 100%;
					min-width: 100%;
				}
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
				background-color: rgb(255,66,54);
				&:active{
					background-color:white;
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
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		max-width:30%;
		&>view{
			// margin-top:5px;
		}
		.name{
			min-height:20px;
			color: rgb(38,27,44);
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
		}
	}
	.state{
		max-width:70px;
		min-width:70px;
		height:40px;
		max-height:40px;
	}
	.cover{
		width: 100%;height:100%;background-color: black;position: absolute;z-index:9999;
	}
</style>
