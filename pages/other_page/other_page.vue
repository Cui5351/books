<template>
	<view>
		<navigation show_back='1'>
			工具
		</navigation>
		<scroll-view scroll-y="true" :style="{marginTop:head_height_child+'px'}">
			<view class="tool" v-for="(item,index) in tools" :index='index' @click="toggle_page(item.tools_link)" >
				<view class="avatar">
					<image :src="item.src" ></image>
				</view>
				<view class="description">
					<view class="title">
						{{item.tools_name}}
					</view>
					<view class="txt">
						{{item.tools_description}}
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import page from '../inner_page/inner_page.vue'
	import navigation from '../navigation/navigation_all.vue'
	import {reactive,ref} from 'vue'
	export default {
		components:{
			navigation,page
		},
		beforeMount() {
			uni.showLoading({
				title:'加载中'
			})
			uni.this7=this
			uni.request({
				url:'https://www.mynameisczy.asia:5351/getTools',
				method:'get',
				success(e) {
					console.log(e);
					e.data.value.forEach((item,index)=>{
						item.src=`https://www.mynameisczy.asia/dog_collection/dog${index+1}.jpeg`
						uni.this7.tools.push(item)
					})
					uni.hideLoading()
				},fail() {
					uni.hideLoading()
					uni.showToast({
						icon:'error',
						title:'加载失败，请先检查网络'
					})
				}
			})
		},
		setup() {
			let head_height_child=ref(uni.getMenuButtonBoundingClientRect().height*2.5)
			let tools=reactive([])
			function toggle_page(link){
				uni.setClipboardData({
					data: link,
					success: function () {
						uni.showToast({
							icon:'success',
							title:'链接复制成功!'
						})
					},fail(){
						uni.showToast({
							icon:'error',
							title:'链接复制失败!'
						})
					}
				});
			}
			return {tools,head_height_child,toggle_page}
		}
	}
</script>

<style lang="less" scoped>
@import url("@/general.less");
.tool:first-child{
	margin-top: 0;
}
.tool{
	margin-top:10px;
	padding:10px 20px;
	border:10px;
	box-sizing: border-box;
	background-color: white;
	display: flex;
	&>.avatar{
		width:80px;
		height:80px;
		&>image{
			width: 100%;
			height:100%;
		}
	}
	&>.description{
		padding-left:10px;
		box-sizing: border-box;
		&>.title{
			font-weight: bold;
			font-size:20px;
		}
		&>.txt{
		}
	}
}
</style>
