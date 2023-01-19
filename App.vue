<script>
	import {useStore} from 'vuex'
	import {reactive} from 'vue'
	//可按需导入
	//导入微信支付对象
	export default {
		onLaunch: function() {
			// 修改字体计划：失败
			// uni.loadFontFace({
			// 	global:true,
			//   family: 'Bitstream Vera Serif Bold',
			//   source: 'url("https://www.mynameisczy.asia/font/AaWangCaiZhaoPaiTi-2.ttf")',
			//   success() {
			// 	  console.log('success')
			//   },fail(e) {
			//   	console.log(e)
			//   }
			// })
		},
		onShow: function() {
			
		},
		onUnload() {
			console.log('exit');
		},
		onLoad(){
			
			// 检查版本更新
			let updateManager=uni.getUpdateManager()
			updateManager.onCheckForUpdate(function (res) {
			  // 请求完新版本信息的回调
			  console.log(res.hasUpdate);
			})
			
			updateManager.onUpdateReady(function (res) {
			  uni.showModal({
			    title: '更新提示',
			    content: '新版本已经准备好，是否重启应用？',
			    success(res) {
			      if (res.confirm) {
			        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
			        updateManager.applyUpdate();
			      }
			    }
			  });
			
			});
			
			
			// 每20s(20000ms)发送一次网络请求（更新数据）
			const store=reactive(useStore())
			let timer=setInterval(()=>{
				// 如果退出登录了，清除定时器
				// if(store.getters.login_state){
					// store.dispatch('setLoginState',0)
					// clearInterval(timer)
				// }
			if(store.getters.login_state)
				uni.request({
					url:'https://www.mynameisczy.asia:5000/user_data_auto_update',
					method:'POST',
					data:{openid:store.state.openid},
					success(res) {
						if(!res.data.state){
							uni.showToast({
								icon:'error',
								title:'请重新登录'
							})
							store.dispatch('setLoginState',0)
							return
						}
						let value=res.data.value
						if(value.avatarUrl!=store.getters.user_avatar||value.nickName!=store.getters.user_name||value.score!=store.getters.user_score||value.gender!=store.getters.user_gender){
								// 修改avatarUrl
							if(value.avatarUrl!=store.getters.user_avatar){
								store.state.portraitUrl=value.avatarUrl
							}
							// 修改name
							if(value.nickName!=store.getters.user_name){
								store.state.name=value.nickName
							}
							// 修改score
							if(value.score!=store.getters.user_score){
								store.state.score=value.score
							}
							// 修改gender
							if(value.gender!=store.getters.user_gender){
								store.state.gender=value.gender
							}
							// 写入本地
							uni.setStorage({
								key:'user_info',
								data:{
									gender:store.state.gender,
									name:store.state.name,
									openid:store.state.openid,
									portraitUrl:store.state.portraitUrl,
									score:store.state.score,
									telephone:store.state.telephone,
									introduction:store.state.introduction
								}
							})
						}
						let {author_answer,data_provide_answer}=res.data.value
						if(author_answer!=store.state.author_answer||data_provide_answer!=store.state.data_provide_answer){
							store.state.author_answer=author_answer
							uni.showToast({
								title:'收到了新消息'
							})
							// 将回复存入本地
							uni.setStorage({
								key:'answer',
								data:{
									author_answer,data_provide_answer
								}
							})
						}
					}
				})
			},30000)
			
			// 获取分享功能
			uni.showShareMenu({
				withShareTicket:true,
				//设置下方的Menus菜单，才能够让发送给朋友与分享到朋友圈两个按钮可以点击
				menus:["shareAppMessage","shareTimeline"]
			});
// 发送request请求
			uni.request({
				url:'https://www.mynameisczy.asia:5000/small_program_state',
				method:'POST',
				data:{
					small_program_name:'book_small_program'
				},success(value) {
					// 登录失败
					if(value.data.value==0){
						uni.reLaunch({
							url:'/pages/service_stop_page/service_stop_page',
						})
						uni.showToast({
							title:'bug修复当中,请耐心等待',
							icon:'none'
						})
					}
				},fail(e) {
					// 加载失败
					if(!value.data.value){
						uni.reLaunch({
							url:'/pages/service_stop_page/service_stop_page',
							fail(e) {
								console.log('fail',e)
							}
						})
					}
				}
			})
			
		},
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import '@/uni_modules/uni-scss/index.scss';
	/* #ifndef APP-NVUE */
	// 设置整个项目的背景色
	page {
		width:100%;
		position: relative;
		height:100%;
		background-color: #f5f5f5;
		overflow: hidden;
		// font-family: 'Bitstream Vera Serif Bold';
	}
	
	::-webkit-scrollbar{
		display: none;
	}

	/* #endif */
	.example-info {
		font-size: 14px;
		color: #333;
		padding: 10px;
	}
</style>
