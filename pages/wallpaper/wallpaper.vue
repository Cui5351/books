<template>
	<view class="container">
		<link rel="stylesheet" type="text/css" href="../../static/iconfont/font-awesome-4.7.0/css/font-all.css">
		<navigation show_back='1'>
			壁纸
		</navigation>
		<scroll-view scroll-y="true" class="vessel" :style="{marginTop:head_height_child+'px',height:(container_height-head_height_child-20)+'px'}">
			<view class="wallpaper_container" v-for="(item,index) in images" :key="index" :style="{height:wallpaper_height+'px'}">
				<view class="wallpaper">
					<image :src="'https://www.mynameisczy.asia/wallpaper/image'+item.image_path+'.jpg'"  mode='aspectFill'></image>
				</view>
				<view class="wallpaper_info">
					<view>
						壁纸信息:{{item.image_info}}
					</view>
					<view>
						<uni-icons  :type="!item.state?'download':'checkmarkempty'" size="25" @click='save_image(item)'></uni-icons>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import navigation from '../navigation/navigation_all.vue'
	import {reactive,ref} from 'vue'
	export default {
		components:{
			navigation
		},
		setup() {
			// 壁纸参数
			let wallpaper_height=ref(200)
			let images=reactive([
				{
					image_info:'这是张壁纸',
					image_path:1,
					state:0
				},				{
					image_info:'这是张壁纸',
					image_path:2,
					state:0
				},				{
					image_info:'这是张壁纸',
					image_path:3,
					state:0
				},
				{
					image_info:'这是张壁纸',
					image_path:4,
					state:0
				},
				{
					image_info:'这是张壁纸',
					image_path:5,
					state:0
				},
				{
					image_info:'这是张壁纸',
					image_path:6,
					state:0
				},
				{
					image_info:'这是张壁纸',
					image_path:7,
					state:0
				}
			])
			function save_image(item){
				if(item.state)
					return
				let url=`https://www.mynameisczy.asia/wallpaper/image${item.image_path}.jpg`
				// let fs=uni.getFileSystemManager()
				// console.log(fs,'fs');
				// uni.request({
				// 	url:url,
				// 	method:'GET',
				// 	responseType:'arraybuffer',
				// 	success(e){
				// 		console.log(e,'val');
				// 	}
				// })
				uni.showLoading({
					title:'图片下拉中!'
				})
				uni.downloadFile({
					url:url,
					success(res) {
						uni.hideLoading()
					if (res.statusCode === 200) 
						uni.saveImageToPhotosAlbum({
							filePath:res.tempFilePath,
							success() {
								uni.showToast({
									icon:'success',
									title:'保存成功'
								})
								item.state=1
							},
							fail() {
								uni.showToast({
									icon:'error',
									title:'用户取消保存'
								})
							}
						})
					else{
						uni.showToast({
							icon:'error',
							title:'保存失败'
						})
					}
				}
				})
				
				    // uni.saveFile({
				    //   tempFilePath: url,
				    //   success: function (res) {
						  // console.log(res);
				    //     var savedFilePath = res.savedFilePath;
				    //   }
				    // })
			}
			
			let head_height_child=ref(uni.getMenuButtonBoundingClientRect().height*1.7)
			let container_height=ref(uni.getSystemInfoSync().windowHeight)
			return {head_height_child,container_height,wallpaper_height,images,save_image}
		},
		methods: {

		}
	}
</script>

<style lang="less" scoped>
	.container {
		padding: 20px;
		font-size: 14px;
		line-height: 24px;
		box-sizing: border-box;
		width:100%;
		height:100%;
		&>.tip{
			width:100%;
			height:100%;
			display: flex;
			justify-content: center;
			font-size:30px;
			align-items: center;
		}
		&>.vessel{
			width:100%;
		}
	}
	// 壁纸容器
	.wallpaper_container{
		width: 100%;
		margin-top:20px;
		display: flex;
		flex-direction: column;
		border-radius:20px;
		background-color: white;
		&>.wallpaper{
			display: flex;
			justify-content: center;
			align-items: center;
			overflow: hidden;
			width: 100%;
			max-height:80%;
			min-height:80%;
		}
		&>.wallpaper_info{
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding:0 20px 0 20px;
			box-sizing: border-box;
			width: 100%;
			max-height:20%;
			min-height:20%;
		}
	}
</style>