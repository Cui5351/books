<template>
		<view class="bill">
			<uni-popup ref="popup" background-color="#fff">
				<view class="popup-content">
					<text>简介</text>
					<text>{{content}}</text>
				</view>
			</uni-popup>
			<view class="store_infos" :style="{height:goods_category/4+25+'px'}" v-for="(item,index) in store_infos" :key="index">
				<view :style="{maxWidth:goods_category/4+'px',minWidth:goods_category/4+'px',maxHeight:goods_category/3.5+'px',minHeight:goods_category/3.5+'px'}">
					<image @click.stop="toggle(item)" @error="image_load_err(item)" :src="item.src?item.src:'https://www.mynameisczy.asia/image/'+item.book_name+'.jpg'" :style="{maxWidth:goods_category/5+'px',minWidth:goods_category/5+'px',maxHeight:goods_category/4+'px',minHeight:goods_category/4+'px'}"></image>
				</view>
				<view class="title" >
					<view style="font-weight:bold;font-size:17px;display: flex;justify-content: space-between;">
						{{item.book_name}}
						<uni-fav class="favBtn" :checked='item.fav' circle="true" bgColorChecked="#dd524d" @click.stop="fav_b(item)"/>
					</view>
					<view style="color:gray;font-size:13px;" @click.stop="request_book_info(item)">
						<!-- <view style="display: inline-block;font-size:16px;color: red;">{{item.score}}分</view> -->
						<text decode>
							作者: {{item.author}}
						</text>
						<view style="display: flex;flex-direction:column;vertical-align: center;">
							<text decode style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">
								总章节: {{item.passage_count}}&emsp;
								类型: {{item.book_type}}
							</text>
							<view style="display: flex;flex-direction:row;justify-content: space-between;vertical-align: center;">
								<text>
									小说情况：{{item.book_state}}
								</text>
								<text decode style="display: block;font-size:16px;color: red;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">
									进入
								</text>
							</view>
						</view>
						<!-- 再写一个简介（多余的使用省略好） -->
					</view>
				</view>
			</view>
		</view>
</template>

<script>
	import {ref,reactive} from 'vue'
	import {useStore} from 'vuex';
	import hooks from '../store/hooks.js'
	import uniPopup from '@/uni_modules/uni-popup/components/uni-popup/popup.js'
	export default {
		components:{
			uniPopup
		},
		props:['store_infos','store'],
		setup(props) {
			let content=ref('')
			let info=reactive(uni.getSystemInfoSync())
			const {request_book_info}=hooks()
			
			let goods_category=ref(info.screenHeight/1.6)
			
			// 取消收藏
			function fav_b(fav){
				props.store.dispatch('fav_book',fav)
				props.store_infos.forEach((item,index)=>{
					if(item.book_name==fav.book_name){
						props.store_infos.splice(index,1)
					}
				})
			}
			function image_load_err(item){
				item.src='https://www.mynameisczy.asia/image/image_load_error.jpeg'
			}
			return {image_load_err,content,info,goods_category,request_book_info,fav_b}
		},
		methods: {
			toggle(item){
				this.content=item.book_introduce
				this.$refs.popup.open()
			}
		}
	}
</script>

<style scoped lang="less">
	.popup-content{
		box-sizing: border-box;
		padding:20px;
		&>text:first-child{
			margin-bottom:15px;
			font-weight:bold;
		}
		&>text{
			text-align: center;
			display: block;
			font-size:20px;
		}
	}
.bill{
	box-sizing: border-box;
	flex-grow: 1;
		display: flex;
		flex-direction: column;
		&>.bottom{
			height:30px;
			display: flex;
			justify-content: center;
			align-items: center;
			width:100%;
			color:gray;
		}
		&>.store_infos{
			margin:5px 0;
			&:active{
				background-color: rgba(0,0,0,.1);
			}
			.title{
				justify-content: space-around;
				display: flex;
				flex-direction: column;
			}
			&>view{
				flex-grow: 1;
				padding:10px 10px;
				box-sizing: border-box;
			}
			display: flex;
			justify-content: center;
			align-items: center;
			background-color: white;	
	}
}
</style>
