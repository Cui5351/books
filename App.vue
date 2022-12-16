<script>
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
			//   	console.log(e);
			//   }
			// })
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		onLoad(){
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
