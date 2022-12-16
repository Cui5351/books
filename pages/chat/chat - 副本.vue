<template>
	<navigation show_back='true'>书友会</navigation>
	<inner_page>
		<view class="vessel">
			<scroll-view scroll-y="true">
				<view>
					<view class="user" v-for="(item,index) in message" :key="index">
						<view class="name_avatar">
							<view class="name">
								{{item.name}}
							</view>
							<view class="avatar">
								<image :src="item.avatar" style="width: 100%;height:100%;" mode=""></image>
							</view>
						</view>
						<view class="answer">
							{{item.data}}
						</view>
					</view>
				</view>
			</scroll-view>
			<view class="">
				用户输入
			</view>
		</view>
	</inner_page>
</template>

<script>
	import navigation from '../navigation/navigation_all.vue'
	import inner_page from '../inner_page/inner_page.vue'
	
	import {useStore} from 'vuex'
	import {reactive} from 'vue'
	export default {
		components:{
			navigation,inner_page
		},
		onLoad() {
			// 连接socket
			uni.connectSocket({url:'wss://www.mynameisczy.asia:5000/user_chat',fail(e) {
				console.log('fail',e);	
			},success(e) {
				console.log('success',e);
			}})
			const store=useStore()
		// 打开连接
			uni.onSocketOpen(function(res){
			uni.showLoading({
				title:'进入中'
			})	
			// state
				// 进入聊天为1
				// 发送消息为2
				uni.sendSocketMessage({
					data:JSON.stringify({
						name:store.getters.user_name,
						avatar:store.getters.user_avatar,
						state:1,
						data:''
					}),
					success(){
						uni.hideLoading()
						uni.showToast({
							icon:'success',
							title:'进入书友会'
						})
				},fail(){
						uni.hideLoading()
						uni.showToast({
							icon:'error',
							title:'网络连接失败'
						})
				}})
			})
			// 接收消息
			uni.onSocketMessage(function(res) {
				console.log(res.data);
				let data=JSON.parse(res.data)
				if(data.state==1){
					uni.showToast({
						title:data.name+'进入'
					})
					return
				}
            });			
		},
		mounted() {
		},
		setup(){
			let message=reactive([{
				avatar:'https://thirdwx.qlogo.cn/mmopen/vi_32/1BoHFIQLgF9Mib2KSAIc1qSSKtkf8W3UIFeM40oHQs4caFHaxlOgb6yia8sujw5icFrcsxxjOUFf9EI8ErkhD23bg/132',
				name:'口古口',
				data:'我是口古口'
			},{
				avatar:'https://thirdwx.qlogo.cn/mmopen/vi_32/1BoHFIQLgF9Mib2KSAIc1qSSKtkf8W3UIFeM40oHQs4caFHaxlOgb6yia8sujw5icFrcsxxjOUFf9EI8ErkhD23bg/132',
				name:'Yzz',
				data:'我是Yzz'
			},{
				avatar:'https://thirdwx.qlogo.cn/mmopen/vi_32/jS4DD0hyIwmVFiaBT4sVJWAX9IqaS18CC9EzLRiaPiaxNQoojIZ0VJiaYIdPicQIfQN7RCSZ6EmepeWSROIhicrk6ibsg/132',
				name:'米兰的小铁匠',
				data:'我是米兰的小铁匠'
			}])
			return {message}
		},
		methods: {
			
		}
	}
</script>

<style lang="less" scoped>
.vessel{
	background-color: white;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	height:100%;
	&>scroll-view{
		flex-grow: 1;
		background-color: skyblue;
	}
	&>view{
		height:70px;
		background-color: green;
	}
}
.user{
	height:100px;
	background-color: yellow;
	display:flex;
	&>view{
		flex-grow: 1;
	}
	.name_avatar{
		max-width:100px;
		display:flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		max-height:100px;
	}
	.name{
		text-align: center;
	}
	.avatar{
		width:60px;
		height:60px;
		border-radius: 50%;
		overflow: hidden;
	}
}
</style>
